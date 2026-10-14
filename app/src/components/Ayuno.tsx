import { useEffect, useState } from 'react'
import { useStore } from '../lib/store'
import { useUI } from '../lib/ui'
import { estadoAyuno, fmtHoras, HITOS } from '../lib/ayuno'
import { Icon } from './Icon'

/** Contador de ayuno desde la última comida con hora, con hitos que tienen respaldo en humanos. */
export const AyunoCard = ({ compacto }: { compacto?: boolean }) => {
  const d = useStore()
  const ui = useUI()
  const [, tick] = useState(0)
  const [info, setInfo] = useState(false)
  useEffect(() => { const id = window.setInterval(() => tick((x) => x + 1), 30_000); return () => window.clearInterval(id) }, [])
  const E = estadoAyuno(d)
  if (!E) return compacto ? null : (
    <section className="panel pad ayuno"><h2 className="h2"><Icon name="hourglass" size={16} />Ayuno</h2><p className="cap">Cargá tus comidas con la hora y el contador arranca solo desde la última.</p></section>
  )
  const p = Math.min(1, E.horas / E.ideal.horas)
  const max = Math.max(E.ideal.horas, 16)
  const desde = `${String(E.desde.getHours()).padStart(2, '0')}:${String(E.desde.getMinutes()).padStart(2, '0')}`
  const ayer = E.desde.toDateString() !== new Date().toDateString()
  return (
    <section className={`panel pad ayuno ${compacto ? 'compacto' : ''}`} onClick={compacto ? () => ui.go('comida') : undefined} role={compacto ? 'button' : undefined}>
      <div className="ay-top">
        <span className="ay-ring" style={{ ['--p' as string]: p }}><b className="num">{fmtHoras(E.horas).replace(' min', '′')}</b></span>
        <span className="grow">
          <span className="eyebrow">Ayuno · desde las {desde}{ayer ? ' de ayer' : ''}</span>
          <b className="ay-t">{E.faltaIdeal > 0 ? `Faltan ${fmtHoras(E.faltaIdeal)} para tu ayuno ideal de hoy (${E.ideal.horas} h)` : `Llegaste a tu ayuno ideal de hoy (${E.ideal.horas} h)`}</b>
          {E.proximo && E.proximo.h !== E.ideal.horas && <small className="cap">Faltan {fmtHoras(E.proximo.h - E.horas)} para {E.proximo.titulo.toLowerCase()} ({E.proximo.h} h)</small>}
        </span>
      </div>
      {!compacto && <>
        <div className="ay-linea" aria-hidden="true">
          <i style={{ width: `${Math.min(100, (E.horas / max) * 100)}%` }} />
          {HITOS.filter((x) => x.h <= max).map((x) => <span key={x.h} className={`ay-h ${E.horas >= x.h ? 'ok' : ''} ${x.h === E.ideal.horas ? 'ideal' : ''}`} style={{ left: `${(x.h / max) * 100}%` }}><em>{x.h} h</em></span>)}
        </div>
        <p className="body-2" style={{ marginTop: 18 }}>{E.ideal.motivo}</p>
        <div className="ay-hitos">
          {HITOS.map((x) => (
            <div key={x.h} className={`ay-hito ${E.horas >= x.h ? 'ok' : ''}`}>
              <span className="num">{x.h} h</span>
              <span className="grow"><b>{x.titulo}</b><small>{x.detalle}</small><small className="fuente">{x.fuente}</small></span>
            </div>
          ))}
        </div>
        <button className="link-row" onClick={() => setInfo(!info)} aria-expanded={info}><Icon name={info ? 'chevron-down' : 'chevron-right'} size={15} />¿Y la autofagia?</button>
        {info && <div className="ay-info body-2">
          <p>No hay una hora demostrada en personas. La autofagia existe y aumenta con el ayuno, pero los tiempos que circulan (16, 24 o 72 h) vienen de estudios en ratones o en células; en humanos todavía no hay una forma confiable de medirla en sangre. Por eso la app no te muestra una cuenta regresiva: sería inventada.</p>
          <p>Lo que sí está medido en personas: comer en una ventana más corta no hace bajar más grasa que comer las mismas calorías en horario libre. El ayuno sirve si te ayuda a comer menos y a ordenar el día; el déficit y la proteína son lo que mueve la aguja.</p>
          <p className="cap">Fuentes: Bagherniya et al., Ageing Res Rev 2018 (revisión: la evidencia de autofagia por ayuno es mayormente animal) · Liu et al., NEJM 2022 · Lowe et al., JAMA Intern Med 2020.</p>
        </div>}
        <p className="cap" style={{ marginTop: 10 }}>Si entrenás en ayunas o te mareás, cortá el ayuno: rendir y recuperarte importa más que el número.</p>
      </>}
    </section>
  )
}
