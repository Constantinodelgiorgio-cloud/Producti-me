import { useEffect, useRef, useState } from 'react'
import type Anthropic from '@anthropic-ai/sdk'
import { useStore, type Data } from '../lib/store'
import { useUI } from '../lib/ui'
import { dow, today, uid } from '../lib/date'
import { agendaDe, habitsFor, excusaDe, tituloBloque } from '../lib/logic'
import { aplicarAcciones, describir, revertirCambio, validarAccion } from '../lib/actions'
import { resolverPropuesta, runTurn, userMessage, type ToolHost } from '../lib/coach'
import { ALIMENTOS, resolver } from '../lib/foods'
import type { Accion, Chat, ChatMsg, CuentaId, HabitState, MomentoComida, SocialLog } from '../lib/types'
import { hayRiesgo } from '../lib/seguridad'
import { comidaSugerida } from '../lib/ayuno'
import { Icon } from '../components/Icon'
import { Empty } from '../components/ui'

type ApiMsg = Anthropic.Beta.Messages.BetaMessageParam
// Deshacer de los registros hechos por el coach (vive mientras la app está abierta).
const undos = new Map<string, () => void>()

const momentoComida = (): MomentoComida => { const h = new Date().getHours(); return h < 11 ? 'desayuno' : h < 15 ? 'almuerzo' : h < 19 ? 'merienda' : h < 23 ? 'cena' : 'snack' }

const sugerencias = (d: Data) => {
  const t = today()
  const ag = agendaDe(d, t)
  const out: string[] = []
  if (ag.some((a) => /facultad/i.test(a.que))) out.push('Hoy no tengo facultad')
  if (ag.some((a) => /gimnasio/i.test(a.que))) out.push('Pasame el gimnasio para la tarde', 'No puedo entrenar hoy')
  out.push('Esta semana tengo menos tiempo', 'Agregá una salida el sábado a las 22')
  if (dow(t) >= 4) out.push('Organizame el fin de semana')
  out.push('Almorcé milanesa con puré', 'Gasté 8.500 en el súper con Mercado Pago')
  return out.slice(0, 6)
}

