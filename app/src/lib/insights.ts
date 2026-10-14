import type { Data } from './store'
import { addDays, today } from './date'
import { compliance, habitsFor, sleepHours } from './logic'
import type { Habit } from './types'

// Insights (al estilo Exist y Bearable): compara cómo estás los días que hacés un hábito contra los días que no.
// Solo con al menos 7 días de cada lado y 21 en total. Se muestran como "puede estar relacionado", nunca como causa.

const media = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length
const varianza = (xs: number[]) => { const m = media(xs); return xs.reduce((a, x) => a + (x - m) ** 2, 0) / Math.max(1, xs.length - 1) }

type Resultado = { k: string; nombre: string; unidad: string; valor: (d: Data, f: string) => number | undefined; siguiente?: boolean; mejorAlto: boolean }
const RESULTADOS: Resultado[] = [
  { k: 'animo', nombre: 'tu ánimo a la noche', unidad: 'puntos', mejorAlto: true, valor: (d, f) => d.checkins[f]?.animoNoche ?? d.journal.filter((j) => j.fecha === f && j.animo).at(-1)?.animo },
  { k: 'estres', nombre: 'tu estrés', unidad: 'puntos', mejorAlto: false, valor: (d, f) => d.checkins[f]?.estres },
  { k: 'energia', nombre: 'tu energía al día siguiente', unidad: 'puntos', mejorAlto: true, siguiente: true, valor: (d, f) => d.checkins[f]?.energia },
  { k: 'sueno', nombre: 'las horas que dormís esa noche', unidad: 'h', mejorAlto: true, siguiente: true, valor: (d, f) => sleepHours(d.checkins[f]?.horaDormir, d.checkins[f]?.horaDespertar) ?? d.salud?.[f]?.sueno },
]

export interface Insight { habito: Habit; resultado: string; diff: number; unidad: string; estrellas: number; nCon: number; nSin: number; frase: string; positivo: boolean }
export interface Insights { lista: Insight[]; dias: number; faltan: number }

export const calcularInsights = (d: Data, hasta = today()): Insights => {
  const dias = Array.from({ length: 90 }, (_, i) => addDays(hasta, -i - 1)).filter((f) => f >= d.inicio)
  const conDatos = dias.filter((f) => d.habitLog[f] && Object.keys(d.habitLog[f]).length).length
  const out: Insight[] = []
  for (const h of d.habits.filter((x) => x.activo)) {
    for (const r of RESULTADOS) {
      const con: number[] = []
      const sin: number[] = []
      for (const f of dias) {
        if (!habitsFor(d.habits, f).some((x) => x.id === h.id) || !d.habitLog[f]) continue
        const st = d.habitLog[f][h.id]
        if (st === 'reserva') continue
        const v = r.valor(d, r.siguiente ? addDays(f, 1) : f)
        if (v === undefined || v === null) continue
        if (st === 'hecho' || st === 'minimo') con.push(v)
        else sin.push(v)
      }
      if (con.length < 7 || sin.length < 7 || con.length + sin.length < 21) continue
      const diff = media(con) - media(sin)
      const sd = Math.sqrt((varianza(con) + varianza(sin)) / 2) || 1
      const dz = diff / sd
      if (Math.abs(dz) < 0.4) continue
      const estrellas = Math.max(1, Math.min(5, Math.round(Math.abs(dz) * 2 + Math.log2(Math.min(con.length, sin.length) / 7))))
      const positivo = r.mejorAlto ? diff > 0 : diff < 0
      const cant = `${Math.abs(diff).toFixed(1).replace('.', ',')} ${r.unidad}`
      out.push({
        habito: h, resultado: r.k, diff, unidad: r.unidad, estrellas, nCon: con.length, nSin: sin.length, positivo,
        frase: `Los días que hacés «${h.nombre}», ${r.nombre} ${diff > 0 ? 'sube' : 'baja'} ${cant} en promedio. Puede estar relacionado.`,
      })
    }
  }
  out.sort((a, b) => b.estrellas - a.estrellas || Math.abs(b.diff) - Math.abs(a.diff))
  // Un insight por hábito, los 3 más confiables.
  const vistos = new Set<string>()
  const lista = out.filter((x) => (vistos.has(x.habito.id) ? false : (vistos.add(x.habito.id), true))).slice(0, 3)
  return { lista, dias: conDatos, faltan: Math.max(0, 21 - conDatos) }
}

/** Resumen del mes contra el mes anterior: comparación con tu propia historia, no con otros. */
export const resumenMes = (d: Data, mes = today().slice(0, 7)) => {
  const prevD = new Date(`${mes}-01T12:00`); prevD.setMonth(prevD.getMonth() - 1)
  const prev = `${prevD.getFullYear()}-${String(prevD.getMonth() + 1).padStart(2, '0')}`
  const diasMes = (m: string) => { const out: string[] = []; for (let f = `${m}-01`; f.startsWith(m) && f <= today(); f = addDays(f, 1)) out.push(f); return out }
  const calc = (m: string) => {
    const ds = diasMes(m)
    const c = compliance(d, ds)
    return {
      habitos: c === null ? null : Math.round(c * 100),
      entrenos: d.workouts.filter((w) => w.fecha.startsWith(m)).length,
      estudio: Math.round(d.study.filter((s) => s.fecha.startsWith(m)).reduce((a, s) => a + s.minutos, 0) / 60),
      diario: d.journal.filter((j) => j.fecha.startsWith(m)).length,
      contactos: d.social.filter((s) => s.fecha.startsWith(m)).length,
      recuperacion: (d.cuerpo ?? []).filter((c2) => c2.fecha.startsWith(m)).reduce((a, c2) => a + c2.minutos, 0),
    }
  }
  return { mes, actual: calc(mes), anterior: calc(prev) }
}
