import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useStore } from '../lib/store'
import { useUI } from '../lib/ui'
import { addDays, diffDays, fmtShort, today, uid, weekStart } from '../lib/date'
import { CHARLAS, CIERRE_PROFUNDO, EMOCIONES, PREGUNTAS_DIARIO } from '../lib/seed'
import { animoDe, EnojoFlow, MoodMeter } from '../components/Animo'
import type { Idea, JournalEntry, ModoDiario, Persona, SocialLog } from '../lib/types'
import { hayRiesgo } from '../lib/seguridad'
import { Icon } from '../components/Icon'
import { Bar, Card, Empty, Field, NumInput, PageHead, Seg } from '../components/ui'
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
        <Creencia />
        <section className="panel pad" id="sec-amigos">
          <h2 className="h2" style={{ marginBottom: 12 }}><Icon name="message-circle" size={16} />Registrar contacto</h2>
          <form className="form-grid" onSubmit={save}>
            <Field label="Tipo" id="so-t"><select id="so-t" value={l.tipo} onChange={(e) => setL({ ...l, tipo: e.target.value as SocialLog['tipo'] })}>{TIPOS.map((x) => <option key={x}>{x}</option>)}</select></Field>
            <Field label="Con quién" id="so-c"><input id="so-c" list="personas" value={l.con} placeholder="Nombre o “el grupo”" onChange={(e) => setL({ ...l, con: e.target.value })} /></Field>
            <datalist id="personas">{personas.map((p) => <option key={p} value={p} />)}</datalist>
            <Field label="Fecha" id="so-f"><input id="so-f" type="date" value={l.fecha} max={today()} onChange={(e) => setL({ ...l, fecha: e.target.value })} /></Field>
            <Field label="Cómo fue" id="so-n"><input id="so-n" value={l.nota ?? ''} onChange={(e) => setL({ ...l, nota: e.target.value })} /></Field>
            {(l.tipo === 'juntada' || l.tipo === 'llamada') && <Field label="Tiempo juntos (min)" id="so-m"><NumInput id="so-m" decimals={false} value={l.minutos ?? ''} onValue={(n) => setL({ ...l, minutos: n })} /></Field>}
            <div className="field" style={{ gridColumn: '1 / -1' }}><label>Tipo de charla (opcional)</label><div className="chips" style={{ flexWrap: 'wrap' }}>{CHARLAS.map((c) => <button type="button" key={c} className="chip" aria-pressed={l.charla === c} onClick={() => setL({ ...l, charla: l.charla === c ? undefined : c })}>{c}</button>)}</div></div>
            <button className="btn btn-primary" disabled={!l.con.trim()}>Guardar</button>
          </form>
        </section>
      </div>
      <aside className="stack">
        <Card title="Últimas 8 semanas" icon="layout-grid"><BarC data={chart} x="semana" stacked ys={[{ key: 'juntadas', name: 'Juntadas', color: '#8EA8FF' }, { key: 'contactos', name: 'Contactos', color: '#4A5160' }]} height={180} /></Card>
        <Personas onAnotar={(con) => { setL({ ...l, con }); document.getElementById('sec-amigos')?.scrollIntoView({ behavior: 'smooth' }) }} />
        <Gratitud />
      </aside>
    </div>
  )
}

