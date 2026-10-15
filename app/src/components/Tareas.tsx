import { useState } from 'react'
import { useStore, type Data } from '../lib/store'
import { useUI } from '../lib/ui'
import { addDays, dow, today, uid } from '../lib/date'
import { bedtimeFor, compliance, hourFmt, nowMin, planDelDia, toMin } from '../lib/logic'
import { conHora, obligatoriasDe, type Obligatoria } from '../lib/dia'
import type { Tarea } from '../lib/types'
import { Icon } from './Icon'
import { CheckBox } from './HabitRow'
import { Sheet } from './Sheets'

const fmtMin = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60}` : ''}` : `${m} min`)
export const tareasDe = (d: Pick<Data, 'tareas'>, f: string) => (d.tareas ?? []).filter((t) => !t.hecha && t.fecha && t.fecha <= f)
export const hechasHoy = (d: Pick<Data, 'tareas'>, f: string) => (d.tareas ?? []).filter((t) => t.hecha === f)

/** Minutos libres que quedan hoy: hasta la hora de dormir, sin bloques de agenda ni hábitos con horario pendientes. */
export const libresHoy = (d: Data) => {
  const f = today()
  const wake = toMin(d.checkins[f]?.horaDespertar ?? d.profile.despertar[dow(f)])
  const bedS = bedtimeFor(d.profile.despertar[dow(addDays(f, 1))], d.profile.suenoMin)
  const bed = toMin(bedS) < wake ? toMin(bedS) + 1440 : toMin(bedS)
  const ahora = Math.max(nowMin(), wake)
  const plan = planDelDia(d, f, wake, bed)
  const ocup = (a: number, b: number) => Math.max(0, Math.min(b, bed) - Math.max(a, ahora))
  const bloques = plan.bloques.reduce((a, x) => a + ocup(x.ini, x.fin), 0)
  const habitos = plan.slots.filter((s) => s.habitos.some((h) => !d.habitLog[f]?.[h.id])).reduce((a, x) => a + ocup(x.ini, x.fin), 0)
  return Math.max(0, bed - ahora - bloques - habitos)
}

/** Tareas de hoy con aviso de capacidad: planificar ~70 % del tiempo libre real. */
export const TareasHoy = () => {
  const d = useStore()
  const ui = useUI()
  const f = today()
  const [txt, setTxt] = useState('')
  const [min, setMin] = useState<number | undefined>(30)
  const list = tareasDe(d, f)
  const hechas = hechasHoy(d, f)
  const plan = list.reduce((a, t) => a + (t.minutos ?? 30), 0)
  const libres = libresHoy(d)
  const uso = libres ? plan / libres : plan ? 2 : 0
  const toggle = (t: Tarea) => {
    const prev = t.hecha
    d.set((s) => ({ tareas: s.tareas.map((x) => (x.id === t.id ? { ...x, hecha: prev ? undefined : f } : x)), planDia: conHora(s, f, `t:${t.id}`, !prev) }))
    if (!prev) ui.notify(`Hecho: ${t.texto}`, () => useStore.getState().set((s) => ({ tareas: s.tareas.map((x) => (x.id === t.id ? { ...x, hecha: undefined } : x)) })))
  }
  const add = () => {
    if (!txt.trim()) return
    d.set((s) => ({ tareas: [...(s.tareas ?? []), { id: uid(), texto: txt.trim(), fecha: f, creada: f, minutos: min }] }))
    setTxt('')
  }
  return (
    <section className="tareas">
      <div className="sec" style={{ margin: '4px 2px 10px' }}><span className="eyebrow">Tareas de hoy</span>{hechas.length + list.length > 0 && <span className="cap num">{hechas.length}/{hechas.length + list.length}</span>}</div>
      <div className="panel tareas-list">
        {list.map((t) => (
          <div key={t.id} className={`tarea ${t.dificil ? 'dificil' : ''}`}>
            <CheckBox on={false} label={`Marcar hecha: ${t.texto}`} onClick={() => toggle(t)} />
            <span className="grow"><span className="tt">{t.texto}</span>{(t.primerPaso || t.dificil || (t.pospuesta ?? 0) > 0) && <small>{[t.dificil && 'la difícil del día', t.primerPaso && `primer paso: ${t.primerPaso}`, (t.pospuesta ?? 0) > 0 && `pospuesta ${t.pospuesta} ${t.pospuesta === 1 ? 'vez' : 'veces'}`].filter(Boolean).join(' · ')}</small>}</span>
            <span className="cap num">{fmtMin(t.minutos ?? 30)}</span>
          </div>
        ))}
        {hechas.map((t) => (
          <div key={t.id} className="tarea done"><CheckBox on label={`Desmarcar: ${t.texto}`} onClick={() => toggle(t)} /><span className="grow tt">{t.texto}</span></div>
        ))}
        <form className="tarea-add" onSubmit={(e) => { e.preventDefault(); add() }}>
           <input aria-label="Nueva tarea para hoy" placeholder="Nueva tarea…" value={txt} onChange={(e) => setTxt(e.target.value)} />
          <select aria-label="Minutos estimados" value={min ?? ''} onChange={(e) => setMin(Number(e.target.value) || undefined)}>{[15, 30, 45, 60, 90, 120].map((m) => <option key={m} value={m}>{fmtMin(m)}</option>)}</select>
          <button className="btn btn-quiet btn-sm" disabled={!txt.trim()}><Icon name="plus" size={15} /></button>
        </form>
        {list.length > 0 && (
          <div className={`capacidad ${uso > 1 ? 'over' : uso > 0.8 ? 'warn' : ''}`}>
            <span className="cap-bar"><i style={{ width: `${Math.min(100, uso * 100)}%` }} /><b style={{ left: '70%' }} /></span>
            <span className="cap">{uso > 1 ? `No entra todo: ${fmtMin(plan)} planificado y te quedan ${fmtMin(libres)} libres. Pasá algo a mañana en el cierre.` : `${fmtMin(plan)} de ${fmtMin(libres)} libres hasta las ${hourFmt(toMin(bedtimeFor(d.profile.despertar[dow(addDays(f, 1))], d.profile.suenoMin)))}${uso > 0.8 ? ' · ajustado: lo ideal es ~70 %' : ''}`}</span>
          </div>
        )}
      </div>
    </section>
  )
}

