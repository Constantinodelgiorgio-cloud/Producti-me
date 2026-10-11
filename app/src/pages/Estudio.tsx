import { useEffect, useRef, useState } from 'react'
import { useStore } from '../lib/store'
import { weekSoFar } from '../lib/logic'
import { addDays, diffDays, fmtShort, today, uid, weekStart } from '../lib/date'
import { Bar, Card, Field } from '../components/ui'
import { BarC, PieC } from '../components/charts'
import type { Exam, StudySession, Subject } from '../lib/types'

const TIPOS: StudySession['tipo'][] = ['facultad', 'ia', 'ingles', 'lectura']
const TIPO_LBL = { facultad: 'Facultad', ia: 'IA', ingles: 'Inglés', lectura: 'Lectura' }

export default function Estudio() {
  const d = useStore()
  const [tema, setTema] = useState('')
  const [tipo, setTipo] = useState<StudySession['tipo']>('facultad')
  const [foco, setFoco] = useState(4)
  const [manual, setManual] = useState(45)
  const [running, setRunning] = useState<number | null>(null)
  const [, tick] = useState(0)
  const timer = useRef<number>(undefined)
  useEffect(() => {
    if (running) timer.current = window.setInterval(() => tick((x) => x + 1), 1000)
    return () => window.clearInterval(timer.current)
  }, [running])
  const elapsed = running ? Math.floor((Date.now() - running) / 1000) : 0
  const save = (minutos: number) => {
    if (minutos <= 0) return
    d.set((s) => ({ study: [...s.study, { id: uid(), fecha: today(), tema: tema || TIPO_LBL[tipo], tipo, minutos, foco }] }))
  }

  const semana = weekSoFar()
  const porTipo = TIPOS.map((tp) => ({ name: TIPO_LBL[tp], value: d.study.filter((s) => semana.includes(s.fecha) && s.tipo === tp).reduce((a, s) => a + s.minutos, 0) })).filter((x) => x.value > 0)
  const aprendizaje = d.study.filter((s) => semana.includes(s.fecha) && s.tipo !== 'facultad').reduce((a, s) => a + s.minutos, 0) / 60
  const weeks = Array.from({ length: 8 }, (_, i) => addDays(weekStart(today()), -7 * (7 - i)))
  const chart = weeks.map((ws) => {
    const row: Record<string, number | string> = { semana: ws.slice(5) }
    for (const tp of TIPOS) row[tp] = +(d.study.filter((s) => weekStart(s.fecha) === ws && s.tipo === tp).reduce((a, s) => a + s.minutos, 0) / 60).toFixed(1)
    return row
  })

  return (
    <>
      <Card title="⏱️ Sesión de foco">
        <div className="row">
          <Field label="Tipo"><select value={tipo} onChange={(e) => setTipo(e.target.value as StudySession['tipo'])}>{TIPOS.map((x) => <option key={x} value={x}>{TIPO_LBL[x]}</option>)}</select></Field>
          <Field label="Materia / tema">
            <input list="materias" value={tema} onChange={(e) => setTema(e.target.value)} />
            <datalist id="materias">{d.subjects.map((s) => <option key={s.id} value={s.nombre} />)}</datalist>
          </Field>
          <Field label="Foco (1–5)"><input type="number" min={1} max={5} value={foco} onChange={(e) => setFoco(+e.target.value)} /></Field>
        </div>
        <div className="row" style={{ marginTop: 10 }}>
          <div className="big" style={{ minWidth: 110 }}>{String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')}</div>
          {!running
            ? <button className="btn primary" onClick={() => setRunning(Date.now())}>▶ Empezar</button>
            : <button className="btn primary" onClick={() => { save(Math.round(elapsed / 60)); setRunning(null) }}>⏹ Terminar y guardar</button>}
          <span className="grow" />
          <input type="number" style={{ width: 80 }} value={manual} onChange={(e) => setManual(+e.target.value)} />
          <button className="btn" onClick={() => save(manual)}>+ min manual</button>
        </div>
      </Card>

      <div className="grid">
        <Card title="🤖 IA + inglés + lectura (semana)">
          <div className="big">{aprendizaje.toFixed(1)} h <span className="muted small">/ {d.profile.horasAprendizaje} h</span></div>
          <Bar value={aprendizaje / d.profile.horasAprendizaje} />
          {porTipo.length > 0 && <PieC data={porTipo} height={180} />}
        </Card>
        <Card title="📊 Horas por semana"><BarC data={chart} x="semana" stacked ys={TIPOS.map((x) => ({ key: x, name: TIPO_LBL[x] }))} height={220} /></Card>
      </div>

      <Examenes />
      <Materias />
    </>
  )
}

function Examenes() {
  const d = useStore()
  const [e, setE] = useState<Omit<Exam, 'id'>>({ materiaId: d.subjects[0]?.id ?? '', tipo: 'parcial', fecha: today() })
  const t = today()
  const list = d.exams.slice().sort((a, b) => a.fecha.localeCompare(b.fecha))
  return (
    <Card title="📅 Parciales, TPs y finales">
      <div className="row">
        <Field label="Materia"><select value={e.materiaId} onChange={(x) => setE({ ...e, materiaId: x.target.value })}>{d.subjects.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}</select></Field>
        <Field label="Tipo"><select value={e.tipo} onChange={(x) => setE({ ...e, tipo: x.target.value as Exam['tipo'] })}>{['parcial', 'TP', 'final'].map((x) => <option key={x}>{x}</option>)}</select></Field>
        <Field label="Fecha"><input type="date" value={e.fecha} onChange={(x) => setE({ ...e, fecha: x.target.value })} /></Field>
        <button className="btn primary" style={{ alignSelf: 'flex-end' }} onClick={() => d.set((s) => ({ exams: [...s.exams, { id: uid(), ...e }] }))}>+</button>
      </div>
      <table style={{ marginTop: 10 }}><tbody>
        {list.map((x) => {
          const n = diffDays(x.fecha, t)
          return (
            <tr key={x.id} style={{ opacity: n < 0 ? 0.55 : 1 }}>
              <td>{fmtShort(x.fecha)}</td>
              <td>{x.tipo}</td>
              <td>{d.subjects.find((s) => s.id === x.materiaId)?.nombre}</td>
              <td>{n >= 0 ? `${n} d` : <input type="number" placeholder="nota" style={{ width: 70 }} value={x.nota ?? ''} onChange={(ev) => d.set((s) => ({ exams: s.exams.map((y) => y.id === x.id ? { ...y, nota: ev.target.value ? +ev.target.value : undefined } : y) }))} />}</td>
              <td><button className="btn sm ghost" onClick={() => d.set((s) => ({ exams: s.exams.filter((y) => y.id !== x.id) }))}>✕</button></td>
            </tr>
          )
        })}
      </tbody></table>
    </Card>
  )
}

function Materias() {
  const d = useStore()
  const up = (id: string, p: Partial<Subject>) => d.set((s) => ({ subjects: s.subjects.map((x) => x.id === id ? { ...x, ...p } : x) }))
  const notas = d.subjects.filter((s) => s.nota).map((s) => s.nota!)
  return (
    <Card title="🎓 Materias" right={notas.length ? <span className="chip">Promedio {(notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(2)}</span> : null}>
      {d.subjects.map((s) => (
        <div className="habit" key={s.id}>
          <div className="name">{s.nombre}</div>
          <select style={{ width: 150 }} value={s.estado} onChange={(e) => up(s.id, { estado: e.target.value as Subject['estado'] })}>{['cursando', 'final pendiente', 'aprobada'].map((x) => <option key={x}>{x}</option>)}</select>
          <input type="number" placeholder="nota" style={{ width: 70 }} value={s.nota ?? ''} onChange={(e) => up(s.id, { nota: e.target.value ? +e.target.value : undefined })} />
        </div>
      ))}
      <button className="btn sm" style={{ marginTop: 8 }} onClick={() => { const n = prompt('Nombre de la materia'); if (n) d.set((s) => ({ subjects: [...s.subjects, { id: uid(), nombre: n, estado: 'cursando' }] })) }}>+ Materia</button>
    </Card>
  )
}
