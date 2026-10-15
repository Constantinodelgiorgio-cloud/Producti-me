import { useState } from 'react'
import { useStore, type Data } from '../lib/store'
import { useUI } from '../lib/ui'
import { dow, today, uid } from '../lib/date'
import { duracionBloque, excusaDe, habitsFor, hourFmt, nowMin, tituloBloque, toMin } from '../lib/logic'
import { conHora, eventosDelDia, flexiblesDe, obligatoriasDe, TIPOS_SUCESO, vencidas, type Obligatoria } from '../lib/dia'
import { ahoraHHMM } from '../lib/ayuno'
import { hayRiesgo } from '../lib/seguridad'
import type { AgendaItem, Habit, TipoSuceso } from '../lib/types'
import { Icon } from './Icon'
import { CheckBox, HabitRow } from './HabitRow'
import { Ring } from './ui'

const DIAS_LARGO = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábados', 'domingos']
/** Hábitos que van adentro de un bloque (entrenar dentro del gimnasio, marmolería dentro de su turno). */
const vinculados = (a: AgendaItem, hs: Habit[]) =>
  /gimnasio|rugby|partido|entren/i.test(a.que) ? hs.filter((h) => /entren/i.test(h.nombre))
  : /marmoler/i.test(a.que) ? hs.filter((h) => /marmoler/i.test(h.nombre)) : []
/** Cada hábito va al primer bloque pendiente que le corresponde (o al primero, si todos están marcados). */
const repartir = (d: Data, f: string): Map<string, Habit[]> => {
  const ags = obligatoriasDe(d, f).filter((o) => o.item)
  const hs = habitsFor(d.habits, f).filter((h) => !h.obligatorio)
  const out = new Map<string, Habit[]>()
  const usados = new Set<string>()
  for (const o of [...ags.filter((x) => !x.estado), ...ags.filter((x) => x.estado)])
    for (const h of vinculados(o.item!, hs)) if (!usados.has(h.id)) { usados.add(h.id); out.set(o.clave, [...(out.get(o.clave) ?? []), h]) }
  return out
}

/** Agenda de hoy editable: si todavía es la base del día, se copia para cambiar solo hoy. */
const editarHoy = (s: Data, f: string, fn: (ag: AgendaItem[]) => AgendaItem[]): Data['planDia'] => {
  const p = s.planDia[f] ?? {}
  const base = (p.agenda ?? s.profile.agenda[dow(f)] ?? []).map((x) => ({ ...x }))
  return { ...s.planDia, [f]: { ...p, agenda: fn(base) } }
}

/** Vista "El día": lo obligatorio (con o sin hora), lo flexible y lo que va pasando. Sin grilla de horarios. */
export function ElDia() {
  const d = useStore()
  const f = today()
  const obs = obligatoriasDe(d, f)
  const listas = obs.filter((o) => o.estado && o.estado !== 'no').length
  const tardes = vencidas(d, f, nowMin())
  return (
    <div className="dia-grid">
      <section className="panel ob-panel" aria-label="Obligatorias de hoy">
        <div className="ob-head">
          <Ring p={obs.length ? listas / obs.length : 0} size={40} sw={4} />
          <div className="grow"><span className="eyebrow">Obligatorias de hoy</span><div className="ob-count"><b className="num">{listas}</b> de {obs.length}</div></div>
        </div>
        {tardes.length > 0 && <p className="cap ob-aviso"><Icon name="clock" size={13} />{tardes.length === 1 ? `«${tardes[0].clave}» ya pasó su hora.` : `${tardes.length} ya pasaron su hora.`} Marcala, cambiale la hora o sacala de hoy: el día cambió, no pasa nada.</p>}
        <div className="ob-list">
          {obs.length === 0 && <p className="cap" style={{ padding: '6px 2px 10px' }}>Nada obligatorio hoy. Agregá lo que sí o sí tiene que pasar (con hora si la tiene).</p>}
          {obs.map((o) => o.item ? <ObRow key={o.clave} o={o} /> : <div key={o.clave} className="ob-hab"><HabitRow h={o.habito!} fecha={f} /></div>)}
        </div>
        <AgregarObligatoria />
      </section>
      <LoQuePasa />
      <CuandoPuedas />
    </div>
  )
}

