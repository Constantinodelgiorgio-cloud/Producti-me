import type { Data } from './store'
import { addDays, today } from './date'
import { agendaDe, toMin } from './logic'
import type { Meal, MomentoComida } from './types'

// Comidas numeradas por orden (1.ª, 2.ª, 3.ª…) con hora, y contador de ayuno con hitos que tienen
// respaldo en estudios con personas. Las referencias completas están en docs/18-comidas-y-ayuno.md.

// ---------- Comidas numeradas ----------
const ORDEN_MOMENTO: Record<MomentoComida, number> = { desayuno: 1, almuerzo: 2, merienda: 3, cena: 4, snack: 5 }
/** Número de comida (para registros viejos sin número, se deduce del momento). */
export const numeroComida = (m: Meal) => m.comida ?? ORDEN_MOMENTO[m.momento ?? 'snack']
/** Momento aproximado por la hora, para compatibilidad con lo anterior (widget, coach). */
export const momentoPorHora = (hhmm: string): MomentoComida => { const h = Number(hhmm.slice(0, 2)); return h < 11 ? 'desayuno' : h < 15 ? 'almuerzo' : h < 19 ? 'merienda' : h < 23 ? 'cena' : 'snack' }
export const ahoraHHMM = () => new Date().toTimeString().slice(0, 5)

export interface ComidaDia { n: number; hora?: string; items: Meal[]; kcal: number; prot: number }
export const comidasDelDia = (d: Pick<Data, 'meals'>, fecha: string): ComidaDia[] => {
  const map = new Map<number, Meal[]>()
  for (const m of d.meals.filter((x) => x.fecha === fecha)) map.set(numeroComida(m), [...(map.get(numeroComida(m)) ?? []), m])
  return [...map.entries()].sort((a, b) => a[0] - b[0]).map(([n, items]) => ({
    n, items, hora: items.map((x) => x.hora).filter(Boolean).sort()[0],
    kcal: items.reduce((a, x) => a + x.kcal, 0), prot: items.reduce((a, x) => a + x.prot, 0),
  }))
}
/**
 * A qué comida va lo que cargás ahora: si la última comida de ese día fue hace menos de 45 min,
 * se suma a esa; si no, es una comida nueva.
 */
export const comidaSugerida = (d: Pick<Data, 'meals'>, fecha: string, hora = ahoraHHMM()) => {
  const cs = comidasDelDia(d, fecha)
  const ult = cs.at(-1)
  if (!ult) return 1
  const ultHora = ult.items.map((x) => x.hora).filter(Boolean).sort().at(-1)
  if (ultHora && Math.abs(toMin(hora) - toMin(ultHora)) < 45) return ult.n
  return ult.n + 1
}
export const ordinal = (n: number) => `${n}.ª comida`

// ---------- Ayuno ----------
/** Momento de la última comida registrada con hora (fecha + hora local). */
export const ultimaComida = (d: Pick<Data, 'meals'>): Date | null => {
  const con = d.meals.filter((m) => m.hora).map((m) => new Date(`${m.fecha}T${m.hora}:00`)).filter((x) => !isNaN(x.getTime()) && x.getTime() <= Date.now())
  if (!con.length) return null
  return new Date(Math.max(...con.map((x) => x.getTime())))
}

export interface Hito { h: number; titulo: string; detalle: string; fuente: string }
/**
 * Hitos con respaldo en humanos. No hay hito de autofagia: no existe una hora demostrada en personas
 * (los 16–48 h que circulan vienen de ratones o de redes sociales).
 */
export const HITOS: Hito[] = [
  { h: 4, titulo: 'Fin de la digestión', detalle: 'Después de una comida mixta, la glucosa y la insulina vuelven a su nivel de base en unas 3–5 h: empieza el estado posabsortivo.', fuente: 'Fisiología del estado posabsortivo (manual de referencia)' },
  { h: 12, titulo: 'Cambio metabólico', detalle: 'Entre las 12 y las 36 h de ayuno el hígado agota buena parte de su glucógeno y el cuerpo empieza a usar más grasa y a producir cuerpos cetónicos. Las 12 h son el umbral más bajo de ese rango.', fuente: 'Anton et al., Obesity 2018' },
  { h: 14, titulo: 'Ventana 14:10', detalle: 'Ayuno de 14 h estudiado en adultos con comida restringida a 10 h: compatible con 4 comidas de proteína y con dormir bien.', fuente: 'Wilkinson et al., Cell Metabolism 2020' },
  { h: 16, titulo: 'Ventana 16:8', detalle: 'En hombres que entrenan fuerza, comer en 8 h con proteína suficiente mantuvo la fuerza y la masa magra y bajó grasa. Con poca proteína, otro estudio vio pérdida de masa magra.', fuente: 'Moro et al., J Transl Med 2016 · Lowe et al., JAMA Intern Med 2020' },
]

export interface Ideal { horas: number; motivo: string }
/**
 * Ayuno ideal del día, según la agenda: más corto los días exigentes (llegar con energía y repartir
 * la proteína importa más) y más largo los días livianos. Nunca más de 16 h.
 */
export const ayunoIdeal = (d: Data, fecha = today()): Ideal => {
  const hoy = agendaDe(d, fecha)
  const manana = agendaDe(d, addDays(fecha, 1))
  const exigente = [...hoy, ...manana.filter((a) => toMin(a.hora) < 12 * 60)].some((a) => a.intensidad === 'partido' || a.intensidad === 'roja')
  const entrena = hoy.some((a) => /gimnasio|rugby|entren|partido/i.test(a.que))
  if (exigente) return { horas: 12, motivo: 'Día exigente (partido o intensidad roja): con 12 h nocturnas alcanza. Llegar comido rinde más y te deja espacio para 4–5 comidas con proteína.' }
  if (entrena) return { horas: 14, motivo: 'Día de entrenamiento: 14 h te deja una ventana de 10 h para 4 comidas de ~50 g de proteína, lo que mejor cuida el músculo en un déficit.' }
  return { horas: 16, motivo: 'Día liviano: hasta 16 h es lo máximo estudiado en gente que entrena fuerza sin perder músculo, siempre que llegues a la proteína del día.' }
}

export interface EstadoAyuno { desde: Date; horas: number; ideal: Ideal; proximo: Hito | null; faltaIdeal: number; superado: Hito[] }
export const estadoAyuno = (d: Data): EstadoAyuno | null => {
  const desde = ultimaComida(d)
  if (!desde) return null
  const horas = (Date.now() - desde.getTime()) / 3600e3
  const ideal = ayunoIdeal(d)
  return {
    desde, horas, ideal,
    proximo: HITOS.find((x) => x.h > horas && x.h <= Math.max(ideal.horas, 12)) ?? null,
    faltaIdeal: Math.max(0, ideal.horas - horas),
    superado: HITOS.filter((x) => x.h <= horas),
  }
}
export const fmtHoras = (h: number) => { const m = Math.round(h * 60); return m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${String(m % 60).padStart(2, '0')} min` : ''}` : `${m} min` }
