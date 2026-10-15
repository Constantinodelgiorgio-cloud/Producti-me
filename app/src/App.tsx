import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useStore } from './lib/store'
import { castigosPendientes, levelInfo, processRules, sancionActiva, totalXp } from './lib/logic'
import { parseHash, ROUTE_INFO, SECTION, useUI, type Route } from './lib/ui'
import { Icon } from './components/Icon'
import { Bar } from './components/ui'
import { today, uid } from './lib/date'
import { hayRiesgo } from './lib/seguridad'
import { AyudaSheet, CheckinSheet, ConfirmSheet, MasSheet, RegistrarSheet } from './components/Sheets'
import { CastigoSheet } from './components/Castigos'
import { HabitSheet } from './components/HabitTile'
import { CierreSheet } from './components/Tareas'
import { syncCorreo } from './lib/correo'
import { iniciarSync, sincronizar } from './lib/sync'
import { iniciarSalud } from './lib/salud'
import Hoy from './pages/Hoy'
import Habitos from './pages/Habitos'

// Las pantallas con gráficos se cargan al abrirlas (Recharts no entra en la carga inicial).
const Comida = lazy(() => import('./pages/Comida'))
const Fisico = lazy(() => import('./pages/Fisico'))
const Estudio = lazy(() => import('./pages/Estudio'))
const Finanzas = lazy(() => import('./pages/Finanzas'))
const Vida = lazy(() => import('./pages/Vida'))
const Revision = lazy(() => import('./pages/Revision'))
const Ajustes = lazy(() => import('./pages/Ajustes'))
const Coach = lazy(() => import('./pages/Coach'))
const Areas = lazy(() => import('./pages/Areas'))
const Cuerpo = lazy(() => import('./pages/Cuerpo'))
const PAGES: Record<Route, React.ComponentType> = { hoy: Hoy, habitos: Habitos, comida: Comida, fisico: Fisico, estudio: Estudio, finanzas: Finanzas, vida: Vida, revision: Revision, ajustes: Ajustes, coach: Coach, areas: Areas, cuerpo: Cuerpo }

const SIDE: [Route, string][] = [['hoy', '1'], ['habitos', '2'], ['coach', '3'], ['fisico', '4'], ['estudio', '5'], ['finanzas', '6'], ['vida', '7'], ['cuerpo', '8']]
const TABS: (Route | '+')[] = ['hoy', 'habitos', '+', 'coach', 'areas']
const AREA_ROUTES: Route[] = ['areas', 'cuerpo', 'fisico', 'comida', 'estudio', 'finanzas', 'vida', 'revision', 'ajustes']

/** Marca "Horizonte": un sol que sale sobre la curva de un horizonte. */
export const Logo = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
    <defs>
      <radialGradient id="lg-sun" cx="32" cy="33" r="15" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#fff" /><stop offset=".33" stopColor="#E8EDFF" /><stop offset=".36" stopColor="#C3D0FF" stopOpacity=".45" /><stop offset="1" stopColor="#8EA8FF" stopOpacity="0" /></radialGradient>
      <linearGradient id="lg-rim" x1="9" x2="55" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#8EA8FF" stopOpacity="0" /><stop offset=".5" stopColor="#F2F5FF" /><stop offset="1" stopColor="#8EA8FF" stopOpacity="0" /></linearGradient>
      <clipPath id="lg-c"><rect width="64" height="64" rx="15" /></clipPath>
    </defs>
    <g clipPath="url(#lg-c)">
      <rect width="64" height="64" fill="#0A0B0F" />
      <circle cx="32" cy="33" r="15" fill="url(#lg-sun)" />
      <circle cx="32" cy="72" r="38" fill="#07080B" />
      <path d="M9 42 A38 38 0 0 1 55 42" fill="none" stroke="url(#lg-rim)" strokeWidth="1.8" strokeLinecap="round" />
    </g>
    <rect x=".5" y=".5" width="63" height="63" rx="14.5" fill="none" stroke="#262A31" />
  </svg>
)

