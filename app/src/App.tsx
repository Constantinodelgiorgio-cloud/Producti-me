import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useStore } from './lib/store'
import { levelInfo, processRules, totalXp } from './lib/logic'
import { parseHash, useUI, type Route } from './lib/ui'
import { Icon } from './components/Icon'
import { Bar } from './components/ui'
import { CheckinSheet, ConfirmSheet, MasSheet, RegistrarSheet } from './components/Sheets'
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
const PAGES: Record<Route, React.ComponentType> = { hoy: Hoy, habitos: Habitos, comida: Comida, fisico: Fisico, estudio: Estudio, finanzas: Finanzas, vida: Vida, revision: Revision, ajustes: Ajustes }

const AREA_TABS: Record<string, [string, string]> = { fisico: ['Físico', 'dumbbell'], estudio: ['Estudio', 'book-open'], finanzas: ['Finanzas', 'wallet'], vida: ['Vida', 'users'] }
const SIDE: [Route, string, string, string][] = [['hoy', 'Hoy', 'house', '1'], ['habitos', 'Hábitos', 'list-checks', '2'], ['fisico', 'Físico', 'dumbbell', '3'], ['estudio', 'Estudio', 'book-open', '4'], ['finanzas', 'Finanzas', 'wallet', '5'], ['vida', 'Vida', 'users', '6']]

const Logo = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><rect x=".5" y=".5" width="21" height="21" rx="6" fill="#0E1013" stroke="#2A2E36" /><path d="M5 13.5h12" stroke="#2A2E36" strokeWidth="1.5" strokeLinecap="round" /><path d="M5 13.5h7.5" stroke="#8EA8FF" strokeWidth="1.5" strokeLinecap="round" /><circle cx="12.5" cy="13.5" r="1.8" fill="#E6ECFF" /></svg>
)

function Splash() {
  return <div style={{ height: '100%', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}><Logo /></div>
}

export default function App() {
  const [ready, setReady] = useState(useStore.persist.hasHydrated())
  useEffect(() => useStore.persist.onFinishHydration(() => setReady(true)), [])
  useEffect(() => {
    if (!ready) return
    const run = () => { const patch = processRules(useStore.getState()); if (patch) useStore.getState().set(() => patch) }
    run()
    const id = window.setInterval(run, 10 * 60 * 1000)
    return () => window.clearInterval(id)
  }, [ready])
  return ready ? <Shell /> : <Splash />
}

function Shell() {
  const ui = useUI()
  const pinned = useStore((s) => s.settings.pinned ?? 'fisico')
  const xp = useStore((s) => totalXp(s))
  const L = levelInfo(xp)
  const scroll = useRef<HTMLDivElement>(null)
  const route = ui.route === 'comida' ? 'hoy' : ui.route
  const P = PAGES[ui.route]

  useEffect(() => { scroll.current?.scrollTo({ top: 0 }) }, [ui.route, ui.sub])
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
  // Atajos de escritorio: ⌘K comandos, R registrar, 1–6 pantallas.
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const s = useUI.getState()
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); s.setPalette(!s.palette); return }
      if (e.key === 'Escape') { if (s.palette) s.setPalette(false); else if (s.sheet) s.closeSheet(); return }
      if (s.sheet || s.palette || (e.target as HTMLElement).matches('input, textarea, select') || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key.toLowerCase() === 'r') { e.preventDefault(); s.openSheet('registrar') }
      const n = Number(e.key)
      if (n >= 1 && n <= 6) s.go(SIDE[n - 1][0])
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [])

  const tabs: ([Route, string, string] | '+')[] = [['hoy', 'Hoy', 'house'], ['habitos', 'Hábitos', 'list-checks'], '+', [pinned, ...AREA_TABS[pinned]] as [Route, string, string], ['mas' as Route, 'Más', 'ellipsis']]
  const masActive = !['hoy', 'habitos', pinned].includes(route)

  return (
    <div className="shell">
      <nav className="side" aria-label="Navegación principal">
        <div className="brand"><Logo /><b>PRODUCTI-ME</b></div>
        <button className="side-cta" onClick={() => ui.openSheet('registrar')}><Icon name="plus" />Registrar<span className="kbd end">R</span></button>
        {SIDE.map(([k, n, i, key]) => <button key={k} className="side-btn" aria-current={route === k ? 'page' : undefined} onClick={() => ui.go(k)}><Icon name={i} />{n}<span className="kbd end">{key}</span></button>)}
        <div className="side-sep" />
        <button className="side-btn" aria-current={route === 'revision' ? 'page' : undefined} onClick={() => ui.go('revision')}><Icon name="calendar-check" />Revisión semanal</button>
        <button className="side-btn" aria-current={route === 'ajustes' ? 'page' : undefined} onClick={() => ui.go('ajustes')}><Icon name="settings" />Ajustes</button>
        <button className="side-btn" onClick={() => ui.setPalette(true)}><Icon name="command" />Comandos<span className="kbd end">⌘K</span></button>
        <div className="side-foot">
          <span>Nivel {L.lvl} · Liga {L.league.name}</span>
          <Bar value={L.progress} />
          <span className="num">{L.toNext.toLocaleString('es-AR')} XP para el nivel {L.lvl + 1}</span>
        </div>
      </nav>
      <div className="main">
        <div className="scroll" ref={scroll}>
          <main className="page" key={ui.route + (ui.sub ?? '')}>
            <Suspense fallback={<div style={{ height: 200 }} />}><P /></Suspense>
          </main>
        </div>
        <nav className="tabbar" aria-label="Navegación principal">
          {tabs.map((t) => t === '+'
            ? <div className="tab" key="+"><button className="tab-add" aria-label="Registrar" onClick={() => ui.openSheet('registrar')}><Icon name="plus" size={22} stroke={2.2} /></button></div>
            : <button key={t[0]} className="tab" aria-current={(t[0] === ('mas' as Route) ? masActive : route === t[0]) ? 'page' : undefined}
                onClick={() => (t[0] === ('mas' as Route) ? ui.openSheet('mas') : ui.go(t[0]))}><Icon name={t[2]} size={21} /><span>{t[1]}</span></button>)}
        </nav>
      </div>
      {ui.sheet === 'registrar' && <RegistrarSheet />}
      {ui.sheet === 'mas' && <MasSheet />}
      {ui.sheet === 'checkin-manana' && <CheckinSheet kind="manana" />}
      {ui.sheet === 'checkin-noche' && <CheckinSheet kind="noche" />}
      {ui.sheet === 'confirm' && <ConfirmSheet />}
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
    ['utensils', 'Registrar comida', () => ui.go('comida')], ['plus', 'Registrar…', () => ui.openSheet('registrar')],
    ['sun', 'Check-in de la mañana', () => ui.openSheet('checkin-manana')], ['moon', 'Check-in de la noche', () => ui.openSheet('checkin-noche')],
    ['dumbbell', 'Registrar entrenamiento', () => ui.go('fisico', 'entreno')], ['receipt', 'Registrar gasto o ingreso', () => ui.go('finanzas', 'movimientos')],
    ['notebook-pen', 'Escribir en el diario', () => ui.go('vida', 'diario')], ['timer', 'Iniciar sesión de estudio', () => ui.go('estudio')],
    ...SIDE.map(([k, n, ic]) => [ic, `Ir a ${n}`, () => ui.go(k)] as [string, string, () => void]),
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
