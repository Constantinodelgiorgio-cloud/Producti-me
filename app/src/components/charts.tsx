import { Bar as RBar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Candle } from '../lib/logic'

// Serie principal en el acento; el resto en grises fríos. La meta va en verde punteado.
export const PALETTE = ['#8EA8FF', '#C9D0DC', '#5FBF92', '#E0A852', '#6B7280', '#B4C5FF', '#9AA3B2', '#4A5160', '#E5766F']
const axis = { stroke: '#7C828E', fontSize: 11, fontFamily: 'Geist Mono, ui-monospace, monospace' }
const tip = {
  contentStyle: { background: '#13151A', border: '1px solid #2A2E36', borderRadius: 12, fontSize: 12, boxShadow: '0 12px 30px -10px rgba(0,0,0,.8)' },
  labelStyle: { color: '#A0A6B2', fontFamily: 'Geist Mono, monospace', fontSize: 11 }, itemStyle: { color: '#F5F6F8' },
}
const grid = <CartesianGrid stroke="#1E2127" vertical={false} />
type Y = { key: string; color?: string; name?: string }
/** Sin ningún valor distinto de 0: en vez de ejes vacíos, un aviso del mismo alto. */
const vacio = (data: object[], ys: Y[]) => !data.some((r) => ys.some((y) => { const v = (r as Record<string, unknown>)[y.key]; return typeof v === 'number' && v !== 0 }))
const Vacio = ({ height }: { height: number }) => <div className="chart-empty" style={{ height }}><span>Todavía sin datos para graficar</span></div>

export const LineC = ({ data, x, ys, target, height = 200 }: { data: object[]; x: string; ys: Y[]; target?: number; height?: number }) => vacio(data, ys) ? <Vacio height={Math.min(height, 120)} /> : (
  <ResponsiveContainer width="100%" height={height}>
    <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
      {grid}
      <XAxis dataKey={x} tick={axis} tickLine={false} axisLine={{ stroke: '#2A2E36' }} minTickGap={14} interval="preserveStartEnd" />
      <YAxis tick={axis} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
      <Tooltip {...tip} cursor={{ stroke: '#3A3F49' }} />
      {target !== undefined && <ReferenceLine y={target} stroke="#5FBF92" strokeDasharray="4 4" />}
      {ys.map((y, i) => <Line isAnimationActive={false} key={y.key} dataKey={y.key} name={y.name ?? y.key} stroke={y.color ?? PALETTE[i]} strokeWidth={2} dot={{ r: 2.5, strokeWidth: 0, fill: y.color ?? PALETTE[i] }} activeDot={{ r: 4 }} connectNulls />)}
    </LineChart>
  </ResponsiveContainer>
)

export const BarC = ({ data, x, ys, height = 200, stacked, target }: { data: object[]; x: string; ys: Y[]; height?: number; stacked?: boolean; target?: number }) => vacio(data, ys) ? <Vacio height={Math.min(height, 120)} /> : (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
      {grid}
      <XAxis dataKey={x} tick={axis} tickLine={false} axisLine={{ stroke: '#2A2E36' }} minTickGap={14} interval="preserveStartEnd" />
      <YAxis tick={axis} tickLine={false} axisLine={false} />
      <Tooltip {...tip} cursor={{ fill: 'rgba(255,255,255,.03)' }} />
      {target !== undefined && <ReferenceLine y={target} stroke="#5FBF92" strokeDasharray="4 4" />}
      {ys.map((y, i) => <RBar isAnimationActive={false} key={y.key} dataKey={y.key} name={y.name ?? y.key} fill={y.color ?? PALETTE[i]} stackId={stacked ? 's' : undefined} radius={stacked ? 0 : [4, 4, 0, 0]} maxBarSize={28} />)}
    </BarChart>
  </ResponsiveContainer>
)

export const PieC = ({ data, height = 220 }: { data: { name: string; value: number }[]; height?: number }) => (
  <div>
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie isAnimationActive={false} data={data} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="86%" paddingAngle={2} stroke="#0E1013" strokeWidth={2}>
          {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
        </Pie>
        <Tooltip {...tip} />
      </PieChart>
    </ResponsiveContainer>
    <div className="row" style={{ justifyContent: 'center', gap: '6px 14px' }}>
      {data.map((x, i) => <span key={x.name} className="cap row" style={{ gap: 6 }}><i style={{ width: 8, height: 8, borderRadius: 2, background: PALETTE[i % PALETTE.length], display: 'inline-block' }} />{x.name}</span>)}
    </div>
  </div>
)

/** Gráfico de velas en SVG (semanal). */
export const Candles = ({ data, height = 200, target }: { data: Candle[]; height?: number; target?: number }) => {
  if (data.length === 0) return <p className="cap">Todavía no hay valores. Cargá el primero para ver la evolución semanal.</p>
  const W = Math.max(320, data.length * 34)
  const pad = { l: 44, r: 8, t: 8, b: 20 }
  const vals = data.flatMap((d) => [d.high, d.low]).concat(target ?? [])
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const span = max - min || 1
  const y = (v: number) => pad.t + (1 - (v - min) / span) * (height - pad.t - pad.b)
  const step = (W - pad.l - pad.r) / data.length
  return (
    <div className="tbl-wrap">
      <svg width={W} height={height} role="img" aria-label="Gráfico de velas semanal">
        {[min, min + span / 2, max].map((t, i) => (
          <g key={i}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="#1E2127" />
            <text x={pad.l - 6} y={y(t) + 4} fill="#7C828E" fontSize="10.5" fontFamily="Geist Mono, monospace" textAnchor="end">{t >= 1000 ? `${(t / 1000).toFixed(1)}k` : t.toFixed(1)}</text>
          </g>
        ))}
        {target !== undefined && <line x1={pad.l} x2={W - pad.r} y1={y(target)} y2={y(target)} stroke="#5FBF92" strokeDasharray="4 4" />}
        {data.map((c, i) => {
          const cx = pad.l + step * i + step / 2
          const color = c.close >= c.open ? '#8EA8FF' : '#E5766F'
          const top = y(Math.max(c.open, c.close))
          return (
            <g key={i}>
              <title>{`Semana del ${c.label}: apertura ${c.open} · cierre ${c.close} · máximo ${c.high} · mínimo ${c.low}`}</title>
              <line x1={cx} x2={cx} y1={y(c.high)} y2={y(c.low)} stroke={color} />
              <rect x={cx - step * 0.28} y={top} width={step * 0.56} height={Math.max(2, Math.abs(y(c.open) - y(c.close)))} fill={color} rx={2} />
              <text x={cx} y={height - 4} fill="#7C828E" fontSize="10" fontFamily="Geist Mono, monospace" textAnchor="middle">{c.label}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
