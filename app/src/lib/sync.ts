import { create } from 'zustand'
import { get as idbGet, set as idbSet } from 'idb-keyval'
import { exportData, initialData, useStore, type Data } from './store'
import type { Settings } from './types'

// Sincronización entre dispositivos (iPhone, iPad, PC) a través del script de Google del usuario
// (integraciones/producti-me.gs): guarda una copia de los datos en un archivo de SU Google Drive.
//
// Cómo se combinan los cambios (fusión de 3 vías): `base` es la última versión que este dispositivo
// sincronizó. Si algo cambió solo de un lado, gana ese lado; si se agregó de un lado, se suma; si se
// borró de un lado y el otro no lo tocó, queda borrado. Si los dos cambiaron lo mismo, gana este
// dispositivo. Así se suman los datos cargados en el iPad y en el iPhone sin pisarse.

const BASE_KEY = 'producti-me-sync-base'
/** Ajustes que son de cada dispositivo y nunca viajan (la clave de la IA no sale del dispositivo). */
const LOCALES: (keyof Settings)[] = ['apiKey', 'correoUrl', 'correoToken', 'syncOn']

type J = unknown
const isObj = (x: J): x is Record<string, J> => !!x && typeof x === 'object' && !Array.isArray(x)

/** JSON estable (claves ordenadas): dos objetos iguales dan el mismo texto aunque el orden difiera. */
export const stable = (x: J): string =>
  Array.isArray(x) ? `[${x.map(stable).join(',')}]`
  : isObj(x) ? `{${Object.keys(x).filter((k) => x[k] !== undefined).sort().map((k) => `${JSON.stringify(k)}:${stable(x[k])}`).join(',')}}`
  : JSON.stringify(x ?? null)
const eq = (a: J, b: J) => a === b || stable(a) === stable(b)

const keyOf = (x: J) => (isObj(x) && typeof x.id === 'string' ? `id:${x.id}` : `v:${stable(x)}`)

/** Fusión de 3 vías. `undefined` significa "no existe". En conflicto real gana `l` (este dispositivo). */
export const merge3 = (b: J, l: J, r: J, path = ''): J => {
  if (eq(l, r)) return l
  if (eq(b, l)) return r
  if (eq(b, r)) return l
  if (Array.isArray(l) && Array.isArray(r)) {
    const B = new Map((Array.isArray(b) ? b : []).map((x) => [keyOf(x), x]))
    const L = new Map(l.map((x) => [keyOf(x), x]))
    const R = new Map(r.map((x) => [keyOf(x), x]))
    const out: J[] = []
    const push = (k: string) => {
      const v = merge3(B.get(k), L.get(k), R.get(k), path)
      if (v !== undefined) out.push(v)
    }
    for (const k of L.keys()) push(k)
    for (const k of R.keys()) if (!L.has(k)) push(k)
    return out
  }
  if (isObj(l) && isObj(r)) {
    const bo = isObj(b) ? b : {}
    const out: Record<string, J> = {}
    for (const k of new Set([...Object.keys(l), ...Object.keys(r)])) {
      const v = merge3(bo[k], l[k], r[k], path ? `${path}.${k}` : k)
      if (v !== undefined) out[k] = v
    }
    return out
  }
  // Conflicto en un valor simple. El "día 1" toma el más antiguo de los dos.
  if (path === 'inicio' && typeof l === 'string' && typeof r === 'string') return l < r ? l : r
  return l === undefined ? r : l
}

/** Datos que viajan: todo menos los ajustes locales. */
const portable = (d: Data): Data => {
  const settings = { ...d.settings }
  for (const k of LOCALES) delete settings[k]
  return { ...d, settings: settings as Settings }
}
/** Lo que no debería duplicarse si dos dispositivos lo registraron por separado. */
const limpiar = (d: Data): Data => {
  const vistos = new Set<string>()
  const unico = <T extends { ref?: string }>(m: T) => {
    if (!m.ref) return true
    if (vistos.has(m.ref)) return false
    vistos.add(m.ref)
    return true
  }
  const money = d.money.filter(unico)
  const pendientes = d.pendientes.filter((p) => !p.ref || !vistos.has(p.ref)).filter(unico)
  return { ...d, money, pendientes }
}

