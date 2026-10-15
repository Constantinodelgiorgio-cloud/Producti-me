import { useEffect, useState } from 'react'
import { useStore, type Data } from '../lib/store'
import { useUI } from '../lib/ui'
import { addDays, dow, parse, today, weekStart } from '../lib/date'
import {
  agendaAhora, avisos, bedtimeFor, dayNutrition, excusaDe, habitScore, habitsFor, hourFmt, last, levelInfo, MOMENTOS,
  momentoDe, nowMin, recomendaciones, tituloBloque, toMin, recuerdos, sancionActiva, sleepHours, totalXp, weekMedals,
} from '../lib/logic'
import type { Habit } from '../lib/types'
import { Icon } from '../components/Icon'
import { Attention, Bar, Card, Empty, Medal, Notes, Ring, Seg } from '../components/ui'
import { CheckBox } from '../components/HabitRow'
import { HabitTile } from '../components/HabitTile'
import { CastigoBand } from '../components/Castigos'
import { VueltaYEstado } from '../components/Estados'
import { ListoCard } from '../components/Listo'
import { TareasHoy } from '../components/Tareas'
import { InsightsCard } from '../components/Insights'
import { AyunoCard } from '../components/Ayuno'
import { ElDia } from '../components/Dia'
import { notasSueno } from '../lib/rendimiento'

const greet = () => { const h = new Date().getHours(); return h < 6 ? 'Buenas noches' : h < 13 ? 'Buen día' : h < 20 ? 'Buenas tardes' : 'Buenas noches' }
const stamp = () => {
  const d = new Date()
  return `${d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })} · ${hourFmt(nowMin())}`
}
const fmtLeft = (m: number) => (m <= 0 ? 'en curso' : m < 60 ? `en ${m} min` : `en ${Math.floor(m / 60)} h ${m % 60 ? `${m % 60} min` : ''}`.trim())
const dec = (n: number) => n.toFixed(1).replace('.', ',')

function useClock() {
  const [, tick] = useState(0)
  useEffect(() => { const id = setInterval(() => tick((x) => x + 1), 30_000); return () => clearInterval(id) }, [])
}

export function dayState(d: Data, f: string) {
  const all = habitsFor(d.habits, f)
  const log = d.habitLog[f] ?? {}
  const hs = all.filter((h) => habitScore(d, f, h) !== null) // sin los excusados
  const done = hs.filter((h) => log[h.id] === 'hecho' || log[h.id] === 'minimo' || (excusaDe(d, f, h.id)?.alternativa && !log[h.id])).length
  const score = hs.reduce((a, h) => a + (habitScore(d, f, h) ?? 0), 0)
  return { all, hs, log, done, n: hs.length, p: hs.length ? score / hs.length : 0 }
}

export default function Hoy() {
  useClock()
  const d = useStore()
  const ui = useUI()
  const v = d.settings.hoyView
  const view = v === 'dia' || v === 'agenda' || v === 'linea' ? 'dia' : 'ahora'
  const setView = (x: 'ahora' | 'dia') => d.set((s) => ({ settings: { ...s.settings, hoyView: x } }))
  const first = !Object.keys(d.habitLog).some((x) => x >= d.inicio) && !Object.keys(d.checkins).some((x) => x >= d.inicio)
  const ds = dayState(d, today())
  return (
    <div className="view">
      <header className="top hoy-top">
        <div style={{ minWidth: 0 }}>
          <div className="eyebrow">{stamp()}</div>
          <h1 className="h1 display">{first ? 'Bienvenido, ' : `${greet()}, `}{d.profile.nombre}</h1>
        </div>
        <button className="day-ring" onClick={() => ui.go('habitos')} aria-label={`${ds.done} de ${ds.n} hábitos hechos. Abrir hábitos.`}>
          <Ring p={ds.p} size={58} sw={4.5} />
          <span className="num"><b>{ds.done}</b>/{ds.n}</span>
        </button>
      </header>
      <div className="row" style={{ marginBottom: 14, justifyContent: 'space-between' }}>
        <Seg label="Vista de Hoy" value={view} onChange={setView} options={[['ahora', 'Ahora'], ['dia', 'El día']]} />
        <button className="icon-btn only-desk" aria-label="Comandos" onClick={() => ui.setPalette(true)}><Icon name="search" /></button>
      </div>
      {view === 'ahora' ? <Ahora /> : <ElDia />}
    </div>
  )
}

