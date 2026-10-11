import { useEffect, useState } from 'react'
import { useStore } from '../lib/store'
import { useUI } from '../lib/ui'
import { weekSoFar } from '../lib/logic'
import { addDays, diffDays, fmtShort, today, uid, weekStart } from '../lib/date'
import type { Exam, StudySession, Subject } from '../lib/types'
import { Icon } from '../components/Icon'
import { Bar, Card, Empty, Field, PageHead } from '../components/ui'
import { BarC, PieC } from '../components/charts'

const TIPOS: StudySession['tipo'][] = ['facultad', 'ia', 'ingles', 'lectura']
const TIPO_LBL = { facultad: 'Facultad', ia: 'IA', ingles: 'Inglés', lectura: 'Lectura' }
const RUN_KEY = 'pm-study-running'

export default function Estudio() {
  const d = useStore()
  const ui = useUI()
  const [tema, setTema] = useState('')
  const [tipo, setTipo] = useState<StudySession['tipo']>('facultad')
  const [foco, setFoco] = useState(4)
  const [manual, setManual] = useState('45')
  // El inicio se guarda para que el temporizador siga si la app se cierra.
  const [running, setRunning] = useState<number | null>(() => { try { return Number(localStorage.getItem(RUN_KEY)) || null } catch { return null } })
  const [, tick] = useState(0)
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => tick((x) => x + 1), 1000)
    return () => clearInterval(id)
  }, [running])
  const setRun = (v: number | null) => { setRunning(v); try { v ? localStorage.setItem(RUN_KEY, String(v)) : localStorage.removeItem(RUN_KEY) } catch { /* sin almacenamiento */ } }
  const elapsed = running ? Math.floor((Date.now() - running) / 1000) : 0
  const save = (minutos: number) => {
    if (minutos <= 0) return
    const id = uid()
    d.set((s) => ({ study: [...s.study, { id, fecha: today(), tema: tema.trim() || TIPO_LBL[tipo], tipo, minutos, foco }] }))
    ui.notify(`${minutos} min de ${TIPO_LBL[tipo]} guardados`, () => d.set((s) => ({ study: s.study.filter((x) => x.id !== id) })))
  }

  const semana = weekSoFar()
  const porTipo = TIPOS.map((tp) => ({ name: TIPO_LBL[tp], value: d.study.filter((s) => semana.includes(s.fecha) && s.tipo === tp).reduce((a, s) => a + s.minutos, 0) })).filter((x) => x.value > 0)
  const aprendizaje = d.study.filter((s) => semana.includes(s.fecha) && s.tipo !== 'facultad').reduce((a, s) => a + s.minutos, 0) / 60
  const weeks = Array.from({ length: 8 }, (_, i) => addDays(weekStart(today()), -7 * (7 - i)))
  const chart = weeks.map((ws) => {
    const row: Record<string, number | string> = { semana: ws.slice(5).replace('-', '/') }
    for (const tp of TIPOS) row[tp] = +(d.study.filter((s) => weekStart(s.fecha) === ws && s.tipo === tp).reduce((a, s) => a + s.minutos, 0) / 60).toFixed(1)
    return row
  })

  return (
    <div className="view">
      <PageHead eyebrow="Administración de Empresas · 3.º año" title="Estudio" />
      <div className="two-col">
        <div className="stack">
          <section className="horizon now" style={{ ['--p' as string]: running ? Math.min(1, elapsed / (50 * 60)) : 0 }}>
            <div className="now-head"><span className="eyebrow">Sesión de foco</span>{running && <span className="countdown"><span className="pulse" aria-hidden="true" />en curso</span>}</div>
            <div className="timer" style={{ margin: '14px 0' }} aria-live="off">{String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')}</div>
            <div className="form-grid">
              <Field label="Tipo" id="s-t"><select id="s-t" value={tipo} onChange={(e) => setTipo(e.target.value as StudySession['tipo'])}>{TIPOS.map((x) => <option key={x} value={x}>{TIPO_LBL[x]}</option>)}</select></Field>
              <Field label="Materia o tema" id="s-m"><input id="s-m" list="materias" value={tema} onChange={(e) => setTema(e.target.value)} /></Field>
              <datalist id="materias">{d.subjects.map((s) => <option key={s.id} value={s.nombre} />)}</datalist>
              <Field label="Foco (1–5)" id="s-f"><input id="s-f" type="number" inputMode="numeric" min={1} max={5} value={foco} onChange={(e) => setFoco(Number(e.target.value))} /></Field>
            </div>
            <div className="row" style={{ marginTop: 14 }}>
              {!running ? <button className="btn btn-primary" onClick={() => setRun(Date.now())}><Icon name="play" size={16} />Empezar</button>
                : <button className="btn btn-primary" onClick={() => { save(Math.max(1, Math.round(elapsed / 60))); setRun(null) }}><Icon name="square" size={14} />Terminar y guardar</button>}
              {running && <button className="btn btn-ghost" onClick={() => setRun(null)}>Descartar</button>}
              <span className="grow" />
              <form className="row" style={{ flexWrap: 'nowrap' }} onSubmit={(e) => { e.preventDefault(); save(Number(manual)) }}>
                <input aria-label="Minutos a cargar a mano" type="number" inputMode="numeric" style={{ width: 84 }} value={manual} onChange={(e) => setManual(e.target.value)} />
                <button className="btn btn-quiet">Cargar min</button>
              </form>
            </div>
          </section>
          <Exams />
          <Subjects />
        </div>
        <aside className="stack">
          <Card title="IA, inglés y lectura" icon="bot">
            <div><span className="val-l">{aprendizaje.toFixed(1).replace('.', ',')}</span><span className="unit">h de {d.profile.horasAprendizaje} h esta semana</span></div>
            <div style={{ margin: '12px 0' }}><Bar value={aprendizaje / d.profile.horasAprendizaje} /></div>
            {porTipo.length > 0 ? <PieC data={porTipo} height={170} /> : <p className="cap">Sin sesiones esta semana.</p>}
          </Card>
          <Card title="Horas por semana" icon="layout-grid"><BarC data={chart} x="semana" stacked ys={TIPOS.map((x) => ({ key: x, name: TIPO_LBL[x] }))} height={210} /></Card>
        </aside>
      </div>
    </div>
  )
}