const BORRADOR = 'pm-diario-borrador'
type Draft = { modo: ModoDiario; tema?: string; preguntas: { p: string; r: string }[]; texto: string; animo?: number; emo?: string; v?: number; a?: number; inicio?: number }
const vacio = (modo: ModoDiario, tema?: string, pregunta?: string): Draft => ({
  modo, tema, texto: '',
  inicio: Date.now(),
  // Las sesiones profundas cierran con una pregunta de sentido, no con "escribí más".
  preguntas: modo === 'guiado' ? PREGUNTAS_DIARIO.Guiado.map((p) => ({ p, r: '' })) : modo === 'profundo' && pregunta ? [{ p: pregunta, r: '' }, { p: CIERRE_PROFUNDO, r: '' }] : modo === 'profundo' && tema ? [...PREGUNTAS_DIARIO[tema], CIERRE_PROFUNDO].map((p) => ({ p, r: '' })) : [],
})
const STOP = new Set('pensando pienso pensar pensaba sentir sentia sentirme siento quiero queria tengo tenia hablar dijo dije porque cuando donde sobre entre hasta desde hacia todos todas mucho mucha muchos tengo tiene tenía estoy estaba siento sentí hacer hice quiero quería puedo puede nunca siempre otra otro otros nada algo alguien ahora antes después mejor peor igual bien pasó pasa estar sería cosas cosa veces vida día días semana hoy mañana aunque mismo misma también entonces pero como solo sola esto esta este eso esas esos ellos ellas nosotros fuera dentro'.split(' '))
/** Tema que vuelve: palabra (o nombre) presente en 3 de las últimas 4 entradas profundas o guiadas. */
const temaRepetido = (js: JournalEntry[]) => {
  const ult = js.filter((j) => j.modo === 'profundo' || j.modo === 'guiado' || j.modo === 'libre').slice(-4)
  if (ult.length < 3) return null
  const norm = (w: string) => w.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const contar = (sacar: (t: string) => string[]) => {
    const c = new Map<string, number>()
    for (const j of ult) for (const w of new Set(sacar(j.texto))) c.set(w, (c.get(w) ?? 0) + 1)
    return [...c.entries()].filter(([, n]) => n >= 3).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
  }
  // Primero personas o lugares (palabras con mayúscula que no abren una oración); después temas.
  const nombre = contar((t) => (t.match(/(?<![.!?¿¡]\s|^)\b[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}/g) ?? []).filter((w) => !STOP.has(norm(w))))
  if (nombre) return nombre
  return contar((t) => (norm(t).match(/[a-zñ]{5,}/g) ?? []).filter((w) => !STOP.has(w) && !/(ando|endo|iendo|aba|aban|ia|ian)$/.test(w)))
}
const leerBorrador = (): Draft | null => { try { const x = localStorage.getItem(BORRADOR); return x ? JSON.parse(x) as Draft : null } catch { return null } }
const preguntaDelDia = () => { const all = Object.entries(PREGUNTAS_DIARIO).filter(([k]) => k !== 'Guiado').flatMap(([, v]) => v); return all[Number(today().replace(/-/g, '')) % all.length] }