export default function Coach() {
  const d = useStore()
  const ui = useUI()
  const f = today()
  const chat: Chat | undefined = d.chats.filter((c) => c.fecha === f).at(-1)
  const [txt, setTxt] = useState(() => { const x = useUI.getState().coachDraft ?? ''; return x })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [edit, setEdit] = useState<Record<string, boolean[]>>({})
  const [showLog, setShowLog] = useState(false)
  const end = useRef<HTMLDivElement>(null)
  const autoSent = useRef(false)

  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [chat?.msgs.length, busy])
  // Mensaje traído desde Hoy: se envía solo.
  useEffect(() => {
    const draft = useUI.getState().coachDraft
    if (draft && !autoSent.current && d.settings.apiKey) { autoSent.current = true; useUI.setState({ coachDraft: undefined }); send(draft) }
    else if (draft) useUI.setState({ coachDraft: undefined })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const saveChat = (c: Chat) => d.set((s) => ({ chats: [...s.chats.filter((x) => x.id !== c.id), c].slice(-30) }))
  const current = (): Chat => useStore.getState().chats.filter((c) => c.fecha === f).at(-1) ?? { id: uid(), fecha: f, msgs: [], api: [] }

  const host: ToolHost = {
    proponer: (_id, _r, acciones) => {
      const st = useStore.getState()
      const errores = acciones.map((a, i) => { const e = validarAccion(st, a); return e ? `acción ${i + 1}: ${e}` : null }).filter(Boolean) as string[]
      return { errores }
    },
    registrar: (name, input) => {
      const st = useStore.getState()
      const key = uid()
      if (name === 'registrar_comida') {
        const items = Array.isArray(input.items) ? input.items as { texto: string; gramos?: number; cantidad?: number }[] : []
        const pool = [...st.alimentosPropios, ...ALIMENTOS]
        const ok: string[] = []
        const no: string[] = []
        const ids: string[] = []
        const hora = new Date().toTimeString().slice(0, 5)
        const comida = comidaSugerida(st, today(), hora)
        const momento = (input.momento as MomentoComida) ?? momentoComida()
        const meals = items.flatMap((it) => {
          const r = resolver(String(it.texto ?? ''), pool, it.gramos, it.cantidad)
          if (!r) { no.push(it.texto); return [] }
          const id = uid(); ids.push(id)
          ok.push(`${r.alimento.nombre} ${r.gramos} g (${r.kcal} kcal, ${r.prot} g P)`)
          return [{ id, fecha: today(), nombre: r.alimento.nombre, foodId: r.alimento.id, gramos: r.gramos, momento, hora, comida, kcal: r.kcal, prot: r.prot, carb: r.carb, grasa: r.grasa }]
        })
        if (!meals.length) return { ok: false, texto: `No encontré en la base: ${no.join(', ')}. Pedile que lo cargue en Comida como alimento propio o que use otro nombre.` }
        st.set((s) => ({ meals: [...s.meals, ...meals] }))
        undos.set(key, () => useStore.getState().set((s) => ({ meals: s.meals.filter((m) => !ids.includes(m.id)) })))
        return { ok: true, undoKey: key, texto: `Registrado (${comida}.ª comida, ${hora}): ${ok.join('; ')}.${no.length ? ` No encontrado: ${no.join(', ')}.` : ''}` }
      }
      if (name === 'registrar_movimiento') {
        const monto = Number(input.monto)
        if (!(monto > 0)) return { ok: false, texto: 'Monto inválido.' }
        const tipo = input.tipo === 'ingreso' ? 'ingreso' : 'gasto'
        const id = uid()
        const cat = typeof input.categoria === 'string' && input.categoria ? input.categoria : 'Otros'
        st.set((s) => ({ money: [...s.money, { id, fecha: typeof input.fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input.fecha) ? input.fecha : today(), tipo, monto, moneda: input.moneda === 'USD' ? 'USD' : 'ARS', cuenta: (input.cuenta as CuentaId) ?? undefined, categoria: cat, nota: typeof input.nota === 'string' ? input.nota : undefined, origen: 'coach' }] }))
        undos.set(key, () => useStore.getState().set((s) => ({ money: s.money.filter((m) => m.id !== id) })))
        return { ok: true, undoKey: key, texto: `${tipo === 'gasto' ? 'Gasto' : 'Ingreso'} de ${input.moneda === 'USD' ? 'USD' : '$'} ${monto.toLocaleString('es-AR')} en ${cat} registrado.` }
      }
      if (name === 'registrar_contacto') {
        const con = String(input.con ?? '').trim()
        if (!con) return { ok: false, texto: 'Falta con quién.' }
        const id = uid()
        st.set((s) => ({ social: [...s.social, { id, fecha: today(), tipo: (input.tipo as SocialLog['tipo']) ?? 'mensaje', con, nota: typeof input.nota === 'string' ? input.nota : undefined }] }))
        undos.set(key, () => useStore.getState().set((s) => ({ social: s.social.filter((x) => x.id !== id) })))
        return { ok: true, undoKey: key, texto: `${input.tipo ?? 'Contacto'} con ${con} registrado.` }
      }
      if (name === 'registrar_tarea') {
        const texto = String(input.texto ?? '').trim()
        if (!texto) return { ok: false, texto: 'Falta la tarea.' }
        const id = uid()
        const fecha = typeof input.fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input.fecha) ? input.fecha : undefined
        st.set((s) => ({ tareas: [...(s.tareas ?? []), { id, texto, fecha, creada: today(), minutos: Number(input.minutos) || undefined }] }))
        undos.set(key, () => useStore.getState().set((s) => ({ tareas: s.tareas.filter((x) => x.id !== id) })))
        return { ok: true, undoKey: key, texto: `Tarea agregada${fecha ? ` para el ${fecha}` : ' (algún día)'}: ${texto}.` }
      }
      if (name === 'anotar_suceso') {
        const texto = String(input.texto ?? '').trim().slice(0, 240)
        if (!texto) return { ok: false, texto: 'Vacío.' }
        const tipo = (['nota', 'imprevisto', 'cambio', 'bien'] as const).find((x) => x === input.tipo) ?? 'nota'
        const id = uid()
        st.set((s) => ({ sucesos: [...(s.sucesos ?? []), { id, fecha: today(), hora: new Date().toTimeString().slice(0, 5), texto, tipo }] }))
        undos.set(key, () => useStore.getState().set((s) => ({ sucesos: s.sucesos.filter((x) => x.id !== id) })))
        return { ok: true, undoKey: key, texto: `Anotado en el día: ${texto}` }
      }
      if (name === 'recordar') {
        const texto = String(input.texto ?? '').trim().slice(0, 240)
        if (!texto) return { ok: false, texto: 'Vacío.' }
        const id = uid()
        st.set((s) => ({ memoria: [...(s.memoria ?? []), { id, texto, fecha: today(), origen: 'coach' }] }))
        undos.set(key, () => useStore.getState().set((s) => ({ memoria: s.memoria.filter((x) => x.id !== id) })))
        return { ok: true, undoKey: key, texto: `Recordado: ${texto}` }
      }
      if (name === 'marcar_habito') {
        const h = st.habits.find((x) => x.id === input.habito_id)
        const est = input.estado as HabitState
        if (!h || !['hecho', 'minimo', 'no', 'reserva'].includes(est)) return { ok: false, texto: `Hábito o estado inválido (${String(input.habito_id)}).` }
        const fecha = typeof input.fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input.fecha) ? input.fecha : today()
        const prev = st.habitLog[fecha]?.[h.id]
        const write = (v?: HabitState) => useStore.getState().set((s) => { const day = { ...(s.habitLog[fecha] ?? {}) }; if (v) day[h.id] = v; else delete day[h.id]; return { habitLog: { ...s.habitLog, [fecha]: day } } })
        write(est)
        undos.set(key, () => write(prev))
        return { ok: true, undoKey: key, texto: `"${h.nombre}" marcado como ${est === 'hecho' ? 'hecho' : est === 'minimo' ? 'versión mínima' : 'no hecho'}.` }
      }
      return { ok: false, texto: `Herramienta desconocida: ${name}` }
    },
  }

  const run = async (c: Chat, api: ApiMsg[]) => {
    setBusy(true); setErr('')
    try {
      const r = await runTurn(useStore.getState(), api, host)
      saveChat({ ...c, api: r.api, msgs: [...c.msgs, ...r.msgs] })
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
      saveChat({ ...c, api })
    } finally { setBusy(false) }
  }

  const send = async (texto: string) => {
    if (!texto.trim() || busy) return
    let c = current()
    let api = c.api as ApiMsg[]
    // Si quedó una propuesta sin decidir, se toma como descartada para poder seguir.
    const pend = c.msgs.find((m) => m.propuesta?.estado === 'pendiente')
    if (pend?.propuesta) {
      api = resolverPropuesta(api, pend.propuesta.toolUseId, 'Constantino no la aplicó y escribió otro mensaje: tomala como descartada salvo que la vuelva a pedir.')
      c = { ...c, msgs: c.msgs.map((m) => (m.id === pend.id ? { ...m, propuesta: { ...m.propuesta!, estado: 'descartada' } } : m)) }
    }
    // Frases de riesgo: primero las líneas de ayuda (sin depender de la IA).
    if (hayRiesgo(texto)) ui.openSheet('ayuda')
    api = userMessage(useStore.getState(), texto.trim(), api)
    c = { ...c, api, msgs: [...c.msgs, { id: uid(), rol: 'user', texto: texto.trim() }] }
    saveChat(c)
    setTxt('')
    await run(c, api)
  }

  const decide = async (m: ChatMsg, aplicar: boolean) => {
    const p = m.propuesta!
    const c = current()
    const sel = edit[m.id]
    const acciones = sel ? p.acciones.filter((_, i) => sel[i]) : p.acciones
    let msgs = c.msgs
    let resultado = 'Constantino descartó la propuesta.'
    if (aplicar && acciones.length) {
      const st = useStore.getState()
      const errores = acciones.map((a) => validarAccion(st, a)).filter(Boolean)
      if (errores.length) { setErr(`No se puede aplicar: ${errores.join(' · ')}`); return }
      const { patch, cambio } = aplicarAcciones(st, acciones, p.resumen, 'coach')
      st.set(() => patch)
      msgs = msgs.map((x) => (x.id === m.id ? { ...x, propuesta: { ...p, acciones, estado: 'aplicada', cambioId: cambio.id } } : x))
      resultado = `Aplicada${sel ? ` (eligió ${acciones.length} de ${p.acciones.length} acciones)` : ''}.`
      ui.notify(`${acciones.length} cambio${acciones.length > 1 ? 's' : ''} aplicado${acciones.length > 1 ? 's' : ''}`, () => { const r = revertirCambio(useStore.getState(), cambio.id); if (r) useStore.getState().set(() => r) })
    } else msgs = msgs.map((x) => (x.id === m.id ? { ...x, propuesta: { ...p, estado: 'descartada' } } : x))
    setEdit((e) => { const n = { ...e }; delete n[m.id]; return n })
    const api = resolverPropuesta(c.api as ApiMsg[], p.toolUseId, resultado)
    const nc = { ...c, msgs, api }
    saveChat(nc)
    await run(nc, api)
  }

  const revertir = (m: ChatMsg) => {
    const p = m.propuesta!
    const r = p.cambioId ? revertirCambio(useStore.getState(), p.cambioId) : null
    if (!r) return
    d.set(() => r)
    const c = current()
    saveChat({ ...c, msgs: c.msgs.map((x) => (x.id === m.id ? { ...x, propuesta: { ...p, estado: 'revertida' } } : x)) })
    ui.notify('Cambios revertidos', undefined, 'neutral')
  }

  const nueva = () => saveChat({ id: uid(), fecha: f, msgs: [], api: [] })
  const ag = agendaDe(d, f)
  const hs = habitsFor(d.habits, f)
  const exc = hs.filter((h) => excusaDe(d, f, h.id)).length

  return (
    <div className="view coach-page">
      <header className="coach-head">
        <div style={{ minWidth: 0 }}>
          <div className="eyebrow">Coach · {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'short' })}</div>
          <h1 className="h1">¿Qué cambió hoy?</h1>
        </div>
        <div className="top-actions">
          <button className="icon-btn" aria-label="Historial y memoria del coach" aria-pressed={showLog} onClick={() => setShowLog(!showLog)}><Icon name="history" size={18} /></button>
          <button className="icon-btn" aria-label="Nueva conversación" onClick={nueva}><Icon name="plus" size={18} /></button>
        </div>
      </header>

      <button className="plan-state" onClick={() => ui.go('hoy')} aria-label="Ver el plan de hoy">
        <span className="ps-dot" data-on={!!d.planDia[f]} />
        <span className="grow"><b>Tu día · {ag.length} obligatoria{ag.length === 1 ? '' : 's'} · {hs.length} hábitos</b><span className="cap">{ag.map((a) => `${a.hora || 'sin hora'} ${tituloBloque(a.que)}`).join(' · ') || 'Nada obligatorio'}{exc ? ` · ${exc} excusado${exc > 1 ? 's' : ''}` : ''}</span></span>
        <Icon name="chevron-right" size={16} />
      </button>

      {showLog && <CambiosLog />}
      {showLog && <MemoriaPanel />}

      {!d.settings.apiKey ? (
        <section className="panel" style={{ marginTop: 16 }}><Empty icon="sparkles" title="Conectá tu clave para hablar con el coach" action={<button className="btn btn-primary" onClick={() => ui.go('ajustes')}>Ir a Ajustes</button>}>El coach usa la API de Anthropic con tu clave, guardada solo en este dispositivo. Puede reorganizar tu agenda, excusar hábitos con motivo y registrar comidas, gastos y contactos.</Empty></section>
      ) : (
        <div className="chat" aria-live="polite">
          {!chat?.msgs.length && !busy && (
            <div className="chat-empty">
              <p className="lead">Contame qué cambió y reorganizo el día o la semana. Puedo mover bloques, excusar hábitos con motivo, definir tu prioridad y registrar comidas, gastos y contactos.</p>
            </div>
          )}
          {chat?.msgs.map((m) => <Msg key={m.id} m={m} d={d} sel={edit[m.id]} onSel={(v) => setEdit((e) => ({ ...e, [m.id]: v }))} onDecide={decide} onRevert={revertir} busy={busy} />)}
          {busy && <div className="thinking" aria-label="El coach está pensando"><span /></div>}
          {err && <p className="err" role="alert">{err}</p>}
          <div ref={end} />
        </div>
      )}

      {d.settings.apiKey && (
        <div className="composer-wrap">
          {!busy && <div className="chips sug">{sugerencias(d).map((s) => <button key={s} className="chip" onClick={() => send(s)}>{s}</button>)}</div>}
          <Composer value={txt} onChange={setTxt} onSend={() => send(txt)} busy={busy} lang={d.settings.lang} />
        </div>
      )}
    </div>
  )
}

