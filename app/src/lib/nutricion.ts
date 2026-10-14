import type { Data } from './store'
import { addDays, diffDays, today } from './date'
import { dayNutrition } from './logic'

// Peso como tendencia y gasto calórico adaptativo (al estilo MacroFactor, simplificado):
// gasto ≈ lo que comiste − la energía que ganaste o perdiste según la tendencia del peso.
// Sin rojos ni retos: registrar con honestidad es lo que hace funcionar la estimación.

export const KCAL_POR_KG = 7700
const ALFA = 0.1 // cada día la tendencia se mueve un 10 % hacia el peso de la balanza (The Hacker's Diet)

export interface PuntoPeso { f: string; peso?: number; tendencia: number }
/** Serie diaria desde el primer pesaje: rellena huecos interpolando y suaviza con un promedio móvil exponencial. */
export const tendenciaPeso = (d: Pick<Data, 'body'>, hasta = today()): PuntoPeso[] => {
  const ms = d.body.filter((b) => b.peso).sort((a, b) => a.fecha.localeCompare(b.fecha))
  if (!ms.length) return []
  const out: PuntoPeso[] = []
  let tr = ms[0].peso!
  let j = 0
  for (let f = ms[0].fecha, i = 0; f <= hasta && i < 1000; f = addDays(f, 1), i++) {
    while (j < ms.length - 1 && ms[j + 1].fecha <= f) j++
    const a = ms[j]
    const b = ms[j + 1]
    const real = ms.find((m) => m.fecha === f)?.peso
    // Interpolación lineal entre pesajes; después del último, se mantiene.
    const est = real ?? (b ? a.peso! + ((b.peso! - a.peso!) * diffDays(f, a.fecha)) / diffDays(b.fecha, a.fecha) : a.peso!)
    tr = tr + ALFA * (est - tr)
    out.push({ f, peso: real, tendencia: Math.round(tr * 100) / 100 })
  }
  return out
}

/** Un día cuenta como registrado si tiene al menos 2 comidas cargadas. */
export const diaRegistrado = (d: Pick<Data, 'meals'>, f: string) => d.meals.filter((m) => m.fecha === f).length >= 2

export interface Gasto {
  tdee: number | null; dias: number; registrados: number; cambioSemanalKg: number | null; ingestaMedia: number | null
  sugerido: number | null; ritmoObjetivoKg: number | null; motivo?: string
}
/** Gasto estimado con los últimos 21 días (mínimo 14). Se pausa si faltan más de 3 de cada 7 días o hay pocos pesajes. */
export const gastoAdaptativo = (d: Data, hasta = today()): Gasto => {
  const serie = tendenciaPeso(d, hasta)
  const pesajes = d.body.filter((b) => b.peso && b.fecha <= hasta)
  const dias = Math.min(21, serie.length)
  const ventana = Array.from({ length: dias }, (_, i) => addDays(hasta, -i - 1)).reverse() // hasta ayer (hoy está incompleto)
  const reg = ventana.filter((f) => diaRegistrado(d, f))
  const base: Gasto = { tdee: null, dias, registrados: reg.length, cambioSemanalKg: null, ingestaMedia: null, sugerido: null, ritmoObjetivoKg: null }
  if (pesajes.length < 3 || dias < 14) return { ...base, motivo: `Hacen falta 2 semanas de pesajes (3 o más) y comidas. Llevás ${pesajes.length} pesaje${pesajes.length === 1 ? '' : 's'} y ${reg.length} días completos.` }
  if (reg.length < (dias * 4) / 7) return { ...base, motivo: `Pocos días completos (${reg.length} de ${dias}): con al menos 2 comidas por día alcanza para estimar.` }
  const ingesta = reg.reduce((a, f) => a + dayNutrition(d, f).kcal, 0) / reg.length
  const t0 = serie.find((x) => x.f === ventana[0])?.tendencia ?? serie[0].tendencia
  const t1 = serie.find((x) => x.f === ventana.at(-1))?.tendencia ?? serie.at(-1)!.tendencia
  const deltaKg = t1 - t0
  const tdee = Math.round((ingesta - (deltaKg * KCAL_POR_KG) / dias) / 10) * 10
  const peso = serie.at(-1)!.tendencia
  // Ritmo de bajada para cuidar músculo y fuerza: ~0,7 % del peso por semana.
  const ritmo = 0.007 * peso
  const sugerido = Math.round((tdee - (ritmo * KCAL_POR_KG) / 7) / 50) * 50
  return { ...base, tdee, ingestaMedia: Math.round(ingesta), cambioSemanalKg: Math.round(((deltaKg * 7) / dias) * 100) / 100, sugerido, ritmoObjetivoKg: Math.round(ritmo * 10) / 10 }
}

/** Proteína por comida para aprovecharla mejor: 0,4 g por kg de peso (≈ 40 g para 102 kg). */
export const protPorComida = (d: Pick<Data, 'body' | 'profile'>) => {
  const p = [...d.body].filter((b) => b.peso).sort((a, b) => a.fecha.localeCompare(b.fecha)).at(-1)?.peso ?? d.profile.pesoObjetivo
  return Math.round((0.4 * p) / 5) * 5
}

/** Días completos (≥ 2 comidas) en los últimos 7: la constancia que importa, no la perfección. */
export const adherencia = (d: Pick<Data, 'meals'>, hasta = today()) =>
  Array.from({ length: 7 }, (_, i) => addDays(hasta, -i - 1)).filter((f) => diaRegistrado(d, f)).length
