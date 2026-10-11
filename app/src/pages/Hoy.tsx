import { useState } from 'react'
import { useStore } from '../lib/store'
import { avisos, bedtimeFor, recomendaciones, recuerdos, sleepHours } from '../lib/logic'
import { dow, today } from '../lib/date'
import { askCoach } from '../lib/coach'
import { Card, Field, Notes, Scale, VoiceText } from '../components/ui'
import { HabitList } from '../components/HabitList'
import { LevelCard } from '../components/LevelCard'
import { useT } from '../lib/i18n'
import type { CheckIn } from '../lib/types'

const INT_COLOR = { roja: '#f87171', amarilla: '#f5b83d', baja: '#4ade80', partido: '#c084fc', libre: '#8b95a7' }

export default function Hoy() {
  const d = useStore()
  const t = useT()
  const f = today()
  const ci: CheckIn = d.checkins[f] ?? { fecha: f }
  const upd = (p: Partial<CheckIn>) => d.set((s) => ({ checkins: { ...s.checkins, [f]: { ...(s.checkins[f] ?? { fecha: f }), ...p } } }))
  const [coach, setCoach] = useState(d.coachLog.find((c) => c.fecha === f)?.texto ?? '')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const hs = sleepHours(ci.horaDormir, ci.horaDespertar)
  const hora = new Date().getHours()
  const noche = hora >= 19 || hora < 4

  const briefing = async () => {
    setLoading(true); setErr('')
    try {
      const txt = await askCoach(useStore.getState())
      setCoach(txt)
      d.set((s) => ({ coachLog: [...s.coachLog.filter((c) => c.fecha !== f), { fecha: f, texto: txt }] }))
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    } finally { setLoading(false) }
  }

  const manana = (
    <Card title={`☀️ ${t('checkinManana')}`}>
      <div className="row">
        <Field label="Me acosté"><input type="time" value={ci.horaDormir ?? ''} onChange={(e) => upd({ horaDormir: e.target.value })} /></Field>
        <Field label="Me levanté"><input type="time" value={ci.horaDespertar ?? d.profile.despertar[dow(f)]} onChange={(e) => upd({ horaDespertar: e.target.value })} /></Field>
      </div>
      {hs !== null && <p className={`small ${hs < d.profile.suenoMin ? 'muted' : ''}`}>Dormiste {hs.toFixed(1)} h {hs < d.profile.suenoMin ? `(meta ${d.profile.suenoMin} h ✕)` : '✓'}</p>}
      <h3>Calidad del sueño</h3><Scale max={5} value={ci.calidadSueno} onChange={(n) => upd({ calidadSueno: n })} />
      <h3>Energía</h3><Scale max={5} value={ci.energia} onChange={(n) => upd({ energia: n })} />
      <h3>Ánimo</h3><Scale value={ci.animoManana} onChange={(n) => upd({ animoManana: n })} />
      <h3>Prioridad n.º 1 de hoy</h3>
      <VoiceText rows={1} lang={d.settings.lang} value={ci.prioridad ?? ''} onChange={(v) => upd({ prioridad: v })} placeholder="Si hoy solo hacés una cosa, ¿cuál es?" />
    </Card>
  )

  const nocheCard = (
    <Card title={`🌙 ${t('checkinNoche')}`}>
      <h3>Ánimo</h3><Scale value={ci.animoNoche} onChange={(n) => upd({ animoNoche: n })} />
      <h3>Estrés</h3><Scale value={ci.estres} onChange={(n) => upd({ estres: n })} />
      <h3>Enojo</h3><Scale value={ci.enojo} onChange={(n) => upd({ enojo: n })} />
      <h3>¿Cumpliste la prioridad{ci.prioridad ? `: "${ci.prioridad}"` : ''}?</h3>
      <div className="row">
        {(['si', 'parcial', 'no'] as const).map((v) => (
          <button key={v} className={`btn sm ${ci.prioridadCumplida === v ? 'primary' : ''}`} onClick={() => upd({ prioridadCumplida: v })}>{v === 'si' ? 'Sí' : v === 'parcial' ? 'Parcial' : 'No'}</button>
        ))}
      </div>
      <h3>Victoria del día</h3>
      <VoiceText rows={1} lang={d.settings.lang} value={ci.victoria ?? ''} onChange={(v) => upd({ victoria: v })} placeholder="Algo que salió bien, aunque sea chico" />
      <h3>Nota libre</h3>
      <VoiceText lang={d.settings.lang} value={ci.nota ?? ''} onChange={(v) => upd({ nota: v })} placeholder="Qué pasó hoy, qué te afectó…" />
      <p className="small muted">Para dormir {d.profile.suenoMin} h: acostate antes de las {bedtimeFor(d.profile.despertar[(dow(f) + 1) % 7], d.profile.suenoMin)}.</p>
    </Card>
  )

  return (
    <>
      <LevelCard />
      <div className="grid">
        <Card title={`📋 ${t('agenda')}`}>
          {d.profile.agenda[dow(f)].map((a, i) => (
            <div className="note" key={i}>
              <b style={{ minWidth: 48 }}>{a.hora}</b>
              <span>{a.que}{a.intensidad && <span className="chip" style={{ marginLeft: 6, color: INT_COLOR[a.intensidad] }}>● {a.intensidad}</span>}</span>
            </div>
          ))}
        </Card>
        <Card title={`🔔 ${t('avisos')}`}><Notes items={avisos(d)} /></Card>
      </div>
      <Card title={`✅ ${t('pendientes')}`}><HabitList fecha={f} /></Card>
      <div className="grid">
        <Card title={`💡 ${t('recomendaciones')}`}><Notes items={recomendaciones(d)} /></Card>
        <Card title={`🕰️ ${t('recuerdos')}`}><Notes items={recuerdos(d)} empty="Tus recuerdos van a aparecer acá a medida que registres victorias y diario." /></Card>
      </div>
      <Card title={`🧢 ${t('coach')}`} right={<button className="btn sm primary" disabled={loading || !d.settings.apiKey} onClick={briefing}>{loading ? '…' : coach ? 'Actualizar' : 'Briefing de hoy'}</button>}>
        {!d.settings.apiKey && <p className="muted small">Cargá tu API key de Anthropic en Ajustes para activar el coach.</p>}
        {err && <p className="small" style={{ color: 'var(--warn)' }}>{err}</p>}
        {coach && <div className="coach">{coach}</div>}
      </Card>
      {noche ? <>{nocheCard}{manana}</> : <>{manana}{nocheCard}</>}
    </>
  )
}
