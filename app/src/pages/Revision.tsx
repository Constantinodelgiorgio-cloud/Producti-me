import { useState } from 'react'
import { useStore } from '../lib/store'
import { compliance, last, MEDAL_ICON, weekMedals } from '../lib/logic'
import { addDays, fmtShort, today, weekDays, weekStart } from '../lib/date'
import { AREAS } from '../lib/seed'
import { askCoach } from '../lib/coach'
import { Card, Field, VoiceText } from '../components/ui'
import { LineC } from '../components/charts'
import type { Review } from '../lib/types'

export default function Revision() {
  const d = useStore()
  const ws = weekStart(today())
  const existing = d.reviews.find((r) => r.semana === ws)
  const [r, setR] = useState<Review>(existing ?? { semana: ws, bien: '', mal: '', ajuste: '', prioridades: ['', '', ''], medallas: {} })
  const [coach, setCoach] = useState('')
  const [loading, setLoading] = useState(false)
  const wm = weekMedals(d, ws)
  const dias = weekDays(ws).filter((f) => f <= today())
  const entrenos = d.workouts.filter((w) => w.fecha >= ws).length
  const est = d.study.filter((s) => s.fecha >= ws).reduce((a, s) => a + s.minutos, 0) / 60
  const juntadas = d.social.filter((s) => s.fecha >= ws && s.tipo === 'juntada').length
  const pesoSemana = d.body.filter((b) => b.fecha >= ws && b.peso).at(-1)?.peso
  const hist = Array.from({ length: 12 }, (_, i) => addDays(ws, -7 * (11 - i))).map((w) => ({ semana: w.slice(5), pct: Math.round((compliance(d, weekDays(w).filter((f) => f <= today())) ?? 0) * 100) || null }))

  const guardar = () => {
    const medallas = Object.fromEntries(Object.entries(wm.areas).map(([k, v]) => [k, v!.m]))
    d.set((s) => ({ reviews: [...s.reviews.filter((x) => x.semana !== ws), { ...r, medallas }] }))
  }
  const pedir = async () => {
    setLoading(true)
    try {
      setCoach(await askCoach(useStore.getState(), `Hacé la revisión semanal. Lo que salió bien: ${r.bien}. Lo que salió mal: ${r.mal}. Proponé 3 prioridades concretas para la semana que viene y un ajuste de hábitos.`))
    } catch (e) { setCoach(String(e)) } finally { setLoading(false) }
  }

  return (
    <>
      <Card title={`🗓️ Revisión de la semana del ${fmtShort(ws)}`} right={wm.globalMedal && <span style={{ fontSize: 26 }}>{MEDAL_ICON[wm.globalMedal]}</span>}>
        <div className="podium">
          <div className="p"><div className="small muted">Cumplimiento</div><b>{Math.round((wm.global ?? 0) * 100)} %</b></div>
          <div className="p"><div className="small muted">Entrenamientos</div><b>{entrenos}</b></div>
          <div className="p"><div className="small muted">Horas de estudio</div><b>{est.toFixed(1)}</b></div>
          <div className="p"><div className="small muted">Juntadas</div><b>{juntadas}</b></div>
          <div className="p"><div className="small muted">Peso</div><b>{pesoSemana ?? '—'}</b></div>
          <div className="p"><div className="small muted">Ahorro</div><b>{last(d.savings)?.valor ?? '—'}</b></div>
        </div>
        <h3>Medallas por área ({dias.length} días)</h3>
        <div className="row">{AREAS.map((a) => wm.areas[a.id] && <span key={a.id} className="chip">{a.emoji} {MEDAL_ICON[wm.areas[a.id]!.m]} {Math.round(wm.areas[a.id]!.c * 100)} %</span>)}</div>
      </Card>
      <Card title="📈 Tendencia de cumplimiento (12 semanas)"><LineC data={hist} x="semana" ys={[{ key: 'pct', name: '% cumplido' }]} target={90} height={180} /></Card>
      <Card title="✍️ Reflexión">
        <Field label="¿Qué salió bien?"><VoiceText lang={d.settings.lang} value={r.bien} onChange={(v) => setR({ ...r, bien: v })} rows={3} /></Field>
        <Field label="¿Qué salió mal y por qué?"><VoiceText lang={d.settings.lang} value={r.mal} onChange={(v) => setR({ ...r, mal: v })} rows={3} /></Field>
        <Field label="¿Qué ajusto? (hábitos, horarios, metas)"><VoiceText lang={d.settings.lang} value={r.ajuste} onChange={(v) => setR({ ...r, ajuste: v })} rows={2} /></Field>
        <h3>3 prioridades de la semana que viene</h3>
        {r.prioridades.map((p, i) => <input key={i} style={{ marginBottom: 6 }} value={p} onChange={(e) => setR({ ...r, prioridades: r.prioridades.map((x, j) => j === i ? e.target.value : x) })} placeholder={`Prioridad ${i + 1}`} />)}
        <div className="row" style={{ marginTop: 8 }}>
          <button className="btn primary" onClick={guardar}>{existing ? 'Actualizar' : 'Guardar revisión'}</button>
          <button className="btn" disabled={!d.settings.apiKey || loading} onClick={pedir}>{loading ? '…' : '🧢 Pedir revisión al coach'}</button>
        </div>
        {coach && <div className="coach" style={{ marginTop: 12 }}>{coach}</div>}
      </Card>
      <Card title="📚 Revisiones anteriores">
        {d.reviews.slice().reverse().map((x) => (
          <details key={x.semana} style={{ marginBottom: 6 }}>
            <summary>{fmtShort(x.semana)} · {Object.values(x.medallas).map((m) => MEDAL_ICON[m!]).join('')}</summary>
            <p className="small"><b>Bien:</b> {x.bien}<br /><b>Mal:</b> {x.mal}<br /><b>Ajuste:</b> {x.ajuste}<br /><b>Prioridades:</b> {x.prioridades.filter(Boolean).join(' · ')}</p>
          </details>
        ))}
      </Card>
    </>
  )
}
