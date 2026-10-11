import { useState } from 'react'
import { useStore } from '../lib/store'
import { addDays, diffDays, fmtShort, today, uid, weekStart } from '../lib/date'
import { EMOCIONES } from '../lib/seed'
import { Bar, Card, Field, VoiceText } from '../components/ui'
import { BarC, LineC, PieC } from '../components/charts'
import type { Idea, SocialLog } from '../lib/types'

const TABS = ['Amigos', 'Diario y ánimo', 'Ideas', 'Apoyo'] as const

export default function Vida() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Amigos')
  return (
    <>
      <div className="tabs">{TABS.map((x) => <button key={x} className={`btn sm ${tab === x ? 'on' : ''}`} onClick={() => setTab(x)}>{x}</button>)}</div>
      {tab === 'Amigos' && <Amigos />}
      {tab === 'Diario y ánimo' && <Diario />}
      {tab === 'Ideas' && <Ideas />}
      {tab === 'Apoyo' && <Apoyo />}
    </>
  )
}

function Amigos() {
  const d = useStore()
  const [l, setL] = useState<Omit<SocialLog, 'id'>>({ fecha: today(), tipo: 'mensaje', con: '' })
  const ws = weekStart(today())
  const semana = d.social.filter((s) => s.fecha >= ws)
  const juntadas = semana.filter((s) => s.tipo === 'juntada').length
  const contactos = semana.length
  const weeks = Array.from({ length: 8 }, (_, i) => addDays(ws, -7 * (7 - i)))
  const chart = weeks.map((w) => ({ semana: w.slice(5), juntadas: d.social.filter((s) => weekStart(s.fecha) === w && s.tipo === 'juntada').length, contactos: d.social.filter((s) => weekStart(s.fecha) === w && s.tipo !== 'juntada').length }))
  const personas = [...new Set(d.social.map((s) => s.con).filter(Boolean))]
  return (
    <>
      <Card title="🤝 Volver a ser parte del grupo">
        <div className="row">
          <div className="grow"><div className="small muted">Juntadas esta semana</div><div className="big">{juntadas} / 1</div><Bar value={juntadas} /></div>
          <div className="grow"><div className="small muted">Mensajes / llamadas / planes</div><div className="big">{contactos - juntadas} / 4</div><Bar value={(contactos - juntadas) / 4} /></div>
        </div>
        <p className="small muted">Meta semanal: 1 juntada + 4 contactos. Ser parte se construye con presencia repetida: aparecer, proponer, sostener. El sábado de rugby cuenta: quedate al tercer tiempo.</p>
      </Card>
      <Card title="➕ Registrar contacto">
        <div className="row">
          <Field label="Tipo"><select value={l.tipo} onChange={(e) => setL({ ...l, tipo: e.target.value as SocialLog['tipo'] })}>{['mensaje', 'llamada', 'plan propuesto', 'juntada'].map((x) => <option key={x}>{x}</option>)}</select></Field>
          <Field label="Con quién"><input list="personas" value={l.con} onChange={(e) => setL({ ...l, con: e.target.value })} placeholder="Nombre o 'el grupo'" /><datalist id="personas">{personas.map((p) => <option key={p} value={p} />)}</datalist></Field>
          <Field label="Fecha"><input type="date" value={l.fecha} onChange={(e) => setL({ ...l, fecha: e.target.value })} /></Field>
        </div>
        <Field label="Cómo fue"><input value={l.nota ?? ''} onChange={(e) => setL({ ...l, nota: e.target.value })} /></Field>
        <button className="btn primary" style={{ marginTop: 10 }} disabled={!l.con} onClick={() => { d.set((s) => ({ social: [...s.social, { id: uid(), ...l }] })); setL({ fecha: today(), tipo: 'mensaje', con: '' }) }}>Guardar</button>
      </Card>
      <Card title="📊 Últimas 8 semanas"><BarC data={chart} x="semana" stacked ys={[{ key: 'juntadas', color: '#4ade80' }, { key: 'contactos', color: '#60a5fa' }]} height={180} /></Card>
      <Card title="Con quién hablaste">
        {personas.length === 0 && <p className="muted small">Todavía nada. Empezá hoy con un mensaje al grupo.</p>}
        {personas.map((p) => {
          const ult = d.social.filter((s) => s.con === p).sort((a, b) => b.fecha.localeCompare(a.fecha))[0]
          const n = diffDays(today(), ult.fecha)
          return <div className="note small" key={p}><span>{p}</span><span className="grow" /><span className={n > 10 ? '' : 'muted'} style={{ color: n > 10 ? 'var(--warn)' : undefined }}>hace {n} d · {ult.tipo}</span></div>
        })}
      </Card>
    </>
  )
}

