import type { Data } from './store'
import type { AgendaItem, AreaId, Habit, Medal, Momento, Penalty, Snapshot } from './types'
import { addDays, diffDays, dow, iso, today, weekDays, weekStart } from './date'
import { AREAS, PENALTIES } from './seed'

// ---------- Hábitos y medallas ----------
export const habitsFor = (habits: Habit[], fecha: string) =>
  habits.filter((h) => h.activo && (h.dias.length === 0 || h.dias.includes(dow(fecha))))

const score = (s?: string) => (s === 'hecho' ? 1 : s === 'minimo' ? 0.5 : 0)

/** Agenda de una fecha: la del plan puntual si existe; si no, la base del día de la semana. */
export const agendaDe = (d: Pick<Data, 'planDia' | 'profile'>, fecha: string): AgendaItem[] =>
  [...(d.planDia?.[fecha]?.agenda ?? d.profile.agenda[dow(fecha)] ?? [])].sort((a, b) => a.hora.localeCompare(b.hora))
export const excusaDe = (d: Pick<Data, 'planDia'>, fecha: string, habitId: string) => d.planDia?.[fecha]?.excusas?.[habitId]

/**
 * Puntaje de un hábito en una fecha. Un hábito excusado no cuenta (sale del total);
 * si la excusa trae una alternativa realizada, cuenta como versión mínima.
 */
export const habitScore = (d: Data, f: string, h: Habit): number | null => {
  const st = d.habitLog[f]?.[h.id]
  const ex = excusaDe(d, f, h.id)
  if (ex && !st) return ex.alternativa ? 0.5 : null
  return score(st)
}

/** Cumplimiento 0–1 de una lista de fechas, opcionalmente filtrado por área. */
export const compliance = (d: Data, fechas: string[], area?: AreaId) => {
  let total = 0
  let done = 0
  const t = today()
  // Solo cuentan días desde que se usa la app; hoy cuenta recién cuando hay algo marcado.
  for (const f of fechas.filter((x) => x >= d.inicio && (x < t || d.habitLog[x]))) {
    for (const h of habitsFor(d.habits, f)) {
      if (area && h.area !== area) continue
      const sc = habitScore(d, f, h)
      if (sc === null) continue
      total++
      done += sc
    }
  }
  return total === 0 ? null : done / total
}

export const medalOf = (c: number | null): Medal | null =>
  c === null ? null : c >= 0.9 ? 'oro' : c >= 0.75 ? 'plata' : c >= 0.6 ? 'bronce' : 'malo'

export const MEDAL_LABEL: Record<Medal, string> = { oro: 'Oro', plata: 'Plata', bronce: 'Bronce', malo: 'Bajo meta' }

/** Días de la semana hasta hoy inclusive. */
export const weekSoFar = (fecha = today()) => weekDays(weekStart(fecha)).filter((f) => f <= fecha)

export const weekMedals = (d: Data, start: string, upTo = today()) => {
  const fechas = weekDays(start).filter((f) => f <= upTo)
  const out: Partial<Record<AreaId, { c: number; m: Medal }>> = {}
  for (const a of AREAS) {
    const c = compliance(d, fechas, a.id)
    const m = medalOf(c)
    if (c !== null && m) out[a.id] = { c, m }
  }
  const global = compliance(d, fechas)
  return { areas: out, global, globalMedal: medalOf(global) }
}

export const streak = (d: Data, habitId: string) => {
  let n = 0
  let f = today()
  if (!d.habitLog[f]?.[habitId]) f = addDays(f, -1)
  for (let i = 0; i < 400; i++) {
    const h = d.habits.find((x) => x.id === habitId)
    if (!h) break
    const applies = h.dias.length === 0 || h.dias.includes(dow(f))
    const st = d.habitLog[f]?.[habitId]
    if (applies) {
      if (st === 'hecho' || st === 'minimo') n++
      else break
    }
    f = addDays(f, -1)
  }
  return n
}

