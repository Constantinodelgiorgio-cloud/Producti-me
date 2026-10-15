import type { Data } from './store'
import type { AgendaItem, Habit, Suceso, TipoSuceso } from './types'
import type { Route } from './ui'
import { agendaDe, duracionBloque, estadoObligatoria, excusaDe, habitsFor, momentoDe, toMin } from './logic'
import { ahoraHHMM, comidasDelDia, ordinal } from './ayuno'

// El día sin grilla: lo obligatorio (con o sin hora) y lo que va pasando.
// Los días son dinámicos: no se reparte cada hábito en un horario sugerido;
// se marca lo que hay que hacer sí o sí y se registra lo que fue pasando.

export interface Obligatoria { clave: string; item?: AgendaItem; habito?: Habit; estado?: 'hecho' | 'no' | 'minimo' | 'reserva' | 'excusa'; hora?: string }

/** Lo obligatorio de hoy: los compromisos de la agenda y los hábitos marcados como no negociables. */
export const obligatoriasDe = (d: Data, f: string): Obligatoria[] => {
  const ag = agendaDe(d, f).map((a): Obligatoria => ({ clave: a.que, item: a, estado: estadoObligatoria(d, f, a.que), hora: a.hora || undefined }))
  const hs = habitsFor(d.habits, f).filter((h) => h.obligatorio).map((h): Obligatoria => {
    const st = d.habitLog[f]?.[h.id]
    return { clave: h.id, habito: h, estado: st === 'no' ? 'no' : st ?? (excusaDe(d, f, h.id) ? 'excusa' : undefined), hora: h.hora }
  })
  return [...ag, ...hs]
}

/** Hábitos flexibles: se hacen cuando el día lo permite. Primero lo que encaja con este momento. */
export const flexiblesDe = (d: Data, f: string) => {
  const h = new Date().getHours()
  const now = h < 12 ? 'manana' : h < 20 ? 'tarde' : 'noche'
  const rank = (x: Habit) => {
    const m = momentoDe(x, d, f)
    return m === now ? 0 : m === 'dia' ? 1 : 2
  }
  return habitsFor(d.habits, f).filter((x) => !x.obligatorio).sort((a, b) => rank(a) - rank(b))
}

export const TIPOS_SUCESO: Record<TipoSuceso, { label: string; icon: string }> = {
  nota: { label: 'Nota', icon: 'pen-line' },
  imprevisto: { label: 'Imprevisto', icon: 'zap' },
  cambio: { label: 'Cambio de plan', icon: 'repeat' },
  bien: { label: 'Algo bueno', icon: 'star' },
}

export interface Evento { id: string; hora?: string; icon: string; texto: string; detalle?: string; ir?: Route; suceso?: Suceso }

const pesos = (n: number) => `$${Math.round(n).toLocaleString('es-AR')}`

