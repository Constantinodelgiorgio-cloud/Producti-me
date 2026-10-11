import { useEffect, useState } from 'react'
import { useStore, type Data } from '../lib/store'
import { useUI } from '../lib/ui'
import { addDays, dow, parse, today, weekStart } from '../lib/date'
import {
  agendaAhora, avisos, bedtimeFor, compliance, dayNutrition, habitsFor, hourFmt, last, levelInfo, MOMENTOS, momentoDe, nowMin,
  recomendaciones, recuerdos, sleepHours, toMin, totalXp, weekMedals,
} from '../lib/logic'
import type { Habit } from '../lib/types'
import { Icon, habitIcon } from '../components/Icon'
import { Attention, Bar, Card, Empty, Medal, Notes, Ring, Seg } from '../components/ui'
import { CheckBox, HabitRow, useSetHabit } from '../components/HabitRow'

const greet = () => { const h = new Date().getHours(); return h < 6 ? 'Buenas noches' : h < 13 ? 'Buen día' : h < 20 ? 'Buenas tardes' : 'Buenas noches' }
const stamp = () => {
  const d = new Date()
  return `${d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' }).replace(/\./g, '').replace(',', '')} · ${hourFmt(nowMin())}`
}
const fmtLeft = (m: number) => (m <= 0 ? 'en curso' : m < 60 ? `en ${m} min` : `en ${Math.floor(m / 60)} h ${m % 60 ? `${m % 60} min` : ''}`.trim())
const dec = (n: number) => n.toFixed(1).replace('.', ',')

function useClock() {
  const [, tick] = useState(0)
  useEffect(() => { const id = setInterval(() => tick((x) => x + 1), 30_000); return () => clearInterval(id) }, [])
}

function dayState(d: Data, f: string) {
  const hs = habitsFor(d.habits, f)
  const log = d.habitLog[f] ?? {}
  const done = hs.filter((h) => log[h.id] === 'hecho' || log[h.id] === 'minimo').length
  const score = hs.reduce((a, h) => a + (log[h.id] === 'hecho' ? 1 : log[h.id] === 'minimo' ? 0.5 : 0), 0)
  return { hs, log, done, n: hs.length, p: hs.length ? score / hs.length : 0 }
}

export default function Hoy() {
  useClock()
  const d = useStore()
  const ui = useUI()
  const view = d.settings.hoyView ?? 'enfoque'
  const setView = (v: 'enfoque' | 'linea') => d.set((s) => ({ settings: { ...s.settings, hoyView: v } }))
  const first = Object.keys(d.habitLog).length === 0 && Object.keys(d.checkins).length === 0
  return (
    <div className="view">
      <header className="top">
        <div style={{ minWidth: 0 }}><div className="eyebrow">{stamp()}</div><h1 className="h1">{first ? 'Bienvenido, ' : `${greet()}, `}{d.profile.nombre}</h1></div>
        <div className="top-actions">
          <Seg label="Vista de Hoy" value={view} onChange={setView} options={[['enfoque', 'Enfoque'], ['linea', 'Línea']]} />
          <button className="icon-btn only-desk" aria-label="Comandos" onClick={() => ui.setPalette(true)}><Icon name="search" /></button>
        </div>
      </header>
      {view === 'enfoque' ? <Enfoque /> : <Linea />}
    </div>
  )
}