// ---------- XP y niveles ----------
/** XP de una sesión de estudio: sin evidencia rinde la mitad; con evidencia suma un bono grande. */
export const sessionXp = (s: { minutos: number; tipo: string; evidencia?: { verificado?: boolean } }) => {
  if (s.tipo === 'facultad') return Math.round(s.minutos / 3)
  if (!s.evidencia) return Math.round(s.minutos / 6)
  return Math.round(s.minutos / 3) + (s.evidencia.verificado ? 40 : 25)
}
export const XP_TEST = { aprobado: 150, intento: 20 }
/** Recuperación: poco XP, pero constante (respirar 5 min vale lo mismo que un vaso de agua más). */
export const cuerpoXp = (c: { tipo: string; minutos: number }) =>
  c.tipo === 'cardio' || c.tipo === 'caminata' ? Math.min(30, Math.round(c.minutos / 3)) : Math.min(15, 5 + Math.round(c.minutos / 2))

/** Fechas (locales) cubiertas por sanciones: en esos días no se gana XP. */
export const bannedDays = (d: Pick<Data, 'sanciones'>) => {
  const out = new Set<string>()
  for (const s of d.sanciones ?? []) {
    let f = iso(new Date(s.desde))
    const hasta = iso(new Date(s.hasta))
    for (let i = 0; f <= hasta && i < 60; i++) { out.add(f); f = addDays(f, 1) }
  }
  return out
}
export const sancionActiva = (d: Pick<Data, 'sanciones'>, now = Date.now()) =>
  (d.sanciones ?? []).filter((s) => new Date(s.desde).getTime() <= now && new Date(s.hasta).getTime() > now).sort((a, b) => b.hasta.localeCompare(a.hasta))[0]

export const totalXp = (d: Data) => {
  const ban = bannedDays(d)
  // Solo cuenta desde el día 1 (inicio) y fuera de los días sancionados.
  const ok = (f: string) => f >= d.inicio && !ban.has(f)
  let xp = 0
  for (const [f, log] of Object.entries(d.habitLog)) {
    if (!ok(f)) continue
    for (const [id, st] of Object.entries(log)) {
      const h = d.habits.find((x) => x.id === id)
      if (h) xp += h.xp * score(st)
    }
  }
  // Excusas con alternativa realizada: media XP.
  for (const [f, p] of Object.entries(d.planDia ?? {})) {
    if (!ok(f)) continue
    for (const [id, ex] of Object.entries(p.excusas ?? {})) {
      const h = d.habits.find((x) => x.id === id)
      if (h && ex.alternativa && !d.habitLog[f]?.[id]) xp += h.xp / 2
    }
  }
  xp += Object.keys(d.checkins).filter(ok).length * 10
  xp += d.workouts.filter((w) => ok(w.fecha)).length * 30
  xp += d.study.filter((s) => ok(s.fecha)).reduce((a, s) => a + sessionXp(s), 0)
  xp += d.journal.filter((j) => ok(j.fecha)).reduce((a, j) => a + (j.modo && j.modo !== 'libre' ? 15 : 10), 0)
  xp += d.social.filter((s) => ok(s.fecha)).reduce((a, s) => a + (s.tipo === 'juntada' ? 40 : 15), 0)
  xp += d.penalties.filter((p) => p.hecho && ok(p.fecha)).length * 20
  xp += (d.cuerpo ?? []).filter((c) => ok(c.fecha)).reduce((a, c) => a + cuerpoXp(c), 0)
  xp += Object.entries(d.pasos ?? {}).filter(([f, n]) => ok(f) && n >= (d.profile.pasosObjetivo ?? 8000)).length * 10
  for (const r of d.rutas ?? []) for (const m of r.metas) if (m.test && ok(m.test.fecha)) xp += m.test.aprobado ? XP_TEST.aprobado : XP_TEST.intento
  xp += d.xpAdjust.filter((x) => x.fecha >= d.inicio).reduce((a, x) => a + x.xp, 0)
  return Math.max(0, Math.round(xp))
}