// ---------------- Ahora ----------------
function Ahora() {
  const d = useStore()
  const ui = useUI()
  const f = today()
  const ds = dayState(d, f)
  const ci = d.checkins[f]
  // De madrugada (antes de la hora de despertar) lo que importa es dormir, no la clase de dentro de 6 horas.
  const madrugada = nowMin() < toMin(ci?.horaDespertar ?? d.profile.despertar[dow(f)]) && new Date().getHours() < 6
  const ahora = madrugada ? null : agendaAhora(d)
  const proximo = madrugada ? agendaAhora(d) : null
  const wakeTomorrow = d.profile.despertar[dow(addDays(f, 1))]
  const bed = bedtimeFor(wakeTomorrow, d.profile.suenoMin)
  const wm = weekMedals(d, weekStart(f))
  const L = levelInfo(totalXp(d))
  const san = sancionActiva(d)
  const hour = new Date().getHours()
  const complete = ds.n > 0 && ds.p >= 1
  const togglePrio = () => {
    const prev = ci?.prioridadCumplida
    const next = prev === 'si' ? undefined : 'si'
    d.set((s) => ({ checkins: { ...s.checkins, [f]: { ...(s.checkins[f] ?? { fecha: f }), prioridadCumplida: next } } }))
    if (next) ui.notify('Prioridad del día cumplida', () => d.set((s) => ({ checkins: { ...s.checkins, [f]: { ...s.checkins[f], prioridadCumplida: prev } } })))
  }
  const xpHoy = ds.hs.reduce((a, h) => a + h.xp * (habitScore(d, f, h) ?? 0), 0)
  const avs = avisos(d).filter((a) => !/^Sanción|Castigo/.test(a.text))

  return (
    <div className="hoy-grid">
      <div className="stack">
        {/* Nivel 1 · qué importa ahora */}
        <section className={`horizon now hero ${complete ? 'complete' : ''}`} style={{ ['--p' as string]: ds.p }} aria-label="Ahora">
          {complete ? (
            <div className="hero-done">
              <span className="eyebrow">Día completo</span>
              <div className="now-title">{ds.done} de {ds.n} hábitos · {Math.round(xpHoy)} XP{san ? ' (sin XP por sanción)' : ''}</div>
              <p className="body-2">Mañana te levantás a las {wakeTomorrow}. Acostate antes de las {bed}.</p>
            </div>
          ) : <>
            <div className="now-head">
              <span className="eyebrow">Ahora</span>
              {ahora && <span className="countdown"><span className="pulse" aria-hidden="true" />{ahora.faltan <= 0 ? `en curso · termina ${fmtLeft(ahora.fin - nowMin())}` : fmtLeft(ahora.faltan)}</span>}
            </div>
            <div className="now-main">
              <div style={{ minWidth: 0 }}>
                <div className="cap mono">{ahora ? `${ahora.hora}–${hourFmt(ahora.fin)}` : madrugada ? `te levantás a las ${ci?.horaDespertar ?? d.profile.despertar[dow(f)]}` : `antes de las ${bed}`}{ahora?.intensidad && <span className={`int ${ahora.intensidad}`} style={{ marginLeft: 8 }}>{ahora.intensidad}</span>}{d.planDia[f]?.agenda && <span className="chip-mini">plan cambiado</span>}</div>
                <div className="now-title xl">{ahora ? tituloBloque(ahora.que) : madrugada ? 'Es hora de dormir' : 'Acostarte para dormir ' + dec(d.profile.suenoMin) + ' h'}</div>
                {proximo && <div className="cap" style={{ marginTop: 6 }}>Lo primero: {tituloBloque(proximo.que)} a las {proximo.hora}</div>}
              </div>
              {ahora && /revisi/i.test(ahora.que) && <button className="btn btn-quiet btn-sm" onClick={() => ui.go('revision')}>Preparar<Icon name="arrow-right" size={15} /></button>}
            </div>
          </>}
          {ci?.prioridad ? (
            <div className={`prio ${ci.prioridadCumplida === 'si' ? 'is-done' : ''}`}>
              <span className={ci.prioridadCumplida === 'si' ? 'is-done' : ''}><CheckBox on={ci.prioridadCumplida === 'si'} label="Marcar la prioridad como cumplida" onClick={togglePrio} /></span>
              <div className="grow"><div className="eyebrow" style={{ marginBottom: 2 }}>Prioridad del día</div><div className="t">{ci.prioridad}</div></div>
            </div>
          ) : (
            <div className="prio">
              <span className="h-ic"><Icon name="target" size={16} /></span>
              <div className="grow"><div className="t">Sin prioridad para hoy</div><div className="cap">Si hoy hacés una sola cosa, ¿cuál es?</div></div>
              <button className="btn btn-quiet btn-sm" onClick={() => ui.openSheet('checkin-manana')}>Definir</button>
            </div>
          )}
          <div className="dayline">
            <div className="ticks-day" style={{ ['--n' as string]: Math.max(1, ds.n) }} role="img" aria-label={`${ds.done} de ${ds.n} hábitos`}>
              {ds.hs.map((h) => <i key={h.id} className={ds.log[h.id] === 'hecho' ? 'd' : ds.log[h.id] === 'minimo' || excusaDe(d, f, h.id)?.alternativa ? 'm' : ''} />)}
            </div>
            <span className="cap num">{Math.round(ds.p * 100)} %</span>
          </div>
          <div className="row cap" style={{ marginTop: 10, gap: 10 }}>
            <span>Semana {wm.global === null ? '—' : `${Math.round(wm.global * 100)} %`}</span>{wm.globalMedal && <Medal m={wm.globalMedal} />}
            <span className="grow" /><span>Nivel {L.lvl} · {L.league.name}</span>
          </div>
        </section>

        <VueltaYEstado />

        <ListoCard compacto />

        <CastigoBand />

        <TareasHoy />

        <ParaCompletar />

        <CoachBar />
      </div>

      <aside className="stack rail">
        {/* Nivel 2 · cómo viene el día */}
        {((hour >= 17 && !ci?.animoNoche) || (hour >= 19 && !ci?.cerrado)) && (
          <div className="ci-row">

            {hour >= 17 && !ci?.animoNoche && <button className="ci-btn" onClick={() => ui.openSheet('checkin-noche')}><Icon name="moon" size={20} /><span><b>Check-in de la noche</b><small>1 min · ánimo y victoria</small></span></button>}
            {hour >= 19 && !ci?.cerrado && <button className="ci-btn" onClick={() => ui.openSheet('cierre')}><Icon name="sunset" size={20} /><span><b>Cerrar el día</b><small>30 s · pendientes y la difícil de mañana</small></span></button>}
          </div>
        )}
        <div className="sec" style={{ marginTop: 4 }}><span className="eyebrow">Cómo viene el día</span><span className="cap">tocá para ver la semana</span></div>
        <Signals />
        <AyunoCard compacto />
        {avs.length > 0 && <><div className="sec"><span className="eyebrow">Requiere atención</span></div><Attention items={avs} /></>}
        {/* Nivel 3 · contexto */}
        <InsightsCard ocultarVacio />
        <Card title="Recomendaciones" icon="lightbulb"><Notes items={[...notasSueno(d), ...recomendaciones(d)].slice(0, 5)} /></Card>
        {recuerdos(d).length > 0 && <Card title="Recuerdos" icon="clock"><Notes items={recuerdos(d)} /></Card>}
      </aside>
    </div>
  )
}