function ObRow({ o }: { o: Obligatoria }) {
  const d = useStore()
  const ui = useUI()
  const f = today()
  const [menu, setMenu] = useState(false)
  const [hora, setHora] = useState(o.hora ?? '')
  const a = o.item!
  const hecho = o.estado === 'hecho'
  const now = nowMin()
  const cur = !!a.hora && !o.estado && toMin(a.hora) <= now && now < toMin(a.hora) + 60
  const hs = repartir(d, f).get(a.que) ?? []
  const marcar = (v?: 'hecho' | 'no') => {
    const prev = o.estado as 'hecho' | 'no' | undefined
    const write = (x?: 'hecho' | 'no') => d.set((s) => {
      const p = s.planDia[f] ?? {}
      const hechos = { ...(p.hechos ?? {}) }
      if (x) hechos[a.que] = x
      else delete hechos[a.que]
      const pd = conHora(s, f, `ob:${a.que}`, x === 'hecho')
      return { planDia: { ...pd, [f]: { ...pd[f], hechos } } }
    })
    write(v)
    if (v) ui.notify(v === 'hecho' ? `Hecho: ${a.que}` : `${a.que}: hoy no se hizo`, () => write(prev), v === 'hecho' ? 'ok' : 'neutral')
  }
  const cambiarHora = (h: string) => {
    d.set((s) => ({ planDia: editarHoy(s, f, (ag) => ag.map((x) => (x.que === a.que ? { ...x, hora: h } : x))) }))
    setMenu(false)
    ui.notify(h ? `${a.que} pasa a las ${h} (solo hoy)` : `${a.que} queda sin hora fija hoy`, undefined, 'neutral')
  }
  const quitar = () => {
    const antes = useStore.getState().planDia[f]
    d.set((s) => ({ planDia: editarHoy(s, f, (ag) => ag.filter((x) => x.que !== a.que)) }))
    ui.notify(`${a.que} sale de hoy`, () => useStore.getState().set((s) => ({ planDia: { ...s.planDia, [f]: antes ?? {} } })), 'neutral')
  }
  const base = (d.profile.agenda[dow(f)] ?? []).some((x) => x.que === a.que)
  const quitarSiempre = async () => {
    if (!(await ui.confirm({ title: `¿Sacar «${a.que}» de todos los ${DIAS_LARGO[dow(f)]}?`, body: 'Deja de aparecer como obligatoria ese día de la semana. Los días ya pasados no cambian.', confirm: 'Sacar' }))) return
    d.set((s) => ({
      profile: { ...s.profile, agenda: s.profile.agenda.map((ag, i) => (i === dow(f) ? ag.filter((x) => x.que !== a.que) : ag)) },
      planDia: s.planDia[f]?.agenda ? editarHoy(s, f, (ag) => ag.filter((x) => x.que !== a.que)) : s.planDia,
    }))
  }
  return (
    <div className={`ob ${hecho ? 'is-done' : o.estado === 'no' ? 'is-no' : ''} ${cur ? 'cur' : ''}`}>
      <div className="ob-main">
        <CheckBox on={hecho} label={`${hecho ? 'Desmarcar' : 'Marcar hecha'}: ${a.que}`} onClick={() => marcar(hecho ? undefined : 'hecho')} />
        <span className={`ob-hora mono ${a.hora ? '' : 'flex'}`}>{a.hora || 'sin hora'}{a.hora && duracionBloque(a) !== 60 && <small>{hourFmt(toMin(a.hora) + duracionBloque(a))}</small>}</span>
        <span className="grow ob-t"><span className="tt">{tituloBloque(a.que)}</span>{(o.estado === 'no' || cur) && <small>{o.estado === 'no' ? 'hoy no se hizo' : 'ahora'}</small>}</span>
        {a.intensidad && <span className={`int ${a.intensidad}`}>{a.intensidad}</span>}
        <button className="min-btn" aria-label={`Opciones: ${a.que}`} aria-expanded={menu} onClick={() => setMenu(!menu)}><Icon name="ellipsis" size={14} /></button>
      </div>
      {menu && (
        <div className="ob-menu">
          <label className="ob-time"><span className="cap">Hora de hoy</span><input type="time" value={hora} onChange={(e) => setHora(e.target.value)} /></label>
          <button className="btn btn-quiet btn-sm" disabled={hora === (a.hora ?? '')} onClick={() => cambiarHora(hora)}>Guardar hora</button>
          {a.hora && <button className="btn btn-ghost btn-sm" onClick={() => { setHora(''); cambiarHora('') }}>Sin hora</button>}
          <button className="btn btn-ghost btn-sm" onClick={() => { marcar(o.estado === 'no' ? undefined : 'no'); setMenu(false) }}>{o.estado === 'no' ? 'Volver a pendiente' : 'Hoy no se hizo'}</button>
          <button className="btn btn-ghost btn-sm" onClick={quitar}>Sacar de hoy</button>
          {base && <button className="btn btn-ghost btn-sm" onClick={quitarSiempre}>Sacar de todos los {DIAS_LARGO[dow(f)]}</button>}
        </div>
      )}
      {hs.length > 0 && <div className="hlist in-blk">{hs.map((h) => <HabitRow key={h.id} h={h} fecha={f} compact />)}</div>}
    </div>
  )
}

