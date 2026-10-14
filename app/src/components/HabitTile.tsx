import { useRef, useState } from 'react'
import { useStore, type Data } from '../lib/store'
import { useUI } from '../lib/ui'
import { dayNutrition, excusaDe, fuerza, listoParaGraduar, RESERVAS_SEMANA, reservasUsadas, semanaDe, sleepHours, streak } from '../lib/logic'
import { aplicarAcciones, CATEGORIAS_EXCUSA, validarExcusa } from '../lib/actions'
import { today, uid } from '../lib/date'
import type { CategoriaExcusa, Habit } from '../lib/types'
import { HABIT_ICONS, Icon, habitIcon } from './Icon'
import { useSetHabit } from './HabitRow'
import { Sheet } from './Sheets'

const short = (n: string) => n.replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+\d+\s*(min|h)\b.*$/i, '').trim()

/** Progreso real del dato vinculado a un hábito (proteína, comidas, sueño, minutos de estudio). */
export const liveProgress = (d: Data, h: Habit, f: string): { p: number; label: string } | null => {
  const n = h.nombre.toLowerCase()
  if (/proteína/.test(n)) { const v = dayNutrition(d, f).prot; return { p: v / d.profile.protObjetivo, label: `${Math.round(v)}/${d.profile.protObjetivo} g` } }
  if (/registrar todas las comidas/.test(n)) { const c = d.meals.filter((m) => m.fecha === f).length; return { p: c / 4, label: `${c} comida${c === 1 ? '' : 's'}` } }
  if (/dormir/.test(n)) { const s = sleepHours(d.checkins[f]?.horaDormir, d.checkins[f]?.horaDespertar); return s === null ? null : { p: s / d.profile.suenoMin, label: `${s.toFixed(1).replace('.', ',')} h` } }
  const tipo = /facultad/.test(n) ? 'facultad' : /inglés/.test(n) ? 'ingles' : /\bia\b/.test(n) ? 'ia' : /lectura/.test(n) ? 'lectura' : /programaci/.test(n) ? 'programacion' : null
  if (tipo) {
    const meta = Number(n.match(/(\d+)\s*min/)?.[1] ?? 30)
    const min = d.study.filter((s) => s.fecha === f && s.tipo === tipo).reduce((a, s) => a + s.minutos, 0)
    return min ? { p: min / meta, label: `${min}/${meta} min` } : null
  }
  if (/registrar ingresos/.test(n)) { const c = d.money.filter((m) => m.fecha === f).length; return c ? { p: 1, label: `${c} mov.` } : null }
  return null
}

