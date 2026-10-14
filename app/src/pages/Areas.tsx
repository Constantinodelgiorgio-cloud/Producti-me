import { useStore } from '../lib/store'
import { useUI, type Route } from '../lib/ui'
import { today, weekStart } from '../lib/date'
import { compliance, dayNutrition, last, portfolioReturn, weekSoFar } from '../lib/logic'
import { Icon } from '../components/Icon'
import { Bar } from '../components/ui'

/** Hub de áreas: cada una con su identidad, su dato principal y su progreso. */
export default function Areas() {
  const d = useStore()
  const ui = useUI()
  const t = today()
  const ws = weekStart(t)
  const semana = weekSoFar()
  const nut = dayNutrition(d, t)
  const entrenos = d.workouts.filter((w) => w.fecha >= ws).length
  const est = d.study.filter((s) => semana.includes(s.fecha)).reduce((a, s) => a + s.minutos, 0) / 60
  const conEv = d.study.filter((s) => semana.includes(s.fecha) && s.tipo !== 'facultad')
  const mes = t.slice(0, 7)
  const gastoMes = d.money.filter((m) => m.fecha.startsWith(mes) && m.tipo === 'gasto' && (m.moneda ?? 'ARS') === 'ARS').reduce((a, m) => a + m.monto, 0)
  const ahorro = last(d.savings)?.valor ?? 0
  const rend = portfolioReturn(d)
  const juntadas = d.social.filter((s) => s.fecha >= ws && s.tipo === 'juntada').length
  const contactos = d.social.filter((s) => s.fecha >= ws).length
  const diario = d.journal.filter((j) => j.fecha >= ws).length
  const cuerpoSem = (d.cuerpo ?? []).filter((c) => c.fecha >= ws)
  const recup = cuerpoSem.filter((c) => c.tipo === 'respiracion' || c.tipo === 'estiramiento').reduce((a, c) => a + c.minutos, 0)
  const cardio = cuerpoSem.filter((c) => c.tipo === 'cardio' || c.tipo === 'caminata').reduce((a, c) => a + c.minutos, 0)
  const pasosHoy = d.pasos?.[t]

  const cards: { r: Route; wide?: boolean; s: string; icon: string; name: string; big: string; unit: string; foot: string; p: number }[] = [
    { r: 'fisico', s: 'fisico', icon: 'dumbbell', name: 'Físico', big: String(entrenos), unit: entrenos === 1 ? 'entrenamiento' : 'entrenamientos', foot: `${Math.round(nut.prot)} / ${d.profile.protObjetivo} g de proteína hoy`, p: compliance(d, semana, 'fisico') ?? 0 },
    { r: 'estudio', s: 'estudio', icon: 'book-open', name: 'Estudio', big: est.toFixed(1).replace('.', ','), unit: 'h esta semana', foot: conEv.length ? `${conEv.filter((x) => x.evidencia).length} de ${conEv.length} sesiones con evidencia` : 'Facultad, inglés, lectura, IA y programación', p: compliance(d, semana, 'estudio') ?? 0 },
    { r: 'finanzas', s: 'finanzas', icon: 'wallet', name: 'Finanzas', big: `$ ${Math.round(gastoMes).toLocaleString('es-AR')}`, unit: 'gastado este mes', foot: `Ahorro USD ${ahorro.toLocaleString('es-AR')}${rend !== null ? ` · portafolio ${rend >= 0 ? '+' : '−'}${Math.abs(rend * 100).toFixed(1).replace('.', ',')} %` : ''}`, p: Math.min(1, ahorro / d.profile.ahorroObjetivo) },
    { r: 'vida', s: 'vida', icon: 'users', name: 'Vida', big: `${juntadas}`, unit: juntadas === 1 ? 'juntada' : 'juntadas', foot: `${contactos} contactos · ${diario} entradas de diario esta semana`, p: Math.min(1, (Math.min(juntadas, 1) + Math.min(contactos, 4) / 4) / 2) },
    { r: 'cuerpo', wide: true, s: 'cuerpo', icon: 'wind', name: 'Cuerpo', big: String(recup), unit: 'min de recuperación', foot: `Respirar, estirar, pasos y cardio suave · ${cardio} min de cardio${pasosHoy ? ` · ${pasosHoy.toLocaleString('es-AR')} pasos hoy` : ''}`, p: Math.min(1, cardio / (d.profile.cardioObjetivo ?? 150)) },
  ]
  return (
    <div className="view">
      <header className="top"><div><div className="eyebrow">Tu vida por áreas</div><h1 className="h1 display">Áreas</h1></div></header>
      <div className="area-grid">
        {cards.map((c) => (
          <button key={c.r} className={`area-card ${c.wide ? 'wide' : ''}`} data-s={c.s} onClick={() => ui.go(c.r)} style={{ ['--p' as string]: c.p }}>
            <span className="ac-top"><span className="ac-ic"><Icon name={c.icon} size={20} /></span><span className="ac-name">{c.name}</span><Icon name="arrow-right" size={16} className="ac-go" /></span>
            <span className="ac-val"><span className="val-l">{c.big}</span><span className="unit">{c.unit}</span></span>
            <Bar value={c.p} />
            <span className="cap">{c.foot}</span>
          </button>
        ))}
      </div>
      <div className="panel" style={{ marginTop: 22 }}>
        {([['comida', 'utensils', 'Comida', `${Math.round(nut.kcal).toLocaleString('es-AR')} kcal hoy`], ['revision', 'calendar-check', 'Revisión semanal', d.reviews.some((r) => r.semana === ws) ? 'hecha esta semana' : 'los domingos'], ['ajustes', 'settings', 'Ajustes', 'metas, coach, correo y datos']] as [Route, string, string, string][]).map(([r, i, n, s]) => (
          <button key={r} className="hub-row" onClick={() => ui.go(r)}><Icon name={i} size={18} /><span className="grow">{n}<small>{s}</small></span><Icon name="chevron-right" size={16} /></button>
        ))}
      </div>
    </div>
  )
}
