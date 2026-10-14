import { useEffect, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import type { Note } from '../lib/logic'
import type { Medal as MedalT } from '../lib/types'
import { MEDAL_LABEL } from '../lib/logic'
import { Icon } from './Icon'
import { useUI, type Route } from '../lib/ui'

export const Card = ({ title, right, children, className = '', icon }: { title?: ReactNode; right?: ReactNode; children: ReactNode; className?: string; icon?: string }) => (
  <section className={`panel pad ${className}`}>
    {title && <div className="sec" style={{ margin: '0 0 16px' }}><h2 className="h2">{icon && <Icon name={icon} size={16} />}{title}</h2>{right}</div>}
    {children}
  </section>
)

export const PageHead = ({ eyebrow, title, right, back }: { eyebrow?: string; title: string; right?: ReactNode; back?: boolean }) => {
  const ui = useUI()
  return (
    <header className="top">
      <div className="row" style={{ alignItems: 'flex-start', flexWrap: 'nowrap', gap: 4, minWidth: 0 }}>
        {back && <button className="icon-btn" style={{ marginLeft: -10 }} aria-label="Volver" onClick={() => ui.go(ui.prev && ui.prev !== ui.route ? ui.prev : 'hoy')}><Icon name="chevron-left" size={20} /></button>}
        <div style={{ minWidth: 0 }}>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1 className="h1">{title}</h1></div>
      </div>
      {right && <div className="top-actions">{right}</div>}
    </header>
  )
}

export const Bar = ({ value, ghost, tone }: { value: number; ghost?: number; tone?: 'neutral' | 'ok' | 'over' }) => (
  <div className={`bar ${tone ?? ''}`} role="presentation">
    {ghost !== undefined && <i className="ghost" style={{ width: `${Math.max(0, Math.min(1, ghost)) * 100}%` }} />}
    <i style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }} />
  </div>
)

export const Medal = ({ m }: { m: MedalT | null | undefined }) =>
  m ? <span className={`medal m-${m}`}>{MEDAL_LABEL[m]}</span> : <span className="medal m-none">Sin datos</span>

export const Notes = ({ items, empty }: { items: Note[]; empty?: string }) => {
  const go = useUI((s) => s.go)
  if (items.length === 0) return <p className="cap">{empty ?? 'Nada por ahora.'}</p>
  return <div>{items.map((n, i) => (
    <div className="note-row" key={i}><Icon name={n.icon} size={16} /><span className="grow">{n.text}</span>
      {n.go && n.action && <button className="btn btn-quiet btn-sm" onClick={() => go(n.go as Route)}>{n.action}</button>}</div>
  ))}</div>
}

/** Lista de avisos con punto de severidad y acción. */
export const Attention = ({ items }: { items: Note[] }) => {
  const go = useUI((s) => s.go)
  return <div className="panel">{items.map((n, i) => (
    <div className="attn-row" key={i}><span className={`sev ${n.tone ?? ''}`} aria-hidden="true" /><span className="grow">{n.text}</span>
      {n.go && n.action && <button className="btn btn-quiet btn-sm" onClick={() => go(n.go as Route)}>{n.action}</button>}</div>
  ))}</div>
}

export const Empty = ({ icon, title, children, action }: { icon: string; title: string; children?: ReactNode; action?: ReactNode }) => (
  <div className="empty"><span className="glyph"><Icon name={icon} size={20} /></span><h3>{title}</h3>{children && <p>{children}</p>}{action && <div className="row" style={{ marginTop: 4 }}>{action}</div>}</div>
)