/** Tarjeta icónica: tocar = hecho; mantener presionado (o ⋯) = más opciones. */
export const HabitTile = ({ h, fecha, big }: { h: Habit; fecha: string; big?: boolean }) => {
  const d = useStore()
  const ui = useUI()
  const setHabit = useSetHabit()
  const st = d.habitLog[fecha]?.[h.id]
  const ex = excusaDe(d, fecha, h.id)
  const live = liveProgress(d, h, fecha)
  const s = streak(d, h.id)
  const ref = useRef<HTMLDivElement>(null)
  const timer = useRef<number | null>(null)
  const long = useRef(false)
  const sem = h.porSemana ? semanaDe(d, h, fecha) : 0
  const p = st === 'hecho' ? 1 : st === 'minimo' ? 0.5 : ex ? (ex.alternativa ? 0.5 : 0) : h.porSemana ? Math.min(1, sem / h.porSemana) : Math.min(1, live?.p ?? 0)
  const state = st === 'hecho' ? 'is-done' : st === 'minimo' ? 'is-min' : st === 'no' ? 'is-no' : st === 'reserva' || ex ? 'is-ex' : ''
  const C = 2 * Math.PI * 21

  const down = () => {
    long.current = false
    timer.current = window.setTimeout(() => { long.current = true; ui.openSheet('habito', `${h.id}|${fecha}`) }, 450)
  }
  const cancel = () => { if (timer.current) clearTimeout(timer.current); timer.current = null }
  const tap = () => { cancel(); if (long.current) return; if (ex && !st) { ui.openSheet('habito', `${h.id}|${fecha}`); return } setHabit(h, fecha, 'hecho', ref.current) }

  return (
    <div className={`htile ${state} ${big ? 'big' : ''}`} ref={ref}>
      <button className="htile-main" onPointerDown={down} onPointerUp={cancel} onPointerLeave={cancel} onPointerCancel={cancel} onClick={tap}
        onContextMenu={(e) => { e.preventDefault(); cancel(); ui.openSheet('habito', `${h.id}|${fecha}`) }}
        aria-label={`${h.nombre}${st ? `: ${st === 'hecho' ? 'hecho' : st === 'minimo' ? 'versión mínima' : 'no hecho'}` : ex ? ': excusado' : ''}. Tocá para marcar hecho; mantené presionado para más opciones.`} aria-pressed={st === 'hecho'}>
        <span className="ht-ring">
          <svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21" className="trk" /><circle cx="24" cy="24" r="21" className="val" strokeDasharray={C} strokeDashoffset={C * (1 - p)} /></svg>
          <span className="ht-ic">{st === 'hecho' ? <Icon name="check" size={20} stroke={2.4} /> : st === 'no' ? <Icon name="minus" size={18} /> : <Icon name={habitIcon(h)} size={20} />}</span>
        </span>
        <span className="ht-name">{short(h.nombre)}</span>
        <span className="ht-meta num">{st === 'reserva' ? 'reserva' : ex && !st ? 'excusado' : st === 'minimo' ? 'mínimo' : h.porSemana ? `${sem}/${h.porSemana} semana` : live ? live.label : `+${h.xp} XP`}</span>
        {s > 2 && <span className="ht-streak" title={`${s} días seguidos`}>{s}</span>}
      </button>
      <button className="ht-more" aria-label={`Más opciones: ${h.nombre}`} onClick={() => ui.openSheet('habito', `${h.id}|${fecha}`)}><Icon name="ellipsis" size={16} /></button>
    </div>
  )
}

