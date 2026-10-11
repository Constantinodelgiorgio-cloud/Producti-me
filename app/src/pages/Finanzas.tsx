import { useState } from 'react'
import { useStore } from '../lib/store'
import { useUI } from '../lib/ui'
import { last, portfolioReturn, weeklyCandles } from '../lib/logic'
import { diffDays, fmtShort, today, uid } from '../lib/date'
import type { MoneyMove } from '../lib/types'
import { Icon } from '../components/Icon'
import { Bar, Card, Field, PageHead, Seg } from '../components/ui'
import { BarC, Candles, PieC } from '../components/charts'
import { useScrollToSub } from '../components/useScrollTo'

const CATS_GASTO = ['Comida', 'Salidas', 'Ropa / estética', 'Gimnasio / suplementos', 'Transporte', 'Facultad', 'Tecnología / IA', 'Aporte a inversiones', 'Otros']
const CATS_INGRESO = ['Marmolería', 'Redes', 'Proyectos propios', 'Otros']
const usd = (n: number) => `USD ${Math.round(n).toLocaleString('es-AR')}`

export default function Finanzas() {
  useScrollToSub()
  const d = useStore()
  const ui = useUI()
  const P = d.profile
  const ahorro = last(d.savings)?.valor ?? 0
  const rend = portfolioReturn(d)
  const diasRest = Math.max(1, diffDays(P.ahorroFecha, today()))
  const falta = Math.max(0, P.ahorroObjetivo - ahorro)
  const [snap, setSnap] = useState({ fecha: today(), ahorro: '', portafolio: '' })
  const [mv, setMv] = useState<Omit<MoneyMove, 'id'>>({ fecha: today(), tipo: 'gasto', monto: 0, categoria: 'Comida' })
  const mes = today().slice(0, 7)
  const delMes = d.money.filter((m) => m.fecha.startsWith(mes))
  const gastos = CATS_GASTO.map((c) => ({ name: c, value: delMes.filter((m) => m.tipo === 'gasto' && m.categoria === c).reduce((a, m) => a + m.monto, 0) })).filter((x) => x.value > 0)
  const meses = [...new Set(d.money.map((m) => m.fecha.slice(0, 7)))].sort().slice(-6).map((m) => ({
    mes: m.slice(5),
    ingresos: d.money.filter((x) => x.fecha.startsWith(m) && x.tipo === 'ingreso').reduce((a, x) => a + x.monto, 0),
    gastos: d.money.filter((x) => x.fecha.startsWith(m) && x.tipo === 'gasto').reduce((a, x) => a + x.monto, 0),
  }))

  const saveSnap = (e: React.FormEvent) => {
    e.preventDefault()
    const f = snap.fecha
    d.set((s) => ({
      savings: snap.ahorro ? [...s.savings.filter((x) => x.fecha !== f), { fecha: f, valor: Number(snap.ahorro) }] : s.savings,
      portfolio: snap.portafolio ? [...s.portfolio.filter((x) => x.fecha !== f), { fecha: f, valor: Number(snap.portafolio) }] : s.portfolio,
    }))
    ui.notify('Valores guardados')
    setSnap({ fecha: today(), ahorro: '', portafolio: '' })
  }
  const saveMove = (e: React.FormEvent) => {
    e.preventDefault()
    if (!mv.monto) return
    const id = uid()
    d.set((s) => ({ money: [...s.money, { id, ...mv }] }))
    ui.notify(`${mv.tipo === 'gasto' ? 'Gasto' : 'Ingreso'} de ${usd(mv.monto)} guardado`, () => d.set((s) => ({ money: s.money.filter((x) => x.id !== id) })))
    setMv({ ...mv, monto: 0, nota: '' })
  }

  return (
    <div className="view">
      <PageHead eyebrow="Ahorro, portafolio y movimientos" title="Finanzas" />
      <div className="two-col">
        <div className="stack">
          <div className="grid">
            <section className="horizon now" style={{ ['--p' as string]: Math.min(1, ahorro / P.ahorroObjetivo) }}>
              <div className="now-head"><span className="eyebrow">Ahorro</span><span className="cap">meta {fmtShort(P.ahorroFecha)}</span></div>
              <div style={{ margin: '14px 0 10px' }}><span className="val-l">{usd(ahorro)}</span><span className="unit">de {P.ahorroObjetivo.toLocaleString('es-AR')}</span></div>
              <p className="body-2">{falta ? `Faltan ${usd(falta)} en ${diasRest} días: unos ${usd((falta / diasRest) * 7)} por semana.` : 'Meta alcanzada.'}</p>
            </section>
            <section className="panel pad">
              <div className="sec" style={{ margin: '0 0 14px' }}><span className="eyebrow">Portafolio · 2.º semestre</span><span className="cap">meta {P.rendimientoObjetivo} %</span></div>
              <div><span className="val-l" style={{ color: rend === null ? undefined : rend >= 0 ? 'var(--success)' : 'var(--danger)' }}>{rend === null ? '—' : `${rend >= 0 ? '+' : '−'}${Math.abs(rend * 100).toFixed(1).replace('.', ',')} %`}</span><span className="unit">en USD</span></div>
              <div style={{ margin: '12px 0 8px' }}><Bar value={rend === null ? 0 : rend / (P.rendimientoObjetivo / 100)} tone={rend !== null && rend * 100 >= P.rendimientoObjetivo ? 'ok' : undefined} /></div>
              <p className="cap">{rend === null ? 'Cargá el valor del 1/7 y uno actual para medir el rendimiento.' : `Del ${fmtShort(P.rendimientoDesde)} al ${fmtShort(P.rendimientoHasta)}. Los aportes no cuentan como rendimiento.`}</p>
            </section>
          </div>
          <Card title="Portafolio · velas semanales" icon="trending-up"><Candles data={weeklyCandles(d.portfolio)} /></Card>
          <Card title="Ahorro · velas semanales" icon="piggy-bank"><Candles data={weeklyCandles(d.savings)} target={P.ahorroObjetivo} /></Card>
          <Card title="Gastos del mes" icon="receipt">
            {gastos.length ? <PieC data={gastos} /> : <p className="cap">Sin gastos registrados este mes.</p>}
            {meses.length > 0 && <><div className="eyebrow" style={{ margin: '16px 0 4px' }}>Ingresos y gastos</div><BarC data={meses} x="mes" ys={[{ key: 'ingresos', name: 'Ingresos', color: '#5FBF92' }, { key: 'gastos', name: 'Gastos', color: '#C9D0DC' }]} /></>}
          </Card>
        </div>

        <aside className="stack">
          <section className="panel pad" id="sec-valores">
            <h2 className="h2" style={{ marginBottom: 12 }}><Icon name="wallet" size={16} />Actualizar valores</h2>
            <form className="form-grid" onSubmit={saveSnap}>
              <Field label="Fecha" id="v-f"><input id="v-f" type="date" value={snap.fecha} max={today()} onChange={(e) => setSnap({ ...snap, fecha: e.target.value })} /></Field>
              <Field label="Ahorro total (USD)" id="v-a"><input id="v-a" type="number" inputMode="decimal" value={snap.ahorro} onChange={(e) => setSnap({ ...snap, ahorro: e.target.value })} /></Field>
              <Field label="Portafolio (USD)" id="v-p"><input id="v-p" type="number" inputMode="decimal" value={snap.portafolio} onChange={(e) => setSnap({ ...snap, portafolio: e.target.value })} /></Field>
              <button className="btn btn-primary" disabled={!snap.ahorro && !snap.portafolio}>Guardar</button>
            </form>
            <p className="cap" style={{ marginTop: 10 }}>Para medir el semestre, cargá el valor del portafolio al 1/7 con esa fecha.</p>
          </section>
          <section className="panel pad" id="sec-movimientos">
            <h2 className="h2" style={{ marginBottom: 12 }}><Icon name="receipt" size={16} />Gasto o ingreso</h2>
            <div style={{ marginBottom: 12 }}><Seg label="Tipo de movimiento" value={mv.tipo} onChange={(t) => setMv({ ...mv, tipo: t, categoria: t === 'gasto' ? CATS_GASTO[0] : CATS_INGRESO[0] })} options={[['gasto', 'Gasto'], ['ingreso', 'Ingreso']]} /></div>
            <form className="form-grid" onSubmit={saveMove}>
              <Field label="Monto (USD)" id="m-m"><input id="m-m" type="number" inputMode="decimal" value={mv.monto || ''} onChange={(e) => setMv({ ...mv, monto: Number(e.target.value) })} /></Field>
              <Field label="Categoría" id="m-c"><select id="m-c" value={mv.categoria} onChange={(e) => setMv({ ...mv, categoria: e.target.value })}>{(mv.tipo === 'gasto' ? CATS_GASTO : CATS_INGRESO).map((c) => <option key={c}>{c}</option>)}</select></Field>
              <Field label="Fecha" id="m-f"><input id="m-f" type="date" value={mv.fecha} max={today()} onChange={(e) => setMv({ ...mv, fecha: e.target.value })} /></Field>
              <Field label="Nota" id="m-n"><input id="m-n" value={mv.nota ?? ''} onChange={(e) => setMv({ ...mv, nota: e.target.value })} /></Field>
              <button className="btn btn-primary" disabled={!mv.monto}>Guardar</button>
            </form>
          </section>
          <Card title="Últimos movimientos" icon="clock">
            {d.money.length === 0 ? <p className="cap">Todavía no registraste movimientos.</p> : d.money.slice().sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 10).map((m) => (
              <div className="list-row" key={m.id}>
                <span className="grow"><span style={{ display: 'block' }}>{m.categoria}</span><span className="cap">{fmtShort(m.fecha)}{m.nota ? ` · ${m.nota}` : ''}</span></span>
                <span className="num mono" style={{ color: m.tipo === 'gasto' ? 'var(--t2)' : 'var(--success)' }}>{m.tipo === 'gasto' ? '−' : '+'}{m.monto.toLocaleString('es-AR')}</span>
                <button className="icon-btn sm" aria-label="Borrar movimiento" onClick={() => { d.set((s) => ({ money: s.money.filter((x) => x.id !== m.id) })); ui.notify('Movimiento borrado', () => d.set((s) => ({ money: [...s.money, m] })), 'neutral') }}><Icon name="trash" size={15} /></button>
              </div>
            ))}
          </Card>
        </aside>
      </div>
    </div>
  )
}
