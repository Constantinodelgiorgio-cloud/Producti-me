import type { Data } from './store'
import type { Accion, AgendaItem, Cambio, CategoriaExcusa, Excusa, Momento, PlanDia } from './types'
import { agendaDe } from './logic'
import { uid } from './date'

// Motor de cambios: el Coach (o la interfaz) propone acciones tipadas; acá se validan, se aplican
// sobre `planDia`/`checkins` y se guarda el estado anterior de cada fecha para revertir el grupo entero.

const HORA = /^([01]\d|2[0-3]):[0-5]\d$/
const FECHA = /^\d{4}-\d{2}-\d{2}$/
export const CATEGORIAS_EXCUSA: CategoriaExcusa[] = ['causa externa', 'compromiso real', 'salud', 'fuerza mayor']
const MOMENTOS: Momento[] = ['manana', 'dia', 'tarde', 'noche']

// Excusas que no aportan al progreso: no se aceptan.
const FLOJAS: [RegExp, string][] = [
  [/me (quedé|quede) dormid|me dorm[ií]|no (me )?escuch[eé] (la )?alarma|me levant[eé] tarde/i, 'quedarse dormido'],
  [/no ten[ií]a ganas|sin ganas|fiaca|pereza|vagancia|paja/i, 'falta de ganas'],
  [/me olvid[eé]|se me pas[oó]|no me acord[eé]/i, 'olvido'],
  [/^(estaba )?cansad[oa]\.?$|estaba cansado y ya/i, 'cansancio sin causa'],
  [/no pude porque no\b|porque s[ií]\b|no s[eé]\b/i, 'motivo vacío'],
]

/** Valida que una excusa sea fundamentada y específica. Devuelve el error o null. */
export const validarExcusa = (e: Partial<Excusa>): string | null => {
  const m = (e.motivo ?? '').trim()
  if (!e.categoria || !CATEGORIAS_EXCUSA.includes(e.categoria)) return 'Elegí qué tipo de causa fue: externa, compromiso real, salud o fuerza mayor.'
  const floja = FLOJAS.find(([r]) => r.test(m))
  if (floja) return `"${m}" no es una excusa válida (${floja[1]}): no aporta al progreso. Marcalo como no hecho o hacé la versión mínima.`
  if (m.length < 20 || m.split(/\s+/).length < 5) return 'La excusa tiene que ser específica: qué pasó, con quién o dónde (al menos 5 palabras).'
  return null
}

const sameItem = (a: AgendaItem, hora: string, que: string) =>
  a.hora === hora || a.que.toLowerCase().includes(que.toLowerCase().slice(0, 18)) || que.toLowerCase().includes(a.que.toLowerCase().slice(0, 18))

/** Valida una acción contra los datos actuales. Devuelve un texto de error o null. */
export const validarAccion = (d: Data, a: Accion): string | null => {
  if (!a || typeof a !== 'object' || !('tipo' in a)) return 'Acción sin tipo.'
  if (!FECHA.test(a.fecha ?? '')) return `Fecha inválida: ${a.fecha}`
  switch (a.tipo) {
    case 'agenda_quitar':
    case 'agenda_mover': {
      const items = agendaDe(d, a.fecha)
      const it = items.find((x) => x.hora === a.hora && sameItem(x, a.hora, a.que)) ?? items.find((x) => sameItem(x, a.hora, a.que))
      if (!it) return `No hay un bloque "${a.que}" a las ${a.hora} el ${a.fecha}. Bloques: ${items.map((x) => `${x.hora} ${x.que}`).join('; ') || 'ninguno'}.`
      if (a.tipo === 'agenda_mover' && !HORA.test(a.nueva_hora ?? '')) return `Hora nueva inválida: ${a.nueva_hora}`
      return null
    }
    case 'agenda_agregar':
      if (!HORA.test(a.hora ?? '')) return `Hora inválida: ${a.hora}`
      if (!a.que?.trim()) return 'Falta qué agregar.'
      return null
    case 'habito_excusar': {
      if (!d.habits.some((h) => h.id === a.habito_id)) return `No existe el hábito ${a.habito_id}.`
      return validarExcusa(a)
    }
    case 'habito_momento':
      if (!d.habits.some((h) => h.id === a.habito_id)) return `No existe el hábito ${a.habito_id}.`
      if (!MOMENTOS.includes(a.momento)) return `Momento inválido: ${a.momento}`
      return null
    case 'prioridad':
      return a.texto?.trim() ? null : 'Prioridad vacía.'
    default:
      return `Tipo de acción desconocido: ${(a as { tipo: string }).tipo}`
  }
}