/** Hoja de opciones de un hábito: estados, excusa fundamentada, ícono. */
export const HabitSheet = () => {
  const d = useStore()
  const ui = useUI()
  const setHabit = useSetHabit()
  const [id, fecha = today()] = (ui.sheetArg ?? '').split('|')
  const h = d.habits.find((x) => x.id === id)
  const [modo, setModo] = useState<'menu' | 'excusa' | 'icono' | 'aprender'>('menu')
  const [que, setQue] = useState('')
  const [distinto, setDistinto] = useState('')
  const [cat, setCat] = useState<CategoriaExcusa | ''>('')
  const [motivo, setMotivo] = useState('')
  const [alt, setAlt] = useState('')
  const [err, setErr] = useState('')
  if (!h) return null
  const st = d.habitLog[fecha]?.[h.id]
  const ex = excusaDe(d, fecha, h.id)
  const s = streak(d, h.id)
  const usadas = reservasUsadas(d, h.id, fecha)
  const F = fuerza(d, h)
  const graduar = listoParaGraduar(d, h)
  const mark = (v: 'hecho' | 'minimo' | 'no' | 'reserva') => {
    setHabit(h, fecha, v)
    // Después de un "no", una pregunta para aprender (no es una excusa y no cambia el puntaje).
    if (v === 'no' && st !== 'no') { setModo('aprender'); return }
    ui.closeSheet()
  }
  const guardarAprendizaje = () => {
    if (que.trim()) d.set((s0) => ({ aprendizajes: [...(s0.aprendizajes ?? []), { id: uid(), fecha, habitId: h.id, que: que.trim(), distinto: distinto.trim() || undefined }] }))
    ui.closeSheet()
    if (que.trim()) ui.notify('Anotado. Mañana es otra oportunidad: con la versión mínima alcanza.')
  }
  const excusar = () => {
    const e = validarExcusa({ motivo, categoria: cat || undefined })
    if (e) { setErr(e); return }
    const { patch, cambio } = aplicarAcciones(d, [{ tipo: 'habito_excusar', fecha, habito_id: h.id, motivo, categoria: cat as CategoriaExcusa, alternativa: alt || undefined }], `Excusa: ${h.nombre}`, 'manual')
    d.set(() => patch)
    ui.closeSheet()
    ui.notify(alt ? 'Excusa registrada · la alternativa cuenta como mínima' : 'Excusa registrada · no cuenta para las medallas', async () => {
      const { revertirCambio } = await import('../lib/actions')
      const p = revertirCambio(useStore.getState(), cambio.id); if (p) useStore.getState().set(() => p)
    })
  }
  const quitarExcusa = () => {
    d.set((s0) => { const p = { ...s0.planDia }; const day = { ...(p[fecha] ?? {}) }; const exs = { ...(day.excusas ?? {}) }; delete exs[h.id]; day.excusas = exs; p[fecha] = day; return { planDia: p } })
    ui.closeSheet()
  }
  return (
    <Sheet label={h.nombre}>
      <div className="sheet-head" style={{ alignItems: 'flex-start' }}>
        <div className="row" style={{ flexWrap: 'nowrap', gap: 12 }}>
          <span className="h-ic lg"><Icon name={habitIcon(h)} size={22} /></span>
          <div><h2>{h.nombre}</h2><span className="cap">{s > 0 ? `${s} ${h.porSemana ? (s === 1 ? 'semana cumplida' : 'semanas seguidas') : s === 1 ? 'día' : 'días seguidos'} · ` : ''}+{h.xp} XP{h.minimo ? ` · mínimo: ${h.minimo}` : ''}</span></div>
        </div>
      </div>
      <div className="h-stats">
        <div><span className="cap">Fuerza del hábito</span><span className="val-m num">{Math.round(F * 100)}<span className="unit">%</span></span><span className="fz-bar"><i style={{ width: `${F * 100}%` }} /></span></div>
        {h.porSemana ? <div><span className="cap">Esta semana</span><span className="val-m num">{semanaDe(d, h, fecha)}<span className="unit">/ {h.porSemana}</span></span></div>
          : <div><span className="cap">Reservas</span><span className="val-m num">{RESERVAS_SEMANA - usadas}<span className="unit">/ {RESERVAS_SEMANA} esta semana</span></span></div>}
      </div>
      {h.ancla && <p className="ancla"><Icon name="link" size={14} />{h.ancla}</p>}
      {modo === 'menu' && <div className="stack" style={{ gap: 8 }}>
        {ex && <div className="ex-box"><Icon name="shield-alert" size={16} /><span className="grow"><b>Excusado · {ex.categoria}</b><span className="cap">{ex.motivo}{ex.alternativa ? ` · alternativa: ${ex.alternativa}` : ''}</span></span><button className="btn btn-ghost btn-sm" onClick={quitarExcusa}>Quitar</button></div>}
        <div className="opt-grid">
          <button className={`opt ${st === 'hecho' ? 'on' : ''}`} onClick={() => mark('hecho')}><Icon name="check" />Hecho</button>
          <button className={`opt ${st === 'minimo' ? 'on' : ''}`} disabled={!h.minimo} onClick={() => mark('minimo')}><span className="half" />Versión mínima</button>
          <button className={`opt ${st === 'no' ? 'on' : ''}`} onClick={() => mark('no')}><Icon name="minus" />No hecho</button>
          <button className="opt" onClick={() => setModo('excusa')}><Icon name="shield-alert" />Excusar</button>
        </div>
        {!h.porSemana && <button className={`opt wide ${st === 'reserva' ? 'on' : ''}`} disabled={st !== 'reserva' && usadas >= RESERVAS_SEMANA} onClick={() => mark('reserva')}>
          <Icon name="pause" /><span className="grow">Usar una reserva de emergencia<small>{st === 'reserva' ? 'Tocá para quitarla' : usadas >= RESERVAS_SEMANA ? 'Ya usaste las 2 de esta semana' : `Quedan ${RESERVAS_SEMANA - usadas} esta semana · no corta la racha ni cuenta como falta`}</small></span>
        </button>}
        {graduar && <button className="opt wide" onClick={() => { d.set((s0) => ({ habits: s0.habits.map((x) => x.id === h.id ? { ...x, etapa: 'mantenimiento' } : x) })); ui.closeSheet(); ui.notify(`"${h.nombre}" pasó a mantenimiento: ya es parte de vos`) }}>
          <Icon name="trophy" /><span className="grow">Graduar este hábito<small>Fuerza {Math.round(F * 100)} % y más de 60 días: pasa a mantenimiento, con menos peso en tu día</small></span>
        </button>}
        <div className="link-row as-field">
          <Icon name="clock" size={16} /><label htmlFor="h-hora" className="grow">Hora fija en la agenda</label>
          <input id="h-hora" type="time" value={h.hora ?? ''} onChange={(e) => d.set((s0) => ({ habits: s0.habits.map((x) => x.id === h.id ? { ...x, hora: e.target.value || undefined } : x) }))} />
          {h.hora && <button className="btn btn-ghost btn-sm" onClick={() => d.set((s0) => ({ habits: s0.habits.map((x) => x.id === h.id ? { ...x, hora: undefined } : x) }))}>Automática</button>}
        </div>
        <button className="link-row" onClick={() => setModo('icono')}><Icon name="grid" size={16} />Cambiar ícono<Icon name="chevron-right" size={16} /></button>
      </div>}
      {modo === 'excusa' && <div className="stack" style={{ gap: 14 }}>
        <p className="body-2">Solo valen excusas fundamentadas y específicas: una causa externa, un compromiso real, salud o fuerza mayor. Quedarse dormido, no tener ganas u olvidarse no se excusan.</p>
        <div className="field"><label>Tipo de causa</label><div className="chips" style={{ flexWrap: 'wrap' }}>{CATEGORIAS_EXCUSA.map((c) => <button key={c} type="button" className="chip" aria-pressed={cat === c} onClick={() => { setCat(c); setErr('') }}>{c}</button>)}</div></div>
        <div className="field"><label htmlFor="ex-m">Qué pasó (específico)</label><textarea id="ex-m" rows={3} value={motivo} onChange={(e) => { setMotivo(e.target.value); setErr('') }} placeholder="Ej. No fui a la facultad porque tuve una reunión con proveedores de la marmolería" /></div>
        <div className="field"><label htmlFor="ex-a">¿Hiciste algo en su lugar? (cuenta como mínima)</label><input id="ex-a" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Ej. El gimnasio cerró, salí a correr 30 min" /></div>
        {err && <p className="err" role="alert">{err}</p>}
        <div className="row" style={{ flexWrap: 'nowrap' }}><button className="btn btn-ghost" onClick={() => setModo('menu')}>Volver</button><button className="btn btn-primary grow" onClick={excusar}>Registrar excusa</button></div>
      </div>}
      {modo === 'aprender' && <div className="stack" style={{ gap: 14 }}>
        <p className="body-2">No pasa nada: un día suelto casi no afecta un hábito. Lo que importa es no faltar dos veces seguidas. Para aprender, no para juzgarte:</p>
        <div className="field"><label htmlFor="ap-q">¿Qué se cruzó?</label><input id="ap-q" autoFocus value={que} onChange={(e) => setQue(e.target.value)} placeholder="Ej. salí tarde de la marmolería y llegué fundido" /></div>
        <div className="field"><label htmlFor="ap-d">¿Qué vas a hacer distinto la próxima vez que pase?</label><input id="ap-d" value={distinto} onChange={(e) => setDistinto(e.target.value)} placeholder={h.minimo ? `Ej. hacer solo la versión mínima: ${h.minimo}` : 'Ej. hacerlo antes de salir'} /></div>
        <div className="row" style={{ flexWrap: 'nowrap' }}><button className="btn btn-ghost" onClick={ui.closeSheet}>Omitir</button><button className="btn btn-primary grow" onClick={guardarAprendizaje}>Guardar</button></div>
      </div>}
      {modo === 'icono' && <div className="icon-pick">{HABIT_ICONS.map((n) => (
        <button key={n} aria-label={n} aria-pressed={habitIcon(h) === n} onClick={() => { d.set((s0) => ({ habits: s0.habits.map((x) => x.id === h.id ? { ...x, icono: n } : x) })); setModo('menu') }}><Icon name={n} size={20} /></button>
      ))}</div>}
    </Sheet>
  )
}