function Msg({ m, d, sel, onSel, onDecide, onRevert, busy }: { m: ChatMsg; d: Data; sel?: boolean[]; onSel: (v: boolean[]) => void; onDecide: (m: ChatMsg, a: boolean) => void; onRevert: (m: ChatMsg) => void; busy: boolean }) {
  const [undone, setUndone] = useState(false)
  if (m.rol === 'user') return <div className="msg me"><p>{m.texto}</p></div>
  if (m.rol === 'coach') return <div className="msg coach"><p>{m.texto}</p></div>
  if (m.rol === 'error') return <p className="err">{m.texto}</p>
  if (m.rol === 'registro') {
    const u = m.undoKey && undos.get(m.undoKey)
    return (
      <div className={`msg reg ${undone ? 'undone' : ''}`}>
        <Icon name={undone ? 'undo' : 'circle-check'} size={16} /><span className="grow">{undone ? 'Deshecho: ' : ''}{m.texto}</span>
        {u && !undone && <button className="btn btn-ghost btn-sm" onClick={() => { u(); undos.delete(m.undoKey!); setUndone(true) }}>Deshacer</button>}
      </div>
    )
  }
  const p = m.propuesta!
  const editing = !!sel
  return (
    <section className={`proposal ${p.estado}`}>
      <div className="pr-head"><span className="eyebrow">{p.estado === 'pendiente' ? `Propuesta · ${p.acciones.length} cambio${p.acciones.length > 1 ? 's' : ''}` : p.estado === 'aplicada' ? 'Aplicada' : p.estado === 'revertida' ? 'Revertida' : 'Descartada'}</span></div>
      <p className="pr-sum">{p.resumen}</p>
      <ul className="pr-list">
        {p.acciones.map((a: Accion, i) => {
          const x = describir(d, a)
          return (
            <li key={i} className={editing && !sel![i] ? 'off' : ''}>
              {editing ? <input type="checkbox" aria-label={`Incluir: ${x.texto}`} checked={sel![i]} onChange={(e) => onSel(sel!.map((v, j) => (j === i ? e.target.checked : v)))} /> : <span className={`sg s${x.signo === '+' ? 'p' : x.signo === '−' ? 'm' : 't'}`}>{x.signo}</span>}
              <span className="grow">{x.texto}{a.fecha !== today() && <span className="cap"> · {a.fecha.slice(5).split('-').reverse().join('/')}</span>}</span>
            </li>
          )
        })}
      </ul>
      {p.estado === 'pendiente' && (
        <div className="row pr-actions">
          <button className="btn btn-primary" disabled={busy || (editing && !sel!.some(Boolean))} onClick={() => onDecide(m, true)}><Icon name="check" size={16} />Aplicar{editing ? ` ${sel!.filter(Boolean).length}` : ''}</button>
          <button className="btn btn-quiet" disabled={busy} onClick={() => onSel(editing ? undefined as unknown as boolean[] : p.acciones.map(() => true))}>{editing ? 'Listo' : 'Editar'}</button>
          <button className="btn btn-ghost" disabled={busy} onClick={() => onDecide(m, false)}>Descartar</button>
        </div>
      )}
      {p.estado === 'aplicada' && <div className="row pr-actions"><button className="btn btn-ghost btn-sm" onClick={() => onRevert(m)}><Icon name="rotate-ccw" size={14} />Revertir</button></div>}
    </section>
  )
}

