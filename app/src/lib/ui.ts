import { create } from 'zustand'

// Estado de interfaz (no se guarda): ruta, hojas, avisos y confirmaciones.
export type Route = 'hoy' | 'habitos' | 'comida' | 'fisico' | 'estudio' | 'finanzas' | 'vida' | 'revision' | 'ajustes' | 'coach' | 'areas' | 'cuerpo'
export type SheetKind = 'registrar' | 'mas' | 'checkin-manana' | 'checkin-noche' | 'confirm' | 'castigo' | 'habito' | 'ayuda' | 'cierre' | null

/** Sección visual de cada pantalla: define el tono ambiental (ver styles.css, [data-section]). */
export const SECTION: Record<Route, string> = {
  hoy: 'hoy', habitos: 'hoy', revision: 'hoy', areas: 'areas', coach: 'coach', ajustes: 'coach',
  fisico: 'fisico', comida: 'fisico', estudio: 'estudio', finanzas: 'finanzas', vida: 'vida', cuerpo: 'cuerpo',
}
export const ROUTE_INFO: Record<Route, [string, string]> = {
  hoy: ['Hoy', 'house'], habitos: ['Hábitos', 'list-checks'], coach: ['Coach', 'sparkles'], areas: ['Áreas', 'areas'], fisico: ['Físico', 'dumbbell'],
  comida: ['Comida', 'utensils'], estudio: ['Estudio', 'book-open'], finanzas: ['Finanzas', 'wallet'], vida: ['Vida', 'users'],
  revision: ['Revisión semanal', 'calendar-check'], ajustes: ['Ajustes', 'settings'], cuerpo: ['Cuerpo', 'wind'],
}

interface Toast { id: number; text: string; undo?: () => void; tone?: 'ok' | 'neutral' }
interface Confirm { title: string; body?: string; confirm: string; danger?: boolean; resolve: (ok: boolean) => void }

interface UI {
  route: Route
  sub?: string // pestaña o sección dentro de la pantalla (ej. fisico/cuerpo)
  prev?: Route
  sheet: SheetKind
  palette: boolean
  toast: Toast | null
  confirmReq: Confirm | null
  /** dato de la hoja abierta (ej. id del castigo o del hábito) */
  sheetArg?: string
  /** texto que se precarga en el Coach (desde Hoy) */
  coachDraft?: string
  go: (route: Route, sub?: string) => void
  openSheet: (s: SheetKind, arg?: string) => void
  closeSheet: () => void
  setPalette: (v: boolean) => void
  notify: (text: string, undo?: () => void, tone?: Toast['tone']) => void
  clearToast: () => void
  confirm: (c: Omit<Confirm, 'resolve'>) => Promise<boolean>
}

const ROUTES: Route[] = ['hoy', 'habitos', 'comida', 'fisico', 'estudio', 'finanzas', 'vida', 'revision', 'ajustes', 'coach', 'areas', 'cuerpo']
export const parseHash = (): { route: Route; sub?: string } => {
  const [r, sub] = location.hash.slice(1).split('/')
  return ROUTES.includes(r as Route) ? { route: r as Route, sub } : { route: 'hoy' }
}

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches
/** Transición entre pantallas con View Transitions cuando el navegador la soporta. */
export const withTransition = (fn: () => void) => {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown }
  if (doc.startViewTransition && !reduced()) doc.startViewTransition(fn)
  else fn()
}

let tid = 0
export const useUI = create<UI>((set, get) => ({
  ...parseHash(),
  sheet: null,
  palette: false,
  toast: null,
  confirmReq: null,
  go: (route, sub) => {
    const cur = get()
    if (cur.route === route && cur.sub === sub && !cur.sheet) return
    withTransition(() => set({ prev: cur.route, route, sub, sheet: null, palette: false }))
    const h = sub ? `${route}/${sub}` : route
    if (location.hash.slice(1) !== h) history.replaceState(null, '', `#${h}`)
  },
  openSheet: (sheet, sheetArg) => set({ sheet, sheetArg, palette: false }),
  closeSheet: () => {
    const c = get().confirmReq
    if (c) c.resolve(false)
    set({ sheet: null, confirmReq: null })
  },
  setPalette: (palette) => set({ palette }),
  notify: (text, undo, tone = 'ok') => set({ toast: { id: ++tid, text, undo, tone } }),
  clearToast: () => set({ toast: null }),
  confirm: (c) => new Promise<boolean>((resolve) => set({ confirmReq: { ...c, resolve }, sheet: 'confirm' })),
}))
