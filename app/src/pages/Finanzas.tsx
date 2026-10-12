import { useState } from 'react'
import { useStore } from '../lib/store'
import { useUI } from '../lib/ui'
import { last, portfolioReturn, weeklyCandles } from '../lib/logic'
import { diffDays, fmtShort, today, uid } from '../lib/date'
import { CATS_GASTO, CATS_INGRESO, CUENTAS } from '../lib/seed'
import type { Activo, CuentaId, MoneyMove, Origen, Pendiente } from '../lib/types'
import { Icon } from '../components/Icon'
import { Bar, Card, Field, PageHead, Seg } from '../components/ui'
import { BarC, Candles } from '../components/charts'
import { useScrollToSub } from '../components/useScrollTo'

const usd = (n: number) => `USD ${Math.round(n).toLocaleString('es-AR')}`
const ars = (n: number) => `$ ${n.toLocaleString('es-AR', { maximumFractionDigits: Number.isInteger(n) ? 0 : 2 })}`
const money = (m: Pick<MoneyMove, 'monto' | 'moneda'>) => ((m.moneda ?? 'ARS') === 'USD' ? usd(m.monto) : ars(m.monto))
const ORIGEN_IC: Record<Origen, string> = { manual: 'pencil', correo: 'mail', comprobante: 'file-text', coach: 'sparkles' }
const cuentaN = (c?: CuentaId) => CUENTAS.find((x) => x.id === c)?.nombre ?? 'Sin cuenta'

export default function Finanzas() {
  useScrollToSub()
  const ui = useUI()
  const tab = ui.sub === 'patrimonio' || ui.sub === 'valores' ? 'patrimonio' : 'cartera'
  return (
    <div className="view">
      <PageHead eyebrow="Cartera diaria en pesos · patrimonio en dólares" title="Finanzas" />
      <div style={{ marginBottom: 16 }}><Seg label="Sección" value={tab} onChange={(v) => ui.go('finanzas', v)} options={[['cartera', 'Cartera diaria'], ['patrimonio', 'Patrimonio']]} /></div>
      {tab === 'cartera' ? <Cartera /> : <Patrimonio />}
    </div>
  )
}

