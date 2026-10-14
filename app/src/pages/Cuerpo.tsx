import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useStore, type Data } from '../lib/store'
import { useUI } from '../lib/ui'
import { addDays, dow, fmtShort, today, uid, weekStart } from '../lib/date'
import { agendaDe, cuerpoXp, habitsFor } from '../lib/logic'
import { CARDIO, duracionRutina, FASE_LABEL, RESPIRACIONES, RUTINAS, type Respiracion, type Rutina } from '../lib/cuerpo'
import type { SesionCuerpo, TipoCuerpo } from '../lib/types'
import { Icon } from '../components/Icon'
import { Bar, Empty, Field, Seg } from '../components/ui'

type Tab = 'respirar' | 'estirar' | 'moverse'
const mins = (s: number) => `${Math.round(s / 60)} min`

/** Sonido corto y suave en los cambios de fase (el audio arranca con un toque del usuario). */
let ctx: AudioContext | null = null
const tono = (f = 520, dur = 0.12) => {
  try {
    ctx ??= new AudioContext()
    const o = ctx.createOscillator(); const g = ctx.createGain()
    o.frequency.value = f; o.type = 'sine'
    g.gain.setValueAtTime(0.0001, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur)
    o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + dur + 0.02)
  } catch { /* sin audio */ }
  try { navigator.vibrate?.(12) } catch { /* sin vibración */ }
}

/** Registra una sesión; si es estiramiento y hoy toca "Movilidad / elongación", lo marca hecho. */
const useGuardar = () => {
  const d = useStore()
  const ui = useUI()
  return (s: Omit<SesionCuerpo, 'id' | 'fecha'>) => {
    const f = today()
    const ses: SesionCuerpo = { id: uid(), fecha: f, ...s }
    const mov = s.tipo === 'estiramiento' ? habitsFor(d.habits, f).find((h) => /movilidad|elongaci|estir/i.test(h.nombre) && !d.habitLog[f]?.[h.id]) : undefined
    d.set((st) => ({
      cuerpo: [...st.cuerpo, ses],
      ...(mov ? { habitLog: { ...st.habitLog, [f]: { ...(st.habitLog[f] ?? {}), [mov.id]: 'hecho' as const } } } : {}),
    }))
    ui.notify(`${s.nombre} · ${s.minutos} min · +${cuerpoXp(ses)} XP${mov ? ` · "${mov.nombre}" hecho` : ''}`, () => useStore.getState().set((st) => ({
      cuerpo: st.cuerpo.filter((x) => x.id !== ses.id),
      ...(mov ? { habitLog: { ...st.habitLog, [f]: Object.fromEntries(Object.entries(st.habitLog[f] ?? {}).filter(([k]) => k !== mov.id)) } } : {}),
    })))
  }
}

/** Sugerencia del momento según la agenda, la hora y el check-in. */
const sugerencia = (d: Data): { tab: Tab; id: string; texto: string } => {
  const f = today()
  const h = new Date().getHours()
  const ag = agendaDe(d, f)
  const ci = d.checkins[f]
  const yaEntreno = ag.some((a) => /gimnasio|rugby|partido|entren/i.test(a.que) && Number(a.hora.slice(0, 2)) + 2 <= h)
  if (h >= 22 || h < 4) return { tab: 'respirar', id: '478', texto: 'Ya es de noche: 4 · 7 · 8 acostado ayuda a dormirte antes.' }
  if (yaEntreno) return { tab: 'estirar', id: /rugby|partido/i.test(ag.map((a) => a.que).join(' ')) ? 'espalda' : 'piernas', texto: 'Ya entrenaste hoy: estirar ahora acelera la recuperación de mañana.' }
  if (ci && (ci.estres ?? 0) >= 7) return { tab: 'respirar', id: 'suspiro', texto: 'Marcaste estrés alto en el check-in: tres minutos de suspiro fisiológico.' }
  if (h < 11) return { tab: 'estirar', id: 'despertar', texto: 'Arrancá el día moviendo columna y cadera: 5 minutos.' }
  if (h >= 20) return { tab: 'estirar', id: 'dormir', texto: 'Para bajar el ritmo antes de dormir: 4 minutos en el piso.' }
  return { tab: 'respirar', id: 'caja', texto: 'Antes de estudiar o trabajar: respiración en caja para enfocarte.' }
}