function orden(d: Data, pend: Habit[]) {
  const f = today()
  const h = new Date().getHours()
  const now = h < 12 ? 'manana' : h < 20 ? 'tarde' : 'noche'
  const rank = (x: Habit) => {
    if (x.obligatorio) return -1
    if (/proteína/i.test(x.nombre) && dayNutrition(d, f).prot < d.profile.protObjetivo) return 0
    const m = momentoDe(x, d, f)
    return m === now ? 1 : m === 'dia' ? 2 : MOMENTOS.findIndex((y) => y.id === m) + 3
  }
  return [...pend].sort((a, b) => rank(a) - rank(b))
}

/** Lo pendiente, grande y tocable desde acá. */
function ParaCompletar() {
  const d = useStore()
  const ui = useUI()
  const f = today()
  const ds = dayState(d, f)
  const pend = orden(d, ds.hs.filter((h) => !ds.log[h.id] && !excusaDe(d, f, h.id)))
  if (ds.all.length === 0) return <section className="panel"><Empty icon="list-checks" title="No hay hábitos para hoy" action={<button className="btn btn-quiet" onClick={() => ui.go('habitos')}>Configurar hábitos</button>}>Agregá hábitos y elegí qué días aplican.</Empty></section>
  if (!Object.keys(d.habitLog).some((x) => x >= d.inicio))
    return <section className="panel"><Empty icon="list-checks" title="Tu primer día empieza acá" action={<button className="btn btn-quiet" onClick={() => ui.go('habitos')}>Ver hábitos</button>}>Tocá un hábito cuando lo hacés; con la versión mínima alcanza. Lo más importante para este momento aparece primero.</Empty></section>
  if (!pend.length) return null
  return (
    <section className="todo">
      <div className="sec" style={{ margin: '4px 2px 10px' }}><span className="eyebrow">Para completar</span><button className="link-inline" onClick={() => ui.go('habitos')}>{pend.length} pendientes<Icon name="chevron-right" size={14} /></button></div>
      <div className="tile-grid">
        {pend.slice(0, 6).map((h) => <HabitTile key={h.id} h={h} fecha={f} big />)}
      </div>
    </section>
  )
}

