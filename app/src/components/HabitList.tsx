import { useStore } from '../lib/store'
import { habitsFor, streak } from '../lib/logic'
import { AREAS } from '../lib/seed'
import type { HabitState } from '../lib/types'

export const HabitList = ({ fecha, area }: { fecha: string; area?: string }) => {
  const d = useStore()
  const list = habitsFor(d.habits, fecha).filter((h) => !area || h.area === area)
  const setState = (id: string, st: HabitState) =>
    d.set((s) => {
      const day = { ...(s.habitLog[fecha] ?? {}) }
      if (day[id] === st) delete day[id]
      else day[id] = st
      return { habitLog: { ...s.habitLog, [fecha]: day } }
    })
  if (list.length === 0) return <p className="muted small">No hay hábitos para este día.</p>
  return (
    <div>
      {list.map((h) => {
        const st = d.habitLog[fecha]?.[h.id]
        const s = streak(d, h.id)
        return (
          <div className="habit" key={h.id}>
            <span>{AREAS.find((a) => a.id === h.area)?.emoji}</span>
            <div className="name">
              {h.nombre}
              <small>{h.minimo ? `Mínimo: ${h.minimo} · ` : ''}+{h.xp} XP{s > 1 ? ` · 🔥 ${s}` : ''}</small>
            </div>
            <div className="tri">
              <button title="Hecho" className={st === 'hecho' ? 'on-hecho' : ''} onClick={() => setState(h.id, 'hecho')}>✓</button>
              {h.minimo && <button title="Versión mínima" className={st === 'minimo' ? 'on-minimo' : ''} onClick={() => setState(h.id, 'minimo')}>½</button>}
              <button title="No" className={st === 'no' ? 'on-no' : ''} onClick={() => setState(h.id, 'no')}>✕</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
