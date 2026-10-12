import type { Alimento, CategoriaAlimento } from '../types'
import { RAW } from './data'

export const CATEGORIAS: { id: CategoriaAlimento; nombre: string; icon: string }[] = [
  { id: 'carnes', nombre: 'Carnes', icon: 'beef' }, { id: 'aves', nombre: 'Pollo y aves', icon: 'drumstick' },
  { id: 'pescados', nombre: 'Pescados', icon: 'fish' }, { id: 'huevos', nombre: 'Huevos', icon: 'egg' },
  { id: 'lacteos', nombre: 'Lácteos', icon: 'milk' }, { id: 'quesos', nombre: 'Quesos', icon: 'milk' },
  { id: 'cereales', nombre: 'Cereales y granos', icon: 'wheat' }, { id: 'panificados', nombre: 'Panes y facturas', icon: 'croissant' },
  { id: 'pastas', nombre: 'Pastas', icon: 'utensils' }, { id: 'legumbres', nombre: 'Legumbres', icon: 'bean' },
  { id: 'verduras', nombre: 'Verduras', icon: 'carrot' }, { id: 'frutas', nombre: 'Frutas', icon: 'apple' },
  { id: 'grasas', nombre: 'Aceites, salsas y frutos secos', icon: 'droplets' }, { id: 'platos', nombre: 'Platos caseros', icon: 'cooking-pot' },
  { id: 'rapida', nombre: 'Comida rápida', icon: 'sandwich' }, { id: 'bebidas', nombre: 'Bebidas', icon: 'cup-soda' },
  { id: 'snacks', nombre: 'Snacks', icon: 'popcorn' }, { id: 'dulces', nombre: 'Dulces y postres', icon: 'cake' },
  { id: 'suplementos', nombre: 'Suplementos', icon: 'dumbbell' }, { id: 'propios', nombre: 'Mis alimentos', icon: 'pencil' },
]

export const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ ]/g, ' ').replace(/\s+/g, ' ').trim()
const slug = (s: string) => norm(s).replace(/ /g, '-')

export const ALIMENTOS: Alimento[] = RAW.trim().split('\n').map((line) => {
  const [nombre, cat, kcal, p, c, g, porc, alias] = line.split('|')
  return {
    id: slug(nombre),
    nombre,
    cat: cat as CategoriaAlimento,
    kcal: Number(kcal), prot: Number(p), carb: Number(c), grasa: Number(g),
    porciones: (porc || '100 g:100').split(';').map((x) => { const i = x.lastIndexOf(':'); return { n: x.slice(0, i), g: Number(x.slice(i + 1)) } }),
    alias: (alias || '').split(',').map((a) => a.trim()).filter(Boolean),
  }
})

/** Macros de una cantidad en gramos. */
export const macros = (a: Pick<Alimento, 'kcal' | 'prot' | 'carb' | 'grasa'>, gramos: number) => {
  const f = gramos / 100
  const r = (n: number) => Math.round(n * f * 10) / 10
  return { kcal: Math.round(a.kcal * f), prot: r(a.prot), carb: r(a.carb), grasa: r(a.grasa) }
}

// Distancia de edición acotada (tolera un error de tipeo por palabra).
const lev = (a: string, b: string, max = 2) => {
  if (Math.abs(a.length - b.length) > max) return max + 1
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]
    let best = i
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
      best = Math.min(best, cur[j])
    }
    if (best > max) return max + 1
    prev = cur
  }
  return prev[b.length]
}

const index = new Map<string, string[]>()
const words = (a: Alimento) => {
  const k = a.id
  if (!index.has(k)) index.set(k, [norm(a.nombre), ...a.alias.map(norm)])
  return index.get(k)!
}

// Qué alimento elegir cuando se busca una palabra genérica ("milanesa", "carne", "arroz").
const DEFAULTS: Record<string, string> = {
  milanesa: 'milanesa-de-carne-frita', carne: 'carne-vacuna-magra-generica', pollo: 'pechuga-de-pollo', arroz: 'arroz-blanco-cocido',
  fideos: 'fideos-secos-cocidos', pasta: 'fideos-secos-cocidos', pure: 'pure-de-papa', huevo: 'huevo', huevos: 'huevo', pan: 'pan-frances',
  empanada: 'empanada-de-carne-al-horno', empanadas: 'empanada-de-carne-al-horno', pizza: 'pizza-de-muzzarella', hamburguesa: 'hamburguesa-completa',
  cafe: 'cafe-negro', yogur: 'yogur-entero-natural', yogurt: 'yogur-entero-natural', leche: 'leche-entera', queso: 'queso-cremoso', papa: 'papa-hervida',
  papas: 'papa-hervida', 'papas fritas': 'papas-fritas-caseras', ensalada: 'ensalada-mixta', asado: 'asado-de-tira', bife: 'bife-de-chorizo',
  atun: 'atun-al-natural', whey: 'proteina-whey', proteina: 'proteina-whey', coca: 'gaseosa-comun', cerveza: 'cerveza', vino: 'vino-tinto',
  galletitas: 'galletitas-de-agua', tostadas: 'tostadas-de-pan', medialuna: 'medialuna-de-manteca', medialunas: 'medialuna-de-manteca',
}

