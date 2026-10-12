import { useEffect, useState } from 'react'
import { useStore } from '../lib/store'
import { useUI } from '../lib/ui'
import { sessionXp, weekSoFar, XP_TEST } from '../lib/logic'
import { addDays, diffDays, fmtShort, today, uid, weekStart } from '../lib/date'
import { RUTA_INFO } from '../lib/seed'
import type { AE, Entrega, Evidencia, EvidenciaTipo, Exam, MetaMes, Pregunta, Ruta, StudySession, Subject } from '../lib/types'
import { Icon } from '../components/Icon'
import { Bar, Card, Empty, Field, PageHead, Seg } from '../components/ui'
import { BarC } from '../components/charts'
import { useScrollToSub } from '../components/useScrollTo'

type Tipo = StudySession['tipo']
const TIPOS: Tipo[] = ['facultad', 'ingles', 'lectura', 'ia', 'programacion']
const LBL: Record<Tipo, string> = { facultad: 'Facultad', ingles: 'Inglés', lectura: 'Lectura', ia: 'IA', programacion: 'Programación' }
const RUN_KEY = 'pm-study-running'
const mesActual = () => today().slice(0, 7)

export default function Estudio() {
  useScrollToSub()
  const ui = useUI()
  const tab = ui.sub === 'rutas' || ui.sub === 'facultad' ? ui.sub : 'facultad'
  return (
    <div className="view">
      <PageHead eyebrow="Administración de Empresas · 3.º año" title="Estudio" />
      <Sesion />
      <div style={{ margin: '18px 0 14px' }}><Seg label="Sección" value={tab} onChange={(v) => ui.go('estudio', v)} options={[['facultad', 'Facultad'], ['rutas', 'Inglés · Lectura · IA · Programación']]} /></div>
      {tab === 'facultad' ? <Facultad /> : <Rutas />}
    </div>
  )
}

