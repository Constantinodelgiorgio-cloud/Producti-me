import { useState } from 'react'
import { useStore } from '../lib/store'
import { useUI } from '../lib/ui'
import { today } from '../lib/date'
import { carga, fraseDiaPartido, listoParaHoy, respectoPartido } from '../lib/rendimiento'
import { Icon } from './Icon'

const COLOR = { verde: '#5FBF92', amarillo: '#E0A852', rojo: '#E5766F' } as const

/** "Listo para hoy": semáforo con los datos que lo explican y una frase accionable. */
export const ListoCard = ({ compacto }: { compacto?: boolean }) => {
  const d = useStore()
  const ui = useUI()
  const f = today()
  const L = listoParaHoy(d, f)
  const [abierto, setAbierto] = useState(!compacto)
  const ajustar = (a: 'mejor' | 'peor') => d.set((s) => ({ checkins: { ...s.checkins, [f]: { ...(s.checkins[f] ?? { fecha: f }), ajuste: s.checkins[f]?.ajuste === a ? undefined : a } } }))
  if (L.puntaje === null) return (
    <button className="listo vacio" onClick={() => ui.openSheet('checkin-manana')}>
      <Icon name="gauge" size={20} />
      <span className="grow"><b>Check-in de la mañana · 30 s</b><small>Sueño, energía, dolor y la prioridad del día. Con eso calculo qué tan listo estás para hoy.</small></span>
      <Icon name="chevron-right" size={16} />
    </button>
  )
  const c = COLOR[L.banda!]
  return (
    <section className={`listo b-${L.banda}`} style={{ ['--lc' as string]: c }} aria-label={`Listo para hoy: ${L.puntaje} de 100, ${L.titulo}`}>
      <button className="listo-top" onClick={() => setAbierto(!abierto)} aria-expanded={abierto}>
        <span className="listo-num"><svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="19" className="trk" /><circle cx="22" cy="22" r="19" className="val" strokeDasharray={119.4} strokeDashoffset={119.4 * (1 - L.puntaje / 100)} /></svg><b className="num">{L.puntaje}</b></span>
        <span className="grow"><span className="eyebrow">Listo para hoy{L.calibrando !== null ? ` · calibrando ${L.calibrando}/14` : ''}</span><b className="listo-t">{L.titulo}</b></span>
        <Icon name={abierto ? 'chevron-down' : 'chevron-right'} size={16} />
      </button>
      <p className="listo-frase">{L.frase}</p>
      {abierto && <>
        <div className="listo-comps">
          {L.componentes.map((x) => (
            <div key={x.k} className="lc"><span className="cap">{x.nombre}</span><span className="lc-bar"><i style={{ width: `${Math.max(3, x.v)}%`, background: x.v >= 70 ? COLOR.verde : x.v >= 50 ? COLOR.amarillo : COLOR.rojo }} /></span><small>{x.detalle}</small></div>
          ))}
        </div>
        <div className="row listo-aj">
          <span className="cap grow">¿No coincide con cómo te sentís?</span>
          <button className="chip" aria-pressed={d.checkins[f]?.ajuste === 'mejor'} onClick={() => ajustar('mejor')}>Me siento mejor</button>
          <button className="chip" aria-pressed={d.checkins[f]?.ajuste === 'peor'} onClick={() => ajustar('peor')}>Peor</button>
        </div>
        <p className="cap">Una ayuda para decidir, no un veredicto. Mirá la tendencia de la semana más que el número de un día.</p>
      </>}
    </section>
  )
}

/** Carga de entrenamiento (esfuerzo × minutos): la semana contra lo habitual, sin prometer prever lesiones. */
export const CargaCard = () => {
  const d = useStore()
  const C = carga(d)
  const md = respectoPartido(d)
  const max = Math.max(1, ...C.serie.map((x) => x.v))
  return (
    <section className="panel pad">
      <h2 className="h2"><Icon name="activity" size={16} />Carga de entrenamiento</h2>
      <div className="carga-kpis">
        <div><span className="cap">Últimos 7 días</span><span className="val-m num">{C.semana.toLocaleString('es-AR')}</span><small className="cap">esfuerzo × minutos</small></div>
        <div><span className="cap">Habitual</span><span className="val-m num">{C.habitual?.toLocaleString('es-AR') ?? '—'}</span><small className="cap">{C.habitual ? 'promedio semanal (28 días)' : `faltan ${Math.max(0, 14 - C.diasDatos)} días de datos`}</small></div>
        <div><span className="cap">Esta semana</span><span className={`carga-et ${C.ratio && C.ratio > 1.3 ? 'alta' : ''}`}>{C.etiqueta}</span>{C.monotonia !== null && <small className="cap">monotonía {C.monotonia.toFixed(1).replace('.', ',')}{C.monotonia > 2 ? ' · alta: variá intensidades' : ''}</small>}</div>
      </div>
      <div className="carga-bars" role="img" aria-label="Carga diaria de las últimas 2 semanas">
        {C.serie.map((x) => <span key={x.f} title={`${x.f}: ${x.v}`}><i style={{ height: `${Math.max(2, (x.v / max) * 100)}%` }} /></span>)}
      </div>
      {fraseDiaPartido(md) && <p className="body-2" style={{ marginTop: 14 }}>{fraseDiaPartido(md)}</p>}
      <p className="cap" style={{ marginTop: 10 }}>Una semana muy por encima de lo habitual se asoció en rugby con más lesiones; también cuatro semanas con muy poca carga. Subí de a poco.</p>
    </section>
  )
}
