import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useStore } from './lib/store'
import { castigosPendientes, levelInfo, processRules, sancionActiva, totalXp } from './lib/logic'
import { parseHash, ROUTE_INFO, SECTION, useUI, type Route } from './lib/ui'
import { Icon } from './components/Icon'
import { Bar } from './components/ui'
import { CheckinSheet, ConfirmSheet, MasSheet, RegistrarSheet } from './components/Sheets'
import { CastigoSheet } from './components/Castigos'
import { HabitSheet } from './components/HabitTile'
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
    // Primero se traen los datos de los otros dispositivos; recién después se evalúan las reglas del día.
    const stop = iniciarSync()
    const stopSalud = iniciarSalud()
    void sincronizar().finally(run)
    // Correo de pagos: al abrir la app y cada 10 minutos mientras está abierta.
    const mail = () => { if (useStore.getState().settings.correoUrl) syncCorreo().catch(() => { /* el error queda en correo.error */ }) }
    mail()
    const id = window.setInterval(() => { run(); mail() }, 10 * 60 * 1000)
    const vis = () => { if (document.visibilityState === 'visible') { run(); mail() } }
    document.addEventListener('visibilitychange', vis)
    return () => { stop(); stopSalud(); window.clearInterval(id); document.removeEventListener('visibilitychange', vis) }
  }, [ready])
  return ready ? <Shell /> : <Splash />
}

function Shell() {
  const ui = useUI()
  const xp = useStore((s) => totalXp(s))
  const pend = useStore((s) => castigosPendientes(s).length)
  const san = useStore((s) => sancionActiva(s))
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

  return (
    <div className="shell" data-section={SECTION[route]}>
      <div className="aura" aria-hidden="true" />
      <nav className="side" aria-label="Navegación principal">
        <div className="brand"><Logo size={28} /><b>PRODUCTI-ME</b></div>
        <button className="side-cta" onClick={() => ui.openSheet('registrar')}><Icon name="plus" />Registrar<span className="kbd end">R</span></button>
        {SIDE.map(([k, key]) => (
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

function Palette() {
  const ui = useUI()
  const [q, setQ] = useState('')
  const [i, setI] = useState(0)
  const cmds: [string, string, () => void][] = [
    ['sparkles', 'Hablar con el coach', () => ui.go('coach')],
    ['utensils', 'Registrar comida', () => ui.go('comida')], ['plus', 'Registrar…', () => ui.openSheet('registrar')],
    ['sun', 'Check-in de la mañana', () => ui.openSheet('checkin-manana')], ['moon', 'Check-in de la noche', () => ui.openSheet('checkin-noche')],
    ['dumbbell', 'Registrar entrenamiento', () => ui.go('fisico', 'entreno')], ['receipt', 'Registrar gasto o ingreso', () => ui.go('finanzas', 'movimientos')],
    ['file-text', 'Subir un comprobante', () => ui.go('finanzas', 'comprobante')],
    ['feather', 'Escribir en el diario', () => ui.go('vida', 'diario')], ['wind', 'Respirar unos minutos', () => ui.go('cuerpo', 'respirar')], ['stretch', 'Estirar', () => ui.go('cuerpo', 'estirar')], ['timer', 'Iniciar sesión de estudio', () => ui.go('estudio')],
    ...SIDE.map(([k]) => [ROUTE_INFO[k][1], `Ir a ${ROUTE_INFO[k][0]}`, () => ui.go(k)] as [string, string, () => void]),
    ['areas', 'Ir a Áreas', () => ui.go('areas')],
    ['calendar-check', 'Abrir la revisión semanal', () => ui.go('revision')], ['settings', 'Abrir ajustes', () => ui.go('ajustes')],
  ]
  const list = cmds.filter((c) => c[1].toLowerCase().includes(q.toLowerCase()))
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
