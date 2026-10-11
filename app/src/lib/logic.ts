import type { Data } from './store'
import type { AreaId, Habit, Medal, Momento, Snapshot } from './types'
import { addDays, diffDays, dow, today, weekDays, weekStart, uid } from './date'
import { AREAS, PENALTIES } from './seed'

// ---------- Hábitos y medallas ----------
export const habitsFor = (habits: Habit[], fecha: string) =>
  habits.filter((h) => h.activo && (h.dias.length === 0 || h.dias.includes(dow(fecha))))

const score = (s?: string) => (s === 'hecho' ? 1 : s === 'minimo' ? 0.5 : 0)

/** Cumplimiento 0–1 de una lista de fechas, opcionalmente filtrado por área. */
export const compliance = (d: Data, fechas: string[], area?: AreaId) => {
  let total = 0
  let done = 0
  const t = today()
  // Solo cuentan días desde que se usa la app; hoy cuenta recién cuando hay algo marcado.
  for (const f of fechas.filter((x) => x >= d.inicio && (x < t || d.habitLog[x]))) {
    for (const h of habitsFor(d.habits, f)) {
      if (area && h.area !== area) continue
      total++
      done += score(d.habitLog[f]?.[h.id])
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
export const totalXp = (d: Data) => {
  let xp = 0
  for (const [, log] of Object.entries(d.habitLog))
    for (const [id, st] of Object.entries(log)) {
      const h = d.habits.find((x) => x.id === id)
      if (h) xp += h.xp * score(st)
    }
  xp += Object.keys(d.checkins).length * 10
  xp += d.workouts.length * 30
  xp += d.study.reduce((a, s) => a + Math.round(s.minutos / 3), 0)
  xp += d.journal.length * 10
  xp += d.social.reduce((a, s) => a + (s.tipo === 'juntada' ? 40 : 15), 0)
  xp += d.penalties.filter((p) => p.hecho).length * 20
  xp += d.xpAdjust.reduce((a, x) => a + x.xp, 0)
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

/** Revisa días/semanas cerrados y genera castigos y permitidos. Devuelve el parche o null. */
export const processRules = (d: Data): Partial<Data> | null => {
  const processed = new Set(d.processed)
  const penalties = [...d.penalties]
  const rewards = [...d.rewards]
  const xpAdjust = [...d.xpAdjust]
  const t = today()
  const firstDay = Object.keys(d.habitLog).sort()[0]
  if (!firstDay) return null

  // Día flojo: ayer con menos del 50 % de hábitos.
  const ayer = addDays(t, -1)
  const kDay = `day:${ayer}`
  if (ayer >= firstDay && !processed.has(kDay)) {
    processed.add(kDay)
    const c = compliance(d, [ayer])
    if (c !== null && c < 0.5) {
      penalties.push({ id: uid(), fecha: t, motivo: `Ayer cumpliste ${Math.round(c * 100)} % de los hábitos`, tarea: pick(PENALTIES.general, ayer), hecho: false })
    }
  }

  // Semana cerrada (la anterior).
  const prevWeek = addDays(weekStart(t), -7)
  const kWeek = `week:${prevWeek}`
  if (addDays(prevWeek, 6) >= firstDay && !processed.has(kWeek)) {
    processed.add(kWeek)
    const wm = weekMedals(d, prevWeek, addDays(prevWeek, 6))
    if (wm.globalMedal === 'oro') rewards.push({ id: uid(), fecha: t, motivo: 'Semana de Oro', premio: 'Hamburguesa (permitido)', usado: false })
    if (wm.globalMedal === 'malo') xpAdjust.push({ fecha: t, xp: -150, motivo: 'Semana mala: −150 XP' })
    for (const [area, v] of Object.entries(wm.areas)) {
      if (v?.m !== 'malo') continue
      const lista = area === 'fisico' ? PENALTIES.fisico : area === 'estudio' ? PENALTIES.estudio : PENALTIES.general
      penalties.push({ id: uid(), fecha: t, motivo: `Semana mala en ${AREAS.find((a) => a.id === area)?.nombre}`, tarea: pick(lista, prevWeek + area), hecho: false })
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
        rewards.push({ id: uid(), fecha: t, motivo: `−${i} % de grasa corporal`, premio: 'Hamburguesa (permitido)', usado: false })
      }
    }
  }

  if (processed.size === d.processed.length) return null
  return { processed: [...processed], penalties, rewards, xpAdjust }
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
  const aportes = d.money.filter((m) => m.categoria === 'Aporte a inversiones' && m.fecha > p[0].fecha).reduce((a, m) => a + m.monto, 0)
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
  for (const p of d.penalties.filter((x) => !x.hecho))
    out.push({ icon: 'alert', text: `Castigo pendiente: ${p.tarea} (${p.motivo}). Los permitidos están bloqueados hasta cumplirlo.`, tone: 'warn', go: 'habitos', action: 'Ver' })
  for (const e of d.exams.filter((x) => x.fecha >= t && diffDays(x.fecha, t) <= 21).sort((a, b) => a.fecha.localeCompare(b.fecha))) {
    const m = d.subjects.find((s) => s.id === e.materiaId)
    const n = diffDays(e.fecha, t)
    out.push({ icon: 'calendar', text: `${e.tipo} de ${m?.nombre ?? '?'} ${n === 0 ? 'HOY' : `en ${n} día${n === 1 ? '' : 's'}`}`, tone: n <= 3 ? 'warn' : 'info', go: 'estudio', action: 'Estudiar' })
  }
  if (dow(t) === 6 && !d.reviews.find((r) => r.semana === weekStart(t))) out.push({ icon: 'calendar-check', text: 'Hoy toca la revisión semanal (15–20 min).', tone: 'info', go: 'revision', action: 'Abrir' })
  if (d.exams.length === 0) out.push({ icon: 'pin', text: 'Faltan las fechas de parciales (noviembre) y finales (diciembre).', tone: 'warn', go: 'estudio', action: 'Cargar' })
  const disponibles = d.rewards.filter((r) => !r.usado).length
  if (disponibles && !d.penalties.some((p) => !p.hecho)) out.push({ icon: 'gift', text: `Tenés ${disponibles} permitido${disponibles > 1 ? 's' : ''} ganado${disponibles > 1 ? 's' : ''}.`, tone: 'good', go: 'habitos', action: 'Ver' })
  return out
}

export const recomendaciones = (d: Data): Note[] => {
  const t = today()
  const out: Note[] = []
  const ci = d.checkins[t]
  const hs = sleepHours(ci?.horaDormir, ci?.horaDespertar)
  const agendaHoy = d.profile.agenda[dow(t)]
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
  const minAprendizaje = d.study.filter((s) => semana.includes(s.fecha) && s.tipo !== 'facultad').reduce((a, s) => a + s.minutos, 0)
  const esperado = (d.profile.horasAprendizaje * 60 * semana.length) / 7
  if (minAprendizaje < esperado * 0.7) out.push({ icon: 'bot', text: `IA + inglés + lectura: llevás ${Math.round(minAprendizaje / 60)} h de ${Math.round(esperado / 60)} h esperadas a esta altura de la semana.` })

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
/** Momento del día de un hábito: el elegido o uno deducido del nombre. */
export const momentoDe = (h: Habit): Momento => {
  if (h.momento) return h.momento
  const n = h.nombre.toLowerCase()
  if (/mañana|movilidad|clindamicina/.test(n)) return 'manana'
  if (/noche|journal|lectura|celular|dormir|manos|registrar ingresos/.test(n)) return 'noche'
  if (/entren|estudio|inglés|ia |plan|algo fuera|marmoler|portafolio|escribirle/.test(n)) return 'tarde'
  return 'dia'
}
export const toMin = (hhmm: string) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m }
export const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes() }
/** Próximo bloque de la agenda de hoy (o el que está en curso, hasta 60 min). */
export const agendaAhora = (d: Data) => {
  const items = d.profile.agenda[dow(today())] ?? []
  const n = nowMin()
  const next = items.find((a) => toMin(a.hora) >= n - 60 && toMin(a.hora) + 60 > n) ?? items.find((a) => toMin(a.hora) > n)
  return next ? { ...next, faltan: toMin(next.hora) - n } : null
}
export const hourFmt = (min: number) => `${String(Math.floor(((min % 1440) + 1440) % 1440 / 60)).padStart(2, '0')}:${String(((min % 60) + 60) % 60).padStart(2, '0')}`
