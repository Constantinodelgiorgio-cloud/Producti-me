import { useRef } from 'react'
import { useStore } from '../lib/store'
import { useUI } from '../lib/ui'
import { excusaDe, semanaDe, streak } from '../lib/logic'
import { conHora } from '../lib/dia'
import { today } from '../lib/date'
import type { Habit, HabitState } from '../lib/types'
import { Icon, habitIcon } from './Icon'

/** Marca un hábito en una fecha y avisa con Deshacer. Tocar el mismo estado lo desmarca. */
export const useSetHabit = () => {
  const set = useStore((s) => s.set)
  const notify = useUI((s) => s.notify)
  return (h: Habit, fecha: string, st: HabitState, anchor?: HTMLElement | null) => {
    const prev = useStore.getState().habitLog[fecha]?.[h.id]
    const next = prev === st ? undefined : st
    const write = (v?: HabitState) => set((s) => {
      const day = { ...(s.habitLog[fecha] ?? {}) }
      if (v) day[h.id] = v
      else delete day[h.id]
      // La hora en que lo marcaste alimenta "Lo que va pasando" (solo hoy; un día pasado no tiene hora real).
      return { habitLog: { ...s.habitLog, [fecha]: day }, ...(fecha === today() ? { planDia: conHora(s, fecha, h.id, v === 'hecho' || v === 'minimo') } : {}) }
    })
    write(next)
    if (!next) return
    const gained = next === 'hecho' ? h.xp : next === 'minimo' ? h.xp / 2 : 0
    if (gained && anchor && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const p = document.createElement('span')
      p.className = 'xp-pop'
      p.textContent = `+${gained} XP`
      anchor.appendChild(p)
      setTimeout(() => p.remove(), 750)
    }
    notify(`${h.nombre} · ${next === 'hecho' ? 'hecho' : next === 'minimo' ? 'versión mínima (sostiene la racha)' : next === 'reserva' ? 'reserva de emergencia usada' : 'no hecho'}`, () => write(prev), next === 'no' || next === 'reserva' ? 'neutral' : 'ok')
  }
}

const CheckSvg = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>

export const CheckBox = ({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) => (
  <button type="button" className="check" aria-pressed={on} aria-label={label} onClick={onClick}><span><CheckSvg /></span></button>
)

/** Fila de hábito: tocar el círculo = hecho, ½ = mínimo; en móvil, deslizar → hecho, ← no hecho. */
export const HabitRow = ({ h, fecha, compact }: { h: Habit; fecha: string; compact?: boolean }) => {
  const st = useStore((s) => s.habitLog[fecha]?.[h.id])
  const s = useStore((x) => (compact ? 0 : streak(x, h.id)))
  const ex = useStore((x) => excusaDe(x, fecha, h.id))
  const openSheet = useUI((x) => x.openSheet)
  const setHabit = useSetHabit()
  const fg = useRef<HTMLDivElement>(null)
  const bg = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x0: number; dx: number; locked: boolean } | null>(null)
  const sem = useStore((x) => (h.porSemana ? semanaDe(x, h, fecha) : 0))
  const cls = st === 'hecho' ? 'is-done' : st === 'minimo' ? 'is-min' : st === 'no' ? 'is-no' : st === 'reserva' || ex ? 'is-ex' : ''
  const meta = st === 'reserva' ? 'reserva de emergencia' : ex && !st ? `excusado · ${ex.motivo}` : [h.porSemana && `${sem}/${h.porSemana} esta semana`, h.minimo && `mínimo ${h.minimo}`, s > 1 && `${s} ${h.porSemana ? 'semanas' : 'días'} seguid${h.porSemana ? 'as' : 'os'}`].filter(Boolean).join(' · ')

  const onDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' || (e.target as HTMLElement).closest('button')) return
    drag.current = { x0: e.clientX, dx: 0, locked: false }
    fg.current?.classList.add('dragging')
    fg.current?.parentElement?.classList.add('dragging')
  }
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d || !fg.current || !bg.current) return
    d.dx = e.clientX - d.x0
    if (!d.locked && Math.abs(d.dx) > 8) { d.locked = true; try { fg.current.setPointerCapture(e.pointerId) } catch { /* puntero sintético o ya liberado */ } }
    if (!d.locked) return
    const lim = Math.max(-110, Math.min(110, d.dx))
    fg.current.style.transform = `translateX(${lim}px)`
    bg.current.style.background = lim > 0 ? `rgba(142,168,255,${Math.min(1, lim / 90)})` : `rgba(58,63,73,${Math.min(1, -lim / 90)})`
  }
  const onUp = () => {
    const d = drag.current
    if (!d || !fg.current || !bg.current) return
    fg.current.classList.remove('dragging')
    fg.current.parentElement?.classList.remove('dragging')
    fg.current.style.transform = ''
    bg.current.style.background = ''
    if (d.dx > 80) setHabit(h, fecha, 'hecho', fg.current)
    else if (d.dx < -80) setHabit(h, fecha, 'no', fg.current)
    drag.current = null
  }

  return (
    <div className={`hrow ${cls}`}>
      <div className="hrow-bg" ref={bg} aria-hidden="true"><span className="l"><Icon name="check" size={15} />Hecho</span><span>No hecho<Icon name="x" size={15} /></span></div>
      <div className="hrow-fg" ref={fg} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
        <span className="h-ic"><Icon name={habitIcon(h)} size={16} /></span>
        <span className="h-txt"><span className="h-name">{h.nombre}</span>{meta && <span className="h-meta">{meta}</span>}</span>
        {h.minimo && !st && !compact && <button type="button" className="min-btn" aria-label={`Versión mínima: ${h.minimo}`} title={`Mínimo: ${h.minimo}`} onClick={() => setHabit(h, fecha, 'minimo', fg.current)}>½</button>}
        {!compact && <button type="button" className="min-btn" aria-label={`Más opciones: ${h.nombre}`} onClick={() => openSheet('habito', `${h.id}|${fecha}`)}><Icon name="ellipsis" size={14} /></button>}
        <span className="h-xp num">+{h.xp}</span>
        <CheckBox on={st === 'hecho'} label={`${st === 'hecho' ? 'Desmarcar' : 'Marcar como hecho'}: ${h.nombre}`} onClick={() => setHabit(h, fecha, 'hecho', fg.current)} />
      </div>
    </div>
  )
}