// ---------------- Enfoque ----------------
function Enfoque() {
  const d = useStore()
  const ui = useUI()
  const f = today()
  const ds = dayState(d, f)
  const ci = d.checkins[f]
  const ahora = agendaAhora(d)
  const wakeTomorrow = d.profile.despertar[dow(addDays(f, 1))]
  const bed = bedtimeFor(wakeTomorrow, d.profile.suenoMin)
  const wm = weekMedals(d, weekStart(f))
  const L = levelInfo(totalXp(d))
  const hour = new Date().getHours()
  const togglePrio = () => {
    const prev = ci?.prioridadCumplida
    const next = prev === 'si' ? undefined : 'si'
    d.set((s) => ({ checkins: { ...s.checkins, [f]: { ...(s.checkins[f] ?? { fecha: f }), prioridadCumplida: next } } }))
    if (next) ui.notify('Prioridad del día cumplida', () => d.set((s) => ({ checkins: { ...s.checkins, [f]: { ...s.checkins[f], prioridadCumplida: prev } } })))
  }

  return (
    <div className="hoy-grid">
      <div className="stack">
        <section className={`horizon now ${ds.n && ds.p >= 1 ? 'complete' : ''}`} style={{ ['--p' as string]: ds.p }} aria-label="Ahora">
          <div className="now-head">
            <span className="eyebrow">Ahora</span>
            {ahora && <span className="countdown"><span className="pulse" aria-hidden="true" />{fmtLeft(ahora.faltan)}</span>}
          </div>
          <div className="now-main">
            <div style={{ minWidth: 0 }}>
              <div className="cap mono">{ahora ? ahora.hora : `antes de las ${bed}`}{ahora?.intensidad && <span className={`int ${ahora.intensidad}`} style={{ marginLeft: 8 }}>{ahora.intensidad}</span>}</div>
              <div className="now-title">{ahora ? ahora.que : 'Acostarte para dormir ' + dec(d.profile.suenoMin) + ' h'}</div>
            </div>
            {ahora && /revisi/i.test(ahora.que) && <button className="btn btn-quiet btn-sm" onClick={() => ui.go('revision')}>Preparar<Icon name="arrow-right" size={15} /></button>}
          </div>
          {ci?.prioridad ? (
            <div className={`prio ${ci.prioridadCumplida === 'si' ? 'is-done' : ''}`}>
              <span className={ci.prioridadCumplida === 'si' ? 'is-done' : ''}><CheckBox on={ci.prioridadCumplida === 'si'} label="Marcar la prioridad como cumplida" onClick={togglePrio} /></span>
              <div className="grow"><div className="eyebrow" style={{ marginBottom: 2 }}>Prioridad del día</div><div className="t">{ci.prioridad}</div></div>
            </div>
          ) : (
            <div className="prio">
              <span className="h-ic"><Icon name="target" size={16} /></span>
              <div className="grow"><div className="t">Sin prioridad para hoy</div><div className="cap">Se define en el check-in de la mañana</div></div>
              <button className="btn btn-quiet btn-sm" onClick={() => ui.openSheet('checkin-manana')}>Definir</button>
            </div>
          )}
          <div className="dayline">
            <span className="cap num" style={{ minWidth: 52 }}><b style={{ color: 'var(--t1)', fontWeight: 600 }}>{ds.done}</b> / {ds.n}</span>
            <div className="ticks-day" style={{ ['--n' as string]: Math.max(1, ds.n) }} role="img" aria-label={`${ds.done} de ${ds.n} hábitos`}>
              {ds.hs.map((h) => <i key={h.id} className={ds.log[h.id] === 'hecho' ? 'd' : ds.log[h.id] === 'minimo' ? 'm' : ''} />)}
            </div>
            <span className="cap num">{Math.round(ds.p * 100)} %</span>
          </div>
          <div className="row cap" style={{ marginTop: 10, gap: 10 }}>
            <span>Semana {wm.global === null ? '—' : `${Math.round(wm.global * 100)} %`}</span>{wm.globalMedal && <Medal m={wm.globalMedal} />}
            <span className="grow" /><span>Nivel {L.lvl} · {L.league.name}</span>
          </div>
        </section>
        <NextAction />
      </div>

      <aside className="stack rail">
        <div className="sec" style={{ marginTop: 4 }}><span className="eyebrow">Señales</span><span className="cap">tocá para ver la semana</span></div>
        <Signals />
        {(() => { const a = avisos(d); return a.length ? <><div className="sec"><span className="eyebrow">Requiere atención</span></div><Attention items={a} /></> : null })()}
        {(!ci?.animoManana || (hour >= 17 && !ci?.animoNoche)) && (
          <div className="stack" style={{ gap: 8 }}>
            {!ci?.animoManana && <button className="btn btn-quiet btn-block" style={{ justifyContent: 'flex-start', minHeight: 48 }} onClick={() => ui.openSheet('checkin-manana')}><Icon name="sun" />Check-in de la mañana pendiente<span className="cap end" style={{ marginLeft: 'auto' }}>20 s</span></button>}
            {hour >= 17 && !ci?.animoNoche && <button className="btn btn-quiet btn-block" style={{ justifyContent: 'flex-start', minHeight: 48 }} onClick={() => ui.openSheet('checkin-noche')}><Icon name="moon" />Check-in de la noche<span className="cap" style={{ marginLeft: 'auto' }}>1 min</span></button>}
          </div>
        )}
        <Card title="Recomendaciones" icon="lightbulb"><Notes items={recomendaciones(d).slice(0, 4)} /></Card>
        {recuerdos(d).length > 0 && <Card title="Recuerdos" icon="clock"><Notes items={recuerdos(d)} /></Card>}
        <Coach />
      </aside>
    </div>
  )
}