export const LEAGUES = [
  { min: 1, name: 'Hierro', color: '#8b95a7' },
  { min: 4, name: 'Bronce', color: '#cd7f32' },
  { min: 8, name: 'Plata', color: '#c0c7d4' },
  { min: 13, name: 'Oro', color: '#f5b83d' },
  { min: 19, name: 'Platino', color: '#5eead4' },
  { min: 26, name: 'Diamante', color: '#60a5fa' },
  { min: 35, name: 'Leyenda', color: '#c084fc' },
]
const xpForLevel = (lvl: number) => 150 * (lvl - 1) * lvl // acumulado para alcanzar el nivel
export const levelInfo = (xp: number) => {
  let lvl = 1
  while (xpForLevel(lvl + 1) <= xp) lvl++
  const base = xpForLevel(lvl)
  const next = xpForLevel(lvl + 1)
  const league = [...LEAGUES].reverse().find((l) => lvl >= l.min)!
  const nextLeague = LEAGUES.find((l) => l.min > lvl)
  return { lvl, progress: (xp - base) / (next - base), toNext: next - xp, league, nextLeague }
}

// ---------- Castigos y premios automáticos ----------
const pick = <T,>(arr: T[], seed: string) => arr[[...seed].reduce((a, c) => a + c.charCodeAt(0), 0) % arr.length]
export const PENALTY_HOURS = 48
export const SANCION_HOURS = 72
/** El id sale de la regla que lo generó: si dos dispositivos lo generan, la sincronización lo une en uno. */
const nuevoCastigo = (clave: string, motivo: string, tarea: string): Penalty => {
  const now = Date.now()
  return { id: `pen-${clave}`, fecha: today(), motivo, tarea, hecho: false, creado: new Date(now).toISOString(), vence: new Date(now + PENALTY_HOURS * 3600e3).toISOString() }
}
/** Tiempo restante de un castigo: fracción 0–1 que queda y si venció. */
export const penaltyTime = (p: Penalty, now = Date.now()) => {
  const fin = p.vence ? new Date(p.vence).getTime() : now + PENALTY_HOURS * 3600e3
  const ini = p.creado ? new Date(p.creado).getTime() : fin - PENALTY_HOURS * 3600e3
  const left = fin - now
  return { left, frac: Math.max(0, Math.min(1, left / (fin - ini))), vencido: left <= 0 }
}
export const fmtLeft = (ms: number) => {
  if (ms <= 0) return 'vencido'
  const h = Math.floor(ms / 3600e3)
  const m = Math.floor((ms % 3600e3) / 60e3)
  return h >= 1 ? `${h} h ${String(m).padStart(2, '0')} min` : `${m} min`
}
/** Castigos pendientes, del más urgente al menos urgente. */
export const castigosPendientes = (d: Pick<Data, 'penalties'>) =>
  d.penalties.filter((p) => !p.hecho && !penaltyTime(p).vencido).sort((a, b) => penaltyTime(a).left - penaltyTime(b).left)

