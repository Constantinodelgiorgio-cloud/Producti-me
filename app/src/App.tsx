import { useEffect, useState } from 'react'
import { useStore } from './lib/store'
import { levelInfo, processRules, totalXp } from './lib/logic'
import { useT, type Key } from './lib/i18n'
import Hoy from './pages/Hoy'
import Habitos from './pages/Habitos'
import Fisico from './pages/Fisico'
import Estudio from './pages/Estudio'
import Finanzas from './pages/Finanzas'
import Vida from './pages/Vida'
import Revision from './pages/Revision'
import Ajustes from './pages/Ajustes'

const PAGES = { hoy: Hoy, habitos: Habitos, fisico: Fisico, estudio: Estudio, finanzas: Finanzas, vida: Vida, revision: Revision, ajustes: Ajustes }
type Page = keyof typeof PAGES
const NAV: [Page, string][] = [['hoy', '🏠'], ['habitos', '✅'], ['fisico', '🏉'], ['estudio', '📚'], ['finanzas', '💵'], ['vida', '🤝']]

export default function App() {
  const t = useT()
  const [page, setPage] = useState<Page>(() => (location.hash.slice(1) as Page) in PAGES ? (location.hash.slice(1) as Page) : 'hoy')
  const [ready, setReady] = useState(useStore.persist.hasHydrated())
  const xp = useStore((s) => totalXp(s))
  const L = levelInfo(xp)

  useEffect(() => useStore.persist.onFinishHydration(() => setReady(true)), [])
  useEffect(() => {
    if (!ready) return
    const run = () => { const patch = processRules(useStore.getState()); if (patch) useStore.getState().set(() => patch) }
    run()
    const id = window.setInterval(run, 10 * 60 * 1000)
    return () => window.clearInterval(id)
  }, [ready])
  useEffect(() => { location.hash = page; window.scrollTo(0, 0) }, [page])
  useEffect(() => {
    const on = () => { const h = location.hash.slice(1); if (h in PAGES) setPage(h as Page) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  useEffect(() => { document.documentElement.style.setProperty('--accent', L.lvl >= 4 ? L.league.color : '#f5b83d') }, [L.lvl, L.league.color])

  if (!ready) return null
  const P = PAGES[page]
  return (
    <div className="app">
      <header className="top">
        <h1>Producti-Me</h1>
        <span className="chip" style={{ color: L.league.color }}>Nv {L.lvl} · {L.league.name}</span>
        <span className="sp" />
        <button className={`btn sm ${page === 'revision' ? 'primary' : ''}`} onClick={() => setPage('revision')}>🗓️</button>
        <button className={`btn sm ${page === 'ajustes' ? 'primary' : ''}`} onClick={() => setPage('ajustes')}>⚙️</button>
      </header>
      <P />
      <nav className="nav">
        {NAV.map(([k, icon]) => (
          <button key={k} className={page === k ? 'on' : ''} onClick={() => setPage(k)}><span>{icon}</span>{t(k as Key)}</button>
        ))}
      </nav>
    </div>
  )
}