/** Todo lo que pasó en el día, armado solo con lo que ya registraste en la app, más tus notas. */
export const eventosDelDia = (d: Data, f: string): Evento[] => {
  const ev: Evento[] = []
  const ci = d.checkins[f]
  const horas = d.planDia[f]?.horas ?? {}
  if (ci?.horaDespertar) ev.push({ id: 'wake', hora: ci.horaDespertar, icon: 'sun', texto: 'Te despertaste', detalle: ci.horaDormir ? `te acostaste ${ci.horaDormir}` : undefined })
  for (const s of d.sucesos ?? []) if (s.fecha === f) ev.push({ id: s.id, hora: s.hora, icon: TIPOS_SUCESO[s.tipo].icon, texto: s.texto, detalle: s.tipo === 'nota' ? undefined : TIPOS_SUCESO[s.tipo].label.toLowerCase(), suceso: s })
  for (const o of obligatoriasDe(d, f)) if (o.item && o.estado === 'hecho') ev.push({ id: `ob-${o.clave}`, hora: horas[`ob:${o.clave}`], icon: 'circle-check', texto: o.clave, detalle: 'obligatoria cumplida' })
  const log = d.habitLog[f] ?? {}
  for (const h of d.habits) {
    const st = log[h.id]
    if (st !== 'hecho' && st !== 'minimo') continue
    ev.push({ id: `h-${h.id}`, hora: horas[h.id], icon: 'check', texto: h.nombre, detalle: st === 'minimo' ? 'versión mínima' : undefined, ir: 'habitos' })
  }
  for (const c of comidasDelDia(d, f)) {
    ev.push({ id: `c-${c.n}`, hora: c.hora, icon: 'utensils', texto: ordinal(c.n), detalle: `${c.items.map((m) => m.nombre).slice(0, 3).join(', ')}${c.items.length > 3 ? '…' : ''} · ${Math.round(c.prot)} g prot`, ir: 'comida' })
  }
  for (const w of d.workouts) if (w.fecha === f) ev.push({ id: `w-${w.id}`, icon: 'dumbbell', texto: `Entrenamiento · ${w.tipo}`, detalle: `${w.minutos} min · esfuerzo ${w.rpe}/10`, ir: 'fisico' })
  for (const c of d.cuerpo ?? []) if (c.fecha === f) ev.push({ id: `cu-${c.id}`, icon: 'wind', texto: c.nombre, detalle: `${c.minutos} min`, ir: 'cuerpo' })
  for (const s of d.study) if (s.fecha === f) ev.push({ id: `s-${s.id}`, icon: 'book-open', texto: `Estudio · ${s.tema}`, detalle: `${s.minutos} min`, ir: 'estudio' })
  for (const j of d.journal) if (j.fecha === f) ev.push({ id: `j-${j.id}`, hora: j.hora, icon: 'notebook-pen', texto: j.modo === 'enojo' ? 'Bajaste el enojo' : 'Escribiste en el diario', detalle: j.privada ? 'privada' : j.emocion, ir: 'vida' })
  for (const m of d.money) if (m.fecha === f) ev.push({ id: `m-${m.id}`, icon: m.tipo === 'gasto' ? 'receipt' : 'banknote', texto: `${m.tipo === 'gasto' ? 'Gasto' : 'Ingreso'} ${m.moneda === 'USD' ? `USD ${m.monto}` : pesos(m.monto)}`, detalle: m.comercio ?? m.nota ?? m.categoria, ir: 'finanzas' })
  for (const s of d.social) if (s.fecha === f) ev.push({ id: `so-${s.id}`, icon: 'users', texto: `${s.tipo[0].toUpperCase()}${s.tipo.slice(1)} con ${s.con}`, ir: 'vida' })
  for (const t of d.tareas ?? []) if (t.hecha === f) ev.push({ id: `t-${t.id}`, hora: horas[`t:${t.id}`], icon: 'list-todo', texto: t.texto, detalle: 'tarea hecha' })
  if (ci?.animoNoche) ev.push({ id: 'noche', hora: horas['ci:noche'], icon: 'moon', texto: 'Check-in de la noche', detalle: ci.victoria ? `victoria: ${ci.victoria}` : undefined })
  // Con hora primero (lo más reciente arriba); lo que no tiene hora queda al final.
  // Lo anotado de madrugada (antes de las 5) es el final del día, no el principio.
  const clave = (h?: string) => (!h ? '' : h < '05:00' ? `2${h}` : `1${h}`)
  return ev.sort((a, b) => clave(b.hora).localeCompare(clave(a.hora)))
}

/** Marca en qué momento se hizo algo (hábito, obligatoria, tarea) para el registro del día. */
export const conHora = (d: Data, f: string, clave: string, on: boolean): Data['planDia'] => {
  const p = d.planDia[f] ?? {}
  const horas = { ...(p.horas ?? {}) }
  if (on) horas[clave] = ahoraHHMM()
  else delete horas[clave]
  return { ...d.planDia, [f]: { ...p, horas } }
}

/** Obligatorias pendientes que ya terminaron hace un rato (para un aviso suave, nunca un castigo). */
export const vencidas = (d: Data, f: string, nowMin: number) =>
  obligatoriasDe(d, f).filter((o) => o.item && o.hora && !o.estado && toMin(o.hora) + duracionBloque(o.item) + 15 < nowMin)

/** ¿Hoy cambió algo respecto de un día normal? Para mostrar "plan cambiado". */
export const diaCambiado = (d: Data, f: string) => !!d.planDia[f]?.agenda || (d.sucesos ?? []).some((s) => s.fecha === f && s.tipo === 'cambio')