/** Lo que el coach sabe de vos: visible, editable y borrable. */
function MemoriaPanel() {
  const d = useStore()
  const [t, setT] = useState('')
  const mem = d.memoria ?? []
  return (
    <section className="panel pad" style={{ marginTop: 12 }}>
      <div className="sec" style={{ margin: '0 0 8px' }}><h2 className="h2"><Icon name="brain" size={16} />Lo que el coach sabe de vos</h2><span className="cap">{mem.length}</span></div>
      <p className="cap" style={{ marginBottom: 10 }}>El coach lo usa en cada conversación. Borrá o corregí lo que no esté bien.</p>
      {mem.map((m) => (
        <div className="list-row" key={m.id}>
          <input className="grow mem-in" aria-label="Recuerdo" value={m.texto} onChange={(e) => d.set((s) => ({ memoria: s.memoria.map((x) => (x.id === m.id ? { ...x, texto: e.target.value, origen: 'vos' } : x)) }))} />
          <button className="icon-btn sm" aria-label="Borrar recuerdo" onClick={() => d.set((s) => ({ memoria: s.memoria.filter((x) => x.id !== m.id) }))}><Icon name="trash" size={15} /></button>
        </div>
      ))}
      <form className="row" style={{ flexWrap: 'nowrap', marginTop: 8 }} onSubmit={(e) => { e.preventDefault(); if (!t.trim()) return; d.set((s) => ({ memoria: [...(s.memoria ?? []), { id: uid(), texto: t.trim(), fecha: today(), origen: 'vos' }] })); setT('') }}>
        <input className="grow" aria-label="Agregar algo que el coach tenga que saber" placeholder="Algo que el coach tenga que saber…" value={t} onChange={(e) => setT(e.target.value)} />
        <button className="btn btn-quiet" disabled={!t.trim()}>Agregar</button>
      </form>
    </section>
  )
}