function Exams() {
  const d = useStore()
  const ui = useUI()
  const [e, setE] = useState<Omit<Exam, 'id'>>({ materiaId: d.subjects[0]?.id ?? '', tipo: 'parcial', fecha: today() })
  const t = today()
  const list = d.exams.slice().sort((a, b) => a.fecha.localeCompare(b.fecha))
  return (
    <Card title="Parciales, TPs y finales" icon="calendar">
      <form className="form-grid" onSubmit={(ev) => { ev.preventDefault(); d.set((s) => ({ exams: [...s.exams, { id: uid(), ...e }] })); ui.notify('Fecha agregada') }}>
        <Field label="Materia" id="x-m"><select id="x-m" value={e.materiaId} onChange={(x) => setE({ ...e, materiaId: x.target.value })}>{d.subjects.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}</select></Field>
        <Field label="Tipo" id="x-t"><select id="x-t" value={e.tipo} onChange={(x) => setE({ ...e, tipo: x.target.value as Exam['tipo'] })}>{['parcial', 'TP', 'final'].map((x) => <option key={x}>{x}</option>)}</select></Field>
        <Field label="Fecha" id="x-f"><input id="x-f" type="date" value={e.fecha} onChange={(x) => setE({ ...e, fecha: x.target.value })} /></Field>
        <button className="btn btn-quiet"><Icon name="plus" size={16} />Agregar</button>
      </form>
      {list.length === 0 ? <div className="empty sm"><p>Todavía no cargaste fechas. Los parciales son en noviembre y los finales en diciembre: cargalos para ver la cuenta regresiva en Hoy.</p></div> : (
        <div className="tbl-wrap" style={{ marginTop: 12 }}><table><thead><tr><th>Fecha</th><th>Tipo</th><th>Materia</th><th className="num">Faltan / nota</th><th /></tr></thead><tbody>
          {list.map((x) => {
            const n = diffDays(x.fecha, t)
            return (
              <tr key={x.id} style={{ opacity: n < 0 ? 0.6 : 1 }}>
                <td>{fmtShort(x.fecha)}</td><td>{x.tipo}</td><td>{d.subjects.find((s) => s.id === x.materiaId)?.nombre}</td>
                <td className="num">{n >= 0 ? `${n} d` : <input aria-label="Nota" type="number" inputMode="decimal" placeholder="nota" style={{ width: 80, minHeight: 34 }} value={x.nota ?? ''} onChange={(ev) => d.set((s) => ({ exams: s.exams.map((y) => y.id === x.id ? { ...y, nota: ev.target.value ? Number(ev.target.value) : undefined } : y) }))} />}</td>
                <td><button className="icon-btn sm" aria-label="Borrar fecha" onClick={() => { d.set((s) => ({ exams: s.exams.filter((y) => y.id !== x.id) })); ui.notify('Fecha borrada', () => d.set((s) => ({ exams: [...s.exams, x] })), 'neutral') }}><Icon name="trash" size={15} /></button></td>
              </tr>
            )
          })}
        </tbody></table></div>
      )}
    </Card>
  )
}

function Subjects() {
  const d = useStore()
  const [nueva, setNueva] = useState('')
  const up = (id: string, p: Partial<Subject>) => d.set((s) => ({ subjects: s.subjects.map((x) => x.id === id ? { ...x, ...p } : x) }))
  const notas = d.subjects.filter((s) => s.nota).map((s) => s.nota!)
  return (
    <Card title="Materias" icon="book-open" right={notas.length ? <span className="chip num">Promedio {(notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(2).replace('.', ',')}</span> : null}>
      {d.subjects.length === 0 && <Empty icon="book-open" title="Sin materias">Agregá las materias del cuatrimestre.</Empty>}
      {d.subjects.map((s) => (
        <div className="list-row" key={s.id} style={{ flexWrap: 'wrap' }}>
          <span className="grow" style={{ minWidth: 160 }}>{s.nombre}</span>
          <select aria-label={`Estado de ${s.nombre}`} style={{ width: 160, minHeight: 36 }} value={s.estado} onChange={(e) => up(s.id, { estado: e.target.value as Subject['estado'] })}>{['cursando', 'final pendiente', 'aprobada'].map((x) => <option key={x}>{x}</option>)}</select>
          <input aria-label={`Nota de ${s.nombre}`} type="number" inputMode="decimal" placeholder="nota" style={{ width: 80, minHeight: 36 }} value={s.nota ?? ''} onChange={(e) => up(s.id, { nota: e.target.value ? Number(e.target.value) : undefined })} />
        </div>
      ))}
      <form className="row" style={{ marginTop: 12, flexWrap: 'nowrap' }} onSubmit={(e) => { e.preventDefault(); if (!nueva.trim()) return; d.set((s) => ({ subjects: [...s.subjects, { id: uid(), nombre: nueva.trim(), estado: 'cursando' }] })); setNueva('') }}>
        <input className="grow" aria-label="Nueva materia" placeholder="Agregar materia…" value={nueva} onChange={(e) => setNueva(e.target.value)} />
        <button className="btn btn-quiet" disabled={!nueva.trim()}>Agregar</button>
      </form>
    </Card>
  )
}