/** Revisa días/semanas cerrados y genera castigos y permitidos. Devuelve el parche o null. */
export const processRules = (d: Data): Partial<Data> | null => {
  const processed = new Set(d.processed)
  const penalties = [...d.penalties]
  const rewards = [...d.rewards]
  const xpAdjust = [...d.xpAdjust]
  const t = today()
  const sanciones = [...(d.sanciones ?? [])]
  let tocado = false
  // Castigo vencido: sin permitidos y sin ganar XP durante 72 h (una sanción por castigo).
  for (let i = 0; i < penalties.length; i++) {
    const p = penalties[i]
    if (p.hecho || p.sancionado || !penaltyTime(p).vencido) continue
    const desde = new Date(p.vence!).getTime()
    sanciones.push({ id: `san-${p.id}`, desde: new Date(desde).toISOString(), hasta: new Date(desde + SANCION_HOURS * 3600e3).toISOString(), motivo: `Venció: ${p.tarea}` })
    penalties[i] = { ...p, sancionado: true }
    tocado = true
  }
  // Las reglas evalúan solo días desde el día 1 en que ya se marcó algo.
  const firstDay = Object.keys(d.habitLog).filter((f) => f >= d.inicio).sort()[0]
  if (!firstDay) return tocado ? { penalties, sanciones } : null

  // Día flojo: ayer con menos del 50 % de hábitos.
  const ayer = addDays(t, -1)
  const kDay = `day:${ayer}`
  if (ayer >= firstDay && !processed.has(kDay)) {
    processed.add(kDay)
    const c = compliance(d, [ayer])
    if (c !== null && c < 0.5) {
      penalties.push(nuevoCastigo(kDay, `Ayer cumpliste ${Math.round(c * 100)} % de los hábitos`, pick(PENALTIES.general, ayer)))
    }
  }

  // Semana cerrada (la anterior).
  const prevWeek = addDays(weekStart(t), -7)
  const kWeek = `week:${prevWeek}`
  if (addDays(prevWeek, 6) >= firstDay && !processed.has(kWeek)) {
    processed.add(kWeek)
    const wm = weekMedals(d, prevWeek, addDays(prevWeek, 6))
    if (wm.globalMedal === 'oro') rewards.push({ id: `rew-${kWeek}`, fecha: t, motivo: 'Semana de Oro', premio: 'Hamburguesa (permitido)', usado: false })
    if (wm.globalMedal === 'malo') xpAdjust.push({ fecha: t, xp: -150, motivo: 'Semana mala: −150 XP' })
    for (const [area, v] of Object.entries(wm.areas)) {
      if (v?.m !== 'malo') continue
      const lista = area === 'fisico' ? PENALTIES.fisico : area === 'estudio' ? PENALTIES.estudio : PENALTIES.general
      penalties.push(nuevoCastigo(`${kWeek}:${area}`, `Semana mala en ${AREAS.find((a) => a.id === area)?.nombre}`, pick(lista, prevWeek + area)))
    }
  }

  // Hitos de grasa corporal: un permitido por cada punto de % bajado desde el inicio.
  const grasas = d.body.filter((b) => b.grasa).map((b) => b.grasa!)
  if (grasas.length > 1) {
    const bajado = Math.floor(grasas[0] - Math.min(...grasas))
    for (let i = 1; i <= bajado; i++) {
      const k = `fat:${i}`
      if (!processed.has(k)) {
        processed.add(k)
        rewards.push({ id: `rew-${k}`, fecha: t, motivo: `−${i} % de grasa corporal`, premio: 'Hamburguesa (permitido)', usado: false })
      }
    }
  }

  if (processed.size === d.processed.length && !tocado) return null
  return { processed: [...processed], penalties, rewards, xpAdjust, sanciones }
}

// ---------- Físico ----------
export const e1rm = (kg: number, reps: number) => (reps <= 1 ? kg : kg * (1 + reps / 30))
export const bestE1rm = (d: Data, nombre: string) => {
  let best = 0
  for (const w of d.workouts)
    for (const e of w.ejercicios)
      if (e.nombre.toLowerCase().trim() === nombre.toLowerCase().trim()) best = Math.max(best, e1rm(e.kg, e.reps))
  return best
}
export const dayNutrition = (d: Data, fecha: string) =>
  d.meals.filter((m) => m.fecha === fecha).reduce(
    (a, m) => ({ kcal: a.kcal + m.kcal, prot: a.prot + m.prot, carb: a.carb + m.carb, grasa: a.grasa + m.grasa }),
    { kcal: 0, prot: 0, carb: 0, grasa: 0 },
  )
