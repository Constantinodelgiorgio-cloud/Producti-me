import { useStore, type Data } from './store'
import type { MoneyMove } from './types'

// Contexto argentino: dólar MEP (dolarapi.com) e inflación mensual (IPC del INDEC vía datos.gob.ar).
// Ambas fuentes son públicas, sin clave y permiten consultas desde el navegador. Se guardan en caché.

const SERIE_IPC = '148.3_INIVELNAL_DICI_M_26'

export const actualizarMercado = async (forzar = false) => {
  const m = useStore.getState().mercado ?? {}
  if (!forzar && m.actualizado && Date.now() - new Date(m.actualizado).getTime() < 6 * 3600e3) return
  const [dolar, ipc] = await Promise.allSettled([
    fetch('https://dolarapi.com/v1/dolares/bolsa').then((r) => r.json() as Promise<{ venta: number; fechaActualizacion: string }>),
    fetch(`https://apis.datos.gob.ar/series/api/series/?ids=${SERIE_IPC}&last=24&format=json`).then((r) => r.json() as Promise<{ data: [string, number][] }>),
  ])
  useStore.getState().set((s) => ({
    mercado: {
      ...s.mercado,
      ...(dolar.status === 'fulfilled' && dolar.value?.venta ? { mep: { venta: dolar.value.venta, fecha: dolar.value.fechaActualizacion } } : {}),
      ...(ipc.status === 'fulfilled' && ipc.value?.data ? { ipc: Object.fromEntries(ipc.value.data.map(([f, v]) => [f.slice(0, 7), v])) } : {}),
      actualizado: new Date().toISOString(),
    },
  }))
}

/** Inflación mensual del último mes publicado (ej. 0,019 = 1,9 %). */
export const inflacionMensual = (d: Pick<Data, 'mercado'>): { tasa: number; mes: string } | null => {
  const ipc = d.mercado?.ipc
  if (!ipc) return null
  const meses = Object.keys(ipc).sort()
  if (meses.length < 2) return null
  const a = meses.at(-1)!
  const b = meses.at(-2)!
  return { tasa: ipc[a] / ipc[b] - 1, mes: a }
}
/** Inflación acumulada entre dos meses (usa la última conocida para los meses sin publicar). */
export const inflacionEntre = (d: Pick<Data, 'mercado'>, desde: string, hasta: string) => {
  const ipc = d.mercado?.ipc ?? {}
  const ult = inflacionMensual(d)?.tasa ?? 0.02
  let f = 1
  for (let m = desde; m < hasta; m = sumarMes(m, 1)) {
    const sig = sumarMes(m, 1)
    f *= ipc[sig] && ipc[m] ? ipc[sig] / ipc[m] : 1 + ult
  }
  return f - 1
}
export const sumarMes = (m: string, n: number) => {
  const d = new Date(`${m}-01T12:00`)
  d.setMonth(d.getMonth() + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// ---------- Cuotas ----------
/** Lo que pagás de cuotas en cada uno de los próximos meses (resumen de la tarjeta). */
export const proyeccionCuotas = (d: Pick<Data, 'cuotas'>, desde: string, meses = 6) =>
  Array.from({ length: meses }, (_, i) => {
    const mes = sumarMes(desde, i)
    const items = (d.cuotas ?? []).filter((c) => mes >= c.primerMes && mes < sumarMes(c.primerMes, c.cantidad))
    return { mes, total: items.reduce((a, c) => a + c.total / c.cantidad, 0), items }
  })
/** Cuotas vs. contado: valor presente de las cuotas descontado por la inflación esperada. */
export const compararCuotas = (contado: number, totalCuotas: number, n: number, inflMensual: number) => {
  const cuota = totalCuotas / n
  let vp = 0
  for (let k = 1; k <= n; k++) vp += cuota / Math.pow(1 + inflMensual, k)
  return { cuota, vp, recargo: totalCuotas / contado - 1, conviene: vp < contado ? 'cuotas' as const : 'contado' as const, diferencia: Math.abs(contado - vp) }
}

// ---------- Gastos fijos y suscripciones ----------
export interface Recurrente { clave: string; nombre: string; promedio: number; meses: number; ultimo: string; usd: boolean }
/** Mismo comercio (o categoría de servicios) en 2+ meses distintos con montos parecidos. */
export const recurrentes = (d: Pick<Data, 'money'>): Recurrente[] => {
  const grupos = new Map<string, MoneyMove[]>()
  for (const m of d.money.filter((x) => x.tipo === 'gasto' && x.categoria !== 'Aporte a inversiones')) {
    const k = (m.comercio || (m.categoria === 'Servicios y suscripciones' || m.categoria === 'Tecnología e IA' ? `${m.categoria}·${Math.round(m.monto / 1000)}` : '')).toLowerCase().trim()
    if (!k) continue
    grupos.set(k, [...(grupos.get(k) ?? []), m])
  }
  const out: Recurrente[] = []
  for (const [k, ms] of grupos) {
    const porMes = new Map<string, number>()
    for (const m of ms) porMes.set(m.fecha.slice(0, 7), (porMes.get(m.fecha.slice(0, 7)) ?? 0) + m.monto)
    if (porMes.size < 2) continue
    const vals = [...porMes.values()]
    const prom = vals.reduce((a, b) => a + b, 0) / vals.length
    if (vals.some((v) => Math.abs(v - prom) / prom > 0.25)) continue
    const ult = ms.sort((a, b) => b.fecha.localeCompare(a.fecha))[0]
    out.push({ clave: k, nombre: ult.comercio || ult.categoria, promedio: Math.round(prom), meses: porMes.size, ultimo: ult.fecha, usd: ms.some((m) => m.moneda === 'USD') })
  }
  return out.sort((a, b) => b.promedio - a.promedio)
}
