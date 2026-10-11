import { useState } from 'react'
import { useStore } from '../lib/store'
import { last, portfolioReturn, weeklyCandles } from '../lib/logic'
import { diffDays, fmtShort, today, uid } from '../lib/date'
import { Bar, Card, Field } from '../components/ui'
import { BarC, Candles, PieC } from '../components/charts'
import type { MoneyMove } from '../lib/types'

const CATS_GASTO = ['Comida', 'Salidas', 'Ropa / estética', 'Gimnasio / suplementos', 'Transporte', 'Facultad', 'Tecnología / IA', 'Aporte a inversiones', 'Otros']
const CATS_INGRESO = ['Marmolería', 'Redes', 'Proyectos propios', 'Otros']

export default function Finanzas() {
  const d = useStore()
  const P = d.profile
  const ahorro = last(d.savings)?.valor ?? 0
  const rend = portfolioReturn(d)
  const diasRest = diffDays(P.ahorroFecha, today())
  const [snap, setSnap] = useState({ ahorro: '', portafolio: '' })
  const [mv, setMv] = useState<Omit<MoneyMove, 'id'>>({ fecha: today(), tipo: 'gasto', monto: 0, categoria: 'Comida' })
  const mes = today().slice(0, 7)
  const delMes = d.money.filter((m) => m.fecha.startsWith(mes))
  const gastos = CATS_GASTO.map((c) => ({ name: c, value: delMes.filter((m) => m.tipo === 'gasto' && m.categoria === c).reduce((a, m) => a + m.monto, 0) })).filter((x) => x.value > 0)
  const meses = [...new Set(d.money.map((m) => m.fecha.slice(0, 7)))].sort().slice(-6).map((m) => ({
    mes: m.slice(5),
    ingresos: d.money.filter((x) => x.fecha.startsWith(m) && x.tipo === 'ingreso').reduce((a, x) => a + x.monto, 0),
    gastos: d.money.filter((x) => x.fecha.startsWith(m) && x.tipo === 'gasto').reduce((a, x) => a + x.monto, 0),
  }))

  return (
    <>
      <div className="grid">
        <Card title="🎯 Ahorro → USD 5.000">
          <div className="big">USD {ahorro.toLocaleString('es-AR')}</div>
          <Bar value={ahorro / P.ahorroObjetivo} />
          <p className="small muted">Faltan USD {Math.max(0, P.ahorroObjetivo - ahorro).toLocaleString('es-AR')} en {diasRest} días → ~USD {Math.max(0, Math.ceil(((P.ahorroObjetivo - ahorro) / Math.max(1, diasRest)) * 7))} por semana.</p>
        </Card>
        <Card title="📈 Portafolio · 2.º semestre">
          <div className="big" style={{ color: rend === null ? undefined : rend >= 0 ? 'var(--good)' : 'var(--warn)' }}>{rend === null ? '—' : `${(rend * 100).toFixed(1)} %`}<span className="muted small"> / meta {P.rendimientoObjetivo} %</span></div>
          <Bar value={rend === null ? 0 : rend / (P.rendimientoObjetivo / 100)} />
          <p className="small muted">Desde {fmtShort(P.rendimientoDesde)} hasta {fmtShort(P.rendimientoHasta)} en USD. Cargá el valor del 1/7 como primer dato para medirlo bien. Los aportes (categoría "Aporte a inversiones") no cuentan como rendimiento.</p>
        </Card>
      </div>

      <Card title="✍️ Actualizar valores (USD)">
        <div className="row">
          <Field label="Ahorro total"><input type="number" value={snap.ahorro} onChange={(e) => setSnap({ ...snap, ahorro: e.target.value })} /></Field>
          <Field label="Valor del portafolio (Cocos + IOL)"><input type="number" value={snap.portafolio} onChange={(e) => setSnap({ ...snap, portafolio: e.target.value })} /></Field>
          <button className="btn primary" style={{ alignSelf: 'flex-end' }} onClick={() => {
            const f = today()
            d.set((s) => ({
              savings: snap.ahorro ? [...s.savings.filter((x) => x.fecha !== f), { fecha: f, valor: +snap.ahorro }] : s.savings,
              portfolio: snap.portafolio ? [...s.portfolio.filter((x) => x.fecha !== f), { fecha: f, valor: +snap.portafolio }] : s.portfolio,
            }))
            setSnap({ ahorro: '', portafolio: '' })
          }}>Guardar</button>
        </div>
        <details style={{ marginTop: 8 }}><summary className="small muted">Cargar un valor con fecha pasada (ej. 1/7)</summary>
          <PastValue />
        </details>
      </Card>

      <Card title="🕯️ Portafolio (velas semanales)"><Candles data={weeklyCandles(d.portfolio)} /></Card>
      <Card title="🕯️ Ahorro (velas semanales)"><Candles data={weeklyCandles(d.savings)} target={P.ahorroObjetivo} /></Card>

      <Card title="💸 Ingresos y gastos">
        <div className="row">
          <Field label="Tipo"><select value={mv.tipo} onChange={(e) => setMv({ ...mv, tipo: e.target.value as MoneyMove['tipo'], categoria: e.target.value === 'gasto' ? CATS_GASTO[0] : CATS_INGRESO[0] })}><option>gasto</option><option>ingreso</option></select></Field>
          <Field label="Monto (USD)"><input type="number" value={mv.monto || ''} onChange={(e) => setMv({ ...mv, monto: +e.target.value })} /></Field>
          <Field label="Categoría"><select value={mv.categoria} onChange={(e) => setMv({ ...mv, categoria: e.target.value })}>{(mv.tipo === 'gasto' ? CATS_GASTO : CATS_INGRESO).map((c) => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Nota"><input value={mv.nota ?? ''} onChange={(e) => setMv({ ...mv, nota: e.target.value })} /></Field>
          <button className="btn primary" style={{ alignSelf: 'flex-end' }} disabled={!mv.monto} onClick={() => { d.set((s) => ({ money: [...s.money, { id: uid(), ...mv }] })); setMv({ ...mv, monto: 0, nota: '' }) }}>+</button>
        </div>
        {gastos.length > 0 && <><h3>Gastos del mes</h3><PieC data={gastos} /></>}
        {meses.length > 0 && <><h3>Ingresos vs. gastos</h3><BarC data={meses} x="mes" ys={[{ key: 'ingresos', color: '#4ade80' }, { key: 'gastos', color: '#f87171' }]} /></>}
        <table><tbody>
          {d.money.slice().sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 10).map((m) => (
            <tr key={m.id}><td>{fmtShort(m.fecha)}</td><td>{m.categoria}</td><td style={{ color: m.tipo === 'gasto' ? 'var(--warn)' : 'var(--good)' }}>{m.tipo === 'gasto' ? '−' : '+'}{m.monto}</td><td className="muted">{m.nota}</td>
              <td><button className="btn sm ghost" onClick={() => d.set((s) => ({ money: s.money.filter((x) => x.id !== m.id) }))}>✕</button></td></tr>
          ))}
        </tbody></table>
      </Card>
    </>
  )
}

function PastValue() {
  const d = useStore()
  const [v, setV] = useState({ fecha: '2026-07-01', serie: 'portfolio' as 'portfolio' | 'savings', valor: '' })
  return (
    <div className="row" style={{ marginTop: 8 }}>
      <Field label="Fecha"><input type="date" value={v.fecha} onChange={(e) => setV({ ...v, fecha: e.target.value })} /></Field>
      <Field label="Serie"><select value={v.serie} onChange={(e) => setV({ ...v, serie: e.target.value as typeof v.serie })}><option value="portfolio">Portafolio</option><option value="savings">Ahorro</option></select></Field>
      <Field label="Valor USD"><input type="number" value={v.valor} onChange={(e) => setV({ ...v, valor: e.target.value })} /></Field>
      <button className="btn" style={{ alignSelf: 'flex-end' }} disabled={!v.valor} onClick={() => { d.set((s) => ({ [v.serie]: [...s[v.serie].filter((x) => x.fecha !== v.fecha), { fecha: v.fecha, valor: +v.valor }] })); setV({ ...v, valor: '' }) }}>+</button>
    </div>
  )
}
