import { useStore } from '../lib/store'
import { useUI } from '../lib/ui'
import { calcularInsights, resumenMes } from '../lib/insights'
import { Icon } from './Icon'

/** Las 3 relaciones más confiables entre tus hábitos y cómo estás. */
export const InsightsCard = ({ ocultarVacio }: { ocultarVacio?: boolean }) => {
  const d = useStore()
  const ui = useUI()
  const I = calcularInsights(d)
  if (!I.lista.length && ocultarVacio) return null
  return (
    <section className="panel pad">
      <h2 className="h2"><Icon name="lightbulb" size={16} />Lo que tus datos sugieren</h2>
      {I.lista.length === 0 ? (
        <p className="body-2">{I.faltan > 0 ? `Con ${I.faltan} días más de hábitos y check-ins aparecen las primeras relaciones entre lo que hacés y cómo te sentís.` : 'Todavía no aparece ninguna relación clara. Seguí registrando: hacen falta al menos 7 días con y 7 sin cada hábito.'}</p>
      ) : I.lista.map((x) => (
        <div key={x.habito.id + x.resultado} className={`insight ${x.positivo ? 'pos' : 'neg'}`}>
          <span className="grow"><span className="ins-t">{x.frase}</span><small className="cap">{'★'.repeat(x.estrellas)}{'☆'.repeat(5 - x.estrellas)} confianza · {x.nCon} días con, {x.nSin} sin</small></span>
          <button className="btn btn-quiet btn-sm" onClick={() => { useUI.setState({ coachDraft: `Quiero probar durante 2 semanas: ${x.frase.replace(' Puede estar relacionado.', '')} ¿Cómo lo armamos sin sobrecargar el día?` }); ui.go('coach') }}>Probar 2 semanas</button>
        </div>
      ))}
      <p className="cap" style={{ marginTop: 10 }}>Relaciones, no causas: otras cosas pueden explicarlas. Un experimento de 2 semanas es la mejor forma de saber.</p>
    </section>
  )
}

/** Tu mes contra el anterior. */
export const MesCard = () => {
  const d = useStore()
  const R = resumenMes(d)
  const filas: [string, keyof typeof R.actual, string][] = [['Hábitos', 'habitos', '%'], ['Entrenamientos', 'entrenos', ''], ['Horas de estudio', 'estudio', 'h'], ['Entradas de diario', 'diario', ''], ['Contactos con amigos', 'contactos', ''], ['Minutos de recuperación', 'recuperacion', 'min']]
  const nombreMes = new Date(`${R.mes}-01T12:00`).toLocaleDateString('es-AR', { month: 'long' })
  return (
    <section className="panel pad">
      <h2 className="h2"><Icon name="calendar" size={16} />Tu {nombreMes}, contra tu mes anterior</h2>
      <div className="mes-grid">
        {filas.map(([n, k, u]) => {
          const a = R.actual[k]
          const b = R.anterior[k]
          const delta = a !== null && b !== null && b !== undefined ? (a as number) - (b as number) : null
          return (
            <div key={k} className="mes-c">
              <span className="cap">{n}</span>
              <span className="val-m num">{a ?? '—'}<span className="unit">{u}</span></span>
              <small className={`cap ${delta && delta > 0 ? 'up' : ''}`}>{delta === null ? 'sin mes anterior' : delta === 0 ? 'igual que el mes pasado' : `${delta > 0 ? '+' : '−'}${Math.abs(delta)}${u ? ` ${u}` : ''} vs. ${b}`}</small>
            </div>
          )
        })}
      </div>
    </section>
  )
}
