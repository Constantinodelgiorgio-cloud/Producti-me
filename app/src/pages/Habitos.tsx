import { useState } from 'react'
import { useStore } from '../lib/store'
import { compliance, MEDAL_ICON, weekMedals } from '../lib/logic'
import { addDays, fmtShort, today, uid, weekDays, weekStart } from '../lib/date'
import { AREAS } from '../lib/seed'
import { Bar, Card, Field } from '../components/ui'
import { HabitList } from '../components/HabitList'
import { BarC } from '../components/charts'
import { useT } from '../lib/i18n'
import type { AreaId, Habit } from '../lib/types'

const DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export default function Habitos() {
  const d = useStore()
  const t = useT()
  const [fecha, setFecha] = useState(today())
  const [edit, setEdit] = useState(false)
  const ws = weekStart(fecha)
  const wm = weekMedals(d, ws)
  const chart = weekDays(ws).map((f, i) => ({ dia: DIAS[i], pct: Math.round((compliance(d, [f]) ?? 0) * 100) }))
  const pendientes = d.penalties.filter((p) => !p.hecho)

  return (
    <>
      <Card title={`🏆 ${t('podio')}`} right={<span className="small muted">desde el {fmtShort(ws)}</span>}>
        <div className="podium">
          {AREAS.map((a) => {
            const v = wm.areas[a.id]
            return (
              <div className="p" key={a.id}>
                <div className="row"><span>{a.emoji} {a.nombre}</span><span className="grow" /><b>{v ? MEDAL_ICON[v.m] : '—'}</b></div>
                <Bar value={v?.c ?? 0} color={v?.m === 'malo' ? 'var(--warn)' : undefined} />
              </div>
            )
          })}
        </div>
        <p className="small muted">🥇 ≥ 90 % · 🥈 ≥ 75 % · 🥉 ≥ 60 % · 🟥 menos de 60 %. Un área en rojo al cerrar la semana genera un castigo; una semana global de oro da un permitido.</p>
        <BarC data={chart} x="dia" ys={[{ key: 'pct', name: '% cumplido' }]} height={160} />
      </Card>

      <Card title={<>✅ {fmtShort(fecha, d.settings.lang)}</>} right={
        <div className="row">
          <button className="btn sm" onClick={() => setFecha(addDays(fecha, -1))}>◀</button>
          <button className="btn sm" onClick={() => setFecha(today())}>Hoy</button>
          <button className="btn sm" disabled={fecha >= today()} onClick={() => setFecha(addDays(fecha, 1))}>▶</button>
        </div>}>
        <HabitList fecha={fecha} />
      </Card>

      <div className="grid">
        <Card title={`⚠️ ${t('castigos')}`}>
          {pendientes.length === 0 && <p className="muted small">Sin castigos pendientes. Seguí así.</p>}
          {d.penalties.slice().reverse().slice(0, 12).map((p) => (
            <div className="habit" key={p.id}>
              <div className="name">{p.tarea}<small>{p.motivo} · {fmtShort(p.fecha)}</small></div>
              {p.hecho ? <span className="chip">✓ cumplido</span> : <button className="btn sm primary" onClick={() => d.set((s) => ({ penalties: s.penalties.map((x) => x.id === p.id ? { ...x, hecho: true } : x) }))}>Cumplido</button>}
            </div>
          ))}
          <button className="btn sm" style={{ marginTop: 8 }} onClick={() => {
            const tarea = prompt('¿Qué castigo te ponés?')
            if (tarea) d.set((s) => ({ penalties: [...s.penalties, { id: uid(), fecha: today(), motivo: 'Autoimpuesto', tarea, hecho: false }] }))
          }}>+ Castigo manual</button>
        </Card>
        <Card title={`🍔 ${t('premios')}`}>
          {d.rewards.length === 0 && <p className="muted small">Se ganan con semanas de oro y con cada punto de grasa que bajás.</p>}
          {d.rewards.slice().reverse().slice(0, 12).map((r) => (
            <div className="habit" key={r.id}>
              <div className="name">{r.premio}<small>{r.motivo} · {fmtShort(r.fecha)}</small></div>
              {r.usado ? <span className="chip">usado</span> : (
                <button className="btn sm" disabled={pendientes.length > 0} title={pendientes.length ? 'Primero cumplí los castigos' : ''}
                  onClick={() => d.set((s) => ({ rewards: s.rewards.map((x) => x.id === r.id ? { ...x, usado: true } : x) }))}>Usar</button>
              )}
            </div>
          ))}
        </Card>
      </div>

      <Card title="⚙️ Mis hábitos" right={<button className="btn sm" onClick={() => setEdit(!edit)}>{edit ? 'Listo' : 'Editar'}</button>}>
        {!edit ? <p className="muted small">{d.habits.filter((h) => h.activo).length} hábitos activos. Tocá Editar para cambiarlos, agregar o pausar.</p> : (
          <>
            {d.habits.map((h) => <HabitEditor key={h.id} h={h} />)}
            <button className="btn primary" style={{ marginTop: 10 }} onClick={() => d.set((s) => ({ habits: [...s.habits, { id: uid(), area: 'mente', nombre: 'Nuevo hábito', dias: [], xp: 10, activo: true }] }))}>+ Hábito</button>
          </>
        )}
      </Card>
    </>
  )
}

function HabitEditor({ h }: { h: Habit }) {
  const d = useStore()
  const up = (p: Partial<Habit>) => d.set((s) => ({ habits: s.habits.map((x) => x.id === h.id ? { ...x, ...p } : x) }))
  return (
    <div className="card" style={{ background: 'var(--panel2)' }}>
      <div className="row">
        <Field label="Nombre"><input value={h.nombre} onChange={(e) => up({ nombre: e.target.value })} /></Field>
        <Field label="Área">
          <select value={h.area} onChange={(e) => up({ area: e.target.value as AreaId })}>
            {AREAS.map((a) => <option key={a.id} value={a.id}>{a.emoji} {a.nombre}</option>)}
          </select>
        </Field>
      </div>
      <div className="row" style={{ marginTop: 8 }}>
        <Field label="Versión mínima (días malos)"><input value={h.minimo ?? ''} onChange={(e) => up({ minimo: e.target.value || undefined })} /></Field>
        <Field label="XP"><input type="number" value={h.xp} onChange={(e) => up({ xp: Number(e.target.value) })} /></Field>
      </div>
      <div className="row" style={{ marginTop: 8 }}>
        {DIAS.map((l, i) => {
          const on = h.dias.length === 0 || h.dias.includes(i)
          return <button key={i} className={`btn sm ${on ? 'primary' : ''}`} onClick={() => {
            const base = h.dias.length === 0 ? [0, 1, 2, 3, 4, 5, 6] : h.dias
            const next = on ? base.filter((x) => x !== i) : [...base, i].sort()
            up({ dias: next.length === 7 ? [] : next })
          }}>{l}</button>
        })}
        <span className="grow" />
        <label className="small"><input type="checkbox" checked={h.activo} onChange={(e) => up({ activo: e.target.checked })} /> activo</label>
        <button className="btn sm ghost" onClick={() => confirm('¿Borrar hábito?') && d.set((s) => ({ habits: s.habits.filter((x) => x.id !== h.id) }))}>🗑️</button>
      </div>
    </div>
  )
}