// ---------------- Sesión de foco con evidencia ----------------
const comprimir = (f: File): Promise<string> => new Promise((res, rej) => {
  const r = new FileReader()
  r.onload = () => { const img = new Image(); img.onload = () => { const k = Math.min(1, 640 / Math.max(img.width, img.height)); const c = document.createElement('canvas'); c.width = img.width * k; c.height = img.height * k; c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', 0.7)) }; img.onerror = () => rej(new Error('Imagen inválida')); img.src = String(r.result) }
  r.onerror = () => rej(new Error('No se pudo leer')); r.readAsDataURL(f)
})

/** Verifica un commit público de GitHub: existe y es de hoy. */
export const verificarCommit = async (url: string): Promise<{ ok: boolean; detalle: string }> => {
  const m = url.match(/github\.com\/([^/]+)\/([^/]+)\/commit\/([0-9a-f]{7,40})/i)
  if (!m) return { ok: false, detalle: 'No es un link a un commit de GitHub.' }
  try {
    const r = await fetch(`https://api.github.com/repos/${m[1]}/${m[2]}/commits/${m[3]}`)
    if (!r.ok) return { ok: false, detalle: r.status === 404 ? 'No se encontró (¿repo privado?).' : `GitHub respondió ${r.status}.` }
    const j = await r.json() as { commit: { author: { date: string }; message: string }; stats?: { total: number } }
    const f = j.commit.author.date.slice(0, 10)
    const reciente = diffDays(today(), f) <= 1
    return { ok: reciente, detalle: `${j.commit.message.split('\n')[0].slice(0, 60)} · ${fmtShort(f)}${j.stats ? ` · ${j.stats.total} líneas` : ''}${reciente ? '' : ' · no es de hoy'}` }
  } catch { return { ok: false, detalle: 'No se pudo consultar GitHub.' } }
}

function Sesion() {
  const d = useStore()
  const ui = useUI()
  const [tema, setTema] = useState('')
  const [tipo, setTipo] = useState<Tipo>('facultad')
  const [act, setAct] = useState('')
  const [foco, setFoco] = useState(4)
  const [manual, setManual] = useState('45')
  const [evTipo, setEvTipo] = useState<EvidenciaTipo>('texto')
  const [ev, setEv] = useState('')
  const [checking, setChecking] = useState(false)
  // El inicio se guarda para que el temporizador siga si la app se cierra.
  const [running, setRunning] = useState<number | null>(() => { try { return Number(localStorage.getItem(RUN_KEY)) || null } catch { return null } })
  const [, tick] = useState(0)
  useEffect(() => { if (!running) return; const id = setInterval(() => tick((x) => x + 1), 1000); return () => clearInterval(id) }, [running])
  const setRun = (v: number | null) => { setRunning(v); try { v ? localStorage.setItem(RUN_KEY, String(v)) : localStorage.removeItem(RUN_KEY) } catch { /* sin almacenamiento */ } }
  const elapsed = running ? Math.floor((Date.now() - running) / 1000) : 0
  const ruta = tipo !== 'facultad' ? RUTA_INFO[tipo] : null

  const save = async (minutos: number) => {
    if (minutos <= 0) return
    let evidencia: Evidencia | undefined
    if (ev.trim()) {
      evidencia = { tipo: evTipo, valor: ev.trim() }
      if (evTipo === 'commit') { setChecking(true); const r = await verificarCommit(ev.trim()); setChecking(false); evidencia = { ...evidencia, verificado: r.ok, detalle: r.detalle } }
      if (evTipo === 'link') evidencia.verificado = false
    }
    const id = uid()
    const s: StudySession = { id, fecha: today(), tema: tema.trim() || LBL[tipo], tipo, minutos, foco, actividad: act || undefined, evidencia }
    d.set((st) => ({ study: [...st.study, s] }))
    const xp = sessionXp(s)
    ui.notify(`${minutos} min de ${LBL[tipo]} · +${xp} XP${tipo !== 'facultad' && !evidencia ? ' (sin evidencia: la mitad)' : evidencia?.verificado ? ' · verificado' : ''}`, () => d.set((st) => ({ study: st.study.filter((x) => x.id !== id) })))
    setEv('')
  }
  const pickFoto = async (f?: File) => { if (!f) return; try { setEv(await comprimir(f)); setEvTipo('foto') } catch { /* ignorar */ } }

  return (
    <section className="horizon now" style={{ ['--p' as string]: running ? Math.min(1, elapsed / (50 * 60)) : 0 }}>
      <div className="now-head"><span className="eyebrow">Sesión de foco</span>{running ? <span className="countdown"><span className="pulse" aria-hidden="true" />en curso</span> : <span className="cap">la evidencia duplica el XP</span>}</div>
      <div className="timer" style={{ margin: '12px 0' }} aria-live="off">{String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')}</div>
      <div className="chips" role="group" aria-label="Tipo de sesión" style={{ marginBottom: 12 }}>{TIPOS.map((x) => <button key={x} className="chip" aria-pressed={tipo === x} onClick={() => { setTipo(x); setAct(''); setEvTipo(x === 'programacion' ? 'commit' : x === 'ia' ? 'link' : 'texto') }}><Icon name={x === 'facultad' ? 'graduation-cap' : RUTA_INFO[x].icon} size={13} />{LBL[x]}</button>)}</div>
      <div className="form-grid">
        <Field label={tipo === 'facultad' ? 'Materia' : tipo === 'lectura' ? 'Libro' : 'Tema'} id="s-m"><input id="s-m" list="materias" value={tema} onChange={(e) => setTema(e.target.value)} /></Field>
        <datalist id="materias">{(tipo === 'facultad' ? d.subjects.map((s) => s.nombre) : [...new Set(d.study.filter((s) => s.tipo === tipo).map((s) => s.tema))]).map((s) => <option key={s} value={s} />)}</datalist>
        {ruta && <Field label="Actividad" id="s-a"><select id="s-a" value={act} onChange={(e) => setAct(e.target.value)}><option value="">—</option>{ruta.actividades.map((a) => <option key={a}>{a}</option>)}</select></Field>}
        <Field label="Foco (1–5)" id="s-f"><input id="s-f" type="number" inputMode="numeric" min={1} max={5} value={foco} onChange={(e) => setFoco(Number(e.target.value))} /></Field>
      </div>
      {tipo !== 'facultad' && (
        <div className="evidence">
          <div className="row" style={{ justifyContent: 'space-between' }}><span className="eyebrow">Evidencia</span><Seg label="Tipo de evidencia" value={evTipo} onChange={(v) => { setEvTipo(v); setEv('') }} options={[['texto', 'Texto'], ['link', 'Link'], ['foto', 'Foto'], ['commit', 'Commit']]} /></div>
          <p className="cap" style={{ margin: '6px 0 8px' }}>{ruta?.evidencia}</p>
          {evTipo === 'texto' && <textarea rows={3} aria-label="Evidencia en texto" value={ev} onChange={(e) => setEv(e.target.value)} placeholder={tipo === 'ingles' ? 'Write 3–5 lines in English about what you watched or heard…' : tipo === 'lectura' ? 'Páginas 40–62. Idea principal: …' : 'Qué aprendiste, en dos líneas'} />}
          {(evTipo === 'link' || evTipo === 'commit') && <input aria-label="Link de evidencia" inputMode="url" value={ev} onChange={(e) => setEv(e.target.value)} placeholder={evTipo === 'commit' ? 'https://github.com/usuario/repo/commit/…' : 'https://…'} />}
          {evTipo === 'foto' && <div className="row">{ev ? <img src={ev} alt="Evidencia" className="ev-thumb" /> : null}<label className="btn btn-quiet"><Icon name="camera" size={16} />{ev ? 'Cambiar foto' : 'Sacar o elegir foto'}<input type="file" accept="image/*" capture="environment" hidden onChange={(e) => { pickFoto(e.target.files?.[0]); e.target.value = '' }} /></label></div>}
        </div>
      )}
      <div className="row" style={{ marginTop: 14 }}>
        {!running ? <button className="btn btn-primary" onClick={() => setRun(Date.now())}><Icon name="play" size={16} />Empezar</button>
          : <button className="btn btn-primary" disabled={checking} onClick={async () => { await save(Math.max(1, Math.round(elapsed / 60))); setRun(null) }}><Icon name="square" size={14} />{checking ? 'Verificando…' : 'Terminar y guardar'}</button>}
        {running && <button className="btn btn-ghost" onClick={() => setRun(null)}>Descartar</button>}
        <span className="grow" />
        <form className="row" style={{ flexWrap: 'nowrap' }} onSubmit={(e) => { e.preventDefault(); save(Number(manual)) }}>
          <input aria-label="Minutos a cargar a mano" type="number" inputMode="numeric" style={{ width: 84 }} value={manual} onChange={(e) => setManual(e.target.value)} />
          <button className="btn btn-quiet" disabled={checking}>Cargar min</button>
        </form>
      </div>
    </section>
  )
}

// ---------------- Facultad ----------------
function Facultad() {
  const d = useStore()
  const semana = weekSoFar()
  const weeks = Array.from({ length: 8 }, (_, i) => addDays(weekStart(today()), -7 * (7 - i)))
  const chart = weeks.map((ws) => {
    const row: Record<string, number | string> = { semana: ws.slice(5).replace('-', '/') }
    for (const tp of TIPOS) row[tp] = +(d.study.filter((s) => weekStart(s.fecha) === ws && s.tipo === tp).reduce((a, s) => a + s.minutos, 0) / 60).toFixed(1)
    return row
  })
  const horasFac = d.study.filter((s) => semana.includes(s.fecha) && s.tipo === 'facultad').reduce((a, s) => a + s.minutos, 0) / 60
  return (
    <div className="two-col">
      <div className="stack">
        <Materias />
        <Exams />
      </div>
      <aside className="stack">
        <Card title="Facultad esta semana" icon="graduation-cap"><span className="val-l">{horasFac.toFixed(1).replace('.', ',')}</span><span className="unit">h</span></Card>
        <Card title="Horas por semana" icon="layout-grid"><BarC data={chart} x="semana" stacked ys={TIPOS.map((x, i) => ({ key: x, name: LBL[x], color: ['#9A8CFF', '#C9D0DC', '#6B7280', '#B4C5FF', '#4A5160'][i] }))} height={210} /></Card>
      </aside>
    </div>
  )
}

const notaOk = (v: string) => { if (v === '') return undefined; const n = Number(v.replace(',', '.')); return n >= 1 && n <= 10 ? Math.round(n * 100) / 100 : null }
function Materias() {
  const d = useStore()
  const [nueva, setNueva] = useState('')
  const up = (id: string, p: Partial<Subject>) => d.set((s) => ({ subjects: s.subjects.map((x) => x.id === id ? { ...x, ...p } : x) }))
  const upAE = (s: Subject, p: Partial<AE>) => up(s.id, { ae: { ...(s.ae ?? {}), ...p }, ...(p.final !== undefined ? { nota: p.final } : {}) })
  const finales = d.subjects.map((s) => s.ae?.final ?? s.nota).filter((x): x is number => typeof x === 'number')
  return (
    <Card title="Materias" icon="book-open" right={finales.length ? <span className="chip num">Promedio {(finales.reduce((a, b) => a + b, 0) / finales.length).toFixed(2).replace('.', ',')}</span> : null}>
      <p className="cap" style={{ marginBottom: 12 }}>AE1 y AE2: entregado o incompleto · AE3 (parcial), AE4 (integrador) y Final: nota de 1 a 10.</p>
      {d.subjects.length === 0 && <Empty icon="book-open" title="Sin materias">Agregá las materias del cuatrimestre.</Empty>}
      <div className="subj-list">
        {d.subjects.map((s) => {
          const ae = s.ae ?? {}
          const listo = ae.ae1 === 'entregado' && ae.ae2 === 'entregado' && ae.ae3 !== undefined && ae.ae4 !== undefined
          return (
            <div className="subj" key={s.id}>
              <div className="row" style={{ flexWrap: 'nowrap' }}>
                <b className="grow">{s.nombre}</b>
                <select aria-label={`Estado de ${s.nombre}`} style={{ width: 150, minHeight: 34 }} value={s.estado} onChange={(e) => up(s.id, { estado: e.target.value as Subject['estado'] })}>{['cursando', 'final pendiente', 'aprobada'].map((x) => <option key={x}>{x}</option>)}</select>
              </div>
              <div className="ae-row">
                {(['ae1', 'ae2'] as const).map((k) => (
                  <button key={k} className={`ae-tog ${ae[k] ?? ''}`} aria-label={`${k.toUpperCase()} de ${s.nombre}: ${ae[k] ?? 'sin cargar'}`} onClick={() => upAE(s, { [k]: (ae[k] === 'entregado' ? 'incompleto' : ae[k] === 'incompleto' ? undefined : 'entregado') as Entrega | undefined })}>
                    <span className="ae-k">{k.toUpperCase()}</span><span>{ae[k] === 'entregado' ? <><Icon name="check" size={13} />Entregado</> : ae[k] === 'incompleto' ? 'Incompleto' : '—'}</span>
                  </button>
                ))}
                {(['ae3', 'ae4', 'final'] as const).map((k) => <NotaBox key={k} label={k === 'final' ? 'Final' : k.toUpperCase()} sub={k === 'ae3' ? 'parcial' : k === 'ae4' ? 'integrador' : ''} value={ae[k]} onChange={(v) => upAE(s, { [k]: v })} />)}
              </div>
              {listo && !ae.final && <span className="cap ok-t"><Icon name="circle-check" size={13} /> AE completos: queda el final</span>}
            </div>
          )
        })}
      </div>
      <form className="row" style={{ marginTop: 12, flexWrap: 'nowrap' }} onSubmit={(e) => { e.preventDefault(); if (!nueva.trim()) return; d.set((s) => ({ subjects: [...s.subjects, { id: uid(), nombre: nueva.trim(), estado: 'cursando' }] })); setNueva('') }}>
        <input className="grow" aria-label="Nueva materia" placeholder="Agregar materia…" value={nueva} onChange={(e) => setNueva(e.target.value)} />
        <button className="btn btn-quiet" disabled={!nueva.trim()}>Agregar</button>
      </form>
    </Card>
  )
}

function NotaBox({ label, sub, value, onChange }: { label: string; sub: string; value?: number; onChange: (v: number | undefined) => void }) {
  const [v, setV] = useState(value === undefined ? '' : String(value).replace('.', ','))
  const [bad, setBad] = useState(false)
  return (
    <label className={`ae-nota ${bad ? 'bad' : ''} ${value !== undefined ? (value >= 4 ? 'ok' : 'low') : ''}`}>
      <span className="ae-k">{label}{sub && <small> {sub}</small>}</span>
      <input inputMode="decimal" aria-label={`${label}: nota de 1 a 10`} placeholder="—" value={v} onChange={(e) => { setV(e.target.value); const n = notaOk(e.target.value); setBad(n === null); if (n !== null) onChange(n) }} />
    </label>
  )
}

function Exams() {
  const d = useStore()
  const ui = useUI()
  const [e, setE] = useState<Omit<Exam, 'id'>>({ materiaId: d.subjects[0]?.id ?? '', tipo: 'parcial', fecha: today() })
  const t = today()
  const list = d.exams.slice().sort((a, b) => a.fecha.localeCompare(b.fecha))
  return (
    <Card title="Fechas: parciales, TPs y finales" icon="calendar">
      <form className="form-grid" onSubmit={(ev) => { ev.preventDefault(); d.set((s) => ({ exams: [...s.exams, { id: uid(), ...e }] })); ui.notify('Fecha agregada') }}>
        <Field label="Materia" id="x-m"><select id="x-m" value={e.materiaId} onChange={(x) => setE({ ...e, materiaId: x.target.value })}>{d.subjects.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}</select></Field>
        <Field label="Tipo" id="x-t"><select id="x-t" value={e.tipo} onChange={(x) => setE({ ...e, tipo: x.target.value as Exam['tipo'] })}>{['parcial', 'TP', 'final'].map((x) => <option key={x}>{x}</option>)}</select></Field>
        <Field label="Fecha" id="x-f"><input id="x-f" type="date" value={e.fecha} onChange={(x) => setE({ ...e, fecha: x.target.value })} /></Field>
        <button className="btn btn-quiet"><Icon name="plus" size={16} />Agregar</button>
      </form>
      {list.length === 0 ? <div className="empty sm"><p>Cargá las fechas para ver la cuenta regresiva en Hoy.</p></div> : (
        <div className="tbl-wrap" style={{ marginTop: 12 }}><table><thead><tr><th>Fecha</th><th>Tipo</th><th>Materia</th><th className="num">Faltan</th><th /></tr></thead><tbody>
          {list.map((x) => {
            const n = diffDays(x.fecha, t)
            return (
              <tr key={x.id} style={{ opacity: n < 0 ? 0.6 : 1 }}>
                <td>{fmtShort(x.fecha)}</td><td>{x.tipo}</td><td>{d.subjects.find((s) => s.id === x.materiaId)?.nombre}</td>
                <td className="num">{n >= 0 ? `${n} d` : 'pasó'}</td>
                <td><button className="icon-btn sm" aria-label="Borrar fecha" onClick={() => { d.set((s) => ({ exams: s.exams.filter((y) => y.id !== x.id) })); ui.notify('Fecha borrada', () => d.set((s) => ({ exams: [...s.exams, x] })), 'neutral') }}><Icon name="trash" size={15} /></button></td>
              </tr>
            )
          })}
        </tbody></table></div>
      )}
    </Card>
  )
}

// ---------------- Rutas ----------------
function Rutas() {
  const d = useStore()
  return <div className="ruta-grid">{d.rutas.map((r) => <RutaCard key={r.id} r={r} />)}</div>
}

function RutaCard({ r }: { r: Ruta }) {
  const d = useStore()
  const ui = useUI()
  const info = RUTA_INFO[r.id]
  const mes = mesActual()
  const meta: MetaMes | undefined = r.metas.find((m) => m.mes === mes)
  const ses = d.study.filter((s) => s.tipo === r.id && s.fecha.startsWith(mes))
  const min = ses.reduce((a, s) => a + s.minutos, 0)
  const conEv = ses.filter((s) => s.evidencia).length
  const ver = ses.filter((s) => s.evidencia?.verificado).length
  const [edit, setEdit] = useState(false)
  const [obj, setObj] = useState(r.objetivo)
  const [mt, setMt] = useState(meta?.texto ?? '')
  const [test, setTest] = useState<Pregunta[] | null>(null)
  const [resp, setResp] = useState<number[]>([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const finMes = Number(today().slice(8)) >= 24
  const upRuta = (p: Partial<Ruta>) => d.set((s) => ({ rutas: s.rutas.map((x) => (x.id === r.id ? { ...x, ...p } : x)) }))
  const guardar = () => {
    const metas = meta ? r.metas.map((m) => (m.mes === mes ? { ...m, texto: mt } : m)) : [...r.metas, { mes, texto: mt }]
    upRuta({ objetivo: obj, metas }); setEdit(false)
  }
  const empezarTest = async () => {
    if (!meta) return
    setBusy(true); setErr('')
    try {
      const { generarTest } = await import('../lib/coach')
      const reg = ses.slice(-12).map((s) => `${s.fecha}: ${s.tema}${s.actividad ? ` (${s.actividad})` : ''}${s.evidencia?.tipo === 'texto' ? ` — ${s.evidencia.valor.slice(0, 160)}` : ''}`).join('\n')
      const q = await generarTest(useStore.getState(), info.nombre, meta.texto, reg)
      if (q.length < 3) throw new Error('No se pudo armar el test. Probá de nuevo.')
      setTest(q); setResp(q.map(() => -1))
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) } finally { setBusy(false) }
  }
  const entregar = () => {
    if (!test || !meta) return
    const aciertos = test.filter((q, i) => resp[i] === q.correcta).length
    const aprobado = aciertos / test.length >= 0.7
    upRuta({ metas: r.metas.map((m) => (m.mes === mes ? { ...m, test: { fecha: today(), preguntas: test, respuestas: resp, aciertos, aprobado } } : m)) })
    ui.notify(aprobado ? `Mini test aprobado: ${aciertos}/${test.length} · +${XP_TEST.aprobado} XP` : `${aciertos}/${test.length}: no alcanzó (70 %). Podés repetirlo · +${XP_TEST.intento} XP`)
    setTest(null)
  }

  return (
    <section className="panel ruta" data-r={r.id}>
      <div className="ruta-head">
        <span className="ac-ic"><Icon name={info.icon} size={20} /></span>
        <div className="grow"><h2 className="h2">{info.nombre}</h2><span className="cap">{(min / 60).toFixed(1).replace('.', ',')} h este mes · {ses.length} sesiones</span></div>
        <button className="icon-btn sm" aria-label={`Editar objetivos de ${info.nombre}`} onClick={() => setEdit(!edit)}><Icon name="pencil" size={15} /></button>
      </div>
      {edit ? (
        <div className="stack" style={{ gap: 10, marginTop: 12 }}>
          <Field label="Objetivo de largo plazo" id={`o-${r.id}`}><textarea id={`o-${r.id}`} rows={2} value={obj} onChange={(e) => setObj(e.target.value)} /></Field>
          <Field label="Meta de este mes (lo que tenés que saber hacer al cierre)" id={`m-${r.id}`}><textarea id={`m-${r.id}`} rows={2} value={mt} onChange={(e) => setMt(e.target.value)} /></Field>
          <button className="btn btn-primary" onClick={guardar}>Guardar</button>
        </div>
      ) : <>
        <p className="ruta-obj">{r.objetivo}</p>
        <div className="ruta-meta"><span className="eyebrow">Meta de {new Date().toLocaleDateString('es-AR', { month: 'long' })}</span><p>{meta?.texto ?? 'Sin meta para este mes: definila con el lápiz.'}</p></div>
      </>}
      <div className="ev-stats">
        <div><span className="cap">Con evidencia</span><span className="val-m">{conEv}<span className="unit">/ {ses.length}</span></span><Bar value={ses.length ? conEv / ses.length : 0} /></div>
        <div><span className="cap">Verificadas</span><span className="val-m">{ver}</span></div>
      </div>
      {ses.length > 0 && <div className="ruta-ses">{ses.slice(-3).reverse().map((s) => (
        <div className="list-row" key={s.id}>
          <Icon name={s.evidencia ? (s.evidencia.verificado ? 'circle-check' : s.evidencia.tipo === 'foto' ? 'image' : s.evidencia.tipo === 'texto' ? 'file-text' : 'link') : 'minus'} size={14} className={s.evidencia ? '' : 'muted'} />
          <span className="grow">{s.tema}<span className="cap"> · {fmtShort(s.fecha)} · {s.minutos} min{s.evidencia?.detalle ? ` · ${s.evidencia.detalle}` : ''}</span></span>
          <span className="k">+{sessionXp(s)}</span>
        </div>
      ))}</div>}
      <div className="ruta-test">
        {meta?.test && !test && <div className={`test-res ${meta.test.aprobado ? 'ok' : ''}`}><Icon name={meta.test.aprobado ? 'trophy' : 'target'} size={16} /><span className="grow">Mini test del mes: {meta.test.aciertos}/{meta.test.preguntas.length} {meta.test.aprobado ? '· aprobado' : '· no alcanzó'}</span></div>}
        {!test && meta && (!meta.test || !meta.test.aprobado) && (
          <button className={`btn ${finMes ? 'btn-primary' : 'btn-quiet'} btn-block`} disabled={busy || !d.settings.apiKey} onClick={empezarTest}>
            <Icon name="target" size={16} />{busy ? 'Armando el test…' : meta.test ? 'Repetir el mini test' : finMes ? 'Hacer el mini test del mes' : 'Probar el mini test'}
          </button>
        )}
        {!d.settings.apiKey && <p className="cap" style={{ marginTop: 6 }}>El mini test se arma con el coach: conectá la clave en Ajustes.</p>}
        {err && <p className="err">{err}</p>}
        {test && (
          <div className="quiz">
            {test.map((q, i) => (
              <fieldset key={i} className="q">
                <legend>{i + 1}. {q.p}</legend>
                {q.opciones.map((o, j) => <label key={j} className={`q-opt ${resp[i] === j ? 'on' : ''}`}><input type="radio" name={`q-${r.id}-${i}`} checked={resp[i] === j} onChange={() => setResp(resp.map((x, k) => (k === i ? j : x)))} />{o}</label>)}
              </fieldset>
            ))}
            <div className="row"><button className="btn btn-ghost" onClick={() => setTest(null)}>Cancelar</button><button className="btn btn-primary grow" disabled={resp.some((x) => x < 0)} onClick={entregar}>Entregar</button></div>
          </div>
        )}
      </div>
    </section>
  )
}