function AgregarObligatoria() {
  const d = useStore()
  const ui = useUI()
  const f = today()
  const [open, setOpen] = useState(false)
  const [que, setQue] = useState('')
  const [hora, setHora] = useState('')
  const [siempre, setSiempre] = useState(false)
  const add = () => {
    const t = que.trim()
    if (!t) return
    if (obligatoriasDe(d, f).some((o) => o.clave.toLowerCase() === t.toLowerCase())) { ui.notify('Ya está en las obligatorias de hoy', undefined, 'neutral'); return }
    const item: AgendaItem = { hora, que: t }
    d.set((s) => {
      const out: Partial<Data> = { planDia: s.planDia[f]?.agenda || !siempre ? editarHoy(s, f, (ag) => [...ag, item]) : s.planDia }
      if (siempre) out.profile = { ...s.profile, agenda: s.profile.agenda.map((ag, i) => (i === dow(f) ? [...ag, item] : ag)) }
      return out
    })
    ui.notify(siempre ? `${t}: obligatoria todos los ${DIAS_LARGO[dow(f)]}` : `${t}: obligatoria solo hoy`)
    setQue(''); setHora(''); setSiempre(false); setOpen(false)
  }
  if (!open) return <button className="link-row ob-add-btn" onClick={() => setOpen(true)}><Icon name="plus" size={16} />Agregar obligatoria</button>
  return (
    <form className="ob-add" onSubmit={(e) => { e.preventDefault(); add() }}>
      <input autoFocus aria-label="Qué tiene que pasar sí o sí" placeholder="Ej. Turno médico, entregar el TP, buscar a mi hermana" value={que} onChange={(e) => setQue(e.target.value)} />
      <div className="row ob-add-row">
        <label className="ob-time"><span className="cap">Hora (opcional)</span><input type="time" value={hora} onChange={(e) => setHora(e.target.value)} /></label>
        <div className="chips" role="group" aria-label="Para cuándo">
          <button type="button" className="chip" aria-pressed={!siempre} onClick={() => setSiempre(false)}>Solo hoy</button>
          <button type="button" className="chip" aria-pressed={siempre} onClick={() => setSiempre(true)}>Todos los {DIAS_LARGO[dow(f)]}</button>
        </div>
      </div>
      <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>Cancelar</button>
        <button className="btn btn-primary btn-sm" disabled={!que.trim()}>Agregar</button>
      </div>
    </form>
  )
}

/** Hábitos sin horario: se hacen cuando el día deja un hueco. Lo hecho baja. */
function CuandoPuedas() {
  const d = useStore()
  const ui = useUI()
  const f = today()
  const [verHechos, setVerHechos] = useState(false)
  const [todos, setTodos] = useState(false)
  const adentro = new Set([...repartir(d, f).values()].flat().map((h) => h.id))
  const hs = flexiblesDe(d, f).filter((h) => !adentro.has(h.id))
  if (!hs.length) return null
  const log = d.habitLog[f] ?? {}
  const pend = hs.filter((h) => !log[h.id] && !excusaDe(d, f, h.id))
  const hechos = hs.filter((h) => log[h.id] || excusaDe(d, f, h.id))
  return (
    <section className="flex-sec">
      <div className="sec" style={{ margin: '4px 2px 10px' }}><span className="eyebrow">Cuando puedas</span><button className="link-inline" onClick={() => ui.go('habitos')}>{hechos.length}/{hs.length}<Icon name="chevron-right" size={14} /></button></div>
      {pend.length ? <div className="hlist">{(todos ? pend : pend.slice(0, 6)).map((h) => <HabitRow key={h.id} h={h} fecha={f} />)}</div>
        : <p className="cap" style={{ margin: '0 2px' }}>Todo lo flexible de hoy está marcado.</p>}
      {pend.length > 6 && <button className="link-row" style={{ marginTop: 6 }} aria-expanded={todos} onClick={() => setTodos(!todos)}><Icon name={todos ? 'chevron-down' : 'chevron-right'} size={16} />{todos ? 'Ver menos' : `${pend.length - 6} más para hoy`}</button>}
      {hechos.length > 0 && <>
        <button className="link-row" style={{ marginTop: 6 }} aria-expanded={verHechos} onClick={() => setVerHechos(!verHechos)}><Icon name={verHechos ? 'chevron-down' : 'chevron-right'} size={16} />Marcados · {hechos.length}</button>
        {verHechos && <div className="hlist">{hechos.map((h) => <HabitRow key={h.id} h={h} fecha={f} />)}</div>}
      </>}
      <p className="cap" style={{ margin: '10px 2px 0' }}>Sin horario fijo: primero aparece lo que mejor encaja con este momento. Para que algo no se negocie, abrilo y marcalo como obligatorio.</p>
    </section>
  )
}