export default function Cuerpo() {
  const d = useStore()
  const ui = useUI()
  const tab = (['respirar', 'estirar', 'moverse'].includes(ui.sub ?? '') ? ui.sub : 'respirar') as Tab
  const setTab = (t: Tab) => ui.go('cuerpo', t)
  const [resp, setResp] = useState<Respiracion | null>(null)
  const [rut, setRut] = useState<Rutina | null>(null)
  const f = today()
  const ws = weekStart(f)
  const semana = d.cuerpo.filter((c) => c.fecha >= ws)
  const recup = semana.filter((c) => c.tipo === 'respiracion' || c.tipo === 'estiramiento').reduce((a, c) => a + c.minutos, 0)
  const cardio = semana.filter((c) => c.tipo === 'cardio' || c.tipo === 'caminata').reduce((a, c) => a + c.minutos, 0)
  const diasPasos = Array.from({ length: 7 }, (_, i) => addDays(ws, i)).filter((x) => x <= f)
  const pasosProm = Math.round(diasPasos.reduce((a, x) => a + (d.pasos[x] ?? 0), 0) / Math.max(1, diasPasos.filter((x) => d.pasos[x]).length))
  const metaPasos = d.profile.pasosObjetivo ?? 8000
  const metaCardio = d.profile.cardioObjetivo ?? 150
  const sug = sugerencia(d)
  const abrir = (t: Tab, id: string) => {
    if (t === 'respirar') setResp(RESPIRACIONES.find((r) => r.id === id) ?? null)
    else setRut(RUTINAS.find((r) => r.id === id) ?? null)
  }
  return (
    <div className="view">
      <header className="top"><div><div className="eyebrow">Recuperación y movimiento suave</div><h1 className="h1 display">Cuerpo</h1></div></header>

      <section className="horizon cuerpo-hero" style={{ ['--p' as string]: Math.min(1, cardio / metaCardio) }}>
        <div className="ch-sug">
          <span className="eyebrow">Para ahora</span>
          <p className="ch-t">{sug.texto}</p>
          <button className="btn btn-primary" onClick={() => abrir(sug.tab, sug.id)}><Icon name={sug.tab === 'respirar' ? 'wind' : 'stretch'} size={16} />Empezar {sug.tab === 'respirar' ? RESPIRACIONES.find((r) => r.id === sug.id)?.nombre : RUTINAS.find((r) => r.id === sug.id)?.nombre}</button>
        </div>
        <div className="ch-kpis">
          <div><span className="cap">Recuperación</span><span><span className="val-m">{recup}</span><span className="unit">min esta semana</span></span></div>
          <div><span className="cap">Cardio suave</span><span><span className="val-m">{cardio}</span><span className="unit">/ {metaCardio} min</span></span><Bar value={cardio / metaCardio} /></div>
          <div><span className="cap">Pasos (promedio)</span><span><span className="val-m">{pasosProm ? pasosProm.toLocaleString('es-AR') : '—'}</span><span className="unit">/ {metaPasos.toLocaleString('es-AR')}</span></span><Bar value={pasosProm / metaPasos} /></div>
        </div>
      </section>

      <div style={{ margin: '26px 0 20px' }}><Seg label="Sección de Cuerpo" value={tab} onChange={setTab} options={[['respirar', 'Respirar'], ['estirar', 'Estirar'], ['moverse', 'Pasos y cardio']]} /></div>

      {tab === 'respirar' && (
        <div className="cards-2">
          {RESPIRACIONES.map((r) => (
            <button key={r.id} className="rut-card" onClick={() => setResp(r)}>
              <span className="rc-ic"><Icon name="wind" size={20} /></span>
              <span className="rc-body"><b>{r.nombre}</b><span className="rc-para">{r.para}</span><span className="cap">{r.cuando}</span></span>
              <span className="rc-meta mono">{r.fases.map((x) => String(x.s).replace('.', ',')).join(' · ')}</span>
            </button>
          ))}
        </div>
      )}
      {tab === 'estirar' && (
        <div className="cards-2">
          {RUTINAS.map((r) => (
            <button key={r.id} className="rut-card" onClick={() => setRut(r)}>
              <span className="rc-ic"><Icon name="stretch" size={20} /></span>
              <span className="rc-body"><b>{r.nombre}</b><span className="rc-para">{r.para}</span><span className="cap">{r.pasos.length} ejercicios</span></span>
              <span className="rc-meta mono">{mins(duracionRutina(r))}</span>
            </button>
          ))}
        </div>
      )}
      {tab === 'moverse' && <Moverse />}

      <Historial />
      {resp && createPortal(<RespPlayer r={resp} onClose={() => setResp(null)} />, document.querySelector('.shell') ?? document.body)}
      {rut && createPortal(<RutinaPlayer r={rut} onClose={() => setRut(null)} />, document.querySelector('.shell') ?? document.body)}
    </div>
  )
}

