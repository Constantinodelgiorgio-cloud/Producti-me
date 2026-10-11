import { useState } from 'react'
import { useStore } from '../lib/store'
import { useUI } from '../lib/ui'
import { addDays, diffDays, fmtShort, today, uid, weekStart } from '../lib/date'
import { EMOCIONES } from '../lib/seed'
import type { Idea, SocialLog } from '../lib/types'
import { Icon } from '../components/Icon'
import { Bar, Card, Empty, Field, PageHead, Seg, VoiceText } from '../components/ui'
import { BarC, LineC, PieC } from '../components/charts'

type Tab = 'amigos' | 'diario' | 'ideas' | 'apoyo'

export default function Vida() {
  const ui = useUI()
  const tab: Tab = (['diario', 'ideas', 'apoyo'] as const).includes(ui.sub as never) ? (ui.sub as Tab) : 'amigos'
  return (
    <div className="view">
      <PageHead eyebrow="Amigos, mente e ideas" title="Vida" />
      <div style={{ marginBottom: 16 }}><Seg label="Sección" value={tab} onChange={(v) => ui.go('vida', v)} options={[['amigos', 'Amigos'], ['diario', 'Diario y ánimo'], ['ideas', 'Ideas'], ['apoyo', 'Apoyo']]} /></div>
      {tab === 'amigos' && <Amigos />}
      {tab === 'diario' && <Diario />}
      {tab === 'ideas' && <Ideas />}
      {tab === 'apoyo' && <Apoyo />}
    </div>
  )
}

const TIPOS: SocialLog['tipo'][] = ['mensaje', 'llamada', 'plan propuesto', 'juntada']

function Amigos() {
  const d = useStore()
  const ui = useUI()
  const [l, setL] = useState<Omit<SocialLog, 'id'>>({ fecha: today(), tipo: 'mensaje', con: '' })
  const ws = weekStart(today())
  const semana = d.social.filter((s) => s.fecha >= ws)
  const juntadas = semana.filter((s) => s.tipo === 'juntada').length
  const contactos = semana.length - juntadas
  const weeks = Array.from({ length: 8 }, (_, i) => addDays(ws, -7 * (7 - i)))
  const chart = weeks.map((w) => ({ semana: w.slice(5).replace('-', '/'), juntadas: d.social.filter((s) => weekStart(s.fecha) === w && s.tipo === 'juntada').length, contactos: d.social.filter((s) => weekStart(s.fecha) === w && s.tipo !== 'juntada').length }))
  const personas = [...new Set(d.social.map((s) => s.con).filter(Boolean))]
  const save = (e: React.FormEvent) => {
    e.preventDefault()
    if (!l.con.trim()) return
    const id = uid()
    d.set((s) => ({ social: [...s.social, { id, ...l, con: l.con.trim() }] }))
    ui.notify(`${l.tipo === 'juntada' ? 'Juntada' : 'Contacto'} con ${l.con.trim()} guardado`, () => d.set((s) => ({ social: s.social.filter((x) => x.id !== id) })))
    setL({ fecha: today(), tipo: 'mensaje', con: '' })
  }
  return (
    <div className="two-col">
      <div className="stack">
        <section className="horizon now" style={{ ['--p' as string]: Math.min(1, (Math.min(juntadas, 1) + Math.min(contactos, 4) / 4) / 2) }}>
          <div className="now-head"><span className="eyebrow">Volver a ser parte del grupo</span><span className="cap">esta semana</span></div>
          <div className="grid" style={{ marginTop: 14 }}>
            <div className="stack" style={{ gap: 8 }}><span className="cap">Juntadas</span><span><span className="val-l">{juntadas}</span><span className="unit">/ 1</span></span><Bar value={juntadas} tone={juntadas >= 1 ? 'ok' : undefined} /></div>
            <div className="stack" style={{ gap: 8 }}><span className="cap">Mensajes, llamadas y planes</span><span><span className="val-l">{contactos}</span><span className="unit">/ 4</span></span><Bar value={contactos / 4} tone={contactos >= 4 ? 'ok' : undefined} /></div>
          </div>
          <p className="body-2" style={{ marginTop: 14 }}>Ser parte se construye con presencia repetida: aparecer, proponer, sostener. El sábado de rugby cuenta: quedate al tercer tiempo.</p>
        </section>
        <section className="panel pad" id="sec-amigos">
          <h2 className="h2" style={{ marginBottom: 12 }}><Icon name="message-circle" size={16} />Registrar contacto</h2>
          <form className="form-grid" onSubmit={save}>
            <Field label="Tipo" id="so-t"><select id="so-t" value={l.tipo} onChange={(e) => setL({ ...l, tipo: e.target.value as SocialLog['tipo'] })}>{TIPOS.map((x) => <option key={x}>{x}</option>)}</select></Field>
            <Field label="Con quién" id="so-c"><input id="so-c" list="personas" value={l.con} placeholder="Nombre o “el grupo”" onChange={(e) => setL({ ...l, con: e.target.value })} /></Field>
            <datalist id="personas">{personas.map((p) => <option key={p} value={p} />)}</datalist>
            <Field label="Fecha" id="so-f"><input id="so-f" type="date" value={l.fecha} max={today()} onChange={(e) => setL({ ...l, fecha: e.target.value })} /></Field>
            <Field label="Cómo fue" id="so-n"><input id="so-n" value={l.nota ?? ''} onChange={(e) => setL({ ...l, nota: e.target.value })} /></Field>
            <button className="btn btn-primary" disabled={!l.con.trim()}>Guardar</button>
          </form>
        </section>
      </div>
      <aside className="stack">
        <Card title="Últimas 8 semanas" icon="layout-grid"><BarC data={chart} x="semana" stacked ys={[{ key: 'juntadas', name: 'Juntadas', color: '#8EA8FF' }, { key: 'contactos', name: 'Contactos', color: '#4A5160' }]} height={180} /></Card>
        <Card title="Con quién hablaste" icon="users">
          {personas.length === 0 ? <p className="cap">Todavía nada. Empezá hoy con un mensaje al grupo.</p> : personas.map((p) => {
            const ult = d.social.filter((s) => s.con === p).sort((a, b) => b.fecha.localeCompare(a.fecha))[0]
            const n = diffDays(today(), ult.fecha)
            return <div className="list-row" key={p}><span className="grow">{p}</span><span className="cap" style={{ color: n > 10 ? 'var(--warn)' : undefined }}>hace {n} d · {ult.tipo}</span></div>
          })}
        </Card>
      </aside>
    </div>
  )
}