export const sleepHours = (dormir?: string, despertar?: string) => {
  if (!dormir || !despertar) return null
  const [a, b] = dormir.split(':').map(Number)
  const [c, e] = despertar.split(':').map(Number)
  let m = c * 60 + e - (a * 60 + b)
  if (m < 0) m += 1440
  return m / 60
}
/** Hora recomendada para acostarse para dormir lo mínimo + 15 min para conciliar. */
export const bedtimeFor = (despertar: string, horas: number) => {
  const [h, m] = despertar.split(':').map(Number)
  let mins = h * 60 + m - Math.round(horas * 60) - 15
  if (mins < 0) mins += 1440
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`
}

// ---------- Finanzas ----------
export const last = (s: Snapshot[]) => [...s].sort((a, b) => a.fecha.localeCompare(b.fecha)).at(-1)
export const portfolioReturn = (d: Data) => {
  const p = d.portfolio.filter((x) => x.fecha >= d.profile.rendimientoDesde).sort((a, b) => a.fecha.localeCompare(b.fecha))
  if (p.length < 2) return null
  // Aportes y retiros en USD (Patrimonio): no cuentan como rendimiento.
  const aportes = (d.aportes ?? []).filter((m) => m.fecha > p[0].fecha).reduce((a, m) => a + (m.retiro ? -m.usd : m.usd), 0)
  return (p.at(-1)!.valor - aportes - p[0].valor) / p[0].valor
}
export interface Candle { label: string; open: number; close: number; high: number; low: number }
/** Agrupa una serie en velas semanales. */
export const weeklyCandles = (s: Snapshot[]): Candle[] => {
  const byWeek = new Map<string, number[]>()
  for (const x of [...s].sort((a, b) => a.fecha.localeCompare(b.fecha))) {
    const w = weekStart(x.fecha)
    byWeek.set(w, [...(byWeek.get(w) ?? []), x.valor])
  }
  let prevClose: number | undefined
  return [...byWeek.entries()].map(([w, v]) => {
    const open = prevClose ?? v[0]
    const close = v.at(-1)!
    prevClose = close
    return { label: w.slice(5), open, close, high: Math.max(open, ...v), low: Math.min(open, ...v) }
  })
}

// ---------- Panel "Hoy": avisos, recomendaciones, recuerdos ----------
/** icon = nombre de ícono Lucide (ver components/Icon.tsx); go = pantalla a la que lleva la acción */
export interface Note { icon: string; text: string; tone?: 'warn' | 'good' | 'info'; go?: string; action?: string }

export const avisos = (d: Data): Note[] => {
  const t = today()
  const out: Note[] = []
  const san = sancionActiva(d)
  if (san) out.push({ icon: 'alert', text: `Sanción activa hasta ${new Date(san.hasta).toLocaleString('es-AR', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}: sin XP y sin permitidos (${san.motivo}).`, tone: 'warn' })
  for (const e of d.exams.filter((x) => x.fecha >= t && diffDays(x.fecha, t) <= 21).sort((a, b) => a.fecha.localeCompare(b.fecha))) {
    const m = d.subjects.find((s) => s.id === e.materiaId)
    const n = diffDays(e.fecha, t)
    out.push({ icon: 'calendar', text: `${e.tipo} de ${m?.nombre ?? '?'} ${n === 0 ? 'HOY' : `en ${n} día${n === 1 ? '' : 's'}`}`, tone: n <= 3 ? 'warn' : 'info', go: 'estudio', action: 'Estudiar' })
  }
  if (dow(t) === 6 && !d.reviews.find((r) => r.semana === weekStart(t))) out.push({ icon: 'calendar-check', text: 'Hoy toca la revisión semanal (15–20 min).', tone: 'info', go: 'revision', action: 'Abrir' })
  if (d.exams.length === 0) out.push({ icon: 'pin', text: 'Faltan las fechas de parciales (noviembre) y finales (diciembre).', tone: 'warn', go: 'estudio', action: 'Cargar' })
  const disponibles = d.rewards.filter((r) => !r.usado).length
  if (disponibles && !castigosPendientes(d).length && !san) out.push({ icon: 'gift', text: `Tenés ${disponibles} permitido${disponibles > 1 ? 's' : ''} ganado${disponibles > 1 ? 's' : ''}.`, tone: 'good', go: 'habitos', action: 'Ver' })
  return out
}

export const recomendaciones = (d: Data): Note[] => {
  const t = today()
  const out: Note[] = []
  const ci = d.checkins[t]
  const hs = sleepHours(ci?.horaDormir, ci?.horaDespertar)
  const agendaHoy = agendaDe(d, t)
  const intensidad = agendaHoy.find((a) => a.intensidad)?.intensidad

  if (hs !== null && hs < d.profile.suenoMin)
    out.push({ icon: 'bed', text: `Dormiste ${hs.toFixed(1)} h. ${intensidad === 'roja' ? 'Hoy es intensidad roja: priorizá una siesta de 20–30 min, hidratación y carbohidratos antes del entrenamiento.' : 'Siesta de 20–30 min (no más) y acostate temprano.'}` })
  const manana = addDays(t, 1)
  const wake = d.profile.despertar[dow(manana)]
  out.push({ icon: 'moon', text: `Mañana te levantás a las ${wake}: para dormir ${String(d.profile.suenoMin).replace('.', ',')} h acostate antes de las ${bedtimeFor(wake, d.profile.suenoMin)}. Celular fuera de la cama 30 min antes.` })

  if (intensidad === 'roja') out.push({ icon: 'flame', text: 'Día de intensidad roja: comida con carbohidratos 2–3 h antes y proteína después.' })
  if (intensidad === 'partido') out.push({ icon: 'trophy', text: 'Día de partido: desayuno fuerte, hidratación desde temprano. Aprovechá el tercer tiempo para estar con el grupo.' })

  const nut = dayNutrition(d, t)
  const hora = new Date().getHours()
  if (hora >= 17 && nut.prot < d.profile.protObjetivo * 0.6)
    out.push({ icon: 'beef', text: `Vas ${Math.round(nut.prot)} g de proteína de ${d.profile.protObjetivo} g. Te faltan ${Math.round(d.profile.protObjetivo - nut.prot)} g: sumá carne, pollo, huevos o un batido.` })

  const lastSocial = [...d.social].sort((a, b) => b.fecha.localeCompare(a.fecha))[0]
  const sinSocial = lastSocial ? diffDays(t, lastSocial.fecha) : 99
  if (sinSocial >= 3) out.push({ icon: 'users', text: `Hace ${sinSocial >= 99 ? 'mucho' : `${sinSocial} días`} que no registrás contacto con amigos. Escribí al grupo hoy; proponé algo concreto (fecha + lugar).` })

  const proxExamen = d.exams.filter((e) => e.fecha >= t).sort((a, b) => a.fecha.localeCompare(b.fecha))[0]
  if (proxExamen && diffDays(proxExamen.fecha, t) <= 14) {
    const m = d.subjects.find((s) => s.id === proxExamen.materiaId)
    out.push({ icon: 'book-open', text: `Priorizá ${m?.nombre}: hacé hoy 2 bloques de 45 min de ejercicios tipo examen.` })
  }

  const semana = weekSoFar()
  const ses = d.study.filter((s) => semana.includes(s.fecha) && s.tipo !== 'facultad')
  const minAprendizaje = ses.reduce((a, s) => a + s.minutos, 0)
  const esperado = (d.profile.horasAprendizaje * 60 * semana.length) / 7
  if (minAprendizaje < esperado * 0.7) out.push({ icon: 'bot', text: `IA, inglés, lectura y programación: llevás ${Math.round(minAprendizaje / 60)} h de ${Math.round(esperado / 60)} h esperadas a esta altura de la semana.`, go: 'estudio', action: 'Estudiar' })
  const sinEv = ses.filter((s) => !s.evidencia).length
  if (sinEv >= 2) out.push({ icon: 'target', text: `${sinEv} sesiones de esta semana no tienen evidencia: rinden la mitad de XP. Sumá un link, una foto o 3 líneas.`, go: 'estudio', action: 'Agregar' })

  const rutina = d.journal.filter((j) => diffDays(t, j.fecha) <= 7).length
  if (rutina === 0) out.push({ icon: 'notebook-pen', text: 'Una semana sin journaling. Escribí 3 líneas hoy: qué te molestó, qué salió bien, qué cambiarías.' })
  return out
}

export const recuerdos = (d: Data): Note[] => {
  const t = today()
  const out: Note[] = []
  const hace = [7, 30, 90, 180, 365]
  for (const n of hace) {
    const f = addDays(t, -n)
    const j = d.journal.find((x) => x.fecha === f)
    const v = d.checkins[f]?.victoria
    const lbl = n === 7 ? 'Hace una semana' : n === 30 ? 'Hace un mes' : n === 365 ? 'Hace un año' : `Hace ${n} días`
    if (v) out.push({ icon: 'trophy', text: `${lbl}: "${v}"` })
    else if (j) out.push({ icon: 'book-open', text: `${lbl} escribiste: "${j.texto.slice(0, 120)}${j.texto.length > 120 ? '…' : ''}"` })
  }
  const pesos = d.body.filter((b) => b.peso).sort((a, b) => a.fecha.localeCompare(b.fecha))
  if (pesos.length > 1) {
    const p0 = pesos[0]
    const p1 = pesos.at(-1)!
    if (p0.grasa && p1.grasa && p1.grasa < p0.grasa) out.push({ icon: 'trending-down', text: `Desde el ${p0.fecha} bajaste ${(p0.grasa - p1.grasa).toFixed(1)} puntos de grasa.`, tone: 'good' })
  }
  return out
}

// ---------- Hoy: agenda, momento de los hábitos, próxima acción ----------
export const MOMENTOS: { id: Momento; label: string; hasta: string }[] = [
  { id: 'manana', label: 'Mañana', hasta: 'al despertar' },
  { id: 'dia', label: 'Durante el día', hasta: 'flexible' },
  { id: 'tarde', label: 'Tarde', hasta: 'antes de la cena' },
  { id: 'noche', label: 'Noche', hasta: 'cierre del día' },
]
/** Momento del día de un hábito: el cambiado para esa fecha, el elegido o uno deducido del nombre. */
export const momentoDe = (h: Habit, d?: Pick<Data, 'planDia'>, fecha?: string): Momento => {
  const o = d && fecha ? d.planDia?.[fecha]?.momentos?.[h.id] : undefined
  if (o) return o
  if (h.momento) return h.momento
  const n = h.nombre.toLowerCase()
  if (/mañana|movilidad|clindamicina/.test(n)) return 'manana'
  if (/noche|journal|lectura|celular|dormir|manos|registrar ingresos/.test(n)) return 'noche'
  if (/entren|estudio|inglés|ia |programaci|plan|algo fuera|marmoler|portafolio|escribirle/.test(n)) return 'tarde'
  return 'dia'
}
export const toMin = (hhmm: string) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m }
export const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes() }
/** Bloque de la agenda de hoy en curso (según su duración) o, si no hay, el próximo. */
export const agendaAhora = (d: Data) => {
  const items = agendaDe(d, today())
  const n = nowMin()
  const cur = items.find((a) => toMin(a.hora) <= n && toMin(a.hora) + duracionBloque(a) > n)
  const next = cur ?? items.find((a) => toMin(a.hora) > n)
  return next ? { ...next, faltan: toMin(next.hora) - n, fin: toMin(next.hora) + duracionBloque(next) } : null
}
export const hourFmt = (min: number) => `${String(Math.floor(((min % 1440) + 1440) % 1440 / 60)).padStart(2, '0')}:${String(((min % 60) + 60) % 60).padStart(2, '0')}`

// ---------- Agenda del día: bloques con duración y hábitos ubicados en los huecos ----------
/** Duración estimada de un bloque de agenda a partir de su texto ("hasta 9:00", "1:30–2 h"). */
export const duracionBloque = (a: AgendaItem): number => {
  const hasta = a.que.match(/hasta (\d{1,2})[:.](\d{2})/)
  if (hasta) return Math.max(15, toMin(`${hasta[1].padStart(2, '0')}:${hasta[2]}`) - toMin(a.hora))
  const rango = a.que.match(/(\d)[:.](\d{2})\s*[–-]\s*(\d)\s*h/)
  if (rango) return Number(rango[1]) * 60 + Number(rango[2])
  const horas = a.que.match(/(\d+(?:[.,]\d+)?)\s*h\b/)
  if (horas) return Math.round(Number(horas[1].replace(',', '.')) * 60)
  if (/partido/i.test(a.que)) return 240
  if (/almuerzo|cena/i.test(a.que)) return /siesta/i.test(a.que) ? 75 : 45
  if (/rugby|entrenamiento/i.test(a.que)) return 120
  if (/gimnasio/i.test(a.que)) return 90
  if (/revisi/i.test(a.que)) return 20
  return 60
}
/** Minutos que lleva un hábito ("Inglés 20 min", "IA 60 min"); 0 = no ocupa un horario. */
export const duracionHabito = (h: Habit): number => {
  const n = h.nombre.toLowerCase()
  if (/agua|proteína|registrar todas|outfit|escribirle|proponer|fuera de la rutina|dormir|celular/.test(n)) return 0
  const m = n.match(/(\d+)\s*min/)
  if (m) return Number(m[1])
  const hs = n.match(/(\d+)\s*h\b/)
  if (hs) return Number(hs[1]) * 60
  if (/bloque|marmoler/.test(n)) return 60
  if (/clindamicina|skincare|portafolio/.test(n)) return 5
  if (/manos/.test(n)) return 15
  return 10
}

export interface SlotHabitos { ini: number; fin: number; habitos: Habit[]; titulo?: string }
export interface PlanBloque { ini: number; fin: number; item: AgendaItem; habitos: Habit[] }
export interface PlanDelDia { bloques: PlanBloque[]; slots: SlotHabitos[]; sinHora: Habit[]; dormir?: Habit[] }

/**
 * Arma el día real: los bloques fijos de la agenda con su duración, cada hábito con horario
 * en un hueco libre de su momento (mañana, tarde, noche) y aparte lo que no tiene hora
 * (agua, proteína, escribirle a alguien). Las rutinas cortas consecutivas se agrupan.
 */
export const planDelDia = (d: Data, f: string, wake: number, bed: number): PlanDelDia => {
  const hs = habitsFor(d.habits, f)
  const bloques: PlanBloque[] = agendaDe(d, f).map((a) => ({ ini: toMin(a.hora), fin: toMin(a.hora) + duracionBloque(a), item: a, habitos: [] }))
  const ocupado: [number, number][] = bloques.map((b) => [b.ini, b.fin])
  const sinHora: Habit[] = []
  const dormir: Habit[] = []
  const conHora: { h: Habit; min: number; dur: number }[] = []
  const pend: { h: Habit; dur: number; m: Momento }[] = []
  for (const h of hs) {
    const n = h.nombre.toLowerCase()
    if (/entren/.test(n)) {
      const b = bloques.find((x) => /gimnasio|rugby|partido|entren/i.test(x.item.que))
      if (b) { b.habitos.push(h); continue }
    }
    if (/marmoler/.test(n)) {
      const b = bloques.find((x) => /marmoler/i.test(x.item.que))
      if (b) { b.habitos.push(h); continue }
    }
    if (/dormir|celular/.test(n)) { dormir.push(h); continue }
    if (h.hora) { conHora.push({ h, min: toMin(h.hora), dur: Math.max(10, duracionHabito(h)) }); continue }
    const dur = duracionHabito(h)
    if (!dur) { sinHora.push(h); continue }
    pend.push({ h, dur, m: momentoDe(h, d, f) })
  }
  for (const c of conHora) ocupado.push([c.min, c.min + c.dur])
  const libreDesde = (desde: number, dur: number, hasta: number) => {
    let t = desde
    for (let i = 0; i < 40; i++) {
      const choque = ocupado.find(([a, b]) => t < b && t + dur > a)
      if (!choque) return t + dur <= hasta ? t : null
      t = choque[1] + 5
    }
    return null
  }
  const lastFin = Math.max(wake, ...bloques.filter((b) => b.ini < bed).map((b) => b.fin))
  const ventanas: Record<Momento, number> = { manana: wake + 10, dia: Math.max(wake + 60, 9 * 60), tarde: 13 * 60, noche: Math.max(lastFin + 15, bed - 90) }
  const orden: Momento[] = ['manana', 'tarde', 'dia', 'noche']
  const ubicados: { h: Habit; min: number; dur: number }[] = [...conHora]
  for (const m of orden) {
    for (const p of pend.filter((x) => x.m === m).sort((a, b) => b.dur - a.dur)) {
      const inicio = m === 'noche' ? ventanas.noche : ventanas[m]
      const t = libreDesde(inicio, p.dur, bed) ?? libreDesde(wake, p.dur, bed)
      if (t === null) { sinHora.push(p.h); continue }
      ocupado.push([t, t + p.dur])
      ubicados.push({ h: p.h, min: t, dur: p.dur })
    }
  }
  ubicados.sort((a, b) => a.min - b.min)
  // Rutinas cortas pegadas (≤ 15 min cada una) se muestran juntas, con su horario real.
  const slots: SlotHabitos[] = []
  for (const u of ubicados) {
    const prev = slots.at(-1)
    if (prev && u.dur <= 15 && prev.habitos.every((h) => duracionHabito(h) <= 15) && u.min - prev.fin <= 5) {
      prev.habitos.push(u.h); prev.fin = Math.max(prev.fin, u.min + u.dur)
    } else slots.push({ ini: u.min, fin: u.min + u.dur, habitos: [u.h] })
  }
  for (const s of slots) if (s.habitos.length > 1) s.titulo = s.ini < 12 * 60 ? 'Rutina de la mañana' : s.ini >= 20 * 60 ? 'Rutina de la noche' : 'Rutina corta'
  return { bloques, slots, sinHora, dormir }
}
