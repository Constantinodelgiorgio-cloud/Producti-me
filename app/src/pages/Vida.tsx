import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useStore } from '../lib/store'
import { useUI } from '../lib/ui'
import { addDays, diffDays, fmtShort, today, uid, weekStart } from '../lib/date'
import { EMOCIONES, PREGUNTAS_DIARIO } from '../lib/seed'
import type { Idea, JournalEntry, ModoDiario, SocialLog } from '../lib/types'
import { Icon } from '../components/Icon'
import { Bar, Card, Empty, Field, PageHead, Seg } from '../components/ui'
import { BarC, LineC, PieC } from '../components/charts'

type Tab = 'amigos' | 'diario' | 'ideas' | 'apoyo'

export default function Vida() {
  const ui = useUI()
  const tab: Tab = (['diario', 'ideas', 'apoyo'] as const).includes(ui.sub as never) ? (ui.sub as Tab) : 'amigos'
  return (
    <div className="view">
      <PageHead eyebrow="Amigos, diario, ideas y apoyo" title="Vida" />
      <div style={{ marginBottom: 16 }}><Seg label="Sección" value={tab} onChange={(v) => ui.go('vida', v)} options={[['amigos', 'Amigos'], ['diario', 'Diario'], ['ideas', 'Ideas'], ['apoyo', 'Apoyo']]} /></div>
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

const BORRADOR = 'pm-diario-borrador'
type Draft = { modo: ModoDiario; tema?: string; preguntas: { p: string; r: string }[]; texto: string; animo?: number; emo?: string }
const vacio = (modo: ModoDiario, tema?: string, pregunta?: string): Draft => ({
  modo, tema, texto: '',
  preguntas: modo === 'guiado' ? PREGUNTAS_DIARIO.Guiado.map((p) => ({ p, r: '' })) : modo === 'profundo' && pregunta ? [{ p: pregunta, r: '' }] : modo === 'profundo' && tema ? PREGUNTAS_DIARIO[tema].map((p) => ({ p, r: '' })) : [],
})
const leerBorrador = (): Draft | null => { try { const x = localStorage.getItem(BORRADOR); return x ? JSON.parse(x) as Draft : null } catch { return null } }
const preguntaDelDia = () => { const all = Object.entries(PREGUNTAS_DIARIO).filter(([k]) => k !== 'Guiado').flatMap(([, v]) => v); return all[Number(today().replace(/-/g, '')) % all.length] }

function Diario() {
  const d = useStore()
  const [draft, setDraft] = useState<Draft | null>(null)
  const [leer, setLeer] = useState<JournalEntry | null>(null)
  const borrador = leerBorrador()
  const last30 = Array.from({ length: 30 }, (_, i) => addDays(today(), i - 29)).map((f) => {
    const c = d.checkins[f]
    const j = d.journal.filter((x) => x.fecha === f && x.animo).at(-1)
    return { f: f.slice(5).replace('-', '/'), animo: c?.animoNoche ?? c?.animoManana ?? j?.animo, estres: c?.estres, enojo: c?.enojo, energia: c?.energia ? c.energia * 2 : undefined }
  })
  const emos = EMOCIONES.map((e) => ({ name: e, value: d.journal.filter((j) => j.emocion === e && diffDays(today(), j.fecha) <= 30).length })).filter((x) => x.value > 0)
  const racha = (() => { let n = 0; let f = today(); if (!d.journal.some((j) => j.fecha === f)) f = addDays(f, -1); while (d.journal.some((j) => j.fecha === f)) { n++; f = addDays(f, -1) } return n })()
  const hoyEscrito = d.journal.some((j) => j.fecha === today())
  return (
    <div className="two-col">
      <div className="stack">
        <section className="journal-hero" id="sec-diario">
          <div className="jh-date">{new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}{racha > 1 ? ` · ${racha} días seguidos` : ''}</div>
          <p className="jh-q">“{preguntaDelDia()}”</p>
          {borrador && <button className="btn btn-quiet" onClick={() => setDraft(borrador)}><Icon name="pen-line" size={16} />Seguir el borrador</button>}
          <div className="jh-modes">
            <button className="jh-mode" onClick={() => setDraft(vacio('libre'))}><Icon name="feather" size={20} /><b>Libre</b><small>Hoja en blanco</small></button>
            <button className="jh-mode" onClick={() => setDraft(vacio('guiado'))}><Icon name="list" size={20} /><b>Guiado</b><small>3 preguntas cortas</small></button>
            <button className="jh-mode" onClick={() => setDraft({ ...vacio('profundo'), tema: '' })}><Icon name="orbit" size={20} /><b>Profundo</b><small>Una pregunta que importa</small></button>
          </div>
          {hoyEscrito && <p className="cap" style={{ marginTop: 12 }}><Icon name="circle-check" size={13} /> Ya escribiste hoy. Podés volver cuando quieras.</p>}
        </section>
        <section>
          <div className="sec"><span className="eyebrow">Páginas</span><span className="cap">{d.journal.length}</span></div>
          {d.journal.length === 0 ? <p className="cap">Tus entradas van a aparecer acá, como páginas.</p> : (
            <div className="pages">{d.journal.slice().reverse().slice(0, 30).map((j) => (
              <button key={j.id} className="page-card" onClick={() => setLeer(j)}>
                <span className="pc-date">{new Date(j.fecha + 'T12:00').toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}{j.modo && j.modo !== 'libre' ? ` · ${j.modo}` : ''}{j.animo ? ` · ánimo ${j.animo}` : ''}</span>
                <span className="pc-txt">{(j.preguntas?.find((x) => x.r)?.r ?? j.texto).slice(0, 160)}</span>
                {j.emocion && <span className="pc-emo">{j.emocion}</span>}
              </button>
            ))}</div>
          )}
        </section>
      </div>
      <aside className="stack">
        <Card title="Ánimo, estrés, enojo y energía" icon="trending-up">
          <LineC data={last30} x="f" ys={[{ key: 'animo', name: 'Ánimo', color: '#C59AD6' }, { key: 'estres', name: 'Estrés', color: '#E0A852' }, { key: 'enojo', name: 'Enojo', color: '#E5766F' }, { key: 'energia', name: 'Energía ×2', color: '#C9D0DC' }]} height={220} />
          <p className="cap" style={{ marginTop: 6 }}>Últimos 30 días, desde tus check-ins y el diario.</p>
        </Card>
        {emos.length > 0 && <Card title="Emociones del mes" icon="brain"><PieC data={emos} /></Card>}
      </aside>
      {/* El modo escritura se monta sobre toda la app (tapa la barra inferior). */}
      {draft && createPortal(<Writer initial={draft} onClose={() => setDraft(null)} />, document.querySelector('.shell') ?? document.body)}
      {leer && createPortal(<Reader j={leer} onClose={() => setLeer(null)} />, document.querySelector('.shell') ?? document.body)}
    </div>
  )
}

/** Modo escritura a pantalla completa: serif, márgenes amplios, borrador automático. */
function Writer({ initial, onClose }: { initial: Draft; onClose: () => void }) {
  const d = useStore()
  const ui = useUI()
  const [dr, setDr] = useState<Draft>(initial)
  const [step, setStep] = useState(0)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [rec, setRec] = useState(false)
  useEffect(() => { try { localStorage.setItem(BORRADOR, JSON.stringify(dr)) } catch { /* sin almacenamiento */ } }, [dr])
  useEffect(() => { const on = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }; window.addEventListener('keydown', on); return () => window.removeEventListener('keydown', on) }, [onClose])
  const eligiendo = dr.modo === 'profundo' && !dr.preguntas.length
  const preguntaIA = async () => {
    setBusy(true); setErr('')
    try { const { preguntaProfunda } = await import('../lib/coach'); const p = await preguntaProfunda(useStore.getState()); setDr({ ...dr, preguntas: [{ p, r: '' }] }) }
    catch (e) { setErr(e instanceof Error ? e.message : String(e)) } finally { setBusy(false) }
  }
  const texto = dr.preguntas.length ? dr.preguntas.map((x) => x.r).join('\n\n') : dr.texto
  const listo = texto.trim().length > 0
  const save = () => {
    const id = uid()
    const e: JournalEntry = { id, fecha: today(), hora: new Date().toTimeString().slice(0, 5), texto: dr.preguntas.length ? dr.preguntas.filter((x) => x.r.trim()).map((x) => `${x.p}\n${x.r.trim()}`).join('\n\n') : dr.texto.trim(), modo: dr.modo, preguntas: dr.preguntas.length ? dr.preguntas.filter((x) => x.r.trim()) : undefined, animo: dr.animo, emocion: dr.emo }
    d.set((s) => ({ journal: [...s.journal, e] }))
    try { localStorage.removeItem(BORRADOR) } catch { /* sin almacenamiento */ }
    ui.notify(`Entrada guardada · +${dr.modo === 'libre' ? 10 : 15} XP`, () => d.set((s) => ({ journal: s.journal.filter((x) => x.id !== id) })))
    onClose()
  }
  const dictar = (cb: (t: string) => void) => {
    type SR = { lang: string; onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void; onend: () => void; start: () => void }
    const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR }
    const C = w.SpeechRecognition ?? w.webkitSpeechRecognition
    if (!C) return
    const r = new C(); r.lang = d.settings.lang === 'es' ? 'es-AR' : 'en-US'
    r.onresult = (e) => cb(Array.from(e.results).map((x) => x[0].transcript).join(' ')); r.onend = () => setRec(false); r.start(); setRec(true)
  }
  const area = (value: string, onChange: (v: string) => void, ph: string) => (
    <div className="w-area">
      <textarea autoFocus value={value} onChange={(e) => onChange(e.target.value)} placeholder={ph} aria-label="Texto" />
      <button type="button" className="icon-btn w-mic" aria-label="Dictar" aria-pressed={rec} onClick={() => dictar((t) => onChange((value ? value + ' ' : '') + t))}><Icon name="mic" size={18} /></button>
    </div>
  )
  return (
    <div className="writer" role="dialog" aria-modal="true" aria-label="Escribir en el diario">
      <header className="w-top">
        <button className="icon-btn" aria-label="Cerrar (se guarda el borrador)" onClick={onClose}><Icon name="x" size={20} /></button>
        <span className="w-when">{new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })} · {new Date().toTimeString().slice(0, 5)}</span>
        <span className="cap">borrador guardado</span>
      </header>
      <div className="w-body">
        {eligiendo ? (
          <div className="w-themes">
            <h2 className="w-title">¿Sobre qué querés pensar?</h2>
            <div className="w-theme-grid">{Object.keys(PREGUNTAS_DIARIO).filter((k) => k !== 'Guiado').map((k) => <button key={k} className="w-theme" onClick={() => setDr(vacio('profundo', k))}>{k}</button>)}</div>
            <button className="btn btn-quiet" disabled={busy || !d.settings.apiKey} onClick={preguntaIA}><Icon name="sparkles" size={16} />{busy ? 'Pensando una pregunta…' : 'Que el coach me haga una pregunta'}</button>
            <p className="cap">El coach usa solo los números de tus check-ins, no lo que escribiste.</p>
            {err && <p className="err">{err}</p>}
          </div>
        ) : dr.preguntas.length ? (
          <div className="w-q">
            <div className="w-steps">{dr.preguntas.map((_, i) => <i key={i} className={i === step ? 'on' : dr.preguntas[i].r ? 'done' : ''} />)}</div>
            <h2 className="w-title">{dr.preguntas[step].p}</h2>
            {area(dr.preguntas[step].r, (v) => setDr({ ...dr, preguntas: dr.preguntas.map((x, i) => (i === step ? { ...x, r: v } : x)) }), 'Escribí sin filtro…')}
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <button className="btn btn-ghost" disabled={step === 0} onClick={() => setStep(step - 1)}><Icon name="chevron-left" size={16} />Anterior</button>
              {step < dr.preguntas.length - 1 && <button className="btn btn-quiet" onClick={() => setStep(step + 1)}>Siguiente<Icon name="chevron-right" size={16} /></button>}
            </div>
          </div>
        ) : (
          area(dr.texto, (v) => setDr({ ...dr, texto: v }), '¿Qué pasó hoy? ¿Qué sentiste? Escribí como si nadie fuera a leerlo.')
        )}
        {!eligiendo && (
          <div className="w-close">
            <div className="field"><label htmlFor="w-an">¿Cómo te sentís? · <span className="num">{dr.animo ?? '—'}</span> de 10</label>
              <div className="slider"><input id="w-an" type="range" min={1} max={10} value={dr.animo ?? 5} style={{ ['--v' as string]: `${(((dr.animo ?? 5) - 1) / 9) * 100}%` }} onChange={(e) => setDr({ ...dr, animo: Number(e.target.value) })} /></div></div>
            <div className="chips" style={{ flexWrap: 'wrap' }}>{EMOCIONES.map((e) => <button key={e} className="chip" aria-pressed={dr.emo === e} onClick={() => setDr({ ...dr, emo: dr.emo === e ? undefined : e })}>{e}</button>)}</div>
            <button className="btn btn-primary btn-block" disabled={!listo} onClick={save}>Guardar entrada</button>
          </div>
        )}
      </div>
    </div>
  )
}