function Moverse() {
  const d = useStore()
  const ui = useUI()
  const guardar = useGuardar()
  const f = today()
  const meta = d.profile.pasosObjetivo ?? 8000
  const [pasos, setPasos] = useState(d.pasos[f] ? String(d.pasos[f]) : '')
  const [tipo, setTipo] = useState<string>('Caminata')
  const [min, setMin] = useState('30')
  const [fc, setFc] = useState('')
  const dias = Array.from({ length: 7 }, (_, i) => addDays(f, i - 6))
  const max = Math.max(meta, ...dias.map((x) => d.pasos[x] ?? 0))
  const guardarPasos = () => {
    const n = Math.round(Number(pasos.replace(/\./g, '')))
    if (!n || n < 0) return
    const prev = d.pasos[f]
    d.set((s) => ({ pasos: { ...s.pasos, [f]: n } }))
    ui.notify(`${n.toLocaleString('es-AR')} pasos${n >= meta ? ' · meta cumplida, +10 XP' : ''}`, () => useStore.getState().set((s) => { const p = { ...s.pasos }; if (prev) p[f] = prev; else delete p[f]; return { pasos: p } }))
  }
  return (
    <div className="grid">
      <section className="panel pad">
        <h2 className="h2"><Icon name="footprints" size={16} />Pasos de hoy</h2>
        <p className="cap" style={{ margin: '-6px 0 16px' }}>Copiá el número de la app Salud del iPhone (una app web no puede leerla).</p>
        <form className="row" style={{ flexWrap: 'nowrap' }} onSubmit={(e) => { e.preventDefault(); guardarPasos() }}>
          <input className="grow" inputMode="numeric" aria-label="Pasos de hoy" placeholder={`Meta ${meta.toLocaleString('es-AR')}`} value={pasos} onChange={(e) => setPasos(e.target.value.replace(/[^\d.]/g, ''))} />
          <button className="btn btn-primary" disabled={!pasos}>Guardar</button>
        </form>
        <div className="steps-bars" role="img" aria-label="Pasos de los últimos 7 días">
          {dias.map((x) => {
            const v = d.pasos[x] ?? 0
            return <div key={x} className={`sb ${v >= meta ? 'ok' : ''} ${x === f ? 'today' : ''}`}><i style={{ height: `${Math.max(3, (v / max) * 100)}%` }} /><span>{'LMXJVSD'[dow(x)]}</span></div>
          })}
          <span className="sb-meta" style={{ bottom: `calc(${(meta / max) * 100}% * .78 + 22px)` }} />
        </div>
      </section>
      <section className="panel pad">
        <h2 className="h2"><Icon name="activity" size={16} />Cardio suave</h2>
        <p className="cap" style={{ margin: '-6px 0 16px' }}>Zona 2: podés hablar en frases cortas. Mejora la recuperación entre entrenamientos sin cansarte.</p>
        <div className="chips" style={{ flexWrap: 'wrap', marginBottom: 14 }}>{CARDIO.map((c) => <button key={c} type="button" className="chip" aria-pressed={tipo === c} onClick={() => setTipo(c)}>{c}</button>)}</div>
        <div className="form-grid">
          <Field label="Minutos" id="cd-min"><input id="cd-min" inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value.replace(/\D/g, ''))} /></Field>
          <Field label="Pulsaciones promedio (opcional)" id="cd-fc"><input id="cd-fc" inputMode="numeric" value={fc} onChange={(e) => setFc(e.target.value.replace(/\D/g, ''))} /></Field>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 16, width: '100%' }} disabled={!Number(min)} onClick={() => { guardar({ tipo: (tipo === 'Caminata' ? 'caminata' : 'cardio') as TipoCuerpo, nombre: tipo, minutos: Number(min), fc: Number(fc) || undefined }); setFc('') }}>Registrar {tipo.toLowerCase()}</button>
      </section>
    </div>
  )
}

