import { useStore, type Data } from './store'
import { addDays, today } from './date'
import { agendaDe, bedtimeFor, castigosPendientes, dayNutrition, duracionBloque, estadoObligatoria, excusaDe, habitScore, habitsFor, hourFmt, levelInfo, sancionActiva, tituloBloque, toMin, totalXp } from './logic'
import { dow } from './date'
import type { Salud } from './types'

// Datos que la app toma sola y resumen para el widget, ambos a través del script de Google del usuario
// (integraciones/producti-me.gs):
//   · Atajos de iOS lee la app Salud (pasos, sueño, pulsaciones, energía) y la manda al script.
//   · La app publica un resumen chico del día que lee el widget de la pantalla de inicio (Scriptable).

const conf = () => {
  const s = useStore.getState().settings
  return s.correoUrl ? { url: s.correoUrl, token: s.correoToken ?? '' } : null
}

/** Trae lo que mandó Atajos en las últimas dos semanas y lo suma a los datos (los pasos automáticos mandan). */
export const traerSalud = async (): Promise<number> => {
  const c = conf()
  if (!c) return 0
  const u = new URL(c.url)
  u.searchParams.set('token', c.token)
  u.searchParams.set('accion', 'salud')
  u.searchParams.set('desde', addDays(today(), -14))
  const r = await fetch(u.toString(), { redirect: 'follow', cache: 'no-store' })
  const j = await r.json() as { salud?: Record<string, Salud>; error?: string }
  if (!j.salud) return 0
  const st = useStore.getState()
  const nuevos = Object.entries(j.salud).filter(([f, v]) => JSON.stringify(st.salud?.[f]) !== JSON.stringify(v))
  if (!nuevos.length) return 0
  st.set((s) => {
    const salud = { ...s.salud }
    const pasos = { ...s.pasos }
    for (const [f, v] of nuevos) {
      salud[f] = { ...salud[f], ...v }
      if (v.pasos !== undefined) pasos[f] = Math.round(v.pasos)
    }
    return { salud, pasos }
  })
  return nuevos.length
}

export interface Resumen {
  fecha: string; actualizado: string; nombre: string
  habitos: { hechos: number; total: number }
  nivel: number; liga: string; prioridad?: string; prioridadHecha?: boolean
  castigo?: { tarea: string; vence: string }; sancionHasta?: string
  agenda: { ini: number; fin: number; que: string }[]
  /** obligatorias del día (bloques de agenda con o sin hora) */
  obligatorias?: { hechas: number; total: number }
  proteina: { g: number; meta: number }; kcal: { v: number; meta: number }
  pasos?: number; pasosMeta: number
  avisos: Aviso[]
}
/** Evento para el calendario suscripto (ICS): así el iPhone avisa aunque la app esté cerrada. */
export interface Aviso { id: string; titulo: string; inicio: string; minutos: number; alarma: number; nota?: string }

/** Avisos de los próximos 7 días: tres ventanas fijas (mañana, tarde, cierre) + tareas, exámenes, cumpleaños y castigos. */
export const avisosProximos = (d: Data): Aviso[] => {
  const out: Aviso[] = []
  const t = today()
  for (let i = 0; i < 7; i++) {
    const f = addDays(t, i)
    const wake = d.profile.despertar[dow(f)]
    out.push({ id: `ci-${f}`, titulo: 'Check-in de la mañana (30 s)', inicio: `${f}T${hourFmt(toMin(wake) + 20)}`, minutos: 5, alarma: 0, nota: 'Sueño, energía, dolor y la prioridad del día.' })
    const bed = bedtimeFor(d.profile.despertar[dow(addDays(f, 1))], d.profile.suenoMin)
    const cierre = (toMin(bed) - 60 + 1440) % 1440
    const fCierre = cierre < 6 * 60 ? addDays(f, 1) : f
    out.push({ id: `cierre-${f}`, titulo: 'Cerrar el día (30 s)', inicio: `${fCierre}T${hourFmt(cierre)}`, minutos: 5, alarma: 0, nota: `Pendientes, la difícil de mañana. A dormir antes de las ${bed}.` })
    const tareas = (d.tareas ?? []).filter((x) => !x.hecha && x.fecha === f)
    if (tareas.length) out.push({ id: `tareas-${f}`, titulo: `${tareas.length} tarea${tareas.length > 1 ? 's' : ''} para hoy`, inicio: `${f}T15:00`, minutos: 5, alarma: 0, nota: tareas.map((x) => x.texto).join(' · ') })
  }
  for (const e of d.exams.filter((x) => x.fecha >= t && x.fecha <= addDays(t, 30))) {
    const m = d.subjects.find((s) => s.id === e.materiaId)?.nombre ?? ''
    out.push({ id: `ex-${e.id}`, titulo: `${e.tipo} de ${m}`, inicio: `${e.fecha}T08:00`, minutos: 120, alarma: 14 * 60, nota: 'Mañana: repaso liviano y dormir bien.' })
  }
  for (const p of (d.personas ?? []).filter((x) => x.cumple)) {
    let f = `${t.slice(0, 4)}-${p.cumple}`
    if (f < t) f = `${Number(t.slice(0, 4)) + 1}-${p.cumple}`
    if (f <= addDays(t, 30)) out.push({ id: `cumple-${p.id}`, titulo: `Cumple de ${p.nombre}`, inicio: `${f}T10:00`, minutos: 15, alarma: 0, nota: 'Un mensaje corto vale más de lo que creés.' })
  }
  for (const p of castigosPendientes(d)) {
    if (!p.vence) continue
    const v = new Date(new Date(p.vence).getTime() - 6 * 3600e3)
    const iso = `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, '0')}-${String(v.getDate()).padStart(2, '0')}T${String(v.getHours()).padStart(2, '0')}:${String(v.getMinutes()).padStart(2, '0')}`
    out.push({ id: `pen-${p.id}`, titulo: `Quedan 6 h: ${p.tarea}`, inicio: iso, minutos: 5, alarma: 0, nota: 'Si vence, 72 h sin XP. Volver a tus hábitos también lo anula.' })
  }
  return out
}

