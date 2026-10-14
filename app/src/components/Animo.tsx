import { useEffect, useRef, useState } from 'react'
import { useStore } from '../lib/store'
import { useUI } from '../lib/ui'
import { today, uid } from '../lib/date'
import { PALABRAS_ANIMO, TIPOS_ENOJO } from '../lib/seed'
import { hayRiesgo } from '../lib/seguridad'
import { sonar } from '../lib/guia'
import type { JournalEntry } from '../lib/types'
import { Icon } from './Icon'

export type Cuadrante = keyof typeof PALABRAS_ANIMO
export const cuadranteDe = (v: number, a: number): Cuadrante => (a >= 0 ? (v >= 0 ? 'alto-bien' : 'alto-mal') : (v >= 0 ? 'bajo-bien' : 'bajo-mal'))
/** Ánimo 1–10 a partir del agrado (−5 a 5), para los gráficos de siempre. */
export const animoDe = (v: number) => Math.max(1, Math.min(10, Math.round(((v + 5) / 10) * 9 + 1)))
const COLOR: Record<Cuadrante, string> = { 'alto-mal': '#E5766F', 'bajo-mal': '#6F8FE0', 'bajo-bien': '#5FBF92', 'alto-bien': '#E0C252' }

/** Medidor de ánimo (energía × agrado) y después una palabra precisa: nombrar lo que sentís ayuda a regularlo. */
export const MoodMeter = ({ v, a, palabra, onChange }: { v?: number; a?: number; palabra?: string; onChange: (x: { v: number; a: number; palabra?: string }) => void }) => {
  const ref = useRef<HTMLDivElement>(null)
  const set = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect()
    const nv = Math.round(((e.clientX - r.left) / r.width) * 10 - 5)
    const na = Math.round((1 - (e.clientY - r.top) / r.height) * 10 - 5)
    const cv = Math.max(-5, Math.min(5, nv))
    const ca = Math.max(-5, Math.min(5, na))
    onChange({ v: cv, a: ca, palabra: palabra && v !== undefined && a !== undefined && cuadranteDe(v, a) === cuadranteDe(cv, ca) ? palabra : undefined })
  }
  const q = v !== undefined && a !== undefined ? cuadranteDe(v, a) : null
  return (
    <div className="mood">
      <div className="mood-pad" ref={ref} role="slider" aria-label="Medidor de ánimo: horizontal agrado, vertical energía" aria-valuetext={q ? `${palabra ?? q}` : 'sin elegir'} tabIndex={0}
        onPointerDown={(e) => { ref.current?.setPointerCapture(e.pointerId); set(e) }} onPointerMove={(e) => { if (e.buttons) set(e) }}>
        <span className="mq q1" /><span className="mq q2" /><span className="mq q3" /><span className="mq q4" />
        <span className="mood-ax y">más energía</span><span className="mood-ax y b">menos energía</span>
        <span className="mood-ax x">desagradable</span><span className="mood-ax x r">agradable</span>
        {q && <span className="mood-dot" style={{ left: `${((v! + 5) / 10) * 100}%`, top: `${(1 - (a! + 5) / 10) * 100}%`, background: COLOR[q] }} />}
      </div>
      {q && <div className="chips mood-words" style={{ flexWrap: 'wrap' }}>
        {PALABRAS_ANIMO[q].map((w) => <button key={w} type="button" className="chip" aria-pressed={palabra === w} onClick={() => onChange({ v: v!, a: a!, palabra: palabra === w ? undefined : w })}>{w}</button>)}
      </div>}
      {!q && <p className="cap">Tocá dónde estás: arriba más energía, a la derecha más agradable. Después elegí la palabra más precisa.</p>}
    </div>
  )
}

/** Respiración guiada mínima (5,5 s inhalar / 5,5 s exhalar) para bajar la activación antes de escribir. */
const MiniRespiracion = ({ onListo }: { onListo: () => void }) => {
  const [t, setT] = useState(0)
  useEffect(() => { sonar('inhala', 0.12); const id = window.setInterval(() => setT((x) => x + 1), 1000); return () => window.clearInterval(id) }, [])
  const ciclo = t % 11
  const inhala = ciclo < 5.5
  useEffect(() => { if (t > 0 && (ciclo === 0 || ciclo === 6)) sonar(ciclo === 0 ? 'inhala' : 'exhala', 0.12) }, [t, ciclo])
  useEffect(() => { if (t >= 90) onListo() }, [t, onListo])
  return (
    <div className="mini-resp">
      <div className={`mr-circle ${inhala ? 'in' : 'out'}`}><span>{inhala ? 'Inhalá' : 'Exhalá'}</span></div>
      <p className="cap num">{90 - t} s · respirar lento baja el enojo; descargarse no</p>
      {t >= 30 && <button className="btn btn-ghost btn-sm" onClick={onListo}>Ya estoy un poco más tranquilo</button>}
    </div>
  )
}