function pickNext(d: Data, pend: Habit[]) {
  const prot = pend.find((h) => /proteína/i.test(h.nombre))
  if (prot && dayNutrition(d, today()).prot < d.profile.protObjetivo) return prot
  const h = new Date().getHours()
  const now = h < 12 ? 'manana' : h < 20 ? 'tarde' : 'noche'
  return pend.find((x) => momentoDe(x) === now) ?? pend.find((x) => momentoDe(x) === 'dia') ?? pend[0]
}

function NextAction() {
  const d = useStore()
  const ui = useUI()
  const setHabit = useSetHabit()
  const f = today()
  const ds = dayState(d, f)
  const pend = ds.hs.filter((h) => !ds.log[h.id])
  if (ds.n === 0) return <section className="panel"><Empty icon="list-checks" title="No hay hábitos para hoy" action={<button className="btn btn-quiet" onClick={() => ui.go('habitos')}>Configurar hábitos</button>}>Agregá hábitos y elegí qué días aplican.</Empty></section>
  if (Object.keys(ds.log).length === 0 && Object.keys(d.habitLog).length === 0)
    return <section className="panel"><Empty icon="list-checks" title="Tu primer día empieza acá" action={<><button className="btn btn-primary" onClick={() => ui.openSheet('checkin-manana')}><Icon name="sun" />Hacer el check-in</button><button className="btn btn-quiet" onClick={() => ui.go('habitos')}>Ver hábitos</button></>}>Marcá los hábitos a medida que los hacés. La próxima acción aparece en este lugar, en orden, para que no tengas que decidir qué sigue.</Empty></section>
  if (!pend.length) {
    const xp = ds.hs.reduce((a, h) => a + (ds.log[h.id] === 'hecho' ? h.xp : ds.log[h.id] === 'minimo' ? h.xp / 2 : 0), 0)
    return <section className="panel"><Empty icon="check" title="Día completo">{`${ds.done} de ${ds.n} hábitos marcados y ${Math.round(xp)} XP ganados hoy. Mañana te levantás a las ${d.profile.despertar[dow(addDays(f, 1))]}.`}</Empty></section>
  }
  const h = pickNext(d, pend)
  const rest = pend.filter((x) => x !== h)
  const nut = dayNutrition(d, f)
  const isProt = /proteína/i.test(h.nombre)
  return (
    <section className="panel pad queue-move" key={h.id}>
      <div className="sec" style={{ margin: '0 0 12px' }}><span className="eyebrow">Siguiente acción</span><span className="cap num">{pend.length} pendientes</span></div>
      <div className="next-card" style={{ position: 'relative' }} id="next-card">
        <span className="h-ic"><Icon name={habitIcon(h)} /></span>
        <div className="grow">
          <div className="next-title">{h.nombre}</div>
          <div className="body-2">{isProt ? `Vas ${Math.round(nut.prot)} de ${d.profile.protObjetivo} g. Te faltan ${Math.max(0, Math.round(d.profile.protObjetivo - nut.prot))} g.` : h.minimo ? `Mínimo: ${h.minimo}` : `+${h.xp} XP`}</div>
          <div className="row" style={{ marginTop: 12 }}>
            {isProt && <button className="btn btn-primary" onClick={() => ui.go('comida')}><Icon name="utensils" size={16} />Registrar comida</button>}
            <button className={`btn ${isProt ? 'btn-quiet' : 'btn-primary'}`} onClick={() => setHabit(h, f, 'hecho', document.getElementById('next-card'))}><Icon name="check" size={16} />Hecho</button>
            {h.minimo && <button className="btn btn-ghost" onClick={() => setHabit(h, f, 'minimo', document.getElementById('next-card'))}>Versión mínima</button>}
          </div>
        </div>
      </div>
      {rest.length > 0 && <div className="hlist flat" style={{ marginTop: 14, paddingTop: 6, borderTop: '1px solid var(--line)' }}>{rest.slice(0, 3).map((x) => <HabitRow key={x.id} h={x} fecha={f} compact />)}</div>}
      {rest.length > 3 && <button className="link-row" onClick={() => ui.go('habitos')}><Icon name="list-checks" size={16} />{rest.length - 3} más hoy<Icon name="chevron-right" size={16} /></button>}
    </section>
  )
}