/** Puntaje de coincidencia de una consulta con un alimento (0 = no coincide). `fuzzy` = solo coincidió por error de tipeo. */
const scoreOf = (q: string, a: Alimento): { s: number; fuzzy: boolean } => {
  const qw = q.split(' ').filter(Boolean)
  if (!qw.length) return { s: 0, fuzzy: false }
  const texts = words(a)
  let total = 0
  let fuzzy = false
  for (const w of qw) {
    let best = 0
    for (const t of texts) {
      if (t === w || t.startsWith(w + ' ')) best = Math.max(best, t === norm(a.nombre) ? 10 : 8)
      else if (t.split(' ').some((tw) => tw === w)) best = Math.max(best, 7)
      else if (t.split(' ').some((tw) => tw.startsWith(w))) best = Math.max(best, w.length >= 3 ? 5 : 2)
      else if (w.length >= 4 && t.split(' ').some((tw) => lev(w, tw, w.length >= 7 ? 2 : 1) <= (w.length >= 7 ? 2 : 1))) best = Math.max(best, 3)
    }
    if (!best) return { s: 0, fuzzy: false }
    if (best === 3) fuzzy = true
    total += best
  }
  // Nombre exacto primero, después el alimento típico de la palabra, después los nombres más cortos.
  return { s: total + (norm(a.nombre) === q ? 20 : 0) + (DEFAULTS[q] === a.id ? 15 : 0) - a.nombre.length / 100, fuzzy }
}

export const buscar = (q: string, lista: Alimento[], prioridad: (a: Alimento) => number = () => 0, limite = 40) => {
  const nq = norm(q)
  if (!nq) return []
  const all = lista.map((a) => ({ a, ...scoreOf(nq, a) })).filter((x) => x.s > 0)
  // Si hay coincidencias reales, las que solo coinciden por error de tipeo ("palta" ≈ "pasta") se descartan.
  const exactas = all.some((x) => !x.fuzzy)
  return all
    .filter((x) => !exactas || !x.fuzzy)
    .sort((x, y) => y.s + prioridad(y.a) - (x.s + prioridad(x.a)))
    .slice(0, limite)
    .map((x) => x.a)
}

const NUM: Record<string, number> = { un: 1, una: 1, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, media: 0.5, medio: 0.5 }

/**
 * Interpreta texto libre ("2 huevos", "200 g de arroz", "media palta", "milanesa") y lo convierte en gramos.
 * Devuelve null si no encuentra el alimento.
 */
export const resolver = (texto: string, lista: Alimento[], gramos?: number, cantidad?: number) => {
  const t = norm(texto)
  const g = t.match(/(\d+(?:[.,]\d+)?)\s*(g|gr|gramos|ml|cc)\b/)
  const n = t.match(/^(\d+(?:[.,]\d+)?|un|una|uno|dos|tres|cuatro|cinco|seis|media|medio)\b/)
  const limpio = t.replace(/(\d+(?:[.,]\d+)?)\s*(g|gr|gramos|ml|cc)\b/, '').replace(/^(\d+(?:[.,]\d+)?|un|una|uno|dos|tres|cuatro|cinco|seis|media|medio)\b/, '').replace(/\b(de|con|del|la|el|los|las)\b/g, ' ').trim()
  const a = buscar(limpio || t, lista, undefined, 1)[0]
  if (!a) return null
  let grs = gramos
  if (!grs && g) grs = Number(g[1].replace(',', '.'))
  if (!grs) {
    const k = cantidad ?? (n ? NUM[n[1]] ?? Number(n[1].replace(',', '.')) : 1)
    const unidad = a.porciones.find((p) => /unidad|huevo|feta|empanada|milanesa|porción|pieza|vaso|lata|scoop|pancito|rodaja|alfajor|medialuna|factura|choripán|pancho|sándwich|hamburguesa|tostado/i.test(p.n)) ?? a.porciones[0]
    grs = Math.round(unidad.g * k)
  }
  return { alimento: a, gramos: grs, ...macros(a, grs) }
}