/** Cierre del día (30 s): plan contra hecho, qué pasa con cada pendiente y la tarea difícil de mañana. */
export const CierreSheet = () => {
  const d = useStore()
  const ui = useUI()
  const f = today()
  const man = addDays(f, 1)
  const pend = tareasDe(d, f)
  const hechas = hechasHoy(d, f)
  const c = compliance(d, [f])
  const ci = d.checkins[f]
  const [dificil, setDificil] = useState(d.checkins[man]?.prioridad ?? '')
  const [paso, setPaso] = useState('')
  // La victoria se precarga con lo último que anotaste como "algo bueno" en Lo que va pasando.
  const [victoria, setVictoria] = useState(ci?.victoria ?? (d.sucesos ?? []).filter((x) => x.fecha === f && x.tipo === 'bien').at(-1)?.texto ?? '')
  const obs = obligatoriasDe(d, f).filter((o) => o.item)
  const obListas = obs.filter((o) => o.estado === 'hecho').length
  // Las obligatorias de "solo hoy" que quedaron pendientes: se pasan a mañana o se sueltan.
  const base = new Set((d.profile.agenda[dow(f)] ?? []).map((a) => a.que))
  const obPend = obs.filter((o) => !o.estado && !base.has(o.clave))
  const moverOb = (o: Obligatoria, a: 'manana' | 'soltar') => d.set((s) => {
    const hoy = s.planDia[f] ?? {}
    const out: Partial<Data> = { planDia: { ...s.planDia, [f]: { ...hoy, hechos: { ...(hoy.hechos ?? {}), [o.clave]: 'no' } } } }
    if (a === 'manana') {
      const pm = s.planDia[man] ?? {}
      const ag = pm.agenda ?? (s.profile.agenda[dow(man)] ?? []).map((x) => ({ ...x }))
      if (!ag.some((x) => x.que === o.clave)) out.planDia = { ...out.planDia, [man]: { ...pm, agenda: [...ag, { ...o.item! }] } }
    }
    return out
  })
  const mover = (t: Tarea, a: 'manana' | 'algun' | 'soltar') => d.set((s) => ({
    tareas: a === 'soltar' ? s.tareas.filter((x) => x.id !== t.id) : s.tareas.map((x) => (x.id === t.id ? { ...x, fecha: a === 'manana' ? man : undefined, pospuesta: (x.pospuesta ?? 0) + 1 } : x)),
  }))
  const cerrar = () => {
    d.set((s) => ({
      tareas: dificil.trim() ? [...s.tareas, { id: uid(), texto: dificil.trim(), fecha: man, creada: f, dificil: true, primerPaso: paso.trim() || undefined, minutos: 60 }] : s.tareas,
      checkins: {
        ...s.checkins,
        [f]: { ...(s.checkins[f] ?? { fecha: f }), cerrado: true, victoria: victoria.trim() || s.checkins[f]?.victoria },
        ...(dificil.trim() ? { [man]: { ...(s.checkins[man] ?? { fecha: man }), prioridad: dificil.trim() } } : {}),
      },
    }))
    ui.closeSheet()
    ui.notify('Día cerrado. Escribir lo de mañana antes de dormir ayuda a dormirte más rápido.')
  }
  return (
    <Sheet label="Cerrar el día">
      <div className="sheet-head"><h2>Cerrar el día</h2><span className="cap">≈ 30 s</span></div>
      <div className="stack" style={{ gap: 18 }}>
        <div className="cierre-res">
          <div><span className="val-m num">{c === null ? '—' : `${Math.round(c * 100)} %`}</span><small className="cap">hábitos</small></div>
          <div><span className="val-m num">{hechas.length}/{hechas.length + pend.length}</span><small className="cap">tareas</small></div>
          <div><span className="val-m">{ci?.prioridadCumplida === 'si' ? 'Sí' : ci?.prioridad ? 'Pendiente' : '—'}</span><small className="cap">prioridad</small></div>
          {obs.length > 0 && <div><span className="val-m num">{obListas}/{obs.length}</span><small className="cap">obligatorias</small></div>}
        </div>
        {obPend.length > 0 && <div className="field"><label>Obligatorias de hoy sin hacer</label>
          <div className="stack" style={{ gap: 8 }}>{obPend.map((o) => (
            <div key={o.clave} className="pend-row">
              <span className="grow">{o.clave}{o.hora && <small className="cap"> · {o.hora}</small>}</span>
              <div className="row" style={{ gap: 6, flexWrap: 'nowrap' }}>
                <button className="chip" onClick={() => moverOb(o, 'manana')}>Pasar a mañana</button>
                <button className="chip" onClick={() => moverOb(o, 'soltar')}>Soltar</button>
              </div>
            </div>
          ))}</div>
        </div>}
        {pend.length > 0 && <div className="field"><label>Lo que quedó pendiente</label>
          <div className="stack" style={{ gap: 8 }}>{pend.map((t) => (
            <div key={t.id} className="pend-row">
              <span className="grow">{t.texto}{(t.pospuesta ?? 0) >= 2 && <small className="warn-t">Ya la pasaste {t.pospuesta} veces: partila en un primer paso chico o soltala.</small>}</span>
              <div className="row" style={{ gap: 6, flexWrap: 'nowrap' }}>
                <button className="chip" onClick={() => mover(t, 'manana')}>Mañana</button>
                <button className="chip" onClick={() => mover(t, 'algun')}>Otro día</button>
                <button className="chip" onClick={() => mover(t, 'soltar')}>Soltar</button>
              </div>
            </div>
          ))}</div>
        </div>}
        <div className="field"><label htmlFor="ci-dif">La tarea difícil de mañana</label><input id="ci-dif" value={dificil} onChange={(e) => setDificil(e.target.value)} placeholder="Lo que más te cuesta: va primero" /></div>
        {dificil.trim() && <div className="field"><label htmlFor="ci-paso">Su primer paso concreto</label><input id="ci-paso" value={paso} onChange={(e) => setPaso(e.target.value)} placeholder="Ej. abrir el apunte de Costos en la página 40" /></div>}
        <div className="field"><label htmlFor="ci-vic">Una victoria de hoy (aunque sea chica)</label><input id="ci-vic" value={victoria} onChange={(e) => setVictoria(e.target.value)} placeholder="Algo que salió bien" /></div>
        <div className="row" style={{ flexWrap: 'nowrap' }}><button className="btn btn-ghost" onClick={ui.closeSheet}>Ahora no</button><button className="btn btn-primary grow" onClick={cerrar}>Cerrar el día</button></div>
      </div>
    </Sheet>
  )
}
