import type { Data } from './store'
import { addDays, dow, today } from './date'
import { agendaDe, bedtimeFor, sleepHours, toMin, hourFmt, type Note } from './logic'

// Carga de entrenamiento (session-RPE), "listo para hoy" y sueño ampliado.
// Todo se calcula con lo que ya se registra: esfuerzo × minutos, check-in, sueño y FC en reposo de Salud.
// Los pesos del puntaje son una decisión de diseño, no un índice validado: se muestra como ayuda para decidir.

const media = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)
const desvio = (xs: number[]) => { const m = media(xs); return xs.length > 1 ? Math.sqrt(xs.reduce((a, x) => a + (x - m) ** 2, 0) / (xs.length - 1)) : 0 }
const clamp = (x: number, a = 0, b = 100) => Math.max(a, Math.min(b, x))

// ---------- Carga ----------
/** Carga de un día: esfuerzo (1–10) × minutos de cada entrenamiento; el cardio suave suma con esfuerzo 3. */
export const cargaDia = (d: Pick<Data, 'workouts' | 'cuerpo'>, f: string) =>
  d.workouts.filter((w) => w.fecha === f).reduce((a, w) => a + (w.rpe || 5) * (w.minutos || 0), 0)
  + (d.cuerpo ?? []).filter((c) => c.fecha === f && (c.tipo === 'cardio' || c.tipo === 'caminata')).reduce((a, c) => a + 3 * c.minutos, 0)

export interface Carga { semana: number; habitual: number | null; ratio: number | null; etiqueta: string; monotonia: number | null; diasDatos: number; serie: { f: string; v: number }[] }
/** Últimos 7 días contra el promedio semanal de los últimos 28 (descriptivo: no predice lesiones). */
export const carga = (d: Data, hasta = today()): Carga => {
  const serie = Array.from({ length: 28 }, (_, i) => { const f = addDays(hasta, i - 27); return { f, v: cargaDia(d, f) } })
  const ult7 = serie.slice(-7).map((x) => x.v)
  const semana = ult7.reduce((a, b) => a + b, 0)
  const primero = d.workouts.map((w) => w.fecha).sort()[0]
  const diasDatos = primero ? Math.min(28, Math.round((new Date(hasta).getTime() - new Date(primero).getTime()) / 86400e3) + 1) : 0
  const habitual = diasDatos >= 14 ? (serie.slice(-diasDatos).reduce((a, x) => a + x.v, 0) / diasDatos) * 7 : null
  const ratio = habitual ? semana / habitual : null
  const etiqueta = ratio === null ? 'calibrando' : ratio < 0.8 ? 'por debajo de lo habitual' : ratio <= 1.3 ? 'estable' : ratio <= 1.5 ? 'por encima de lo habitual' : 'muy por encima de lo habitual'
  const sd = desvio(ult7)
  const monotonia = semana > 0 && sd > 0 ? media(ult7) / sd : null
  return { semana: Math.round(semana), habitual: habitual ? Math.round(habitual) : null, ratio, etiqueta, monotonia, diasDatos, serie: serie.slice(-14) }
}

// ---------- Día de partido ----------
/** Días respecto del partido más cercano de la agenda (−: antes, +: después). null si no hay partido en ±6 días. */
export const respectoPartido = (d: Data, f = today()): number | null => {
  for (let k = 0; k <= 6; k++) {
    if (agendaDe(d, addDays(f, -k)).some((a) => a.intensidad === 'partido') || d.workouts.some((w) => w.fecha === addDays(f, -k) && w.tipo === 'partido')) return k
    if (k && agendaDe(d, addDays(f, k)).some((a) => a.intensidad === 'partido')) return -k
  }
  return null
}
export const fraseDiaPartido = (md: number | null): string | null => {
  if (md === null) return null
  if (md === 0) return 'Día de partido: desayuno fuerte, hidratación y activación. Nada pesado antes.'
  if (md === 1) return 'Día después del partido: sentirte cargado es lo esperable (dura unas 48 h). Movilidad, caminar y comer bien.'
  if (md === 2) return 'Segundo día después del partido: todavía es normal el dolor. Recuperación activa y técnica liviana.'
  if (md === -1) return 'Víspera del partido: activación corta. Evitá la fuerza pesada y acostate temprano.'
  if (md === -2) return 'A dos días del partido: bajá el volumen; calidad sobre cantidad.'
  if (md <= -4) return 'Lejos del partido: buen momento para la sesión de fuerza más exigente de la semana.'
  return null
}