// ---------------- Cartera diaria (ARS) ----------------
function Cartera() {
  const d = useStore()
  const ui = useUI()
  const t = today()
  const mes = t.slice(0, 7)
  const [filtro, setFiltro] = useState<CuentaId | 'todas'>('todas')
  const ars0 = d.money.filter((m) => (m.moneda ?? 'ARS') === 'ARS')
  const delMes = ars0.filter((m) => m.fecha.startsWith(mes))
  const gasto = delMes.filter((m) => m.tipo === 'gasto' && m.categoria !== 'Aporte a inversiones').reduce((a, m) => a + m.monto, 0)
  const ingreso = delMes.filter((m) => m.tipo === 'ingreso').reduce((a, m) => a + m.monto, 0)
  const hoy = ars0.filter((m) => m.fecha === t && m.tipo === 'gasto' && m.categoria !== 'Aporte a inversiones').reduce((a, m) => a + m.monto, 0)
  const presupuesto = Object.values(d.presupuestos).reduce((a, b) => a + b, 0)
  const diaMes = Number(t.slice(8))
  const diasMes = new Date(Number(t.slice(0, 4)), Number(t.slice(5, 7)), 0).getDate()
  const cats = [...new Set([...CATS_GASTO, ...delMes.filter((m) => m.tipo === 'gasto').map((m) => m.categoria)])]
    .map((c) => ({ c, v: delMes.filter((m) => m.tipo === 'gasto' && m.categoria === c).reduce((a, m) => a + m.monto, 0), b: d.presupuestos[c] ?? 0 }))
    .filter((x) => x.v > 0 || x.b > 0).sort((a, b) => b.v - a.v)
  const porCuenta = CUENTAS.map((c) => ({ ...c, v: delMes.filter((m) => m.tipo === 'gasto' && m.cuenta === c.id).reduce((a, m) => a + m.monto, 0) }))
  const meses = [...new Set(ars0.map((m) => m.fecha.slice(0, 7)))].sort().slice(-6).map((m) => ({
    mes: m.slice(5), ingresos: ars0.filter((x) => x.fecha.startsWith(m) && x.tipo === 'ingreso').reduce((a, x) => a + x.monto, 0),
    gastos: ars0.filter((x) => x.fecha.startsWith(m) && x.tipo === 'gasto').reduce((a, x) => a + x.monto, 0),
  }))
  const lista = d.money.filter((m) => filtro === 'todas' || m.cuenta === filtro).slice().sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 25)

  return (
    <div className="two-col">
      <div className="stack">
        <section className="horizon now" style={{ ['--p' as string]: presupuesto ? Math.min(1, gasto / presupuesto) : diaMes / diasMes }}>
          <div className="now-head"><span className="eyebrow">Gastado en {new Date().toLocaleDateString('es-AR', { month: 'long' })}</span><span className="cap">hoy {ars(hoy)}</span></div>
          <div style={{ margin: '14px 0 10px' }}><span className="val-xl">{ars(gasto)}</span>{presupuesto > 0 && <span className="unit">de {ars(presupuesto)}</span>}</div>
          <div className="row cap" style={{ gap: 16 }}><span>Ingresos <b className="up">{ars(ingreso)}</b></span><span>Neto <b style={{ color: ingreso - gasto >= 0 ? 'var(--success)' : 'var(--t1)' }}>{ingreso - gasto >= 0 ? '+' : '−'}{ars(Math.abs(ingreso - gasto))}</b></span>{presupuesto > 0 && <span>Ritmo: {Math.round((gasto / presupuesto) * 100)} % del presupuesto al día {diaMes} de {diasMes}</span>}</div>
        </section>

        {d.pendientes.length > 0 && <PorConfirmar />}

        <NuevoMovimiento />

        <Comprobante />

        <Card title="Gastos por categoría" icon="layout-grid" right={<span className="cap">tocá el monto para fijar presupuesto</span>}>
          {cats.length === 0 ? <p className="cap">Sin gastos este mes.</p> : cats.map((x) => <CatRow key={x.c} {...x} />)}
        </Card>
      </div>

      <aside className="stack">
        <CorreoCard />
        <Card title="Por cuenta · este mes" icon="credit-card">
          {porCuenta.map((c) => <div className="list-row" key={c.id}><Icon name={c.icon} size={16} /><span className="grow">{c.nombre}</span><span className="k">{ars(c.v)}</span></div>)}
        </Card>
        <Card title="Movimientos" icon="clock" right={<select aria-label="Filtrar por cuenta" style={{ width: 150, minHeight: 34 }} value={filtro} onChange={(e) => setFiltro(e.target.value as CuentaId | 'todas')}><option value="todas">Todas</option>{CUENTAS.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select>}>
          {lista.length === 0 ? <p className="cap">Todavía no hay movimientos.</p> : lista.map((m) => (
            <div className="list-row" key={m.id}>
              <Icon name={ORIGEN_IC[m.origen ?? 'manual']} size={14} className="muted" />
              <span className="grow"><span style={{ display: 'block' }}>{m.comercio || m.categoria}</span><span className="cap">{fmtShort(m.fecha)} · {cuentaN(m.cuenta)}{m.comercio ? ` · ${m.categoria}` : ''}{m.nota ? ` · ${m.nota}` : ''}</span></span>
              <span className="num mono" style={{ color: m.tipo === 'gasto' ? 'var(--t2)' : 'var(--success)' }}>{m.tipo === 'gasto' ? '−' : '+'}{money(m)}</span>
              <button className="icon-btn sm" aria-label="Borrar movimiento" onClick={() => { d.set((s) => ({ money: s.money.filter((x) => x.id !== m.id) })); ui.notify('Movimiento borrado', () => d.set((s) => ({ money: [...s.money, m] })), 'neutral') }}><Icon name="trash" size={15} /></button>
            </div>
          ))}
        </Card>
        {meses.length > 0 && <Card title="Ingresos y gastos · ARS" icon="trending-up"><BarC data={meses} x="mes" ys={[{ key: 'ingresos', name: 'Ingresos', color: '#6FBFA0' }, { key: 'gastos', name: 'Gastos', color: '#C9D0DC' }]} height={190} /></Card>}
      </aside>
    </div>
  )
}

