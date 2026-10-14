import { useStore, type Data } from './store'
import { addDays, today } from './date'
import { agendaDe, castigosPendientes, dayNutrition, duracionBloque, excusaDe, habitScore, habitsFor, levelInfo, sancionActiva, toMin, totalXp } from './logic'
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
  proteina: { g: number; meta: number }; kcal: { v: number; meta: number }
  pasos?: number; pasosMeta: number
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
    agenda: agendaDe(d, f).map((a) => ({ ini: toMin(a.hora), fin: toMin(a.hora) + duracionBloque(a), que: a.que })),
    proteina: { g: Math.round(nut.prot), meta: d.profile.protObjetivo }, kcal: { v: Math.round(nut.kcal), meta: d.profile.kcalObjetivo },
    pasos: d.pasos[f], pasosMeta: d.profile.pasosObjetivo ?? 8000,
  }
}

let ultimo = ''
export const publicarResumen = async () => {
  const c = conf()
  if (!c) return
  const r = resumen(useStore.getState())
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