/** Módulo de enojo: primero bajar la temperatura, después nombrarlo, mirarlo desde afuera y elegir un paso. */
export const EnojoFlow = ({ onClose }: { onClose: () => void }) => {
  const d = useStore()
  const ui = useUI()
  const [paso, setPaso] = useState(0)
  const [antes, setAntes] = useState(7)
  const [tipo, setTipo] = useState<string>()
  const [con, setCon] = useState('')
  const [afuera, setAfuera] = useState('')
  const [amigo, setAmigo] = useState('')
  const [accion, setAccion] = useState<string>()
  const [detalle, setDetalle] = useState('')
  const [despues, setDespues] = useState(5)
  const nombre = d.profile.nombre
  const guardar = () => {
    const preguntas = [
      { p: 'Qué tipo de enojo y con qué', r: [tipo, con].filter(Boolean).join(' · ') },
      { p: `¿Qué le pasa a ${nombre}, visto desde afuera?`, r: afuera.trim() },
      { p: '¿Qué vería un amigo que lo quiere?', r: amigo.trim() },
      { p: 'El próximo paso', r: [accion, detalle.trim()].filter(Boolean).join(': ') },
    ].filter((x) => x.r)
    const e: JournalEntry = { id: uid(), fecha: today(), hora: new Date().toTimeString().slice(0, 5), modo: 'enojo', texto: preguntas.map((x) => `${x.p}\n${x.r}`).join('\n\n'), preguntas, emocion: tipo ?? 'Enojado', antes, despues, valencia: -3, activacion: Math.round(((despues - 1) / 9) * 10 - 5), animo: animoDe(-3) }
    d.set((s) => ({ journal: [...s.journal, e] }))
    onClose()
    if (hayRiesgo(e.texto)) { ui.openSheet('ayuda'); return }
    ui.notify(antes > despues ? `Bajaste de ${antes} a ${despues}. Eso es regularte.` : 'Guardado. A veces alcanza con nombrarlo.')
  }
  return (
    <div className="writer enojo" role="dialog" aria-modal="true" aria-label="Bajar el enojo">
      <header className="w-top">
        <button className="icon-btn" aria-label="Cerrar" onClick={onClose}><Icon name="x" size={20} /></button>
        <span className="w-when">Bajar la temperatura · paso {paso + 1} de 4</span>
        <span />
      </header>
      <div className="w-body">
        {paso === 0 && <>
          <h2 className="w-title">Primero, el cuerpo.</h2>
          <p className="r-txt">El enojo es activación. Antes de pensar o escribir, 90 segundos de respiración lenta.</p>
          <MiniRespiracion onListo={() => setPaso(1)} />
        </>}
        {paso === 1 && <>
          <h2 className="w-title">¿Qué tipo de enojo es?</h2>
          <div className="chips" style={{ flexWrap: 'wrap' }}>{TIPOS_ENOJO.map((x) => <button key={x} className="chip" aria-pressed={tipo === x} onClick={() => setTipo(x)}>{x}</button>)}</div>
          <div className="field"><label htmlFor="en-con">¿Con qué o con quién?</label><input id="en-con" value={con} onChange={(e) => setCon(e.target.value)} placeholder="Ej. con el profesor por la nota del parcial" /></div>
          <div className="field"><label htmlFor="en-a">¿Qué tan fuerte, ahora? · <span className="num">{antes}</span>/10</label><div className="slider"><input id="en-a" type="range" min={1} max={10} value={antes} style={{ ['--v' as string]: `${((antes - 1) / 9) * 100}%` }} onChange={(e) => setAntes(Number(e.target.value))} /></div></div>
          <button className="btn btn-primary btn-block" disabled={!tipo} onClick={() => setPaso(2)}>Seguir</button>
        </>}
        {paso === 2 && <>
          <h2 className="w-title">Ahora, desde afuera.</h2>
          <p className="r-txt">Como una mosca en la pared: contalo en tercera persona. Mirarlo desde afuera baja el enojo; revivirlo, no.</p>
          <div className="field"><label htmlFor="en-af">¿Qué le pasa a {nombre}?</label><textarea id="en-af" rows={4} value={afuera} onChange={(e) => setAfuera(e.target.value)} placeholder={`${nombre} está enojado porque…`} /></div>
          <div className="field"><label htmlFor="en-am">¿Qué vería un amigo que lo quiere?</label><textarea id="en-am" rows={3} value={amigo} onChange={(e) => setAmigo(e.target.value)} placeholder="Que…" /></div>
          <button className="btn btn-primary btn-block" onClick={() => setPaso(3)}>Seguir</button>
        </>}
        {paso === 3 && <>
          <h2 className="w-title">Un paso hacia adelante.</h2>
          <div className="chips" style={{ flexWrap: 'wrap' }}>{['Hablarlo mañana con calma', 'Poner un límite', 'Pedir perdón', 'Soltarlo', 'Nada por ahora'].map((x) => <button key={x} className="chip" aria-pressed={accion === x} onClick={() => setAccion(x)}>{x}</button>)}</div>
          <div className="field"><label htmlFor="en-d">Concretamente (opcional)</label><input id="en-d" value={detalle} onChange={(e) => setDetalle(e.target.value)} placeholder="Ej. le escribo a Juan mañana a la tarde" /></div>
          <div className="field"><label htmlFor="en-b">¿Qué tan fuerte, ahora? · <span className="num">{despues}</span>/10 <span className="cap">(antes {antes})</span></label><div className="slider"><input id="en-b" type="range" min={1} max={10} value={despues} style={{ ['--v' as string]: `${((despues - 1) / 9) * 100}%` }} onChange={(e) => setDespues(Number(e.target.value))} /></div></div>
          <button className="btn btn-primary btn-block" onClick={guardar}>Guardar</button>
        </>}
      </div>
    </div>
  )
}