function Splash() {
  return <div style={{ height: '100%', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}><Logo size={44} /></div>
}

export default function App() {
  const [ready, setReady] = useState(useStore.persist.hasHydrated())
  useEffect(() => useStore.persist.onFinishHydration(() => setReady(true)), [])
  useEffect(() => {
    if (!ready) return
    const run = () => { const patch = processRules(useStore.getState()); if (patch) useStore.getState().set(() => patch) }
    // Pedir almacenamiento persistente: iOS lo concede a las apps de la pantalla de inicio y evita que borre datos.
    try { void navigator.storage?.persist?.() } catch { /* sin soporte */ }
    // Primero se traen los datos de los otros dispositivos; recién después se evalúan las reglas del día.
    // Al marcar hábitos se revisa enseguida si algún castigo quedó anulado por volver.
    let rt: number | undefined
    const unsubRules = useStore.subscribe((s, p) => { if (s.habitLog !== p.habitLog || s.estados !== p.estados) { window.clearTimeout(rt); rt = window.setTimeout(run, 400) } })
    const stop = iniciarSync()
    const stopSalud = iniciarSalud()
    void sincronizar().finally(run)
    // Correo de pagos: al abrir la app y cada 10 minutos mientras está abierta.
    const mail = () => { if (useStore.getState().settings.correoUrl) syncCorreo().catch(() => { /* el error queda en correo.error */ }) }
    mail()
    const id = window.setInterval(() => { run(); mail() }, 10 * 60 * 1000)
    const vis = () => { if (document.visibilityState === 'visible') { run(); mail() } }
    document.addEventListener('visibilitychange', vis)
    return () => { unsubRules(); stop(); stopSalud(); window.clearInterval(id); document.removeEventListener('visibilitychange', vis) }
  }, [ready])
  return ready ? <Shell /> : <Splash />
}

function Shell() {
  const ui = useUI()
  const xp = useStore((s) => totalXp(s))
  const pend = useStore((s) => castigosPendientes(s).length)
  const san = useStore((s) => sancionActiva(s))
  const areasOff = useStore((s) => s.settings.areasOff)
  const L = levelInfo(xp)
  const scroll = useRef<HTMLDivElement>(null)
  const [compact, setCompact] = useState(false)
  const route = ui.route
  const P = PAGES[route]
  const tabOf = (r: Route): Route => (AREA_ROUTES.includes(r) ? 'areas' : r)
  const activeTab = tabOf(route)

  useEffect(() => { scroll.current?.scrollTo({ top: 0 }); setCompact(false) }, [ui.route, ui.sub])
  useEffect(() => {
    const on = () => { const h = parseHash(); useUI.setState({ route: h.route, sub: h.sub }) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  useEffect(() => {
    if (!ui.toast) return
    const t = setTimeout(() => useUI.getState().clearToast(), 4200)
    return () => clearTimeout(t)
  }, [ui.toast])
  // Número en el ícono de la app instalada: castigos pendientes.
  useEffect(() => {
    const n = navigator as Navigator & { setAppBadge?: (n?: number) => Promise<void>; clearAppBadge?: () => Promise<void> }
    try { if (pend) n.setAppBadge?.(pend)?.catch(() => {}); else n.clearAppBadge?.()?.catch(() => {}) } catch { /* sin soporte */ }
  }, [pend])
  // Atajos de escritorio: ⌘K comandos, R registrar, 1–7 pantallas.
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const s = useUI.getState()
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); s.setPalette(!s.palette); return }
      if (e.key === 'Escape') { if (s.palette) s.setPalette(false); else if (s.sheet) s.closeSheet(); return }
      if (s.sheet || s.palette || (e.target as HTMLElement).matches('input, textarea, select, [contenteditable]') || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key.toLowerCase() === 'r') { e.preventDefault(); s.openSheet('registrar') }
      const n = Number(e.key)
      if (n >= 1 && n <= SIDE.length) s.go(SIDE[n - 1][0])
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [])

  const tabIdx = TABS.indexOf(activeTab)
  const [name, icon] = ROUTE_INFO[route]
  // Título de la pestaña o ventana según la pantalla (y en el selector de apps del sistema).
  useEffect(() => { document.title = route === 'hoy' ? 'Producti-me' : `${name} · Producti-me` }, [route, name])

  return (
    <div className="shell" data-section={SECTION[route]}>
      <div className="aura" aria-hidden="true" />
      <nav className="side" aria-label="Navegación principal">
        <div className="brand"><Logo size={28} /><b>PRODUCTI-ME</b></div>
        <button className="side-cta" onClick={() => ui.openSheet('registrar')}><Icon name="plus" />Registrar<span className="kbd end">R</span></button>
        {SIDE.filter(([k]) => !(areasOff ?? []).includes(k)).map(([k, key]) => (
          <button key={k} className="side-btn" data-s={SECTION[k]} aria-current={route === k || (k === 'fisico' && route === 'comida') ? 'page' : undefined} onClick={() => ui.go(k)}>
            <Icon name={ROUTE_INFO[k][1]} />{ROUTE_INFO[k][0]}{k === 'hoy' && pend > 0 && <span className="badge">{pend}</span>}<span className="kbd end">{key}</span>
          </button>
        ))}
        <div className="side-sep" />
        <button className="side-btn" aria-current={route === 'areas' ? 'page' : undefined} onClick={() => ui.go('areas')}><Icon name="areas" />Áreas</button>
        <button className="side-btn" aria-current={route === 'revision' ? 'page' : undefined} onClick={() => ui.go('revision')}><Icon name="calendar-check" />Revisión semanal</button>
        <button className="side-btn" aria-current={route === 'ajustes' ? 'page' : undefined} onClick={() => ui.go('ajustes')}><Icon name="settings" />Ajustes</button>
        <button className="side-btn" onClick={() => ui.setPalette(true)}><Icon name="command" />Comandos<span className="kbd end">⌘K</span></button>
        <div className="side-foot">
          {san && <span className="warn-t"><Icon name="lock" size={13} /> Sin XP hasta {new Date(san.hasta).toLocaleString('es-AR', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}</span>}
          <span>Nivel {L.lvl} · Liga {L.league.name}</span>
          <Bar value={L.progress} />
          <span className="num">{L.toNext.toLocaleString('es-AR')} XP para el nivel {L.lvl + 1}</span>
        </div>
      </nav>
      <div className="main">
        <div className={`topbar ${compact && route !== 'coach' ? 'show' : ''}`} aria-hidden={!compact}>
          <span className="tb-ic"><Icon name={icon} size={15} /></span><span>{name}</span>
        </div>
        <div className="scroll" ref={scroll} onScroll={(e) => { const c = (e.target as HTMLElement).scrollTop > 64; if (c !== compact) setCompact(c) }}>
          <SinConexion />
          <main className={`page ${route === 'coach' ? 'page-full' : ''}`} key={ui.route + (ui.sub ?? '')}>
            <Suspense fallback={<div style={{ height: 200 }} />}><P /></Suspense>
          </main>
        </div>
        <nav className="tabbar" aria-label="Navegación principal" style={{ ['--ti' as string]: tabIdx < 0 ? 0 : tabIdx }}>
          {tabIdx >= 0 && <span className="tab-ind" aria-hidden="true" />}
          {TABS.map((t) => t === '+'
            ? <div className="tab" key="+"><button className="tab-add" aria-label="Registrar" onClick={() => ui.openSheet('registrar')}><Icon name="plus" size={22} stroke={2.2} /></button></div>
            : <button key={t} className="tab" aria-current={activeTab === t ? 'page' : undefined} onClick={() => ui.go(t)}>
                <span className="tab-ic"><Icon name={ROUTE_INFO[t][1]} size={22} />{t === 'hoy' && pend > 0 && <span className="dot-badge" aria-label={`${pend} castigos pendientes`}>{pend}</span>}</span>
                <span>{ROUTE_INFO[t][0]}</span>
              </button>)}
        </nav>
      </div>
      {ui.sheet === 'registrar' && <RegistrarSheet />}
      {ui.sheet === 'mas' && <MasSheet />}
      {ui.sheet === 'checkin-manana' && <CheckinSheet kind="manana" />}
      {ui.sheet === 'checkin-noche' && <CheckinSheet kind="noche" />}
      {ui.sheet === 'confirm' && <ConfirmSheet />}
      {ui.sheet === 'castigo' && <CastigoSheet />}
      {ui.sheet === 'habito' && <HabitSheet />}
      {ui.sheet === 'ayuda' && <AyudaSheet />}
      {ui.sheet === 'cierre' && <CierreSheet />}
      {ui.palette && <Palette />}
      {ui.toast && (
        <div className="toast" role="status" key={ui.toast.id}>
          <Icon name={ui.toast.tone === 'neutral' ? 'minus' : 'check'} size={16} className={ui.toast.tone === 'neutral' ? '' : 'ok'} />
          <span>{ui.toast.text}</span>
          {ui.toast.undo && <button className="btn btn-ghost btn-sm" onClick={() => { ui.toast?.undo?.(); ui.clearToast() }}>Deshacer</button>}
        </div>
      )}
      <div className="sr" aria-live="polite">{ui.toast?.text}</div>
    </div>
  )
}

/** Pastilla discreta cuando no hay internet: todo sigue funcionando y se guarda en el dispositivo. */
function SinConexion() {
  const [on, setOn] = useState(() => navigator.onLine)
  useEffect(() => {
    const a = () => setOn(true); const b = () => setOn(false)
    window.addEventListener('online', a); window.addEventListener('offline', b)
    return () => { window.removeEventListener('online', a); window.removeEventListener('offline', b) }
  }, [])
  if (on) return null
  return <div className="offline-pill" role="status"><Icon name="cloud-off" size={13} />Sin conexión · todo se guarda en el teléfono</div>
}

function Palette() {
  const ui = useUI()
  const [q, setQ] = useState('')
  const [i, setI] = useState(0)
  const verDia = (foco?: string) => {
    useStore.getState().set((s) => ({ settings: { ...s.settings, hoyView: 'dia' } }))
    ui.go('hoy')
    if (foco) setTimeout(() => (document.querySelector(foco) as HTMLElement | null)?.focus(), 350)
  }
  const anotar = (texto: string) => {
    const id = uid()
    useStore.getState().set((s) => ({ sucesos: [...(s.sucesos ?? []), { id, fecha: today(), hora: new Date().toTimeString().slice(0, 5), texto, tipo: 'nota' }] }))
    if (hayRiesgo(texto)) { ui.openSheet('ayuda'); return }
    ui.notify('Anotado en "Lo que va pasando"', () => useStore.getState().set((s) => ({ sucesos: s.sucesos.filter((x) => x.id !== id) })))
  }
  const cmds: [string, string, () => void][] = [
    ['list-checks', 'Ver el día: obligatorias y lo que pasó', () => verDia()],
    ['pen-line', 'Anotar lo que pasó', () => verDia('.pasa-in input')],
    ['plus', 'Agregar una obligatoria de hoy', () => { verDia(); setTimeout(() => (document.querySelector('.ob-add-btn') as HTMLElement | null)?.click(), 350) }],
    ['sparkles', 'Hablar con el coach', () => ui.go('coach')],
    ['utensils', 'Registrar comida', () => ui.go('comida')], ['plus', 'Registrar…', () => ui.openSheet('registrar')],
    ['sun', 'Check-in de la mañana', () => ui.openSheet('checkin-manana')], ['moon', 'Check-in de la noche', () => ui.openSheet('checkin-noche')], ['sunset', 'Cerrar el día', () => ui.openSheet('cierre')],
    ['dumbbell', 'Registrar entrenamiento', () => ui.go('fisico', 'entreno')], ['receipt', 'Registrar gasto o ingreso', () => ui.go('finanzas', 'movimientos')],
    ['file-text', 'Subir un comprobante', () => ui.go('finanzas', 'comprobante')],
    ['feather', 'Escribir en el diario', () => ui.go('vida', 'diario')], ['wind', 'Respirar unos minutos', () => ui.go('cuerpo', 'respirar')], ['stretch', 'Estirar', () => ui.go('cuerpo', 'estirar')], ['timer', 'Iniciar sesión de estudio', () => ui.go('estudio')],
    ...SIDE.map(([k]) => [ROUTE_INFO[k][1], `Ir a ${ROUTE_INFO[k][0]}`, () => ui.go(k)] as [string, string, () => void]),
    ['areas', 'Ir a Áreas', () => ui.go('areas')], ['phone', 'Ayuda ahora (líneas gratuitas)', () => ui.openSheet('ayuda')],
    ['calendar-check', 'Abrir la revisión semanal', () => ui.go('revision')], ['settings', 'Abrir ajustes', () => ui.go('ajustes')],
  ]
  // Búsqueda sin tildes ("dia" encuentra "día"); si nada coincide, lo escrito se puede anotar en el día.
  const norm = (x: string) => x.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const hallados = cmds.filter((c) => norm(c[1]).includes(norm(q.trim())))
  const list: typeof cmds = q.trim().length > 2 && (!hallados.length || /\s/.test(q.trim())) ? [...hallados, ['pen-line', `Anotar en el día: «${q.trim()}»`, () => anotar(q.trim())]] : hallados
  const run = (c?: (typeof cmds)[number]) => { if (!c) return; ui.setPalette(false); c[2]() }
  return (
    <>
      <div className="scrim" style={{ background: 'rgba(3,4,6,.4)' }} onClick={() => ui.setPalette(false)} />
      <div className="palette" role="dialog" aria-label="Comandos">
        <input autoFocus value={q} placeholder="Buscar una acción o una pantalla…" aria-label="Buscar comando" aria-controls="pal-list"
          onChange={(e) => { setQ(e.target.value); setI(0) }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setI((x) => (x + 1) % Math.max(1, list.length)) }
            if (e.key === 'ArrowUp') { e.preventDefault(); setI((x) => (x - 1 + list.length) % Math.max(1, list.length)) }
            if (e.key === 'Enter') run(list[i])
          }} />
        <ul id="pal-list" role="listbox">
          {list.length ? list.map((c, k) => <li key={c[1]}><button role="option" aria-selected={k === i} onMouseEnter={() => setI(k)} onClick={() => run(c)}><Icon name={c[0]} size={16} />{c[1]}</button></li>)
            : <li className="cap" style={{ padding: 12 }}>Sin resultados para "{q}"</li>}
        </ul>
      </div>
    </>
  )
}