function Diario() {
  const d = useStore()
  const ui = useUI()
  const [txt, setTxt] = useState('')
  const [emo, setEmo] = useState('')
  const last30 = Array.from({ length: 30 }, (_, i) => addDays(today(), i - 29)).map((f) => {
    const c = d.checkins[f]
    return { f: f.slice(5).replace('-', '/'), animo: c?.animoNoche ?? c?.animoManana, estres: c?.estres, enojo: c?.enojo, energia: c?.energia ? c.energia * 2 : undefined }
  })
  const emos = EMOCIONES.map((e) => ({ name: e, value: d.journal.filter((j) => j.emocion === e && diffDays(today(), j.fecha) <= 30).length })).filter((x) => x.value > 0)
  const save = () => {
    const id = uid()
    d.set((s) => ({ journal: [...s.journal, { id, fecha: today(), texto: txt.trim(), emocion: emo || undefined }] }))
    ui.notify('Entrada guardada · +10 XP', () => d.set((s) => ({ journal: s.journal.filter((x) => x.id !== id) })))
    setTxt(''); setEmo('')
  }
  return (
    <div className="two-col">
      <div className="stack">
        <section className="panel pad" id="sec-diario">
          <h2 className="h2" style={{ marginBottom: 12 }}><Icon name="notebook-pen" size={16} />Escribir</h2>
          <div className="chips" style={{ flexWrap: 'wrap', marginBottom: 12 }} role="group" aria-label="Emoción principal">
            {EMOCIONES.map((e) => <button key={e} className="chip" aria-pressed={emo === e} onClick={() => setEmo(emo === e ? '' : e)}>{e}</button>)}
          </div>
          <VoiceText id="j-txt" lang={d.settings.lang} value={txt} onChange={setTxt} rows={5} placeholder="¿Qué pasó? ¿Qué sentiste? ¿Qué harías distinto? Podés dictarlo." />
          <button className="btn btn-primary" style={{ marginTop: 12 }} disabled={!txt.trim()} onClick={save}>Guardar entrada</button>
        </section>
        <Card title="Entradas" icon="book-open">
          {d.journal.length === 0 ? <p className="cap">Tus entradas van a aparecer acá.</p> : d.journal.slice().reverse().slice(0, 20).map((j) => (
            <div className="note-row" key={j.id}><span className="mono cap" style={{ minWidth: 52 }}>{fmtShort(j.fecha)}</span><span>{j.emocion && <b style={{ color: 'var(--t1)', fontWeight: 550 }}>{j.emocion} · </b>}{j.texto}</span></div>
          ))}
        </Card>
      </div>
      <aside className="stack">
        <Card title="Ánimo, estrés, enojo y energía" icon="trending-up">
          <LineC data={last30} x="f" ys={[{ key: 'animo', name: 'Ánimo', color: '#8EA8FF' }, { key: 'estres', name: 'Estrés', color: '#E0A852' }, { key: 'enojo', name: 'Enojo', color: '#E5766F' }, { key: 'energia', name: 'Energía ×2', color: '#C9D0DC' }]} height={220} />
          <p className="cap" style={{ marginTop: 6 }}>Últimos 30 días, desde tus check-ins.</p>
        </Card>
        {emos.length > 0 && <Card title="Emociones del mes" icon="brain"><PieC data={emos} /></Card>}
      </aside>
    </div>
  )
}