// ---------- Listo para hoy ----------
export interface Componente { k: string; nombre: string; v: number; detalle: string }
export interface Listo { puntaje: number | null; banda: 'verde' | 'amarillo' | 'rojo' | null; titulo: string; frase: string; componentes: Componente[]; calibrando: number | null; falta?: string }

const horasDormidas = (d: Data, f: string) => sleepHours(d.checkins[f]?.horaDormir, d.checkins[f]?.horaDespertar) ?? d.salud?.[f]?.sueno ?? null
const bienestarCrudo = (d: Data, f: string): number | null => {
  const c = d.checkins[f]
  if (!c) return null
  const xs: number[] = []
  if (c.energia) xs.push((c.energia - 1) / 4)
  if (c.animoManana) xs.push((c.animoManana - 1) / 9)
  if (c.dolor) xs.push((5 - c.dolor) / 4)
  if (c.fatiga) xs.push((5 - c.fatiga) / 4)
  return xs.length >= 2 ? media(xs) : null
}

export const listoParaHoy = (d: Data, f = today()): Listo => {
  const comps: Componente[] = []
  const pesos: Record<string, number> = { sueno: 0.3, bienestar: 0.35, fc: 0.15, carga: 0.2 }
  const necesidad = d.profile.suenoMin
  // Sueño: horas contra tu necesidad + calidad percibida (primero cómo dormiste según vos).
  const h = horasDormidas(d, f)
  const cal = d.checkins[f]?.calidadSueno
  if (h !== null || cal) {
    const v = clamp((h !== null ? Math.min(1, h / necesidad) * 70 : 45) + (cal ? (cal - 1) * 7.5 : 15))
    comps.push({ k: 'sueno', nombre: 'Sueño', v, detalle: `${h !== null ? `${h.toFixed(1).replace('.', ',')} h` : 'sin horas'}${cal ? ` · calidad ${cal}/5` : ''}` })
  }
  // Bienestar: energía, ánimo, dolor y fatiga; contra tu propio promedio cuando hay historia.
  const b = bienestarCrudo(d, f)
  const hist = Array.from({ length: 28 }, (_, i) => bienestarCrudo(d, addDays(f, -i - 1))).filter((x): x is number => x !== null)
  if (b !== null) {
    const sd = desvio(hist)
    const v = hist.length >= 7 && sd > 0.03 ? clamp(65 + 20 * ((b - media(hist)) / sd)) : clamp(b * 100)
    const c = d.checkins[f]!
    comps.push({ k: 'bienestar', nombre: 'Cómo te sentís', v, detalle: [c.energia && `energía ${c.energia}/5`, c.dolor && `dolor ${c.dolor}/5`, c.fatiga && `fatiga ${c.fatiga}/5`].filter(Boolean).join(' · ') || 'check-in' })
  }
  // FC en reposo (Salud): más alta que tu promedio suele indicar cansancio o algo que se viene.
  const fc = d.salud?.[f]?.fcReposo
  const fcs = Array.from({ length: 28 }, (_, i) => d.salud?.[addDays(f, -i - 1)]?.fcReposo).filter((x): x is number => !!x)
  if (fc && fcs.length >= 7) {
    const sd = Math.max(1.5, desvio(fcs))
    const z = (fc - media(fcs)) / sd
    comps.push({ k: 'fc', nombre: 'Pulso en reposo', v: clamp(70 - 15 * z), detalle: `${fc} ppm · tu promedio ${Math.round(media(fcs))}` })
  }
  // Carga: la semana contra lo habitual, y si ayer fue un día muy pesado.
  const C = carga(d, addDays(f, -1))
  if (C.ratio !== null) {
    const ayer = cargaDia(d, addDays(f, -1))
    let v = C.ratio <= 1 ? 85 : C.ratio <= 1.3 ? 75 : C.ratio <= 1.5 ? 55 : 35
    if (C.habitual && ayer > (C.habitual / 7) * 1.8) v -= 10
    comps.push({ k: 'carga', nombre: 'Carga', v: clamp(v), detalle: `semana ${C.etiqueta}` })
  }
  const md = respectoPartido(d, f)
  const diasCheck = Array.from({ length: 28 }, (_, i) => bienestarCrudo(d, addDays(f, -i))).filter((x) => x !== null).length
  if (!comps.length || b === null) {
    return { puntaje: null, banda: null, titulo: 'Listo para hoy', frase: fraseDiaPartido(md) ?? 'Hacé el check-in de la mañana (20 s) para calcularlo.', componentes: comps, calibrando: null, falta: 'checkin' }
  }
  const tot = comps.reduce((a, c) => a + pesos[c.k], 0)
  let puntaje = Math.round(comps.reduce((a, c) => a + c.v * pesos[c.k], 0) / tot)
  const aj = d.checkins[f]?.ajuste
  if (aj) puntaje = clamp(puntaje + (aj === 'mejor' ? 12 : -12))
  const banda = puntaje >= 70 ? 'verde' : puntaje >= 50 ? 'amarillo' : 'rojo'
  const peor = [...comps].sort((a, z) => a.v - z.v)[0]
  const titulo = banda === 'verde' ? 'Listo para exigirte' : banda === 'amarillo' ? 'Día para moderar' : 'Priorizá recuperar'
  const base = banda === 'verde' ? 'Buen día para la sesión exigente o el bloque de estudio más difícil.'
    : banda === 'amarillo' ? `Entrená, pero sin buscar récords. Lo que más pesa hoy: ${peor.nombre.toLowerCase()}.`
    : `Hoy la recuperación es el entrenamiento: respiración y estiramiento en Cuerpo cuentan como día cumplido. Lo que más pesa: ${peor.nombre.toLowerCase()}.`
  const frase = (md === 1 || md === 2) && banda !== 'verde' ? `${fraseDiaPartido(md)} ${banda === 'rojo' ? 'Cuerpo cuenta como día cumplido.' : ''}`.trim() : base
  return { puntaje, banda, titulo, frase, componentes: comps, calibrando: diasCheck < 14 ? diasCheck : null }
}

