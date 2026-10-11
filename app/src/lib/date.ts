// Fechas en formato local YYYY-MM-DD (sin zona horaria) para agrupar por día.
export const iso = (d: Date = new Date()) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
export const today = () => iso()
export const parse = (s: string) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export const addDays = (s: string, n: number) => {
  const d = parse(s)
  d.setDate(d.getDate() + n)
  return iso(d)
}
export const diffDays = (a: string, b: string) =>
  Math.round((parse(a).getTime() - parse(b).getTime()) / 86400000)
/** Lunes de la semana de la fecha dada. */
export const weekStart = (s: string) => {
  const d = parse(s)
  const dow = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - dow)
  return iso(d)
}
export const weekDays = (start: string) => Array.from({ length: 7 }, (_, i) => addDays(start, i))
/** 0 = lunes … 6 = domingo */
export const dow = (s: string) => (parse(s).getDay() + 6) % 7
export const fmtShort = (s: string, lang: 'es' | 'en' = 'es') =>
  parse(s).toLocaleDateString(lang === 'es' ? 'es-AR' : 'en-US', { day: 'numeric', month: 'short' })
export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
