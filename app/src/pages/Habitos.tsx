import { useState } from 'react'
import { useStore } from '../lib/store'
import { useUI } from '../lib/ui'
import { compliance, habitsFor, MOMENTOS, momentoDe, weekMedals } from '../lib/logic'
import { fmtShort, today, uid, weekDays, weekStart } from '../lib/date'
import { AREAS } from '../lib/seed'
import type { AreaId, Habit, Momento } from '../lib/types'
import { Icon } from '../components/Icon'
import { Bar, Card, Empty, Field, Medal, PageHead, Ring } from '../components/ui'
import { HabitRow } from '../components/HabitRow'

const DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export default function Habitos() {
  const d = useStore()
  const [fecha, setFecha] = useState(today())
  const [filter, setFilter] = useState<AreaId | 'todos'>('todos')
  const [showDone, setShowDone] = useState(false)
  const [edit, setEdit] = useState(false)
  const ws = weekStart(today())
  const days = weekDays(ws)
  const wm = weekMedals(d, ws)
  const list = habitsFor(d.habits, fecha).filter((h) => filter === 'todos' || h.area === filter)
  const log = d.habitLog[fecha] ?? {}
  const pend = list.filter((h) => !log[h.id])
  const marked = list.filter((h) => log[h.id])
  const areasHoy = AREAS.filter((a) => habitsFor(d.habits, fecha).some((h) => h.area === a.id))

  if (edit) return <Editor onClose={() => setEdit(false)} />

  return (
    <div className="view">
      <PageHead eyebrow={`Semana del ${fmtShort(ws)} al ${fmtShort(days[6])}`} title="Hábitos" right={<button className="btn btn-ghost btn-sm" onClick={() => setEdit(true)}><Icon name="pencil" size={15} />Editar</button>} />
      <div className="week" role="group" aria-label="Día de la semana">
        {days.map((f, i) => {
          const c = f >= d.inicio ? compliance(d, [f]) : null
          const fut = f > today()
          return (
            <button key={f} className="wday" aria-pressed={fecha === f} disabled={fut} onClick={() => setFecha(f)} aria-label={`${DIAS[i]} ${fmtShort(f)}${c !== null ? `, ${Math.round(c * 100)} %` : ''}`}>
              <span className="d">{DIAS[i]}</span>
              {c === null ? <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true"><circle cx="13" cy="13" r="10" fill="none" stroke="#24272E" strokeWidth="3" strokeDasharray="2 3" /></svg> : <Ring p={c} size={26} sw={3} />}
              <span className="num mono" style={{ fontSize: 10.5 }}>{c === null ? '—' : Math.round(c * 100)}</span>
            </button>
          )
        })}
      </div>

      <div className="two-col" style={{ marginTop: 16 }}>
        <div>
          <div className="chips" role="group" aria-label="Filtrar por área">
            <button className="chip" aria-pressed={filter === 'todos'} onClick={() => setFilter('todos')}>Todos</button>
            {areasHoy.map((a) => <button key={a.id} className="chip" aria-pressed={filter === a.id} onClick={() => setFilter(a.id)}>{a.nombre}</button>)}
          </div>
          <p className="cap" style={{ margin: '12px 2px' }}>
            {fecha === today() ? 'Hoy' : `Editando el ${fmtShort(fecha)}`} · deslizá a la derecha para marcar hecho y a la izquierda para no hecho. La versión mínima está en ½.
          </p>
          {pend.length ? <div className="hlist">{pend.map((h) => <HabitRow key={h.id} h={h} fecha={fecha} />)}</div>
            : <div className="panel"><Empty icon="check" title={list.length ? `Nada pendiente${filter !== 'todos' ? ` en ${AREAS.find((a) => a.id === filter)?.nombre}` : ''}` : 'Sin hábitos este día'}>{list.length ? 'Todo está marcado. Lo marcado queda abajo por si necesitás corregir algo.' : 'Ningún hábito activo aplica a este día.'}</Empty></div>}
          {marked.length > 0 && <>
            <button className="link-row" style={{ marginTop: 8 }} aria-expanded={showDone} onClick={() => setShowDone(!showDone)}><Icon name={showDone ? 'chevron-left' : 'chevron-right'} size={16} />Marcados · {marked.length}</button>
            {showDone && <div className="hlist">{marked.map((h) => <HabitRow key={h.id} h={h} fecha={fecha} />)}</div>}
          </>}
        </div>

        <aside className="stack">
          <div className="sec" style={{ marginTop: 0 }}><span className="eyebrow">Podio de la semana</span>{wm.globalMedal && <Medal m={wm.globalMedal} />}</div>
          {wm.global === null ? <div className="panel"><Empty icon="trophy" title="Las medallas empiezan con tu primer registro">Cada área recibe Oro (90 %), Plata (75 %), Bronce (60 %) o Bajo meta. Solo cuentan los días desde que empezaste a usar la app.</Empty></div> : (
            <div className="panel">
              {AREAS.map((a) => {
                const v = wm.areas[a.id]
                return (
                  <div className="area-row" key={a.id}>
                    <Icon name={a.icon} size={16} /><span>{a.nombre}</span>
                    <Bar value={v?.c ?? 0} tone="neutral" />
                    <span className="row" style={{ gap: 10, justifyContent: 'flex-end', flexWrap: 'nowrap' }}>{v && <span className="pct">{Math.round(v.c * 100)} %</span>}<Medal m={v?.m} /></span>
                  </div>
                )
              })}
            </div>
          )}
          <Penalties />
        </aside>
      </div>
    </div>
  )
}

function Penalties() {
  const d = useStore()
  const ui = useUI()
  const [nuevo, setNuevo] = useState('')
  const pend = d.penalties.filter((p) => !p.hecho)
  const rewards = d.rewards.filter((r) => !r.usado)
  return (
    <Card title="Castigos y permitidos" icon="flame">
      {pend.length === 0 && <p className="body-2">Sin castigos pendientes.</p>}
      {pend.map((p) => (
        <div className="attn-row" style={{ padding: '10px 0' }} key={p.id}>
          <span className="sev warn" aria-hidden="true" />
          <span className="grow"><span style={{ display: 'block' }}>{p.tarea}</span><span className="cap">{p.motivo} · {fmtShort(p.fecha)}</span></span>
          <button className="btn btn-quiet btn-sm" onClick={() => { d.set((s) => ({ penalties: s.penalties.map((x) => x.id === p.id ? { ...x, hecho: true } : x) })); ui.notify('Castigo cumplido · +20 XP', () => d.set((s) => ({ penalties: s.penalties.map((x) => x.id === p.id ? { ...x, hecho: false } : x) }))) }}>Cumplido</button>
        </div>
      ))}
      <div className="sec" style={{ margin: '14px 0 6px' }}><span className="eyebrow">Permitidos</span><span className="cap">{pend.length ? 'bloqueados hasta cumplir' : `${rewards.length} disponibles`}</span></div>
      {rewards.length === 0 ? <p className="cap">Se ganan con semanas de Oro y con cada punto de grasa corporal que bajás.</p> : rewards.map((r) => (
        <div className="attn-row" style={{ padding: '10px 0' }} key={r.id}>
          <Icon name="gift" size={16} /><span className="grow"><span style={{ display: 'block' }}>{r.premio}</span><span className="cap">{r.motivo}</span></span>
          <button className="btn btn-quiet btn-sm" disabled={pend.length > 0} onClick={() => { d.set((s) => ({ rewards: s.rewards.map((x) => x.id === r.id ? { ...x, usado: true } : x) })); ui.notify('Permitido usado. Disfrutalo.', () => d.set((s) => ({ rewards: s.rewards.map((x) => x.id === r.id ? { ...x, usado: false } : x) }))) }}>Usar</button>
        </div>
      ))}
      <form className="row" style={{ marginTop: 12, flexWrap: 'nowrap' }} onSubmit={(e) => { e.preventDefault(); if (!nuevo.trim()) return; d.set((s) => ({ penalties: [...s.penalties, { id: uid(), fecha: today(), motivo: 'Autoimpuesto', tarea: nuevo.trim(), hecho: false }] })); setNuevo('') }}>
        <input className="grow" aria-label="Nuevo castigo" placeholder="Ponerme un castigo…" value={nuevo} onChange={(e) => setNuevo(e.target.value)} />
        <button className="btn btn-quiet" disabled={!nuevo.trim()}>Agregar</button>
      </form>
    </Card>
  )
}

function Editor({ onClose }: { onClose: () => void }) {
  const d = useStore()
  const ui = useUI()
  const add = () => d.set((s) => ({ habits: [...s.habits, { id: uid(), area: 'mente', nombre: 'Nuevo hábito', dias: [], xp: 10, activo: true }] }))
  return (
    <div className="view">
      <PageHead eyebrow="Configuración" title="Editar hábitos" right={<button className="btn btn-primary btn-sm" onClick={onClose}>Listo</button>} />
      <div className="stack">
        {d.habits.map((h) => <HabitEditor key={h.id} h={h} onDelete={async () => {
          if (await ui.confirm({ title: `¿Borrar "${h.nombre}"?`, body: 'Se borra el hábito. Los días ya registrados dejan de contar para las medallas.', confirm: 'Borrar', danger: true }))
            d.set((s) => ({ habits: s.habits.filter((x) => x.id !== h.id) }))
        }} />)}
        <button className="btn btn-quiet" onClick={add}><Icon name="plus" size={16} />Agregar hábito</button>
      </div>
    </div>
  )
}

function HabitEditor({ h, onDelete }: { h: Habit; onDelete: () => void }) {
  const d = useStore()
  const up = (p: Partial<Habit>) => d.set((s) => ({ habits: s.habits.map((x) => x.id === h.id ? { ...x, ...p } : x) }))
  return (
    <section className="panel editor" style={{ opacity: h.activo ? 1 : 0.6 }}>
      <div className="form-grid">
        <Field label="Nombre" id={`n-${h.id}`}><input id={`n-${h.id}`} value={h.nombre} onChange={(e) => up({ nombre: e.target.value })} /></Field>
        <Field label="Área" id={`a-${h.id}`}><select id={`a-${h.id}`} value={h.area} onChange={(e) => up({ area: e.target.value as AreaId })}>{AREAS.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}</select></Field>
        <Field label="Momento del día" id={`m-${h.id}`}><select id={`m-${h.id}`} value={momentoDe(h)} onChange={(e) => up({ momento: e.target.value as Momento })}>{MOMENTOS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}</select></Field>
        <Field label="Versión mínima" id={`v-${h.id}`}><input id={`v-${h.id}`} value={h.minimo ?? ''} placeholder="Para días malos" onChange={(e) => up({ minimo: e.target.value || undefined })} /></Field>
        <Field label="XP" id={`x-${h.id}`}><input id={`x-${h.id}`} type="number" inputMode="numeric" value={h.xp} onChange={(e) => up({ xp: Number(e.target.value) })} /></Field>
      </div>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="days" role="group" aria-label="Días en que aplica">
          {DIAS.map((l, i) => {
            const on = h.dias.length === 0 || h.dias.includes(i)
            return <button key={i} type="button" aria-pressed={on} onClick={() => {
              const base = h.dias.length === 0 ? [0, 1, 2, 3, 4, 5, 6] : h.dias
              const next = on ? base.filter((x) => x !== i) : [...base, i].sort()
              up({ dias: next.length === 7 ? [] : next })
            }}>{l}</button>
          })}
        </div>
        <div className="row">
          <label className="row cap" style={{ gap: 6 }}><input type="checkbox" checked={h.activo} onChange={(e) => up({ activo: e.target.checked })} />Activo</label>
          <button className="icon-btn sm" aria-label={`Borrar ${h.nombre}`} onClick={onDelete}><Icon name="trash" size={16} /></button>
        </div>
      </div>
    </section>
  )
}