function CatRow({ c, v, b }: { c: string; v: number; b: number }) {
  const d = useStore()
  const [ed, setEd] = useState(false)
  const [val, setVal] = useState(b ? String(b) : '')
  return (
    <div className="cat-row">
      <span className="grow">{c}</span>
      {ed ? <form onSubmit={(e) => { e.preventDefault(); d.set((s) => { const p = { ...s.presupuestos }; if (Number(val) > 0) p[c] = Number(val); else delete p[c]; return { presupuestos: p } }); setEd(false) }} className="row" style={{ flexWrap: 'nowrap' }}>
        <input autoFocus aria-label={`Presupuesto de ${c}`} type="number" inputMode="numeric" placeholder="Presupuesto" value={val} onChange={(e) => setVal(e.target.value)} style={{ width: 120, minHeight: 34 }} /><button className="btn btn-quiet btn-sm">OK</button>
      </form> : <button className="cat-v num" onClick={() => setEd(true)} aria-label={`Fijar presupuesto de ${c}`}>{ars(v)}{b ? <span className="cap"> / {ars(b)}</span> : null}</button>}
      <div className="cat-bar"><Bar value={b ? v / b : 1} tone={b && v > b ? 'over' : b ? undefined : 'neutral'} /></div>
    </div>
  )
}

function NuevoMovimiento() {
  const d = useStore()
  const ui = useUI()
  const [mv, setMv] = useState<Omit<MoneyMove, 'id'>>({ fecha: today(), tipo: 'gasto', monto: 0, categoria: 'Supermercado', moneda: 'ARS', cuenta: 'mp', origen: 'manual' })
  const save = (e: React.FormEvent) => {
    e.preventDefault()
    if (!mv.monto) return
    const id = uid()
    d.set((s) => ({ money: [...s.money, { id, ...mv }] }))
    ui.notify(`${mv.tipo === 'gasto' ? 'Gasto' : 'Ingreso'} de ${money(mv)} guardado`, () => d.set((s) => ({ money: s.money.filter((x) => x.id !== id) })))
    setMv({ ...mv, monto: 0, nota: '', comercio: '' })
  }
  return (
    <section className="panel pad" id="sec-movimientos">
      <div className="sec" style={{ margin: '0 0 12px' }}><h2 className="h2"><Icon name="receipt" size={16} />Registrar</h2><Seg label="Tipo" value={mv.tipo} onChange={(t) => setMv({ ...mv, tipo: t, categoria: t === 'gasto' ? 'Supermercado' : CATS_INGRESO[0] })} options={[['gasto', 'Gasto'], ['ingreso', 'Ingreso']]} /></div>
      <div className="chips" role="group" aria-label="Cuenta" style={{ marginBottom: 12 }}>{CUENTAS.map((c) => <button key={c.id} type="button" className="chip" aria-pressed={mv.cuenta === c.id} onClick={() => setMv({ ...mv, cuenta: c.id })}><Icon name={c.icon} size={13} />{c.nombre}</button>)}</div>
      <form className="form-grid" onSubmit={save}>
        <Field label={`Monto (${mv.moneda === 'USD' ? 'USD' : 'pesos'})`} id="m-m"><input id="m-m" type="number" inputMode="decimal" value={mv.monto || ''} onChange={(e) => setMv({ ...mv, monto: Number(e.target.value) })} /></Field>
        <Field label="Categoría" id="m-c"><select id="m-c" value={mv.categoria} onChange={(e) => setMv({ ...mv, categoria: e.target.value })}>{(mv.tipo === 'gasto' ? CATS_GASTO : CATS_INGRESO).map((c) => <option key={c}>{c}</option>)}</select></Field>
        <Field label="Comercio o persona" id="m-co"><input id="m-co" value={mv.comercio ?? ''} onChange={(e) => setMv({ ...mv, comercio: e.target.value })} /></Field>
        <Field label="Fecha" id="m-f"><input id="m-f" type="date" value={mv.fecha} max={today()} onChange={(e) => setMv({ ...mv, fecha: e.target.value })} /></Field>
        <Field label="Moneda" id="m-mo"><select id="m-mo" value={mv.moneda} onChange={(e) => setMv({ ...mv, moneda: e.target.value as 'ARS' | 'USD' })}><option value="ARS">Pesos</option><option value="USD">Dólares</option></select></Field>
        <button className="btn btn-primary" disabled={!mv.monto}>Guardar</button>
      </form>
    </section>
  )
}