// ---------- Estado visible ----------
export type SyncEstado = 'apagado' | 'sincronizando' | 'ok' | 'error' | 'sin conexion'
export const useSync = create<{ estado: SyncEstado; ultima?: string; error?: string; dispositivo?: string }>(() => ({ estado: 'apagado' }))

const nombreDispositivo = () => {
  const ua = navigator.userAgent
  if (/iPad|Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return 'iPad'
  if (/iPhone/.test(ua)) return 'iPhone'
  if (/Android/.test(ua)) return 'Android'
  return 'Computadora'
}

interface Remoto { rev: number; modificado?: string; dispositivo?: string; data?: Data }
interface Base { rev: number; data: Data }

const conf = () => {
  const s = useStore.getState().settings
  return s.syncOn && s.correoUrl ? { url: s.correoUrl, token: s.correoToken ?? '' } : null
}
const llamar = async <T,>(c: { url: string; token: string }, body?: Record<string, unknown>, params?: Record<string, string>): Promise<T> => {
  const u = new URL(c.url)
  let r: Response
  if (body) {
    // text/plain evita la consulta previa de CORS, que Apps Script no responde.
    r = await fetch(u.toString(), { method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ token: c.token, ...body }) })
  } else {
    u.searchParams.set('token', c.token)
    for (const [k, v] of Object.entries(params ?? {})) u.searchParams.set(k, v)
    r = await fetch(u.toString(), { redirect: 'follow', cache: 'no-store' })
  }
  if (!r.ok) throw new Error(`El script respondió ${r.status}.`)
  const j = await r.json() as T & { error?: string }
  if (j.error === 'clave_sin_cambiar') throw new Error('En el script de Google todavía está la clave de ejemplo: cambiala en la línea CLAVE y publicá una versión nueva.')
  if (j.error === 'unauthorized') throw new Error('La clave del script no coincide con la de Ajustes (o falta publicar una versión nueva del script).')
  if (j.error === 'accion') throw new Error('El script es una versión vieja: actualizalo con integraciones/producti-me.gs.')
  return j
}

let corriendo: Promise<void> | null = null
let otraVez = false

/** Trae lo de la nube, lo combina con lo local y sube el resultado. Seguro de llamar seguido. */
export const sincronizar = (): Promise<void> => {
  if (!conf()) { useSync.setState({ estado: 'apagado' }); return Promise.resolve() }
  // Sin internet no se intenta: los cambios quedan en el teléfono y se suben al volver la conexión.
  if (!navigator.onLine) { useSync.setState({ estado: 'sin conexion', error: undefined }); return Promise.resolve() }
  if (corriendo) { otraVez = true; return corriendo }
  corriendo = (async () => {
    try {
      for (let intento = 0; intento < 3; intento++) {
        if (await unaVuelta()) break
      }
      useSync.setState({ estado: 'ok', ultima: new Date().toISOString(), error: undefined })
    } catch (e) {
      useSync.setState({ estado: 'error', error: e instanceof Error ? e.message : String(e) })
    } finally {
      corriendo = null
      if (otraVez) { otraVez = false; void sincronizar() }
    }
  })()
  return corriendo
}

