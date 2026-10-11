import { Bar as RBar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Candle } from '../lib/logic'

const axis = { stroke: '#8b95a7', fontSize: 11 }
const tip = { contentStyle: { background: '#131a26', border: '1px solid #243046', borderRadius: 10 }, labelStyle: { color: '#e7ecf3' } }
export const PALETTE = ['#f5b83d', '#60a5fa', '#4ade80', '#f87171', '#c084fc', '#5eead4', '#fb923c', '#e879f9', '#a3e635']

export const LineC = ({ data, x, ys, target, height = 200 }: { data: object[]; x: string; ys: { key: string; color?: string; name?: string }[]; target?: number; height?: number }) => (
  <ResponsiveContainer width="100%" height={height}>
    <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
      <CartesianGrid stroke="#243046" strokeDasharray="3 3" />
      <XAxis dataKey={x} tick={axis} />
      <YAxis tick={axis} domain={['auto', 'auto']} />
      <Tooltip {...tip} />
      {target !== undefined && <ReferenceLine y={target} stroke="#4ade80" strokeDasharray="4 4" />}
      {ys.map((y, i) => <Line isAnimationActive={false} key={y.key} dataKey={y.key} name={y.name ?? y.key} stroke={y.color ?? PALETTE[i]} strokeWidth={2} dot={{ r: 3 }} connectNulls />)}
    </LineChart>
  </ResponsiveContainer>
)

export const BarC = ({ data, x, ys, height = 200, stacked }: { data: object[]; x: string; ys: { key: string; color?: string; name?: string }[]; height?: number; stacked?: boolean }) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
      <CartesianGrid stroke="#243046" strokeDasharray="3 3" />
      <XAxis dataKey={x} tick={axis} />
      <YAxis tick={axis} />
      <Tooltip {...tip} cursor={{ fill: '#1a2333' }} />
      {ys.map((y, i) => <RBar isAnimationActive={false} key={y.key} dataKey={y.key} name={y.name ?? y.key} fill={y.color ?? PALETTE[i]} stackId={stacked ? 's' : undefined} radius={stacked ? 0 : [6, 6, 0, 0]} />)}
    </BarChart>
  </ResponsiveContainer>
)

export const PieC = ({ data, height = 220 }: { data: { name: string; value: number }[]; height?: number }) => (
  <ResponsiveContainer width="100%" height={height}>
    <PieChart>
      <Pie isAnimationActive={false} data={data} dataKey="value" nameKey="name" innerRadius="50%" outerRadius="80%" paddingAngle={2} label={(e: { name?: string }) => e.name ?? ''} labelLine={false} fontSize={11}>
        {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="#0b0f17" />)}
      </Pie>
      <Tooltip {...tip} />
    </PieChart>
  </ResponsiveContainer>
)

/** Gráfico de velas en SVG (semanal). */
export const Candles = ({ data, height = 200, target }: { data: Candle[]; height?: number; target?: number }) => {
  if (data.length === 0) return <p className="muted small">Sin datos todavía.</p>
  const W = Math.max(320, data.length * 34)
  const pad = { l: 44, r: 8, t: 8, b: 20 }
  const vals = data.flatMap((d) => [d.high, d.low]).concat(target ?? [])
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const span = max - min || 1
  const y = (v: number) => pad.t + (1 - (v - min) / span) * (height - pad.t - pad.b)
  const step = (W - pad.l - pad.r) / data.length
  const ticks = [min, min + span / 2, max]
  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={W} height={height} role="img" aria-label="Gráfico de velas">
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="#243046" strokeDasharray="3 3" />
            <text x={pad.l - 6} y={y(t) + 4} fill="#8b95a7" fontSize="11" textAnchor="end">{t >= 1000 ? `${(t / 1000).toFixed(1)}k` : t.toFixed(1)}</text>
          </g>
        ))}
        {target !== undefined && <line x1={pad.l} x2={W - pad.r} y1={y(target)} y2={y(target)} stroke="#4ade80" strokeDasharray="4 4" />}
        {data.map((c, i) => {
          const cx = pad.l + step * i + step / 2
          const up = c.close >= c.open
          const color = up ? '#4ade80' : '#f87171'
          const top = y(Math.max(c.open, c.close))
          const h = Math.max(2, Math.abs(y(c.open) - y(c.close)))
          return (
            <g key={i}>
              <title>{`${c.label}: apertura ${c.open} · cierre ${c.close} · máx ${c.high} · mín ${c.low}`}</title>
              <line x1={cx} x2={cx} y1={y(c.high)} y2={y(c.low)} stroke={color} />
              <rect x={cx - step * 0.3} y={top} width={step * 0.6} height={h} fill={color} rx={2} />
              <text x={cx} y={height - 4} fill="#8b95a7" fontSize="10" textAnchor="middle">{c.label}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