/** "Lo que va pasando": tus notas del momento y todo lo que registraste en la app, en orden. */
function LoQuePasa() {
  const d = useStore()
  const ui = useUI()
  const f = today()
  const [t, setT] = useState('')
  const [tipo, setTipo] = useState<TipoSuceso>('nota')
  const [todo, setTodo] = useState(false)
  const ev = eventosDelDia(d, f)
  const add = () => {
    const texto = t.trim()
    if (!texto) return
    const s = { id: uid(), fecha: f, hora: ahoraHHMM(), texto, tipo }
    d.set((st) => ({ sucesos: [...(st.sucesos ?? []), s] }))
    setT('')
    if (hayRiesgo(texto)) { ui.openSheet('ayuda'); return }
    if (tipo === 'imprevisto' || tipo === 'cambio') ui.notify('Anotado. Si te cambia el día, mové o sacá las obligatorias desde los tres puntos.', undefined, 'neutral')
    setTipo('nota')
  }
  const borrar = (id: string) => {
    const s = (d.sucesos ?? []).find((x) => x.id === id)
    d.set((st) => ({ sucesos: st.sucesos.filter((x) => x.id !== id) }))
    if (s) ui.notify('Nota borrada', () => useStore.getState().set((st) => ({ sucesos: [...st.sucesos, s] })), 'neutral')
  }
  const visibles = todo ? ev : ev.slice(0, 12)
  return (
    <section className="panel pasa">
      <div className="sec" style={{ margin: '0 0 12px' }}><span className="eyebrow">Lo que va pasando</span><span className="cap mono">{hourFmt(nowMin())}</span></div>
      <form className="pasa-in" onSubmit={(e) => { e.preventDefault(); add() }}>
        <input aria-label="¿Qué pasó?" placeholder="¿Qué pasó?" value={t} onChange={(e) => setT(e.target.value)} />
        <button className="cb-send" aria-label="Anotar" disabled={!t.trim()}><Icon name="arrow-up" size={16} stroke={2.2} /></button>
      </form>
      <div className="chips pasa-tipos" role="group" aria-label="Tipo">
        {(Object.keys(TIPOS_SUCESO) as TipoSuceso[]).map((k) => <button key={k} type="button" className="chip" aria-pressed={tipo === k} onClick={() => setTipo(k)}><Icon name={TIPOS_SUCESO[k].icon} size={13} />{TIPOS_SUCESO[k].label}</button>)}
      </div>
      {ev.length === 0 ? <p className="cap" style={{ marginTop: 14 }}>Todavía no pasó nada registrado. Lo que marques o cargues en la app (hábitos, comidas, gastos, entrenos) aparece acá solo, con su hora.</p> : (
        <ol className="feed">
          {visibles.map((e) => (
            <li key={e.id} className={`fe ${e.suceso ? `su-${e.suceso.tipo}` : ''}`}>
              <span className="fe-h mono">{e.hora ?? ''}</span>
              <span className="fe-ic"><Icon name={e.icon} size={14} /></span>
              {e.ir ? <button className="fe-t grow" onClick={() => ui.go(e.ir!)}><span className="tt">{e.texto}</span>{e.detalle && <small>{e.detalle}</small>}</button>
                : <span className="fe-t grow"><span className="tt">{e.texto}</span>{e.detalle && <small>{e.detalle}</small>}</span>}
              {e.suceso && <button className="min-btn" aria-label={`Borrar: ${e.texto}`} onClick={() => borrar(e.suceso!.id)}><Icon name="x" size={13} /></button>}
            </li>
          ))}
        </ol>
      )}
      {ev.length > 12 && <button className="link-row" onClick={() => setTodo(!todo)}><Icon name={todo ? 'chevron-down' : 'chevron-right'} size={16} />{todo ? 'Ver menos' : `Ver todo · ${ev.length}`}</button>}
    </section>
  )
}