function CambiosLog() {
  const d = useStore()
  const ui = useUI()
  const list = d.cambios.slice(-15).reverse()
  return (
    <section className="panel pad" style={{ marginTop: 12 }}>
      <div className="sec" style={{ margin: '0 0 8px' }}><h2 className="h2"><Icon name="history" size={16} />Cambios aplicados</h2></div>
      {list.length === 0 ? <p className="cap">Todavía no hay cambios.</p> : list.map((c) => (
        <div className="list-row" key={c.id} style={{ opacity: c.revertido ? 0.55 : 1 }}>
          <span className="grow"><span style={{ display: 'block' }}>{c.resumen}</span><span className="cap">{new Date(c.creado).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} · {c.origen === 'coach' ? 'coach' : 'manual'} · {c.acciones.length} acción{c.acciones.length > 1 ? 'es' : ''}{c.revertido ? ' · revertido' : ''}</span></span>
          {!c.revertido && <button className="btn btn-ghost btn-sm" onClick={() => { const r = revertirCambio(d, c.id); if (r) { d.set(() => r); ui.notify('Cambios revertidos', undefined, 'neutral') } }}>Revertir</button>}
        </div>
      ))}
    </section>
  )
}

type SR = { lang: string; interimResults: boolean; onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void; onend: () => void; start: () => void; stop: () => void }
function Composer({ value, onChange, onSend, busy, lang }: { value: string; onChange: (s: string) => void; onSend: () => void; busy: boolean; lang: string }) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const [rec, setRec] = useState<SR | null>(null)
  const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR }
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition
  useEffect(() => { const t = ref.current; if (!t) return; t.style.height = 'auto'; t.style.height = `${Math.min(140, t.scrollHeight)}px` }, [value])
  const mic = () => {
    if (rec) { rec.stop(); return }
    if (!Ctor) return
    const r = new Ctor(); r.lang = lang === 'es' ? 'es-AR' : 'en-US'; r.interimResults = false
    r.onresult = (e) => onChange((value ? value + ' ' : '') + Array.from(e.results).map((x) => x[0].transcript).join(' '))
    r.onend = () => setRec(null); r.start(); setRec(r)
  }
  return (
    <form className="composer" onSubmit={(e) => { e.preventDefault(); onSend() }}>
      <textarea ref={ref} rows={1} aria-label="Mensaje para el coach" placeholder="Contale algo al coach…" value={value} onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !('ontouchstart' in window)) { e.preventDefault(); onSend() } }} />
      {Ctor && <button type="button" className="icon-btn" aria-label={rec ? 'Detener dictado' : 'Dictar'} aria-pressed={!!rec} onClick={mic}><Icon name={rec ? 'square' : 'mic'} size={18} /></button>}
      <button className="send" aria-label="Enviar" disabled={busy || !value.trim()}><Icon name="arrow-up" size={18} stroke={2.2} /></button>
    </form>
  )
}