/** Lo justo para el widget: sin textos del diario ni montos. */
export const resumen = (d: Data): Resumen => {
  const f = today()
  const hs = habitsFor(d.habits, f).filter((h) => habitScore(d, f, h) !== null)
  const log = d.habitLog[f] ?? {}
  const hechos = hs.filter((h) => log[h.id] === 'hecho' || log[h.id] === 'minimo' || (excusaDe(d, f, h.id)?.alternativa && !log[h.id])).length
  const L = levelInfo(totalXp(d))
  const cast = castigosPendientes(d)[0]
  const nut = dayNutrition(d, f)
  const ci = d.checkins[f]
  return {
    fecha: f, actualizado: new Date().toISOString(), nombre: d.profile.nombre,
    habitos: { hechos, total: hs.length }, nivel: L.lvl, liga: L.league.name,
    prioridad: ci?.prioridad, prioridadHecha: ci?.prioridadCumplida === 'si',
    castigo: cast ? { tarea: cast.tarea, vence: cast.vence ?? '' } : undefined,
    sancionHasta: sancionActiva(d)?.hasta,
    // Solo lo que falta: lo ya hecho (o que hoy no va) no aparece como "ahora" en el widget.
    agenda: agendaDe(d, f).filter((a) => a.hora && !estadoObligatoria(d, f, a.que)).map((a) => ({ ini: toMin(a.hora), fin: toMin(a.hora) + duracionBloque(a), que: tituloBloque(a.que) })),
    obligatorias: { hechas: agendaDe(d, f).filter((a) => estadoObligatoria(d, f, a.que) === 'hecho').length, total: agendaDe(d, f).length },
    proteina: { g: Math.round(nut.prot), meta: d.profile.protObjetivo }, kcal: { v: Math.round(nut.kcal), meta: d.profile.kcalObjetivo },
    pasos: d.pasos[f], pasosMeta: d.profile.pasosObjetivo ?? 8000,
    avisos: avisosProximos(d),
  }
}

let ultimo = ''
export const publicarResumen = async () => {
  const c = conf()
  if (!c) return
  const r = resumen(useStore.getState())
  // La firma ignora la hora para no publicar en cada minuto.
  const firma = JSON.stringify({ ...r, actualizado: '' })
  if (firma === ultimo) return
  const res = await fetch(c.url, { method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ token: c.token, accion: 'resumen', resumen: r }) })
  const j = await res.json().catch(() => ({})) as { ok?: boolean }
  if (j.ok) ultimo = firma
}

/** Al abrir, al volver a la app, tras cada cambio (con pausa) y cada 10 minutos. */
export const iniciarSalud = () => {
  const correr = () => { if (!conf()) return; traerSalud().catch(() => {}).finally(() => { publicarResumen().catch(() => {}) }) }
  correr()
  let timer: number | undefined
  const unsub = useStore.subscribe((s, prev) => {
    if (s === prev || !conf()) return
    window.clearTimeout(timer)
    timer = window.setTimeout(() => { publicarResumen().catch(() => {}) }, 5000)
  })
  const vis = () => { if (document.visibilityState === 'visible') correr() }
  document.addEventListener('visibilitychange', vis)
  const id = window.setInterval(correr, 10 * 60 * 1000)
  return () => { unsub(); document.removeEventListener('visibilitychange', vis); window.clearInterval(id); window.clearTimeout(timer) }
}
