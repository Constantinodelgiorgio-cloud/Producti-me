import { useState, type ReactNode } from 'react'
import type { Note } from '../lib/logic'

export const Card = ({ title, right, children, className = '' }: { title?: ReactNode; right?: ReactNode; children: ReactNode; className?: string }) => (
  <section className={`card ${className}`}>
    {title && <h2>{title}<span className="sp" />{right}</h2>}
    {children}
  </section>
)

export const Bar = ({ value, color }: { value: number; color?: string }) => (
  <div className="bar"><i style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, background: color }} /></div>
)

export const Notes = ({ items, empty }: { items: Note[]; empty?: string }) =>
  items.length === 0 ? <p className="muted small">{empty ?? 'Nada por ahora.'}</p> : (
    <div>{items.map((n, i) => <div key={i} className={`note ${n.tone ?? ''}`}><span>{n.icon}</span><span>{n.text}</span></div>)}</div>
  )

export const Scale = ({ value, onChange, max = 10, min = 1 }: { value?: number; onChange: (n: number) => void; max?: number; min?: number }) => (
  <div className="scale">
    {Array.from({ length: max - min + 1 }, (_, i) => i + min).map((n) => (
      <button key={n} className={value === n ? 'on' : ''} onClick={() => onChange(n)}>{n}</button>
    ))}
  </div>
)

export const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="grow"><label className="f">{label}</label>{children}</div>
)

// Dictado por voz (Web Speech API; en iPhone funciona en Safari).
type SR = { lang: string; interimResults: boolean; onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void; onend: () => void; start: () => void; stop: () => void }
const getSR = (): (new () => SR) | undefined => {
  const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition
}

export const VoiceText = ({ value, onChange, placeholder, lang = 'es', rows }: { value: string; onChange: (s: string) => void; placeholder?: string; lang?: string; rows?: number }) => {
  const [rec, setRec] = useState<SR | null>(null)
  const Ctor = getSR()
  const toggle = () => {
    if (rec) { rec.stop(); return }
    if (!Ctor) return
    const r = new Ctor()
    r.lang = lang === 'es' ? 'es-AR' : 'en-US'
    r.interimResults = false
    r.onresult = (e) => {
      const txt = Array.from(e.results).map((x) => x[0].transcript).join(' ')
      onChange((value ? value + ' ' : '') + txt)
    }
    r.onend = () => setRec(null)
    r.start()
    setRec(r)
  }
  return (
    <div className="row" style={{ alignItems: 'flex-start' }}>
      {rows === 1
        ? <input className="grow" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
        : <textarea className="grow" value={value} placeholder={placeholder} rows={rows} onChange={(e) => onChange(e.target.value)} />}
      {Ctor && <button className="btn" title="Dictar" onClick={toggle}>{rec ? '⏹️' : '🎙️'}</button>}
    </div>
  )
}