function Reader({ j, onClose }: { j: JournalEntry; onClose: () => void }) {
  const d = useStore()
  const ui = useUI()
  useEffect(() => { const on = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }; window.addEventListener('keydown', on); return () => window.removeEventListener('keydown', on) }, [onClose])
  return (
    <div className="writer reader" role="dialog" aria-modal="true" aria-label="Entrada del diario">
      <header className="w-top">
        <button className="icon-btn" aria-label="Cerrar" onClick={onClose}><Icon name="x" size={20} /></button>
        <span className="w-when">{new Date(j.fecha + 'T12:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}{j.hora ? ` · ${j.hora}` : ''}</span>
        <button className="icon-btn" aria-label="Borrar entrada" onClick={async () => { if (await ui.confirm({ title: '¿Borrar esta entrada?', confirm: 'Borrar', danger: true })) { d.set((s) => ({ journal: s.journal.filter((x) => x.id !== j.id) })); onClose() } }}><Icon name="trash" size={18} /></button>
      </header>
      <article className="w-body">
        {j.preguntas?.length ? j.preguntas.map((q, i) => <div key={i} className="r-block"><h3 className="w-title sm">{q.p}</h3><p className="r-txt">{q.r}</p></div>) : <p className="r-txt">{j.texto}</p>}
        {(j.emocion || j.animo) && <p className="cap" style={{ marginTop: 24 }}>{j.emocion ?? ''}{j.emocion && j.animo ? ' · ' : ''}{j.animo ? `ánimo ${j.animo}/10` : ''}</p>}
      </article>
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