function Ideas() {
  const d = useStore()
  const [t, setT] = useState('')
  const up = (id: string, p: Partial<Idea>) => d.set((s) => ({ ideas: s.ideas.map((x) => x.id === id ? { ...x, ...p } : x) }))
  return (
    <div className="stack">
      <form className="row" style={{ flexWrap: 'nowrap' }} onSubmit={(e) => { e.preventDefault(); if (!t.trim()) return; d.set((s) => ({ ideas: [...s.ideas, { id: uid(), fecha: today(), titulo: t.trim(), estado: 'cruda' }] })); setT('') }}>
        <input className="grow" aria-label="Nueva idea" value={t} onChange={(e) => setT(e.target.value)} placeholder="Idea cruda: construcción, tecnología, startups…" />
        <button className="btn btn-primary" disabled={!t.trim()}><Icon name="plus" size={16} />Agregar</button>
      </form>
      {d.ideas.length === 0 && <section className="panel"><Empty icon="lightbulb" title="Tu banco de ideas está vacío">Anotá cualquier idea apenas aparece. Después la investigás y la validás.</Empty></section>}
      <div className="grid">
        {d.ideas.slice().reverse().map((i) => (
          <section className="panel pad stack" key={i.id} style={{ gap: 10 }}>
            <div className="row" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}><b className="grow" style={{ fontWeight: 550 }}>{i.titulo}</b><span className="cap mono">{fmtShort(i.fecha)}</span></div>
            <Seg label="Estado de la idea" value={i.estado} onChange={(v) => up(i.id, { estado: v })} options={[['cruda', 'Cruda'], ['investigando', 'Investigando'], ['validando', 'Validando'], ['descartada', 'Descartada']]} />
            <textarea aria-label={`Notas de ${i.titulo}`} rows={3} value={i.nota ?? ''} onChange={(e) => up(i.id, { nota: e.target.value })} placeholder="Problema, cliente, cómo validarlo en una semana…" />
          </section>
        ))}
      </div>
    </div>
  )
}

function Apoyo() {
  return (
    <div className="grid">
      <Card title="Hablar con un profesional" icon="heart-pulse">
        <p className="body-2" style={{ marginBottom: 10 }}>Pusiste mente 2/10 y emociones 2/10, y que te sentís solo. Eso merece la misma seriedad que la erisipela: un buen psicólogo es un preparador físico para la cabeza.</p>
        <ol className="body-2" style={{ paddingLeft: 18, margin: 0, lineHeight: 1.7 }}>
          <li>Preguntá a tu médico o a tu obra social por psicólogos con cobertura en Corrientes (también hay atención online).</li>
          <li>Pedí una primera entrevista. Alcanza con decir "me siento estancado, solo y enojado".</li>
          <li>Llevá lo que registrás acá: el gráfico de ánimo y tus notas del diario.</li>
          <li>Dale cuatro sesiones antes de decidir si te sirve ese profesional.</li>
        </ol>
      </Card>
      <Card title="Si en algún momento te sentís muy mal" icon="alert">
        <p className="body-2">Si aparecen pensamientos de hacerte daño o sentís que no podés más, no lo cargues solo. Hablá ya con alguien de confianza y llamá a la <b style={{ color: 'var(--t1)' }}>Línea 135</b> (gratuita, CABA y GBA) o al <b style={{ color: 'var(--t1)' }}>(011) 5275-1135</b> desde todo el país, o acercate a una guardia. En emergencias: <b style={{ color: 'var(--t1)' }}>107</b> o <b style={{ color: 'var(--t1)' }}>911</b>.</p>
      </Card>
      <Card title="Para salir del bucle" icon="compass">
        <ul className="body-2" style={{ paddingLeft: 18, margin: 0, lineHeight: 1.7 }}>
          <li>Una cosa nueva por semana: lugar, comida, actividad o persona. Está como hábito los viernes y domingos.</li>
          <li>Cuando aparezca el enojo porque algo no sale, escribí tres líneas en el diario antes de reaccionar.</li>
          <li>Mirá el progreso, no el día: el podio y los gráficos existen para eso.</li>
        </ul>
      </Card>
    </div>
  )
}