/** Entrada directa al Coach. */
function CoachBar() {
  const ui = useUI()
  const [t, setT] = useState('')
  const sug = ['Hoy no tengo facultad', 'Pasame el gimnasio a la tarde', 'No puedo entrenar hoy']
  const send = (x: string) => { useUI.setState({ coachDraft: x }); ui.go('coach') }
  return (
    <section className="coach-bar">
      <form className="cb-input" onSubmit={(e) => { e.preventDefault(); if (t.trim()) send(t.trim()) }}>
        <Icon name="sparkles" size={18} />
        <input aria-label="Contale algo al coach" placeholder="Contale algo al coach…" value={t} onChange={(e) => setT(e.target.value)} />
        <button className="cb-send" aria-label="Enviar al coach" disabled={!t.trim()}><Icon name="arrow-up" size={16} stroke={2.2} /></button>
      </form>
      <div className="chips">{sug.map((s) => <button key={s} className="chip" onClick={() => send(s)}>{s}</button>)}</div>
    </section>
  )
}

function Signals() {
  const d = useStore()
  const [open, setOpen] = useState<string | null>(null)
  const f = today()
  const days = Array.from({ length: 7 }, (_, i) => addDays(f, i - 6))
  const letters = days.map((x) => 'DLMXJVS'[parse(x).getDay()])
  const sleep = (x: string) => sleepHours(d.checkins[x]?.horaDormir, d.checkins[x]?.horaDespertar) ?? d.salud?.[x]?.sueno ?? 0
  const savingAt = (x: string) => last(d.savings.filter((s) => s.fecha <= x))?.valor ?? 0
  const hs = sleepHours(d.checkins[f]?.horaDormir, d.checkins[f]?.horaDespertar) ?? d.salud?.[f]?.sueno ?? null
  const prev = days.slice(0, 6).map(sleep).filter(Boolean)
  const avgPrev = prev.length ? prev.reduce((a, b) => a + b, 0) / prev.length : null
  const prot = dayNutrition(d, f).prot
  const ahorro = last(d.savings)?.valor ?? 0
  const ws = weekStart(f)
  const juntadas = d.social.filter((s) => s.fecha >= ws && s.tipo === 'juntada').length
  const sig = [
    { k: 'sueno', i: 'bed', n: 'Sueño', v: hs === null ? '—' : dec(hs), u: 'h', p: (hs ?? 0) / d.profile.suenoMin, foot: `meta ${dec(d.profile.suenoMin)} h`, trend: hs !== null && avgPrev ? hs - avgPrev : null, week: days.map(sleep), tone: 'neutral' as const, s: 'hoy' },
    { k: 'prot', i: 'beef', n: 'Proteína', v: String(Math.round(prot)), u: `/ ${d.profile.protObjetivo} g`, p: prot / d.profile.protObjetivo, foot: prot >= d.profile.protObjetivo ? 'meta cumplida' : `faltan ${Math.round(d.profile.protObjetivo - prot)} g`, week: days.map((x) => dayNutrition(d, x).prot), tone: prot >= d.profile.protObjetivo ? 'ok' as const : 'neutral' as const, s: 'fisico' },
    { k: 'ahorro', i: 'piggy-bank', n: 'Ahorro', v: ahorro.toLocaleString('es-AR'), u: 'USD', p: ahorro / d.profile.ahorroObjetivo, foot: `${Math.round((ahorro / d.profile.ahorroObjetivo) * 100)} % de ${d.profile.ahorroObjetivo.toLocaleString('es-AR')}`, week: days.map(savingAt), tone: 'neutral' as const, s: 'finanzas' },
    { k: 'amigos', i: 'users', n: 'Amigos', v: String(juntadas), u: '/ 1 juntada', p: juntadas, foot: juntadas >= 1 ? 'meta semanal cumplida' : 'meta: 1 por semana', week: days.map((x) => d.social.filter((s) => s.fecha === x).length), tone: juntadas >= 1 ? 'ok' as const : 'neutral' as const, s: 'vida' },
  ]
  return (
    <div className="signals">
      {sig.map((s) => {
        const max = Math.max(...s.week, 1)
        const exp = open === s.k
        return (
          <button key={s.k} className="signal" data-s={s.s} aria-expanded={exp} onClick={() => setOpen(exp ? null : s.k)}>
            <span className="sig-head"><Icon name={s.i} size={14} />{s.n}{s.trend != null && Math.abs(s.trend) >= 0.1 && <span className={`trend ${s.trend > 0 ? 'up' : 'down'}`}>{s.trend > 0 ? '+' : '−'}{dec(Math.abs(s.trend))}</span>}</span>
            <span><span className="val-m">{s.v}</span><span className="unit">{s.u}</span></span>
            <Bar value={s.p} tone={s.tone} />
            <span className="cap">{s.foot}</span>
            {exp && <>
              <span className="spark" aria-hidden="true">{s.week.map((w, i) => <i key={i} className={i === 6 ? 'today' : ''} style={{ height: `${Math.max(4, (w / max) * 100)}%` }} />)}</span>
              <span className="spark-axis">{letters.map((l, i) => <span key={i}>{l}</span>)}</span>
            </>}
          </button>
        )
      })}
    </div>
  )
}