/** Una vuelta de sincronización. Devuelve false si otro dispositivo subió algo en el medio (se reintenta). */
const unaVuelta = async (): Promise<boolean> => {
  const c = conf()
  if (!c) return true
  useSync.setState({ estado: 'sincronizando' })
  const base = await idbGet<Base>(BASE_KEY)
  const head = await llamar<{ rev: number; dispositivo?: string }>(c, undefined, { accion: 'rev' })
  const foto = useStore.getState()
  const local = portable(exportData())

  let combinado: Data
  if (base && head.rev === base.rev) {
    // Nadie más cambió nada desde la última vez.
    if (eq(local, base.data)) return true
    combinado = local
  } else if (head.rev === 0) {
    combinado = local
  } else {
    const remoto = await llamar<Remoto>(c, undefined, { accion: 'leer' })
    if (!remoto.data) throw new Error('El archivo de la nube está vacío o dañado.')
    // Primera vez en este dispositivo: la base son los datos iniciales de la app,
    // así lo que se cargó en el otro dispositivo gana sobre lo que acá quedó sin tocar.
    const b = base?.data ?? portable(initialData())
    combinado = limpiar(merge3(b, local, { ...initialData(), ...remoto.data }) as Data)
    useSync.setState({ dispositivo: remoto.dispositivo })
    aplicar(foto, local, combinado)
    if (eq(combinado, remoto.data)) { await idbSet(BASE_KEY, { rev: remoto.rev, data: combinado }); return true }
    head.rev = remoto.rev
  }
  const res = await llamar<{ ok?: boolean; rev: number; error?: string }>(c, { accion: 'guardar', rev: head.rev, dispositivo: nombreDispositivo(), data: combinado })
  if (res.error === 'conflict') return false
  if (!res.ok) throw new Error(res.error ?? 'No se pudo guardar en la nube.')
  await idbSet(BASE_KEY, { rev: res.rev, data: combinado })
  return true
}

/** Aplica lo combinado sin perder lo que el usuario haya tocado mientras se sincronizaba. */
const aplicar = (foto: Data, local: Data, combinado: Data) => {
  if (eq(local, combinado)) return
  const st = useStore.getState()
  const ahora = portable(exportData())
  const final = st === foto ? combinado : (merge3(local, ahora, combinado) as Data)
  const settings = { ...final.settings } as Settings
  for (const k of LOCALES) (settings as unknown as Record<string, unknown>)[k] = st.settings[k]
  st.set(() => ({ ...final, settings }))
}

/** Combina una copia exportada (archivo) con los datos de este dispositivo, sin borrar nada de ninguno. */
export const combinarCopia = (copia: Partial<Data>) => {
  const local = portable(exportData())
  const otra = portable({ ...initialData(), ...copia } as Data)
  const final = limpiar(merge3(portable(initialData()), local, otra) as Data)
  aplicar(useStore.getState(), local, final)
}

// ---------- Código para vincular otro dispositivo ----------
export const codigoVinculo = () => {
  const s = useStore.getState().settings
  return `PM1-${btoa(unescape(encodeURIComponent(JSON.stringify({ u: s.correoUrl, k: s.correoToken }))))}`
}
export const leerVinculo = (code: string): { u: string; k: string } | null => {
  try {
    const j = JSON.parse(decodeURIComponent(escape(atob(code.trim().replace(/^PM1-/, ''))))) as { u?: string; k?: string }
    return j.u && /^https:\/\/script\.google(usercontent)?\.com\//.test(j.u) ? { u: j.u, k: j.k ?? '' } : null
  } catch { return null }
}

// ---------- Disparadores ----------
let timer: number | undefined
/** Arranca la sincronización automática: al abrir, al volver a la app, tras cada cambio y cada minuto. */
export const iniciarSync = () => {
  const vis = () => { if (document.visibilityState === 'visible') void sincronizar(); else { window.clearTimeout(timer); void sincronizar() } }
  document.addEventListener('visibilitychange', vis)
  const online = () => void sincronizar()
  window.addEventListener('online', online)
  const unsub = useStore.subscribe((s, prev) => {
    if (s === prev || !conf()) return
    window.clearTimeout(timer)
    timer = window.setTimeout(() => void sincronizar(), 2500)
  })
  const id = window.setInterval(() => { if (document.visibilityState === 'visible') void sincronizar() }, 60_000)
  return () => { document.removeEventListener('visibilitychange', vis); window.removeEventListener('online', online); unsub(); window.clearInterval(id) }
}