/** Escala 1–5 segmentada o 1–10 deslizable. */
export const Scale = ({ value, onChange, max = 10, label, id }: { value?: number; onChange: (n: number) => void; max?: 5 | 10; label: string; id: string }) => {
  if (max === 5) return (
    <div className="field"><label id={`${id}-l`}>{label}</label>
      <div className="scale5" role="radiogroup" aria-labelledby={`${id}-l`}>
        {[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" role="radio" aria-checked={value === n} onClick={() => onChange(n)}>{n}</button>)}
      </div></div>
  )
  const v = value ?? 5
  return (
    <div className="field"><label htmlFor={id}>{label} · <span className="num">{value ?? '—'}</span> de 10</label>
      <div className="slider"><input id={id} type="range" min={1} max={10} value={v} style={{ ['--v' as string]: `${((v - 1) / 9) * 100}%` }} onChange={(e) => onChange(Number(e.target.value))} /></div>
      <div className="ticks"><span>1</span><span>5</span><span>10</span></div></div>
  )
}

export const Field = ({ label, children, id }: { label: string; children: ReactNode; id?: string }) => (
  <div className="field"><label htmlFor={id}>{label}</label>{children}</div>
)

export const Seg = <T extends string>({ value, options, onChange, label }: { value: T; options: [T, string][]; onChange: (v: T) => void; label: string }) => (
  <div className="seg" role="group" aria-label={label}>
    {options.map(([v, l]) => <button key={v} type="button" aria-pressed={value === v} onClick={() => onChange(v)}>{l}</button>)}
  </div>
)

export const Ring = ({ p, size = 64, sw = 5, label }: { p: number; size?: number; sw?: number; label?: string }) => {
  const r = (size - sw) / 2
  const c = 2 * Math.PI * r
  const id = `rg${size}`
  return (
    <svg className="ring" width={size} height={size} viewBox={`0 0 ${size} ${size}`} role={label ? 'img' : 'presentation'} aria-label={label}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7C98F3" /><stop offset="1" stopColor="#C3D0FF" /></linearGradient></defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1C1F25" strokeWidth={sw} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#${id})`} strokeWidth={sw} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.max(0, Math.min(1, p)))} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
    </svg>
  )
}

// Dictado por voz (Web Speech API; en iPhone funciona en Safari).
type SR = { lang: string; interimResults: boolean; onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void; onend: () => void; start: () => void; stop: () => void }
const getSR = (): (new () => SR) | undefined => {
  const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition
}

export const VoiceText = ({ value, onChange, placeholder, lang = 'es', rows, id, label }: { value: string; onChange: (s: string) => void; placeholder?: string; lang?: string; rows?: number; id: string; label?: string }) => {
  const [rec, setRec] = useState<SR | null>(null)
  const Ctor = getSR()
  const toggle = () => {
    if (rec) { rec.stop(); return }
    if (!Ctor) return
    const r = new Ctor()
    r.lang = lang === 'es' ? 'es-AR' : 'en-US'
    r.interimResults = false
    r.onresult = (e) => onChange((value ? value + ' ' : '') + Array.from(e.results).map((x) => x[0].transcript).join(' '))
    r.onend = () => setRec(null)
    r.start()
    setRec(r)
  }
  return (
    <div className="field">
      {label && <label htmlFor={id}>{label}</label>}
      <div className="row" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
        {rows === 1
          ? <input id={id} className="grow" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
          : <textarea id={id} className="grow" value={value} placeholder={placeholder} rows={rows} onChange={(e) => onChange(e.target.value)} />}
        {Ctor && <button type="button" className="icon-btn" style={{ height: 44, width: 44, boxShadow: 'inset 0 0 0 1px var(--line-2)' }} aria-label={rec ? 'Detener dictado' : 'Dictar por voz'} aria-pressed={!!rec} onClick={toggle}><Icon name={rec ? 'square' : 'mic'} /></button>}
      </div>
    </div>
  )
}

/** Convierte "8,7", "8.7" o "1.250,5" en número; vacío o inválido → undefined. */
export const parseNum = (s: string): number | undefined => {
  let t = s.trim().replace(/\s/g, '')
  if (!t) return undefined
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.') // coma decimal: los puntos son de miles
  else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '') // 1.250 → 1250
  const n = Number(t)
  return Number.isFinite(n) ? n : undefined
}
const fmtNum = (v: number | string | undefined) => (typeof v === 'string' ? v : v === undefined || !Number.isFinite(v) ? '' : String(v).replace('.', ','))
const valNum = (v: number | string | undefined) => (typeof v === 'string' ? parseNum(v) : v)

/**
 * Campo numérico que acepta decimales con coma o punto (el teclado del iPhone en español usa coma,
 * y <input type="number"> la rechaza). Guarda el texto mientras se escribe para no perder "8,".
 */
export const NumInput = ({ value, onValue, decimals = true, ...rest }: { value: number | string | undefined; onValue: (n: number | undefined, raw: string) => void; decimals?: boolean } & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type' | 'inputMode'>) => {
  const [raw, setRaw] = useState(fmtNum(value))
  useEffect(() => {
    if (parseNum(raw) !== valNum(value)) setRaw(fmtNum(value))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])
  return <input {...rest} type="text" inputMode={decimals ? 'decimal' : 'numeric'} autoComplete="off" value={raw} onChange={(e) => {
    const r = e.target.value.replace(decimals ? /[^\d.,]/g : /\D/g, '')
    setRaw(r)
    onValue(parseNum(r), r)
  }} />
}