const readFile = (f: File): Promise<{ data: string; mime: string }> => new Promise((res, rej) => {
  const r = new FileReader()
  r.onerror = () => rej(new Error('No se pudo leer el archivo.'))
  r.onload = () => {
    const url = String(r.result)
    if (f.type === 'application/pdf') { res({ data: url.split(',')[1], mime: 'application/pdf' }); return }
    // Las fotos se achican a 1600 px para mandar menos datos.
    const img = new Image()
    img.onload = () => {
      const k = Math.min(1, 1600 / Math.max(img.width, img.height))
      const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k)
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
      res({ data: c.toDataURL('image/jpeg', 0.85).split(',')[1], mime: 'image/jpeg' })
    }
    img.onerror = () => rej(new Error('El archivo no es una imagen válida.'))
    img.src = url
  }
  r.readAsDataURL(f)
})

function Comprobante() {
  const d = useStore()
  const ui = useUI()
  const [texto, setTexto] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const leer = async () => {
    setBusy(true); setErr('')
    try {
      const nuevos: Pendiente[] = []
      if (d.settings.apiKey) {
        const { leerComprobante } = await import('../lib/coach')
        const f = file ? await readFile(file) : null
        const r = await leerComprobante(useStore.getState(), f, texto.trim(), [...CATS_GASTO, ...CATS_INGRESO])
        for (const m of r) if (m.monto > 0) nuevos.push({ id: uid(), fecha: m.fecha || today(), tipo: m.tipo, monto: m.monto, moneda: m.moneda, cuenta: m.cuenta, categoria: m.categoria, comercio: m.comercio || undefined, origen: 'comprobante', fuente: file ? `Comprobante: ${file.name}` : 'Texto pegado', confianza: 'baja' })
      } else {
        const { parseCorreo } = await import('../lib/correo')
        const p = parseCorreo({ id: uid(), fecha: new Date().toISOString(), de: '', asunto: texto.split('\n')[0] ?? '', texto })
        if (p) { const { confianza: _c, ...mv } = p; nuevos.push({ id: uid(), ...mv, origen: 'comprobante', fuente: 'Texto pegado', confianza: 'baja' }) }
      }
      if (!nuevos.length) setErr(d.settings.apiKey ? 'No encontré movimientos en el comprobante.' : 'No pude leer el texto. Con la clave de Anthropic (Ajustes) también se leen fotos y PDF.')
      else { d.set((s) => ({ pendientes: [...s.pendientes, ...nuevos] })); ui.notify(`${nuevos.length} movimiento${nuevos.length > 1 ? 's' : ''} para confirmar`); setTexto(''); setFile(null) }
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) } finally { setBusy(false) }
  }
  return (
    <section className="panel pad" id="sec-comprobante">
      <h2 className="h2" style={{ marginBottom: 10 }}><Icon name="file-text" size={16} />Comprobante o notificación</h2>
      <p className="cap" style={{ marginBottom: 12 }}>Subí una captura, foto o PDF de un pago, o pegá el texto de un correo o notificación de Mercado Pago o del banco. Queda para confirmar.</p>
      <div className="row" style={{ marginBottom: 10 }}>
        <label className="btn btn-quiet"><Icon name="image" size={16} />{file ? file.name.slice(0, 24) : 'Elegir archivo'}<input type="file" accept="image/*,application/pdf" hidden onChange={(e) => { setFile(e.target.files?.[0] ?? null); e.target.value = '' }} /></label>
        {file && <button className="btn btn-ghost btn-sm" onClick={() => setFile(null)}>Quitar</button>}
      </div>
      <textarea rows={3} aria-label="Texto del comprobante" placeholder="Pegá acá el texto (ej. “Pagaste $ 8.500 a Carrefour con tu tarjeta…”)" value={texto} onChange={(e) => setTexto(e.target.value)} />
      {err && <p className="err" style={{ marginTop: 8 }}>{err}</p>}
      <button className="btn btn-primary" style={{ marginTop: 10 }} disabled={busy || (!file && !texto.trim())} onClick={leer}><Icon name="sparkles" size={16} />{busy ? 'Leyendo…' : 'Leer'}</button>
    </section>
  )
}