// ---------- Sueño ampliado ----------
export interface SuenoInfo { deuda: number; noches: number; regularidad: number | null; cafe: string; preentreno: string; siesta: string | null; acostarse: string }
/** Deuda de 14 noches, regularidad (cuánto varía la mitad de tu noche), horarios de cafeína y siesta. */
export const suenoInfo = (d: Data, f = today()): SuenoInfo => {
  const nec = d.profile.suenoMin
  const noches = Array.from({ length: 14 }, (_, i) => horasDormidas(d, addDays(f, -i))).filter((x): x is number => x !== null)
  const deuda = noches.reduce((a, h) => a + Math.max(0, nec - h), 0)
  const mitades = Array.from({ length: 7 }, (_, i) => d.checkins[addDays(f, -i)]).filter((c) => c?.horaDormir && c?.horaDespertar).map((c) => {
    let a = toMin(c!.horaDormir!); const z = toMin(c!.horaDespertar!)
    if (a > z) a -= 1440
    let m = (a + z) / 2
    if (m < -360) m += 1440
    return m
  })
  const regularidad = mitades.length >= 4 ? Math.round(desvio(mitades)) : null
  const acostarse = bedtimeFor(d.profile.despertar[dow(addDays(f, 1))], nec)
  const bed = toMin(acostarse) < 12 * 60 ? toMin(acostarse) + 1440 : toMin(acostarse)
  const cafe = hourFmt(Math.round(bed - 8.8 * 60))
  const preentreno = hourFmt(Math.round(bed - 13.2 * 60))
  const hoy = horasDormidas(d, f)
  const entreno = agendaDe(d, f).find((a) => /gimnasio|rugby|entren/i.test(a.que) && toMin(a.hora) >= 13 * 60)
  const siesta = hoy !== null && hoy < nec ? `Dormiste ${hoy.toFixed(1).replace('.', ',')} h: una siesta de 20–30 min entre las 13 y las 16${entreno ? `, terminándola 30 min antes de ${entreno.que.toLowerCase().split(' ')[0]} (${entreno.hora})` : ''}.` : null
  return { deuda: Math.round(deuda * 10) / 10, noches: noches.length, regularidad, cafe, preentreno, siesta, acostarse }
}

/** Recomendaciones de sueño para Hoy (deuda, regularidad, cafeína y siesta). */
export const notasSueno = (d: Data): Note[] => {
  const S = suenoInfo(d)
  const out: Note[] = []
  const h = new Date().getHours()
  if (S.siesta && h < 16) out.push({ icon: 'bed', text: S.siesta })
  if (h < 16) out.push({ icon: 'coffee', text: `Para dormir bien hoy: último café antes de las ${S.cafe}; un preentreno, antes de las ${S.preentreno}.` })
  if (S.noches >= 5 && S.deuda >= 3) out.push({ icon: 'moon', text: `Deuda de sueño de ${String(S.deuda).replace('.', ',')} h en las últimas ${S.noches} noches. Se paga de a poco: 30–60 min más por noche esta semana.`, tone: 'warn' })
  if (S.regularidad !== null && S.regularidad > 60) out.push({ icon: 'clock', text: `Tu horario de sueño varía unos ${S.regularidad} min de noche a noche. La regularidad pesa tanto como las horas: apuntá a acostarte siempre cerca de las ${S.acostarse}.` })
  return out
}
