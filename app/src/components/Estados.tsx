import { useState } from 'react'
import { useStore } from '../lib/store'
import { useUI } from '../lib/ui'
import { addDays, fmtShort, today, uid } from '../lib/date'
import { compliance, diasSinRegistrar, esDiaDeVuelta, ESTADOS, estadosDe, VUELTA_XP } from '../lib/logic'
import { AREAS } from '../lib/seed'
import type { AreaId, TipoEstado } from '../lib/types'
import { Icon } from './Icon'

const DURACION: Record<TipoEstado, number> = { partido: 0, parciales: 6, lesion: 6, enfermo: 2, 'semana pesada': 5, viaje: 2 }
const areasTxt = (as: AreaId[]) => as.map((a) => AREAS.find((x) => x.id === a)?.nombre.toLowerCase()).filter(Boolean).join(', ')

/** Períodos planificados en los que ciertas áreas no cuentan: así un salto previsible no es una falta. */
export const EstadosPanel = () => {
  const d = useStore()
  const ui = useUI()
  const t = today()
  const [tipo, setTipo] = useState<TipoEstado | null>(null)
  const [desde, setDesde] = useState(t)
  const [hasta, setHasta] = useState(t)
  const [areas, setAreas] = useState<AreaId[]>([])
  const activos = (d.estados ?? []).filter((e) => e.hasta >= t).sort((a, b) => a.desde.localeCompare(b.desde))
  const elegir = (x: TipoEstado) => { setTipo(x); setAreas(ESTADOS[x].areas); setDesde(t); setHasta(addDays(t, DURACION[x])) }
  const guardar = () => {
    if (!tipo) return
    const e = { id: uid(), tipo, desde, hasta: hasta < desde ? desde : hasta, areas }
    d.set((s) => ({ estados: [...(s.estados ?? []), e] }))
    setTipo(null)
    ui.notify(`${ESTADOS[tipo].label}: ${areas.length ? `no cuentan ${areasTxt(areas)}` : 'guardado'}`, () => useStore.getState().set((s) => ({ estados: s.estados.filter((x) => x.id !== e.id) })))
  }
  return (
    <section className="panel pad" id="sec-estados">
      <div className="sec" style={{ margin: '0 0 12px' }}><h2 className="h2"><Icon name="calendar" size={16} />Semanas especiales</h2><span className="cap">{activos.length ? `${activos.length} activa${activos.length > 1 ? 's' : ''}` : 'ninguna'}</span></div>
      <p className="cap" style={{ marginBottom: 14 }}>Marcá de antemano lo que se viene: lo que no aplica esos días no cuenta como falta ni genera castigos. El partido de la agenda se aplica solo.</p>
      {activos.map((e) => (
        <div className="list-row" key={e.id}>
          <Icon name={ESTADOS[e.tipo].icon} size={15} />
          <span className="grow">{ESTADOS[e.tipo].label}<small className="cap" style={{ display: 'block' }}>{fmtShort(e.desde)}{e.hasta !== e.desde ? ` – ${fmtShort(e.hasta)}` : ''} · no cuentan {areasTxt(e.areas)}</small></span>
          <button className="icon-btn sm" aria-label={`Quitar ${ESTADOS[e.tipo].label}`} onClick={() => d.set((s) => ({ estados: s.estados.filter((x) => x.id !== e.id) }))}><Icon name="x" size={15} /></button>
        </div>
      ))}
      <div className="chips" style={{ flexWrap: 'wrap', marginTop: activos.length ? 12 : 0 }}>
        {(Object.keys(ESTADOS) as TipoEstado[]).filter((x) => x !== 'partido').map((x) => <button key={x} className="chip" aria-pressed={tipo === x} onClick={() => (tipo === x ? setTipo(null) : elegir(x))}><Icon name={ESTADOS[x].icon} size={13} />{ESTADOS[x].label}</button>)}
      </div>
      {tipo && (
        <div className="stack" style={{ gap: 12, marginTop: 14 }}>
          <p className="cap">{ESTADOS[tipo].hint}</p>
          <div className="form-grid">
            <div className="field"><label htmlFor="es-d">Desde</label><input id="es-d" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} /></div>
            <div className="field"><label htmlFor="es-h">Hasta</label><input id="es-h" type="date" value={hasta} min={desde} onChange={(e) => setHasta(e.target.value)} /></div>
          </div>
          <div className="field"><label>Áreas que no cuentan</label><div className="chips" style={{ flexWrap: 'wrap' }}>
            {AREAS.map((a) => <button key={a.id} className="chip" aria-pressed={areas.includes(a.id)} onClick={() => setAreas((x) => (x.includes(a.id) ? x.filter((y) => y !== a.id) : [...x, a.id]))}><Icon name={a.icon} size={13} />{a.nombre}</button>)}
          </div></div>
          <button className="btn btn-primary" onClick={guardar}>Guardar</button>
        </div>
      )}
    </section>
  )
}

/** En Hoy: el estado del día (si hay) y la bienvenida o el "nunca faltes dos veces". */
export const VueltaYEstado = () => {
  const d = useStore()
  const ui = useUI()
  const t = today()
  const est = estadosDe(d, t)
  const sin = diasSinRegistrar(d)
  const ayer = compliance(d, [addDays(t, -1)])
  const hoy = compliance(d, [t])
  const vuelta = esDiaDeVuelta(d, t)
  return (
    <>
      {est.map((e) => (
        <div key={e.id} className="estado-chip"><Icon name={ESTADOS[e.tipo].icon} size={15} /><span className="grow"><b>Hoy: {ESTADOS[e.tipo].label.toLowerCase()}</b> · no cuentan {areasTxt(e.areas)}</span></div>
      ))}
      {vuelta ? (
        <div className="vuelta ok"><Icon name="rotate-ccw" size={18} /><span className="grow"><b>Volviste. +{VUELTA_XP} XP</b><small>Después de un día flojo, hoy pasaste el 60 %. Esto es lo que más sostiene un hábito.</small></span></div>
      ) : sin >= 2 ? (
        <div className="vuelta"><Icon name="sun" size={18} /><span className="grow"><b>Qué bueno verte de nuevo</b><small>{sin} días sin registrar. No se cobra nada de eso: hoy con la versión mínima de cada hábito alcanza. Si llegás al 60 %, sumás +{VUELTA_XP} XP por volver.</small></span><button className="btn btn-quiet btn-sm" onClick={() => ui.go('habitos')}>Empezar</button></div>
      ) : ayer !== null && ayer < 0.5 && t > d.inicio && (hoy === null || hoy < 0.6) ? (
        <div className="vuelta"><Icon name="rotate-ccw" size={18} /><span className="grow"><b>Ayer fue flojo ({Math.round(ayer * 100)} %)</b><small>Un día suelto casi no afecta un hábito; dos seguidos sí. Hoy llegá al 60 % (la versión mínima vale) y sumás +{VUELTA_XP} XP.</small></span></div>
      ) : null}
    </>
  )
}