function Diario() {
  const d = useStore()
  const [draft, setDraft] = useState<Draft | null>(null)
  const [leer, setLeer] = useState<JournalEntry | null>(null)
  const [enojo, setEnojo] = useState(false)
  const borrador = leerBorrador()
  const tema = temaRepetido(d.journal)
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
            <button className="jh-mode" onClick={() => setEnojo(true)}><Icon name="flame" size={20} /><b>Enojo</b><small>Bajar la temperatura primero</small></button>
          </div>
          {tema && <div className="tema-rep"><Icon name="repeat" size={16} /><span className="grow">Volviste varias veces a <b>«{tema}»</b>. Darle más vueltas suele hundir; mirarlo desde afuera o imaginar el mejor futuro, no.</span>
            <div className="row" style={{ gap: 6 }}><button className="chip" onClick={() => setDraft(vacio('profundo', 'Desde afuera'))}>Desde afuera</button><button className="chip" onClick={() => setDraft(vacio('profundo', 'Mejor futuro'))}>Mejor futuro</button></div></div>}
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
        <Pixeles />
        {emos.length > 0 && <Card title="Emociones del mes" icon="brain"><PieC data={emos} /></Card>}
      </aside>
      {/* El modo escritura se monta sobre toda la app (tapa la barra inferior). */}
      {draft && createPortal(<Writer initial={draft} onClose={() => setDraft(null)} />, document.querySelector('.shell') ?? document.body)}
      {leer && createPortal(<Reader j={leer} onClose={() => setLeer(null)} />, document.querySelector('.shell') ?? document.body)}
      {enojo && createPortal(<EnojoFlow onClose={() => setEnojo(false)} />, document.querySelector('.shell') ?? document.body)}
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
  const [, tick] = useState(0)
  useEffect(() => { const id = window.setInterval(() => tick((x) => x + 1), 30000); return () => window.clearInterval(id) }, [])
  const largo = dr.modo === 'profundo' && dr.inicio && Date.now() - dr.inicio > 15 * 60e3
  const preguntaIA = async () => {
    setBusy(true); setErr('')
    try { const { preguntaProfunda } = await import('../lib/coach'); const p = await preguntaProfunda(useStore.getState()); setDr({ ...dr, preguntas: [{ p, r: '' }] }) }
    catch (e) { setErr(e instanceof Error ? e.message : String(e)) } finally { setBusy(false) }
  }
  const texto = dr.preguntas.length ? dr.preguntas.map((x) => x.r).join('\n\n') : dr.texto
  const listo = texto.trim().length > 0
  const save = () => {
    const id = uid()
    const e: JournalEntry = { id, fecha: today(), hora: new Date().toTimeString().slice(0, 5), texto: dr.preguntas.length ? dr.preguntas.filter((x) => x.r.trim()).map((x) => `${x.p}\n${x.r.trim()}`).join('\n\n') : dr.texto.trim(), modo: dr.modo, preguntas: dr.preguntas.length ? dr.preguntas.filter((x) => x.r.trim()) : undefined, animo: dr.animo, emocion: dr.emo, valencia: dr.v, activacion: dr.a }
    d.set((s) => ({ journal: [...s.journal, e] }))
    try { localStorage.removeItem(BORRADOR) } catch { /* sin almacenamiento */ }
    if (hayRiesgo(e.texto)) { onClose(); ui.openSheet('ayuda'); return }
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
        {largo && <div className="tema-rep"><Icon name="clock" size={16} /><span className="grow">Llevás más de 15 minutos. Escribir de más sobre lo que duele puede empeorar el ánimo: andá a la última pregunta y cerrá.</span>{dr.preguntas.length > 0 && <button className="chip" onClick={() => setStep(dr.preguntas.length - 1)}>Ir al cierre</button>}</div>}
        {!eligiendo && (
          <div className="w-close">
            <div className="field"><label>¿Cómo te sentís?</label>
              <MoodMeter v={dr.v} a={dr.a} palabra={dr.emo} onChange={(x) => setDr({ ...dr, v: x.v, a: x.a, emo: x.palabra, animo: animoDe(x.v) })} /></div>
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
        {(j.emocion || j.animo) && <p className="cap" style={{ marginTop: 24 }}>{j.emocion ?? ''}{j.emocion && j.animo ? ' · ' : ''}{j.animo ? `ánimo ${j.animo}/10` : ''}{j.antes ? ` · enojo ${j.antes} → ${j.despues}` : ''}</p>}
        <div className="r-flags">
          <label className="check-row cap"><input type="checkbox" checked={!!j.privada} onChange={(e) => d.set((s) => ({ journal: s.journal.map((x) => (x.id === j.id ? { ...x, privada: e.target.checked } : x)) }))} />No compartir con el coach</label>
          <label className="check-row cap"><input type="checkbox" checked={!!j.sinRecuerdo} onChange={(e) => d.set((s) => ({ journal: s.journal.map((x) => (x.id === j.id ? { ...x, sinRecuerdo: e.target.checked } : x)) }))} />No mostrarla en "Recuerdos"</label>
        </div>
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
  const ui = useUI()
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
        <p className="body-2" style={{ marginBottom: 12 }}>Si aparecen pensamientos de hacerte daño o sentís que no podés más, no lo cargues solo. Hablá ya con alguien de confianza y llamá a la <b style={{ color: 'var(--t1)' }}>línea nacional de salud mental 0800-999-0091</b> (gratuita, 24 h, desde Corrientes también) o acercate a una guardia. En emergencias: <b style={{ color: 'var(--t1)' }}>911</b> o <b style={{ color: 'var(--t1)' }}>107</b>.</p>
        <button className="btn btn-quiet" onClick={() => ui.openSheet('ayuda')}><Icon name="phone" size={16} />Ver todas las líneas</button>
      </Card>
      <Card title="Para salir del bucle" icon="compass">
        <ul className="body-2" style={{ paddingLeft: 18, margin: 0, lineHeight: 1.7 }}>
          <li>Una cosa nueva por semana: lugar, comida, actividad o persona. Está como hábito los viernes y domingos.</li>
          <li>Cuando aparezca el enojo: primero bajar la temperatura (90 s de respiración), después ponerle nombre y mirarlo desde afuera. Descargarse no lo baja. Está en Diario → Enojo.</li>
          <li>Mirá el progreso, no el día: el podio y los gráficos existen para eso.</li>
        </ul>
      </Card>
    </div>
  )
}

/** Año en píxeles: un cuadrado por día, coloreado por el ánimo (check-ins y diario). */
function Pixeles() {
  const d = useStore()
  const t = today()
  const semanas = 26
  const inicio = addDays(weekStart(t), -7 * (semanas - 1))
  const animoDia = (f: string) => {
    const c = d.checkins[f]
    const j = d.journal.filter((x) => x.fecha === f && x.animo).at(-1)
    return c?.animoNoche ?? j?.animo ?? c?.animoManana
  }
  const color = (a?: number) => (a === undefined ? undefined : a >= 8 ? '#5FBF92' : a >= 6 ? '#A9C77A' : a >= 5 ? '#E0C252' : a >= 3 ? '#E0A852' : '#E5766F')
  const cols = Array.from({ length: semanas }, (_, w) => Array.from({ length: 7 }, (_, k) => addDays(inicio, w * 7 + k)))
  const conDato = cols.flat().filter((f) => animoDia(f) !== undefined).length
  return (
    <Card title="Seis meses en píxeles" icon="grid">
      <div className="pixeles" role="img" aria-label={`Ánimo de los últimos 6 meses, ${conDato} días con dato`}>
        {cols.map((c, i) => <div key={i} className="px-col">{c.map((f) => <i key={f} className={f > t ? 'fut' : f === t ? 'hoy' : ''} style={{ background: color(animoDia(f)) }} title={`${f}: ${animoDia(f) ?? 'sin dato'}`} />)}</div>)}
      </div>
      <div className="px-leyenda cap"><span><i style={{ background: '#E5766F' }} />bajo</span><span><i style={{ background: '#E0C252' }} />medio</span><span><i style={{ background: '#5FBF92' }} />alto</span><span className="grow" />{conDato} días con dato</div>
    </Card>
  )
}

const wa = (tel?: string, txt = '') => `https://wa.me/${(tel ?? '').replace(/\D/g, '')}${txt ? `?text=${encodeURIComponent(txt)}` : ''}`
const diasHastaCumple = (mmdd: string) => {
  const t = today()
  let f = `${t.slice(0, 4)}-${mmdd}`
  if (f < t) f = `${Number(t.slice(0, 4)) + 1}-${mmdd}`
  return diffDays(f, t)
}

/** Personas que importan: cada cuánto querés hablarle, hace cuánto que no, cumpleaños y horas juntos. Sin puntajes. */
function Personas({ onAnotar }: { onAnotar: (con: string) => void }) {
  const d = useStore()
  const [nueva, setNueva] = useState<Omit<Persona, 'id'> | null>(null)
  const ps = d.personas ?? []
  const ult = (n: string) => d.social.filter((s) => s.con.toLowerCase() === n.toLowerCase()).sort((a, b) => b.fecha.localeCompare(a.fecha))[0]
  const horas = (n: string) => d.social.filter((s) => s.con.toLowerCase() === n.toLowerCase()).reduce((a, s) => a + (s.minutos ?? (s.tipo === 'juntada' ? 120 : s.tipo === 'llamada' ? 15 : 0)), 0) / 60
  const lista = ps.map((p) => { const u = ult(p.nombre); const dias = u ? diffDays(today(), u.fecha) : null; return { p, u, dias, ratio: dias === null ? 2 : dias / p.cadencia } }).sort((a, b) => b.ratio - a.ratio)
  const sugeridas = [...new Set(d.social.map((s) => s.con))].filter((n) => n && !ps.some((p) => p.nombre.toLowerCase() === n.toLowerCase()) && !/grupo/i.test(n)).slice(0, 4)
  const cumples = ps.filter((p) => p.cumple && diasHastaCumple(p.cumple) <= 14).sort((a, b) => diasHastaCumple(a.cumple!) - diasHastaCumple(b.cumple!))
  const guardar = () => { if (!nueva?.nombre.trim()) return; d.set((s) => ({ personas: [...(s.personas ?? []), { id: uid(), ...nueva, nombre: nueva.nombre.trim() }] })); setNueva(null) }
  return (
    <section className="panel pad">
      <div className="sec" style={{ margin: '0 0 12px' }}><h2 className="h2"><Icon name="users" size={16} />Personas que importan</h2><button className="btn btn-ghost btn-sm" onClick={() => setNueva(nueva ? null : { nombre: '', cadencia: 14 })}><Icon name={nueva ? 'x' : 'plus'} size={15} />{nueva ? 'Cancelar' : 'Agregar'}</button></div>
      {cumples.map((p) => <div key={p.id} className="cumple"><Icon name="cake" size={15} /><span className="grow">{diasHastaCumple(p.cumple!) === 0 ? `Hoy cumple ${p.nombre}` : `${p.nombre} cumple en ${diasHastaCumple(p.cumple!)} día${diasHastaCumple(p.cumple!) === 1 ? '' : 's'}`}</span>{p.tel && <a className="chip" href={wa(p.tel, diasHastaCumple(p.cumple!) === 0 ? '¡Feliz cumple! ' : '')} target="_blank" rel="noreferrer">Escribirle</a>}</div>)}
      {nueva && (
        <div className="stack" style={{ gap: 10, marginBottom: 14 }}>
          <div className="form-grid">
            <Field label="Nombre" id="pe-n"><input id="pe-n" value={nueva.nombre} onChange={(e) => setNueva({ ...nueva, nombre: e.target.value })} /></Field>
            <Field label="Hablar cada" id="pe-c"><select id="pe-c" value={nueva.cadencia} onChange={(e) => setNueva({ ...nueva, cadencia: Number(e.target.value) })}><option value={3}>3 días</option><option value={7}>semana</option><option value={14}>2 semanas</option><option value={30}>mes</option><option value={90}>3 meses</option></select></Field>
            <Field label="Cumpleaños" id="pe-b"><input id="pe-b" type="date" value={nueva.cumple ? `2000-${nueva.cumple}` : ''} onChange={(e) => setNueva({ ...nueva, cumple: e.target.value ? e.target.value.slice(5) : undefined })} /></Field>
            <Field label="WhatsApp (con código de área)" id="pe-t"><input id="pe-t" inputMode="tel" value={nueva.tel ?? ''} placeholder="5493794…" onChange={(e) => setNueva({ ...nueva, tel: e.target.value || undefined })} /></Field>
          </div>
          <button className="btn btn-primary" disabled={!nueva.nombre.trim()} onClick={guardar}>Guardar</button>
        </div>
      )}
      {lista.length === 0 && !nueva && <p className="cap">Sumá a las 5–10 personas con las que querés estar más cerca y cada cuánto te gustaría hablarles. La app te avisa con amabilidad cuando pasó un tiempo.</p>}
      {lista.map(({ p, dias }) => {
        const h = horas(p.nombre)
        const prox = h < 50 ? 50 : h < 90 ? 90 : 200
        return (
          <div key={p.id} className={`persona ${dias !== null && dias > p.cadencia ? 'toca' : ''}`}>
            <span className="grow"><b>{p.nombre}</b><small>{dias === null ? 'sin contacto registrado' : dias === 0 ? 'hablaron hoy' : `hace ${dias} día${dias === 1 ? '' : 's'}`} · cada {p.cadencia === 7 ? 'semana' : p.cadencia === 30 ? 'mes' : `${p.cadencia} días`}{h >= 1 ? ` · ${Math.round(h)} h juntos (la amistad cercana se arma con ~${prox} h)` : ''}</small></span>
            {p.tel && <a className="icon-btn sm" aria-label={`Escribirle a ${p.nombre} por WhatsApp`} href={wa(p.tel)} target="_blank" rel="noreferrer"><Icon name="message-circle" size={16} /></a>}
            <button className="btn btn-quiet btn-sm" onClick={() => onAnotar(p.nombre)}>Anotar</button>
            <button className="icon-btn sm" aria-label={`Quitar a ${p.nombre}`} onClick={() => d.set((s) => ({ personas: s.personas.filter((x) => x.id !== p.id) }))}><Icon name="x" size={14} /></button>
          </div>
        )
      })}
      {sugeridas.length > 0 && <div className="chips" style={{ flexWrap: 'wrap', marginTop: 10 }}><span className="cap" style={{ alignSelf: 'center' }}>Sumar:</span>{sugeridas.map((n) => <button key={n} className="chip" onClick={() => d.set((s) => ({ personas: [...(s.personas ?? []), { id: uid(), nombre: n, cadencia: 14 }] }))}><Icon name="plus" size={12} />{n}</button>)}</div>}
      <p className="cap" style={{ marginTop: 12 }}>La gente subestima cuánto valora el otro un mensaje corto. No hace falta un motivo.</p>
    </section>
  )
}

/** Gratitud una vez por semana, dirigida a una persona (más efectiva que a diario y que en abstracto). */
function Gratitud() {
  const d = useStore()
  const ui = useUI()
  const ws = weekStart(today())
  const hecha = d.social.find((s) => s.fecha >= ws && s.charla === 'Gratitud')
  const [con, setCon] = useState('')
  const [txt, setTxt] = useState('')
  const tel = (d.personas ?? []).find((p) => p.nombre.toLowerCase() === con.trim().toLowerCase())?.tel
  const guardar = () => {
    const id = uid()
    d.set((s) => ({ social: [...s.social, { id, fecha: today(), tipo: 'mensaje', con: con.trim(), charla: 'Gratitud', nota: txt.trim() }] }))
    ui.notify('Gratitud de la semana guardada', () => useStore.getState().set((s) => ({ social: s.social.filter((x) => x.id !== id) })))
    setCon(''); setTxt('')
  }
  return (
    <section className="panel pad">
      <h2 className="h2"><Icon name="hand-heart" size={16} />Gratitud de la semana</h2>
      {hecha ? <p className="body-2">Esta semana le agradeciste a <b>{hecha.con}</b>{hecha.nota ? `: “${hecha.nota}”` : ''}. La próxima, el lunes.</p> : <>
        <p className="cap" style={{ margin: '-6px 0 12px' }}>Una vez por semana alcanza: hacerlo seguido le quita efecto. Mejor si se lo decís.</p>
        <div className="stack" style={{ gap: 10 }}>
          <input aria-label="A quién" placeholder="¿A quién le agradecés algo?" value={con} onChange={(e) => setCon(e.target.value)} list="personas" />
          <input aria-label="Por qué" placeholder="¿Por qué? (en una frase)" value={txt} onChange={(e) => setTxt(e.target.value)} />
          <div className="row">
            <button className="btn btn-primary" disabled={!con.trim() || !txt.trim()} onClick={guardar}>Guardar</button>
            {con.trim() && txt.trim() && <a className="btn btn-quiet" href={wa(tel, `${txt.trim()}. Gracias.`)} target="_blank" rel="noreferrer" onClick={guardar}><Icon name="message-circle" size={15} />Mandárselo</a>}
          </div>
        </div>
      </>}
    </section>
  )
}

/** Si el diario dice "no me invitan" o "sobro", una tarjeta que discute esa creencia con evidencia. */
function Creencia() {
  const d = useStore()
  const reciente = d.journal.filter((j) => diffDays(today(), j.fecha) <= 14).reverse()
  const re = /no me invita(n|ron)|sobro|no les importo|nadie me (escribe|llama|busca)|me dejaron afuera|no encajo/i
  const j = reciente.find((x) => re.test(x.texto))
  if (!j) return null
  const frase = j.texto.match(re)?.[0]
  return (
    <section className="note-box creencia">
      <Icon name="lightbulb" size={16} />
      <span>Hace poco escribiste <b>«{frase}»</b>. Es un pensamiento muy común y casi siempre exagera: en 13 experimentos, la gente subestimó cuánto valoraba el otro un mensaje corto, incluso de alguien con quien hablaba poco. Probá hoy escribir primero, sin motivo. Lo peor que pasa es nada.</span>
    </section>
  )
}
