import { useState } from 'react'
import { useStore } from '../lib/store'
import { useUI } from '../lib/ui'
import { compliance, last, weekMedals } from '../lib/logic'
import { addDays, fmtShort, today, weekDays, weekStart } from '../lib/date'
import { obligatoriasDe } from '../lib/dia'
import { AREAS } from '../lib/seed'
import type { Review } from '../lib/types'
import { Icon } from '../components/Icon'
import { Card, Medal, PageHead, VoiceText } from '../components/ui'
import { LineC } from '../components/charts'
import { InsightsCard, MesCard } from '../components/Insights'

export default function Revision() {
  const d = useStore()
  const ui = useUI()
  const ws = weekStart(today())
  const existing = d.reviews.find((r) => r.semana === ws)
  const [r, setR] = useState<Review>(existing ?? { semana: ws, bien: '', mal: '', ajuste: '', prioridades: ['', '', ''], medallas: {} })
  const [coach, setCoach] = useState('')
  const [loading, setLoading] = useState(false)
  const wm = weekMedals(d, ws)
  const aprend = (d.aprendizajes ?? []).filter((a) => a.fecha >= ws)
  const entrenos = d.workouts.filter((w) => w.fecha >= ws).length
  const est = d.study.filter((s) => s.fecha >= ws).reduce((a, s) => a + s.minutos, 0) / 60
  const juntadas = d.social.filter((s) => s.fecha >= ws && s.tipo === 'juntada').length
  // Lo que fue pasando: los días cambian; mirar la semana completa ayuda a ajustar el diseño, no la voluntad.
  const diasSem = weekDays(ws).filter((f) => f <= today())
  const sucs = (d.sucesos ?? []).filter((x) => x.fecha >= ws && x.fecha <= today())
  const buenos = sucs.filter((x) => x.tipo === 'bien')
  const imprevistos = sucs.filter((x) => x.tipo === 'imprevisto' || x.tipo === 'cambio').length
  // Solo los días en que se usaron las obligatorias (y hoy): antes de esta función no había nada que marcar.
  const obsSem = diasSem.filter((f) => f === today() || d.planDia[f]?.hechos).flatMap((f) => obligatoriasDe(d, f).filter((o) => o.item))
  const obsHechas = obsSem.filter((o) => o.estado === 'hecho').length
  const peso = d.body.filter((b) => b.fecha >= ws && b.peso).at(-1)?.peso
  const hist = Array.from({ length: 12 }, (_, i) => addDays(ws, -7 * (11 - i))).map((w) => {
    const c = compliance(d, weekDays(w).filter((f) => f <= today()))
    return { semana: w.slice(5).replace('-', '/'), pct: c === null ? null : Math.round(c * 100) }
  })
  const guardar = () => {
    const medallas = Object.fromEntries(Object.entries(wm.areas).map(([k, v]) => [k, v!.m]))
    d.set((s) => ({ reviews: [...s.reviews.filter((x) => x.semana !== ws), { ...r, medallas }] }))
    ui.notify(existing ? 'Revisión actualizada' : 'Revisión guardada')
  }
  const pedir = async () => {
    setLoading(true)
    try {
      const { askCoach } = await import('../lib/coach')
      setCoach(await askCoach(useStore.getState(), `Hacé la revisión semanal. Lo que salió bien: ${r.bien}. Lo que salió mal: ${r.mal}. Obligatorias cumplidas: ${obsHechas}/${obsSem.length}. Imprevistos y cambios de plan anotados: ${imprevistos}${sucs.length ? ` (${sucs.filter((x) => x.tipo !== 'bien').map((x) => x.texto).slice(0, 8).join('; ')})` : ''}. Lo bueno que anotó: ${buenos.map((x) => x.texto).join('; ') || 'nada'}. Proponé 3 prioridades concretas para la semana que viene y un ajuste de hábitos.`))
    } catch (e) { setCoach(`No se pudo consultar al coach: ${e instanceof Error ? e.message : String(e)}`) } finally { setLoading(false) }
  }
  const kpis: [string, string | number][] = [['Cumplimiento', wm.global === null ? '—' : `${Math.round(wm.global * 100)} %`], ['Entrenamientos', entrenos], ['Horas de estudio', est.toFixed(1).replace('.', ',')], ['Juntadas', juntadas], ['Peso', peso ?? '—'], ['Ahorro', last(d.savings)?.valor.toLocaleString('es-AR') ?? '—']]

  return (
    <div className="view">
      <PageHead eyebrow={`Semana del ${fmtShort(ws)} al ${fmtShort(addDays(ws, 6))}`} title="Revisión semanal" right={wm.globalMedal ? <Medal m={wm.globalMedal} /> : null} />
      <div className="two-col">
        <div className="stack">
          <div className="kpis">{kpis.map(([k, v]) => <div className="kpi" key={k}><span className="cap">{k}</span><span className="val-m">{v}</span></div>)}</div>
          <InsightsCard />
          {aprend.length > 0 && <section className="panel pad"><h2 className="h2"><Icon name="notebook-pen" size={16} />Lo que se cruzó esta semana</h2>
            {aprend.map((a) => <div className="list-row" key={a.id}><span className="grow">{d.habits.find((h) => h.id === a.habitId)?.nombre ?? 'Hábito'}<small className="cap" style={{ display: 'block' }}>{a.que}{a.distinto ? ` → ${a.distinto}` : ''}</small></span><span className="cap">{fmtShort(a.fecha)}</span></div>)}
            <p className="cap" style={{ marginTop: 8 }}>Si algo se repite, es un problema de diseño del día, no de voluntad: ajustá el horario o la versión mínima.</p>
          </section>}
          {(sucs.length > 0 || obsHechas > 0) && <section className="panel pad">
            <h2 className="h2"><Icon name="history" size={16} />Lo que fue pasando</h2>
            <div className="kpis" style={{ marginTop: 4 }}>
              <div className="kpi"><span className="cap">Obligatorias</span><span className="val-m">{obsHechas}/{obsSem.length}</span></div>
              <div className="kpi"><span className="cap">Imprevistos y cambios</span><span className="val-m">{imprevistos}</span></div>
              <div className="kpi"><span className="cap">Cosas buenas</span><span className="val-m">{buenos.length}</span></div>
            </div>
            {buenos.length > 0 && <>
              <div className="stack" style={{ gap: 2, marginTop: 12 }}>{buenos.slice(-6).map((x) => <div className="list-row" key={x.id}><Icon name="star" size={14} className="muted" /><span className="grow">{x.texto}</span><span className="cap">{fmtShort(x.fecha)}</span></div>)}</div>
              <button className="btn btn-quiet btn-sm" style={{ marginTop: 10 }} onClick={() => setR({ ...r, bien: [r.bien.trim(), ...buenos.map((x) => `· ${x.texto}`)].filter(Boolean).join('\n') })}>Usar en "¿Qué salió bien?"</button>
            </>}
            {imprevistos >= 3 && <p className="cap" style={{ marginTop: 10 }}>{imprevistos} cambios en la semana: si se repiten los mismos, conviene sacarlos de las obligatorias fijas o dejarlos sin hora.</p>}
          </section>}
          <MesCard />
          <Card title="Reflexión" icon="notebook-pen">
            <div className="stack" style={{ gap: 14 }}>
              <VoiceText id="r-bien" label="¿Qué salió bien?" lang={d.settings.lang} value={r.bien} onChange={(v) => setR({ ...r, bien: v })} rows={3} />
              <VoiceText id="r-mal" label="¿Qué salió mal y por qué?" lang={d.settings.lang} value={r.mal} onChange={(v) => setR({ ...r, mal: v })} rows={3} />
              <VoiceText id="r-aj" label="¿Qué ajusto? (hábitos, horarios, metas)" lang={d.settings.lang} value={r.ajuste} onChange={(v) => setR({ ...r, ajuste: v })} rows={2} />
              <div className="field"><label>Tres prioridades para la semana que viene</label>
                {r.prioridades.map((p, i) => <input key={i} aria-label={`Prioridad ${i + 1}`} style={{ marginBottom: 6 }} value={p} onChange={(e) => setR({ ...r, prioridades: r.prioridades.map((x, j) => (j === i ? e.target.value : x)) })} placeholder={`Prioridad ${i + 1}`} />)}
              </div>
              <div className="row">
                <button className="btn btn-primary" onClick={guardar}>{existing ? 'Actualizar revisión' : 'Guardar revisión'}</button>
                <button className="btn btn-quiet" disabled={!d.settings.apiKey || loading} onClick={pedir}><Icon name="sparkles" size={16} />{loading ? 'Pensando…' : 'Pedir revisión al coach'}</button>
              </div>
              {coach && <p className="coach-txt">{coach}</p>}
            </div>
          </Card>
        </div>
        <aside className="stack">
          <Card title="Excusas y sanciones de la semana" icon="shield-alert">
            {(() => {
              const ex = weekDays(ws).flatMap((f) => Object.entries(d.planDia[f]?.excusas ?? {}).map(([id, e]) => ({ f, h: d.habits.find((x) => x.id === id)?.nombre ?? id, e })))
              const sn = d.sanciones.filter((x) => x.desde.slice(0, 10) >= ws)
              if (!ex.length && !sn.length) return <p className="cap">Sin excusas ni sanciones esta semana.</p>
              return <>{ex.map((x, i) => <div className="list-row" key={i}><span className="grow">{x.h}<span className="cap" style={{ display: 'block' }}>{fmtShort(x.f)} · {x.e.categoria} · {x.e.motivo}{x.e.alternativa ? ` · alternativa: ${x.e.alternativa}` : ''}</span></span></div>)}
                {sn.map((x) => <div className="list-row" key={x.id}><Icon name="lock" size={14} /><span className="grow">{x.motivo}<span className="cap" style={{ display: 'block' }}>sin XP hasta {new Date(x.hasta).toLocaleString('es-AR', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}</span></span></div>)}</>
            })()}
          </Card>
          <Card title="Medallas por área" icon="trophy">
            {wm.global === null ? <p className="cap">Las medallas aparecen cuando registrás hábitos.</p> : AREAS.filter((a) => wm.areas[a.id]).map((a) => (
              <div className="list-row" key={a.id}><Icon name={a.icon} size={16} /><span className="grow">{a.nombre}</span><span className="pct">{Math.round(wm.areas[a.id]!.c * 100)} %</span><Medal m={wm.areas[a.id]!.m} /></div>
            ))}
          </Card>
          <Card title="Cumplimiento · 12 semanas" icon="trending-up"><LineC data={hist} x="semana" ys={[{ key: 'pct', name: '% cumplido' }]} target={90} height={180} /></Card>
          <Card title="Revisiones anteriores" icon="clock">
            {d.reviews.length === 0 ? <p className="cap">La primera revisión que guardes aparece acá.</p> : d.reviews.slice().reverse().map((x) => (
              <details key={x.semana}>
                <summary>Semana del {fmtShort(x.semana)}</summary>
                <div className="body-2 stack" style={{ gap: 6, padding: '4px 0 10px' }}>
                  <div className="row">{Object.values(x.medallas).map((m, i) => <Medal key={i} m={m} />)}</div>
                  <span><b>Bien:</b> {x.bien || '—'}</span><span><b>Mal:</b> {x.mal || '—'}</span><span><b>Ajuste:</b> {x.ajuste || '—'}</span>
                  <span><b>Prioridades:</b> {x.prioridades.filter(Boolean).join(' · ') || '—'}</span>
                </div>
              </details>
            ))}
          </Card>
        </aside>
      </div>
    </div>
  )
}