function Diario() {
  const d = useStore()
  const [txt, setTxt] = useState('')
  const [emo, setEmo] = useState('')
  const last30 = Array.from({ length: 30 }, (_, i) => addDays(today(), i - 29)).map((f) => {
    const c = d.checkins[f]
    return { f: f.slice(5), animo: c?.animoNoche ?? c?.animoManana, estres: c?.estres, enojo: c?.enojo, energia: c?.energia ? c.energia * 2 : undefined }
  })
  const emos = EMOCIONES.map((e) => ({ name: e, value: d.journal.filter((j) => j.emocion === e && diffDays(today(), j.fecha) <= 30).length })).filter((x) => x.value > 0)
  return (
    <>
      <Card title="✍️ Escribir">
        <div className="row" style={{ marginBottom: 8 }}>{EMOCIONES.map((e) => <button key={e} className={`btn sm ${emo === e ? 'primary' : ''}`} onClick={() => setEmo(emo === e ? '' : e)}>{e}</button>)}</div>
        <VoiceText lang={d.settings.lang} value={txt} onChange={setTxt} rows={5} placeholder="¿Qué pasó? ¿Qué sentiste? ¿Qué harías distinto? (podés dictarlo)" />
        <button className="btn primary" style={{ marginTop: 10 }} disabled={!txt} onClick={() => { d.set((s) => ({ journal: [...s.journal, { id: uid(), fecha: today(), texto: txt, emocion: emo || undefined }] })); setTxt(''); setEmo('') }}>Guardar (+10 XP)</button>
      </Card>
      <Card title="📈 Ánimo, estrés, enojo y energía (30 días)">
        <LineC data={last30} x="f" ys={[{ key: 'animo', name: 'Ánimo', color: '#4ade80' }, { key: 'estres', name: 'Estrés', color: '#f5b83d' }, { key: 'enojo', name: 'Enojo', color: '#f87171' }, { key: 'energia', name: 'Energía ×2', color: '#60a5fa' }]} height={220} />
      </Card>
      {emos.length > 0 && <Card title="🎭 Emociones del mes"><PieC data={emos} /></Card>}
      <Card title="📖 Entradas">
        {d.journal.slice().reverse().slice(0, 20).map((j) => (
          <div className="note small" key={j.id}><span className="muted" style={{ minWidth: 52 }}>{fmtShort(j.fecha)}</span><span>{j.emocion && <b>{j.emocion} · </b>}{j.texto}</span></div>
        ))}
      </Card>
    </>
  )
}

function Ideas() {
  const d = useStore()
  const [t, setT] = useState('')
  const up = (id: string, p: Partial<Idea>) => d.set((s) => ({ ideas: s.ideas.map((x) => x.id === id ? { ...x, ...p } : x) }))
  return (
    <Card title="💡 Banco de ideas">
      <div className="row"><input className="grow" value={t} onChange={(e) => setT(e.target.value)} placeholder="Idea cruda: construcción, tecnología, startups…" />
        <button className="btn primary" disabled={!t} onClick={() => { d.set((s) => ({ ideas: [...s.ideas, { id: uid(), fecha: today(), titulo: t, estado: 'cruda' }] })); setT('') }}>+</button></div>
      {d.ideas.slice().reverse().map((i) => (
        <div className="card" style={{ background: 'var(--panel2)', marginTop: 10 }} key={i.id}>
          <div className="row"><b className="grow">{i.titulo}</b>
            <select style={{ width: 140 }} value={i.estado} onChange={(e) => up(i.id, { estado: e.target.value as Idea['estado'] })}>{['cruda', 'investigando', 'validando', 'descartada'].map((x) => <option key={x}>{x}</option>)}</select></div>
          <textarea style={{ marginTop: 8 }} rows={2} value={i.nota ?? ''} onChange={(e) => up(i.id, { nota: e.target.value })} placeholder="Problema, cliente, cómo validarlo en 1 semana…" />
        </div>
      ))}
    </Card>
  )
}

function Apoyo() {
  return (
    <>
      <Card title="🫶 Hablar con un profesional">
        <p>Pusiste mente 2/10 y emociones 2/10, y que te sentís solo. Eso merece la misma seriedad que la erisipela: un buen psicólogo es un preparador físico para la cabeza.</p>
        <ol className="small" style={{ lineHeight: 1.6 }}>
          <li>Preguntale a tu médico de cabecera o a tu obra social por psicólogos con cobertura en Corrientes (también existe la atención online).</li>
          <li>Pedí una primera entrevista. No hace falta tener todo claro: alcanza con decir "me siento estancado, solo y enojado".</li>
          <li>Llevá a la sesión lo que registrás acá: el gráfico de ánimo y las notas del diario.</li>
          <li>Dale 4 sesiones antes de decidir si te sirve ese profesional.</li>
        </ol>
      </Card>
      <Card title="🆘 Si en algún momento te sentís muy mal">
        <p className="small">Si aparecen pensamientos de hacerte daño o sentís que no podés más, no lo cargues solo: hablá con alguien de confianza ya y llamá a la <b>Línea 135</b> (gratuita, CABA y GBA) o al <b>(011) 5275-1135</b> desde todo el país, o acercate a una guardia. En emergencias, <b>107</b> o <b>911</b>.</p>
      </Card>
      <Card title="🧰 Para el bucle">
        <ul className="small" style={{ lineHeight: 1.6 }}>
          <li>Una cosa nueva por semana (lugar, comida, actividad, persona). Está como hábito los viernes y domingos.</li>
          <li>Cuando aparezca el enojo por algo que no sale: escribí 3 líneas en el diario antes de reaccionar.</li>
          <li>Mirá el progreso, no el día: el podio semanal y los gráficos existen para eso.</li>
        </ul>
      </Card>
    </>
  )
}