const applyOne = (plan: Record<string, PlanDia>, prio: Record<string, string>, d: Data, a: Accion) => {
  const p: PlanDia = { ...(plan[a.fecha] ?? {}) }
  const base = () => (p.agenda ?? agendaDe(d, a.fecha)).map((x) => ({ ...x }))
  switch (a.tipo) {
    case 'agenda_quitar': {
      const items = base()
      const i = items.findIndex((x) => x.hora === a.hora && sameItem(x, a.hora, a.que))
      items.splice(i >= 0 ? i : items.findIndex((x) => sameItem(x, a.hora, a.que)), 1)
      p.agenda = items
      break
    }
    case 'agenda_mover': {
      const items = base()
      const i = items.findIndex((x) => x.hora === a.hora && sameItem(x, a.hora, a.que))
      const j = i >= 0 ? i : items.findIndex((x) => sameItem(x, a.hora, a.que))
      if (j >= 0) items[j] = { ...items[j], hora: a.nueva_hora }
      p.agenda = items.sort((x, y) => x.hora.localeCompare(y.hora))
      break
    }
    case 'agenda_agregar':
      p.agenda = [...base(), { hora: a.hora, que: a.que.trim(), ...(a.intensidad ? { intensidad: a.intensidad } : {}) }].sort((x, y) => x.hora.localeCompare(y.hora))
      break
    case 'habito_excusar':
      p.excusas = { ...(p.excusas ?? {}), [a.habito_id]: { motivo: a.motivo.trim(), categoria: a.categoria, ...(a.alternativa?.trim() ? { alternativa: a.alternativa.trim() } : {}) } }
      break
    case 'habito_momento':
      p.momentos = { ...(p.momentos ?? {}), [a.habito_id]: a.momento }
      break
    case 'prioridad':
      prio[a.fecha] = a.texto.trim()
      return
  }
  plan[a.fecha] = p
}

/** Aplica un grupo de acciones ya validadas. Devuelve el parche del store y el registro del cambio. */
export const aplicarAcciones = (d: Data, acciones: Accion[], resumen: string, origen: Cambio['origen']): { patch: Partial<Data>; cambio: Cambio } => {
  const fechas = [...new Set(acciones.map((a) => a.fecha))]
  const antes: Cambio['antes'] = { planDia: {}, prioridad: {} }
  for (const f of fechas) {
    antes.planDia[f] = d.planDia[f] ? structuredClone(d.planDia[f]) : null
    antes.prioridad[f] = d.checkins[f]?.prioridad ?? null
  }
  const plan = { ...d.planDia }
  const prio: Record<string, string> = {}
  for (const a of acciones) applyOne(plan, prio, d, a)
  const checkins = { ...d.checkins }
  for (const [f, t] of Object.entries(prio)) checkins[f] = { ...(checkins[f] ?? { fecha: f }), prioridad: t }
  const cambio: Cambio = { id: uid(), creado: new Date().toISOString(), origen, resumen, acciones, antes }
  return { patch: { planDia: plan, checkins, cambios: [...d.cambios, cambio] }, cambio }
}

/** Revierte un grupo: restaura cada fecha tocada a como estaba antes de aplicarlo. */
export const revertirCambio = (d: Data, id: string): Partial<Data> | null => {
  const c = d.cambios.find((x) => x.id === id)
  if (!c || c.revertido) return null
  const plan = { ...d.planDia }
  for (const [f, p] of Object.entries(c.antes.planDia)) { if (p) plan[f] = p; else delete plan[f] }
  const checkins = { ...d.checkins }
  for (const [f, t] of Object.entries(c.antes.prioridad)) if (checkins[f]) checkins[f] = { ...checkins[f], prioridad: t ?? undefined }
  return { planDia: plan, checkins, cambios: d.cambios.map((x) => (x.id === id ? { ...x, revertido: true } : x)) }
}

/** Texto corto de una acción, para las tarjetas de propuesta. */
export const describir = (d: Data, a: Accion): { signo: '+' | '−' | '~'; texto: string } => {
  const hab = (id: string) => d.habits.find((h) => h.id === id)?.nombre ?? id
  switch (a.tipo) {
    case 'agenda_quitar': return { signo: '−', texto: `${a.hora} ${a.que}` }
    case 'agenda_mover': return { signo: '~', texto: `${a.que}: ${a.hora} → ${a.nueva_hora}` }
    case 'agenda_agregar': return { signo: '+', texto: `${a.hora} ${a.que}${a.intensidad ? ` · ${a.intensidad}` : ''}` }
    case 'habito_excusar': return { signo: '~', texto: `Excusar "${hab(a.habito_id)}" · ${a.categoria}: ${a.motivo}${a.alternativa ? ` · alternativa: ${a.alternativa}` : ''}` }
    case 'habito_momento': return { signo: '~', texto: `"${hab(a.habito_id)}" pasa a la ${{ manana: 'mañana', dia: 'franja flexible', tarde: 'tarde', noche: 'noche' }[a.momento]}` }
    case 'prioridad': return { signo: '+', texto: `Prioridad: ${a.texto}` }
  }
}