function PorConfirmar() {
  const d = useStore()
  const ui = useUI()
  const up = (id: string, p: Partial<Pendiente>) => d.set((s) => ({ pendientes: s.pendientes.map((x) => (x.id === id ? { ...x, ...p } : x)) }))
  const ok = (p: Pendiente) => {
    const { fuente: _f, confianza: _c, ...mv } = p
    d.set((s) => ({ money: [...s.money, mv], pendientes: s.pendientes.filter((x) => x.id !== p.id) }))
    ui.notify(`${money(p)} registrado`, () => d.set((s) => ({ money: s.money.filter((x) => x.id !== p.id), pendientes: [...s.pendientes, p] })))
  }
  return (
    <section className="panel pad confirm-panel">
      <div className="sec" style={{ margin: '0 0 10px' }}><h2 className="h2"><Icon name="inbox" size={16} />Por confirmar · {d.pendientes.length}</h2>{d.pendientes.length > 1 && <button className="btn btn-quiet btn-sm" onClick={() => d.pendientes.forEach(ok)}>Confirmar todo</button>}</div>
      {d.pendientes.map((p) => (
        <div className="pend-row" key={p.id}>
          <div className="row" style={{ flexWrap: 'nowrap' }}>
            <span className="grow"><b>{p.comercio || p.categoria}</b><span className="cap">{fmtShort(p.fecha)} · {p.fuente}</span></span>
            <span className="num mono" style={{ color: p.tipo === 'gasto' ? 'var(--t1)' : 'var(--success)' }}>{p.tipo === 'gasto' ? '−' : '+'}{money(p)}</span>
          </div>
          <div className="row" style={{ marginTop: 8 }}>
            <select aria-label="Cuenta" value={p.cuenta ?? ''} onChange={(e) => up(p.id, { cuenta: e.target.value as CuentaId })} style={{ width: 150, minHeight: 34 }}>{CUENTAS.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select>
            <select aria-label="Categoría" value={p.categoria} onChange={(e) => up(p.id, { categoria: e.target.value })} style={{ width: 180, minHeight: 34 }}>{[...new Set([p.categoria, ...(p.tipo === 'gasto' ? CATS_GASTO : CATS_INGRESO)])].map((c) => <option key={c}>{c}</option>)}</select>
            <span className="grow" />
            <button className="btn btn-ghost btn-sm" onClick={() => d.set((s) => ({ pendientes: s.pendientes.filter((x) => x.id !== p.id) }))}>Descartar</button>
            <button className="btn btn-primary btn-sm" onClick={() => ok(p)}><Icon name="check" size={14} />Confirmar</button>
          </div>
        </div>
      ))}
    </section>
  )
}

function CorreoCard() {
  const d = useStore()
  const ui = useUI()
  const [busy, setBusy] = useState(false)
  const c = d.correo
  const sync = async () => {
    setBusy(true)
    try { const { syncCorreo } = await import('../lib/correo'); const r = await syncCorreo(); ui.notify(r.nuevos || r.pendientes ? `${r.nuevos} anotados · ${r.pendientes} para confirmar` : 'Sin correos nuevos', undefined, 'neutral') }
    catch { /* el error queda guardado */ } finally { setBusy(false) }
  }
  if (!d.settings.correoUrl) return (
    <section className="panel pad">
      <h2 className="h2" style={{ marginBottom: 8 }}><Icon name="mail" size={16} />Correo de pagos</h2>
      <p className="body-2">Conectá tu Gmail una vez y los pagos de Mercado Pago, Santander y Visa se anotan solos cuando abrís la app.</p>
      <button className="btn btn-quiet" style={{ marginTop: 10 }} onClick={() => ui.go('ajustes', 'correo')}>Conectar</button>
    </section>
  )
  return (
    <section className="panel pad">
      <div className="sec" style={{ margin: '0 0 6px' }}><h2 className="h2"><Icon name="mail" size={16} />Correo conectado</h2><button className="icon-btn sm" aria-label="Revisar ahora" disabled={busy} onClick={sync}><Icon name="refresh" size={15} /></button></div>
      <p className="cap">{c.error ? <span className="err">{c.error}</span> : c.ultima ? `Última revisión: ${new Date(c.ultima).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}` : 'Todavía no se revisó.'} · {d.settings.correoAuto === false ? 'todo queda para confirmar' : 'se anota solo lo que se lee con claridad'}</p>
    </section>
  )
}

// ---------------- Patrimonio (USD) ----------------
const TIPOS_ACTIVO: Activo[] = ['cedear', 'accion', 'cripto', 'fci', 'plazo fijo', 'dolares', 'bono', 'otro']
function Patrimonio() {
  const d = useStore()
  const ui = useUI()
  const P = d.profile
  const ahorro = last(d.savings)?.valor ?? 0
  const rend = portfolioReturn(d)
  const diasRest = Math.max(1, diffDays(P.ahorroFecha, today()))
  const falta = Math.max(0, P.ahorroObjetivo - ahorro)
  const totalPos = d.posiciones.reduce((a, p) => a + p.valorUSD, 0)
  const [snap, setSnap] = useState({ fecha: today(), ahorro: '', portafolio: '' })
  const [pos, setPos] = useState({ activo: '', tipo: 'cedear' as Activo, cantidad: '', valorUSD: '' })
  const [ap, setAp] = useState({ usd: '', nota: '', retiro: false })
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
  return (
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
            <p className="cap">{rend === null ? 'Cargá el valor del 1/7 y uno actual para medir el rendimiento.' : `Del ${fmtShort(P.rendimientoDesde)} al ${fmtShort(P.rendimientoHasta)}. Los aportes y retiros no cuentan como rendimiento.`}</p>
          </section>
        </div>
        <Card title="Posiciones" icon="trending-up" right={totalPos ? <span className="chip num">{usd(totalPos)}</span> : null}>
          {d.posiciones.length === 0 ? <p className="cap">Cargá cada inversión (CEDEAR, acción, cripto, FCI, plazo fijo, dólares) con su valor actual en USD.</p> : d.posiciones.map((p) => (
            <div className="list-row" key={p.id}>
              <span className="grow"><span style={{ display: 'block' }}>{p.activo}</span><span className="cap">{p.tipo} · {p.cantidad} · actualizado {fmtShort(p.actualizado)}</span></span>
              <input aria-label={`Valor de ${p.activo}`} type="number" inputMode="decimal" style={{ width: 110, minHeight: 34 }} value={p.valorUSD} onChange={(e) => d.set((s) => ({ posiciones: s.posiciones.map((x) => (x.id === p.id ? { ...x, valorUSD: Number(e.target.value), actualizado: today() } : x)) }))} />
              <button className="icon-btn sm" aria-label={`Borrar ${p.activo}`} onClick={() => d.set((s) => ({ posiciones: s.posiciones.filter((x) => x.id !== p.id) }))}><Icon name="trash" size={15} /></button>
            </div>
          ))}
          <form className="form-grid" style={{ marginTop: 12 }} onSubmit={(e) => { e.preventDefault(); if (!pos.activo.trim()) return; d.set((s) => ({ posiciones: [...s.posiciones, { id: uid(), activo: pos.activo.trim(), tipo: pos.tipo, cantidad: Number(pos.cantidad) || 0, valorUSD: Number(pos.valorUSD) || 0, actualizado: today() }] })); setPos({ activo: '', tipo: pos.tipo, cantidad: '', valorUSD: '' }) }}>
            <Field label="Activo" id="po-a"><input id="po-a" value={pos.activo} placeholder="Ej. SPY, AAPL, BTC" onChange={(e) => setPos({ ...pos, activo: e.target.value })} /></Field>
            <Field label="Tipo" id="po-t"><select id="po-t" value={pos.tipo} onChange={(e) => setPos({ ...pos, tipo: e.target.value as Activo })}>{TIPOS_ACTIVO.map((x) => <option key={x}>{x}</option>)}</select></Field>
            <Field label="Cantidad" id="po-c"><input id="po-c" type="number" inputMode="decimal" value={pos.cantidad} onChange={(e) => setPos({ ...pos, cantidad: e.target.value })} /></Field>
            <Field label="Valor (USD)" id="po-v"><input id="po-v" type="number" inputMode="decimal" value={pos.valorUSD} onChange={(e) => setPos({ ...pos, valorUSD: e.target.value })} /></Field>
            <button className="btn btn-quiet" disabled={!pos.activo.trim()}><Icon name="plus" size={16} />Agregar</button>
          </form>
          {totalPos > 0 && <button className="btn btn-primary btn-block" style={{ marginTop: 10 }} onClick={() => { d.set((s) => ({ portfolio: [...s.portfolio.filter((x) => x.fecha !== today()), { fecha: today(), valor: totalPos }] })); ui.notify(`Valor del portafolio de hoy: ${usd(totalPos)}`) }}>Registrar {usd(totalPos)} como valor de hoy</button>}
        </Card>
        <Card title="Portafolio · velas semanales" icon="trending-up"><Candles data={weeklyCandles(d.portfolio)} /></Card>
        <Card title="Ahorro · velas semanales" icon="piggy-bank"><Candles data={weeklyCandles(d.savings)} target={P.ahorroObjetivo} /></Card>
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
        <section className="panel pad">
          <h2 className="h2" style={{ marginBottom: 12 }}><Icon name="arrow-up" size={16} />Aportes y retiros</h2>
          <form className="form-grid" onSubmit={(e) => { e.preventDefault(); if (!Number(ap.usd)) return; d.set((s) => ({ aportes: [...s.aportes, { id: uid(), fecha: today(), usd: Number(ap.usd), nota: ap.nota || undefined, retiro: ap.retiro }] })); ui.notify(`${ap.retiro ? 'Retiro' : 'Aporte'} de ${usd(Number(ap.usd))} guardado`); setAp({ usd: '', nota: '', retiro: false }) }}>
            <Field label="Monto (USD)" id="ap-u"><input id="ap-u" type="number" inputMode="decimal" value={ap.usd} onChange={(e) => setAp({ ...ap, usd: e.target.value })} /></Field>
            <Field label="Nota" id="ap-n"><input id="ap-n" value={ap.nota} onChange={(e) => setAp({ ...ap, nota: e.target.value })} /></Field>
            <div className="field"><label>Tipo</label><Seg label="Tipo" value={ap.retiro ? 'r' : 'a'} onChange={(v) => setAp({ ...ap, retiro: v === 'r' })} options={[['a', 'Aporte'], ['r', 'Retiro']]} /></div>
            <button className="btn btn-quiet" disabled={!Number(ap.usd)}>Guardar</button>
          </form>
          {d.aportes.slice(-6).reverse().map((a) => <div className="list-row" key={a.id}><span className="grow">{a.retiro ? 'Retiro' : 'Aporte'}{a.nota ? ` · ${a.nota}` : ''}<span className="cap"> · {fmtShort(a.fecha)}</span></span><span className="k">{a.retiro ? '−' : '+'}{usd(a.usd)}</span><button className="icon-btn sm" aria-label="Borrar" onClick={() => d.set((s) => ({ aportes: s.aportes.filter((x) => x.id !== a.id) }))}><Icon name="trash" size={15} /></button></div>)}
          <p className="cap" style={{ marginTop: 8 }}>Los aportes no cuentan como rendimiento: así el porcentaje del portafolio mide solo lo que ganó la inversión.</p>
        </section>
      </aside>
    </div>
  )
}