function Historial() {
  const d = useStore()
  const lista = [...d.cuerpo].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 12)
  const ic: Record<TipoCuerpo, string> = { respiracion: 'wind', estiramiento: 'stretch', cardio: 'activity', caminata: 'footprints' }
  return (
    <>
      <div className="sec"><span className="eyebrow">Últimas sesiones</span></div>
      {lista.length === 0 ? <section className="panel"><Empty icon="leaf" title="Todavía no hay sesiones">Empezá con la sugerencia de arriba: lleva menos de 5 minutos.</Empty></section> : (
        <div className="panel list-plain">
          {lista.map((c) => (
            <div key={c.id} className="lp-row">
              <Icon name={ic[c.tipo]} size={16} />
              <span className="grow">{c.nombre}<small>{fmtShort(c.fecha)} · {c.minutos} min{c.fc ? ` · ${c.fc} ppm` : ''}</small></span>
              <span className="cap num">+{cuerpoXp(c)} XP</span>
              <button className="icon-btn" aria-label={`Borrar ${c.nombre}`} onClick={() => d.set((s) => ({ cuerpo: s.cuerpo.filter((x) => x.id !== c.id) }))}><Icon name="trash" size={15} /></button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

// ---------- Reproductores a pantalla completa ----------
function RespPlayer({ r, onClose }: { r: Respiracion; onClose: () => void }) {
  const guardar = useGuardar()
  const [total, setTotal] = useState(180)
  const [run, setRun] = useState(false)
  const [t, setT] = useState(0) // décimas de segundo transcurridas
  const ciclo = r.fases.reduce((a, x) => a + x.s, 0)
  const enCiclo = (t / 10) % ciclo
  let acc = 0
  let idx = 0
  for (let i = 0; i < r.fases.length; i++) { if (enCiclo < acc + r.fases[i].s) { idx = i; break } acc += r.fases[i].s }
  const fase = r.fases[idx]
  const restoFase = Math.ceil(acc + fase.s - enCiclo)
  const prevIdx = useRef(-1)
  useEffect(() => {
    if (!run) return
    const id = window.setInterval(() => setT((x) => x + 1), 100)
    return () => window.clearInterval(id)
  }, [run])
  useEffect(() => { if (run && idx !== prevIdx.current) { prevIdx.current = idx; tono(fase.f === 'exhala' ? 392 : 523) } }, [idx, run, fase.f])
  const fin = t / 10 >= total
  useEffect(() => { if (fin && run) { setRun(false); tono(660, .3) } }, [fin, run])
  // Escala del círculo: crece al inhalar, se queda al sostener, se achica al exhalar.
  const escala = fase.f === 'exhala' ? 0.55 : fase.f === 'sostiene' ? (r.fases[idx - 1]?.f === 'exhala' ? 0.55 : 1) : fase.f === 'inhala2' ? 1.08 : 1
  return (
    <div className="player" role="dialog" aria-label={r.nombre} data-s="cuerpo">
      <div className="pl-top"><button className="icon-btn" aria-label="Cerrar" onClick={onClose}><Icon name="x" size={20} /></button><span className="eyebrow">{r.nombre}</span><span style={{ width: 40 }} /></div>
      <div className="pl-stage">
        <div className={`breath ${run ? 'on' : ''}`} style={{ ['--sc' as string]: run ? escala : 0.7, ['--dur' as string]: `${fase.s}s` }}>
          <span className="br-ring" /><span className="br-core" />
          <span className="br-label">{fin ? 'Listo' : run ? FASE_LABEL[fase.f] : 'Preparado'}<small className="num">{fin ? mins(total) : run ? restoFase : r.para}</small></span>
        </div>
      </div>
      <div className="pl-bottom">
        <Bar value={t / 10 / total} />
        <div className="row cap num" style={{ justifyContent: 'space-between' }}><span>{Math.floor(t / 600)}:{String(Math.floor(t / 10) % 60).padStart(2, '0')}</span><span>{mins(total)}</span></div>
        {!run && t === 0 && <div className="chips" style={{ justifyContent: 'center' }}>{[60, 180, 300].map((s) => <button key={s} className="chip" aria-pressed={total === s} onClick={() => setTotal(s)}>{s / 60} min</button>)}</div>}
        <div className="row" style={{ justifyContent: 'center', flexWrap: 'nowrap' }}>
          {fin || (!run && t > 0) ? <>
            <button className="btn btn-ghost" onClick={() => { setT(0); prevIdx.current = -1 }}>Repetir</button>
            <button className="btn btn-primary" onClick={() => { guardar({ tipo: 'respiracion', nombre: r.nombre, minutos: Math.max(1, Math.round(t / 600)) }); onClose() }}>Guardar y cerrar</button>
          </> : <button className="btn btn-primary pl-main" onClick={() => { if (!run) tono(); setRun(!run) }}><Icon name={run ? 'pause' : 'play'} size={18} />{run ? 'Pausa' : 'Empezar'}</button>}
          {run && <button className="btn btn-ghost" onClick={() => setRun(false)}>Terminar</button>}
        </div>
      </div>
    </div>
  )
}

function RutinaPlayer({ r, onClose }: { r: Rutina; onClose: () => void }) {
  const guardar = useGuardar()
  const [i, setI] = useState(0)
  const [run, setRun] = useState(false)
  const [left, setLeft] = useState(r.pasos[0].s)
  const [hecho, setHecho] = useState(0) // segundos hechos
  const p = r.pasos[i]
  const fin = i >= r.pasos.length
  useEffect(() => {
    if (!run || fin) return
    const id = window.setInterval(() => {
      setHecho((x) => x + 1)
      setLeft((x) => {
        if (x > 1) { if (x === 4) tono(440, .08); return x - 1 }
        tono(660, .18)
        setI((k) => { const n = k + 1; if (n < r.pasos.length) setLeft(r.pasos[n].s); else setRun(false); return n })
        return 0
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [run, fin, r.pasos])
  const ir = (n: number) => { if (n < 0 || n > r.pasos.length) return; setI(n); if (n < r.pasos.length) setLeft(r.pasos[n].s) }
  const total = duracionRutina(r)
  return (
    <div className="player" role="dialog" aria-label={r.nombre} data-s="cuerpo">
      <div className="pl-top"><button className="icon-btn" aria-label="Cerrar" onClick={onClose}><Icon name="x" size={20} /></button><span className="eyebrow">{r.nombre} · {mins(total)}</span><span style={{ width: 40 }} /></div>
      <div className="pl-steps" aria-hidden="true">{r.pasos.map((_, k) => <i key={k} className={k < i ? 'd' : k === i ? 'c' : ''} />)}</div>
      <div className="pl-stage col">
        {fin ? <>
          <span className="pl-big">Listo</span>
          <p className="body-2" style={{ textAlign: 'center' }}>{mins(hecho)} de estiramiento. Mañana lo vas a notar.</p>
        </> : <>
          <span className="cap num">{i + 1} de {r.pasos.length}</span>
          <h2 className="pl-name">{p.n}</h2>
          <p className="pl-cue">{p.cue}</p>
          <div className="pl-timer" style={{ ['--p' as string]: 1 - left / p.s }}><span className="num">{left}</span><small>segundos</small></div>
          {r.pasos[i + 1] && <span className="cap">Después: {r.pasos[i + 1].n}</span>}
        </>}
      </div>
      <div className="pl-bottom">
        <div className="row" style={{ justifyContent: 'center', flexWrap: 'nowrap' }}>
          {fin ? <button className="btn btn-primary pl-main" onClick={() => { guardar({ tipo: 'estiramiento', nombre: r.nombre, minutos: Math.max(1, Math.round(hecho / 60)) }); onClose() }}>Guardar y cerrar</button> : <>
            <button className="icon-btn" aria-label="Anterior" disabled={i === 0} onClick={() => ir(i - 1)}><Icon name="chevron-left" size={22} /></button>
            <button className="btn btn-primary pl-main" onClick={() => { if (!run) tono(); setRun(!run) }}><Icon name={run ? 'pause' : 'play'} size={18} />{run ? 'Pausa' : hecho ? 'Seguir' : 'Empezar'}</button>
            <button className="icon-btn" aria-label="Siguiente" onClick={() => ir(i + 1)}><Icon name="chevron-right" size={22} /></button>
          </>}
        </div>
        {!fin && hecho > 30 && <button className="btn btn-ghost" style={{ alignSelf: 'center' }} onClick={() => { setRun(false); setI(r.pasos.length) }}>Terminar acá</button>}
      </div>
    </div>
  )
}