function Signals() {
  const d = useStore()
  const [open, setOpen] = useState<string | null>(null)
  const f = today()
  const days = Array.from({ length: 7 }, (_, i) => addDays(f, i - 6))
  const letters = days.map((x) => 'DLMXJVS'[parse(x).getDay()])
  const sleep = (x: string) => sleepHours(d.checkins[x]?.horaDormir, d.checkins[x]?.horaDespertar) ?? 0
  const savingAt = (x: string) => last(d.savings.filter((s) => s.fecha <= x))?.valor ?? 0
  const hs = sleepHours(d.checkins[f]?.horaDormir, d.checkins[f]?.horaDespertar)
  const prev = days.slice(0, 6).map(sleep).filter(Boolean)
  const avgPrev = prev.length ? prev.reduce((a, b) => a + b, 0) / prev.length : null
  const prot = dayNutrition(d, f).prot
  const ahorro = last(d.savings)?.valor ?? 0
  const ws = weekStart(f)
  const juntadas = d.social.filter((s) => s.fecha >= ws && s.tipo === 'juntada').length
  const sig = [
    { k: 'sueno', i: 'bed', n: 'Sueño', v: hs === null ? '—' : dec(hs), u: 'h', p: (hs ?? 0) / d.profile.suenoMin, foot: `meta ${dec(d.profile.suenoMin)} h`, trend: hs !== null && avgPrev ? hs - avgPrev : null, week: days.map(sleep), tone: 'neutral' as const },
    { k: 'prot', i: 'beef', n: 'Proteína', v: String(Math.round(prot)), u: `/ ${d.profile.protObjetivo} g`, p: prot / d.profile.protObjetivo, foot: prot >= d.profile.protObjetivo ? 'meta cumplida' : `faltan ${Math.round(d.profile.protObjetivo - prot)} g`, week: days.map((x) => dayNutrition(d, x).prot), tone: prot >= d.profile.protObjetivo ? 'ok' as const : 'neutral' as const },
    { k: 'ahorro', i: 'piggy-bank', n: 'Ahorro', v: ahorro.toLocaleString('es-AR'), u: 'USD', p: ahorro / d.profile.ahorroObjetivo, foot: `${Math.round((ahorro / d.profile.ahorroObjetivo) * 100)} % de ${d.profile.ahorroObjetivo.toLocaleString('es-AR')}`, week: days.map(savingAt), tone: 'neutral' as const },
    { k: 'amigos', i: 'users', n: 'Amigos', v: String(juntadas), u: '/ 1 juntada', p: juntadas, foot: juntadas >= 1 ? 'meta semanal cumplida' : 'meta: 1 por semana', week: days.map((x) => d.social.filter((s) => s.fecha === x).length), tone: juntadas >= 1 ? 'ok' as const : 'neutral' as const },
  ]
  return (
    <div className="signals">
      {sig.map((s) => {
        const max = Math.max(...s.week, 1)
        const exp = open === s.k
        return (
          <button key={s.k} className="signal" aria-expanded={exp} onClick={() => setOpen(exp ? null : s.k)}>
            <span className="sig-head"><Icon name={s.i} size={14} />{s.n}{'trend' in s && s.trend != null && Math.abs(s.trend) >= 0.1 && <span className={`trend ${s.trend > 0 ? 'up' : 'down'}`}>{s.trend > 0 ? '+' : '−'}{dec(Math.abs(s.trend))}</span>}</span>
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

function Coach() {
  const d = useStore()
  const f = today()
  const [txt, setTxt] = useState(d.coachLog.find((c) => c.fecha === f)?.texto ?? '')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const go = useUI((s) => s.go)
  const run = async () => {
    setLoading(true); setErr('')
    try {
      const { askCoach } = await import('../lib/coach')
      const t = await askCoach(useStore.getState())
      setTxt(t)
      d.set((s) => ({ coachLog: [...s.coachLog.filter((c) => c.fecha !== f), { fecha: f, texto: t }] }))
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    } finally { setLoading(false) }
  }
  return (
    <Card title="Briefing" icon="sparkles" right={d.settings.apiKey ? <button className="btn btn-quiet btn-sm" disabled={loading} onClick={run}>{loading ? 'Pensando…' : txt ? 'Actualizar' : 'Pedir briefing'}</button> : null}>
      {!d.settings.apiKey && <div className="row"><p className="body-2 grow">Conectá tu clave de Anthropic para recibir un briefing diario del coach.</p><button className="btn btn-quiet btn-sm" onClick={() => go('ajustes')}>Conectar</button></div>}
      {err && <p className="err">No se pudo obtener el briefing: {err}</p>}
      {txt ? <p className="coach-txt">{txt}</p> : d.settings.apiKey && !loading && <p className="cap">Pedí el briefing para ver diagnóstico y tres órdenes para hoy.</p>}
    </Card>
  )
}

// ---------------- Línea del día ----------------
function Linea() {
  const d = useStore()
  const ui = useUI()
  const f = today()
  const ds = dayState(d, f)
  const wake = d.profile.despertar[dow(f)]
  const bed = bedtimeFor(d.profile.despertar[dow(addDays(f, 1))], d.profile.suenoMin)
  const now = nowMin()
  const wm = weekMedals(d, weekStart(f))
  const xpDay = ds.hs.reduce((a, h) => a + (ds.log[h.id] === 'hecho' ? h.xp : ds.log[h.id] === 'minimo' ? h.xp / 2 : 0), 0)
  const winAt: Record<string, number> = { manana: toMin(wake), dia: Math.max(toMin(wake) + 120, 12 * 60), tarde: 15 * 60, noche: 21 * 60 + 30 }
  type Ev = { min: number; key: string; node: React.ReactNode; win?: boolean }
  const evs: Ev[] = [{ min: toMin(wake), key: 'wake', node: <div className="blk"><div className="t"><Icon name="sun" size={16} />Despertar</div><div className="cap">{d.checkins[f]?.animoManana ? 'Check-in hecho' : 'Check-in de la mañana pendiente'}</div></div> }]
  for (const a of d.profile.agenda[dow(f)] ?? [])
    evs.push({ min: toMin(a.hora), key: a.hora + a.que, node: <div className={`blk ${/revisi/i.test(a.que) ? 'key' : ''}`}><div className="row" style={{ justifyContent: 'space-between' }}><div className="t">{a.que}</div>{a.intensidad && <span className={`int ${a.intensidad}`}>{a.intensidad}</span>}</div></div> })
  for (const m of MOMENTOS) {
    const hs = ds.hs.filter((h) => momentoDe(h) === m.id)
    if (!hs.length) continue
    const done = hs.filter((h) => ds.log[h.id]).length
    evs.push({ min: winAt[m.id], key: m.id, win: true, node: <div><div className="win-head"><span className="eyebrow">{m.label} · {m.hasta}</span><span className="cap num">{done}/{hs.length}</span></div><div className="hlist">{hs.map((h) => <HabitRow key={h.id} h={h} fecha={f} />)}</div></div> })
  }
  evs.push({ min: toMin(bed) < toMin(wake) ? toMin(bed) + 1440 : toMin(bed), key: 'bed', node: <div className="blk"><div className="t"><Icon name="moon" size={16} />Acostarte para dormir {dec(d.profile.suenoMin)} h</div><div className="cap">Mañana te levantás a las {d.profile.despertar[dow(addDays(f, 1))]}</div></div> })
  evs.sort((a, b) => a.min - b.min)
  const nowIdx = evs.findIndex((e) => e.min > now)
  return (
    <>
      <section className={`horizon tl-head ${ds.n && ds.p >= 1 ? 'complete' : ''}`} style={{ ['--p' as string]: ds.p }}>
        <Ring p={ds.p} size={64} label={`${ds.done} de ${ds.n} hábitos`} />
        <div className="grow"><div><span className="val-l">{ds.done}</span><span className="unit">de {ds.n} hábitos</span></div>
          <div className="row cap" style={{ marginTop: 6, gap: 8 }}>Semana {wm.global === null ? '—' : `${Math.round(wm.global * 100)} %`} {wm.globalMedal && <Medal m={wm.globalMedal} />} · {Math.round(xpDay)} XP hoy</div></div>
        <button className="btn btn-quiet btn-sm" onClick={() => ui.openSheet(new Date().getHours() >= 17 ? 'checkin-noche' : 'checkin-manana')}><Icon name="sun" size={15} />Check-in</button>
      </section>
      <div className="timeline" aria-label="Línea del día">
        {evs.map((e, i) => (
          <div key={e.key}>
            {i === (nowIdx === -1 ? evs.length : nowIdx) && <div className="nowline" role="presentation"><span>{hourFmt(now)}</span></div>}
            <div className={`slot ${!e.win && e.min < now - 30 ? 'past' : ''} ${e.win && e.min <= now && (evs[i + 1]?.min ?? 1e9) > now ? 'cur' : ''}`}>
              <span className="slot-time">{hourFmt(e.min)}</span>{e.node}
            </div>
          </div>
        ))}
        {nowIdx === -1 && <div className="nowline" role="presentation"><span>{hourFmt(now)}</span></div>}
      </div>
      {compliance(d, [f]) === null && <p className="cap">No hay hábitos para hoy.</p>}
    </>
  )
}
