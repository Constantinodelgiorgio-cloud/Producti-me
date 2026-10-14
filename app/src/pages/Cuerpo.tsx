import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useStore, type Data } from '../lib/store'
import { useUI } from '../lib/ui'
import { addDays, dow, fmtShort, today, uid, weekStart } from '../lib/date'
import { agendaDe, cuerpoXp, habitsFor } from '../lib/logic'
import { listoParaHoy } from '../lib/rendimiento'
import { CARDIO, duracionRutina, FASE_LABEL, RESPIRACIONES, RUTINAS, type Fase, type Respiracion, type Rutina } from '../lib/cuerpo'
import { decir, GUIA_DEF, mantenerPantalla, renderRespiracion, sonar, vibracionDisponible, vibrar } from '../lib/guia'
import type { SesionCuerpo, TipoCuerpo } from '../lib/types'
import { Icon } from '../components/Icon'
import { Bar, Empty, Field, Seg } from '../components/ui'

type Tab = 'respirar' | 'estirar' | 'moverse'
const mins = (s: number) => `${Math.round(s / 60)} min`

/** Registra una sesión; si es estiramiento y hoy toca "Movilidad / elongación", lo marca hecho. */
const useGuardar = () => {
  const d = useStore()
  const ui = useUI()
  return (s: Omit<SesionCuerpo, 'id' | 'fecha'>) => {
    const f = today()
    const ses: SesionCuerpo = { id: uid(), fecha: f, ...s }
    const mov = s.tipo === 'estiramiento' ? habitsFor(d.habits, f).find((h) => /movilidad|elongaci|estir/i.test(h.nombre) && !d.habitLog[f]?.[h.id]) : undefined
    // En un día en rojo, recuperar es el entrenamiento: cuenta como versión mínima.
    const rojo = listoParaHoy(d, f).banda === 'rojo'
    const ent = rojo ? habitsFor(d.habits, f).find((h) => /entren/i.test(h.nombre) && !d.habitLog[f]?.[h.id]) : undefined
    d.set((st) => ({
      cuerpo: [...st.cuerpo, ses],
      ...(mov || ent ? { habitLog: { ...st.habitLog, [f]: { ...(st.habitLog[f] ?? {}), ...(mov ? { [mov.id]: 'hecho' as const } : {}), ...(ent ? { [ent.id]: 'minimo' as const } : {}) } } } : {}),
    }))
    ui.notify(`${s.nombre} · ${s.minutos} min · +${cuerpoXp(ses)} XP${mov ? ` · "${mov.nombre}" hecho` : ''}${ent ? ' · día en rojo: cuenta como entrenamiento mínimo' : ''}`, () => useStore.getState().set((st) => ({
      cuerpo: st.cuerpo.filter((x) => x.id !== ses.id),
      ...(mov || ent ? { habitLog: { ...st.habitLog, [f]: Object.fromEntries(Object.entries(st.habitLog[f] ?? {}).filter(([k]) => k !== mov?.id && k !== ent?.id)) } } : {}),
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
  const saludHoy = d.salud?.[f]
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
        {saludHoy && (saludHoy.sueno !== undefined || saludHoy.fcReposo !== undefined || saludHoy.kcalActivas !== undefined) && (
          <div className="ch-salud cap">
            <span className="eyebrow">Desde Salud, hoy</span>
            {saludHoy.sueno !== undefined && <span><Icon name="bed" size={13} />{String(saludHoy.sueno).replace('.', ',')} h de sueño</span>}
            {saludHoy.fcReposo !== undefined && <span><Icon name="heart-pulse" size={13} />{saludHoy.fcReposo} ppm en reposo</span>}
            {saludHoy.kcalActivas !== undefined && <span><Icon name="flame" size={13} />{Math.round(saludHoy.kcalActivas)} kcal activas</span>}
          </div>
        )}
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
  const auto = d.salud?.[f]
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
        {auto?.pasos !== undefined
          ? <p className="cap auto-note" style={{ margin: '-6px 0 16px' }}><span className="sync-dot on" />Llegan solos desde Salud · {auto.actualizado ? `actualizado ${new Date(auto.actualizado).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}` : 'hoy'}</p>
          : <p className="cap" style={{ margin: '-6px 0 16px' }}>Cargalos a mano o hacé que lleguen solos desde la app Salud con Atajos de iOS (<a href="https://github.com/constantinodelgiorgio-cloud/Producti-me/blob/claude/personal-productivity-wellness-app-mt7jbv/docs/15-salud-widget-y-app-nativa.md" target="_blank" rel="noreferrer">ver la guía</a>).</p>}
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

// ---------- Guía: sonido, vibración y voz ----------
function useGuia() {
  const d = useStore()
  const g = { ...GUIA_DEF, ...d.settings.guia }
  const set = (p: Partial<typeof g>) => d.set((s) => ({ settings: { ...s.settings, guia: { ...GUIA_DEF, ...s.settings.guia, ...p } } }))
  return [g, set] as const
}

function GuiaChips({ voz, onProbar }: { voz?: boolean; onProbar?: () => void }) {
  const [g, set] = useGuia()
  const vib = vibracionDisponible()
  return (
    <div className="guia">
      <div className="chips" role="group" aria-label="Guía sin mirar la pantalla">
        <button className="chip" aria-pressed={g.sonido} onClick={() => { set({ sonido: !g.sonido }); if (!g.sonido) sonar('inhala') }}><Icon name="music" size={14} />Sonido</button>
        <button className="chip" aria-pressed={g.vibracion && vib !== 'no'} disabled={vib === 'no'} onClick={() => { set({ vibracion: !g.vibracion }); if (!g.vibracion) vibrar('sostiene') }}><Icon name="smartphone" size={14} />Vibración</button>
        {voz && <button className="chip" aria-pressed={g.voz} onClick={() => { set({ voz: !g.voz }); if (!g.voz) decir('Voz activada') }}><Icon name="mic" size={14} />Voz</button>}
        {onProbar && <button className="chip" onClick={onProbar}><Icon name="play" size={13} />Probar</button>}
      </div>
      {g.vibracion && vib === 'ios' && <span className="cap">En iPhone la app web solo puede dar un toque suave (iOS 18 o posterior). Para no mirar, dejá el sonido activado.</span>}
      {vib === 'no' && <span className="cap">Este dispositivo no permite vibrar desde la app.</span>}
    </div>
  )
}

// ---------- Reproductores a pantalla completa ----------
function RespPlayer({ r, onClose }: { r: Respiracion; onClose: () => void }) {
  const guardar = useGuardar()
  const [g] = useGuia()
  const [total, setTotal] = useState(180)
  const [estado, setEstado] = useState<'listo' | 'corre' | 'pausa' | 'fin'>('listo')
  const [t, setT] = useState(0) // segundos transcurridos
  const [audio, setAudio] = useState<{ el: HTMLAudioElement; url: string } | null>(null)
  const ciclo = r.fases.reduce((a, x) => a + x.s, 0)
  const ciclos = Math.max(1, Math.round(total / ciclo))
  const duracion = ciclos * ciclo
  const enCiclo = Math.max(0, t) % ciclo
  let acc = 0
  let idx = 0
  for (let i = 0; i < r.fases.length; i++) { if (enCiclo < acc + r.fases[i].s) { idx = i; break } acc += r.fases[i].s }
  const fase = r.fases[idx]
  const restoFase = Math.max(1, Math.ceil(acc + fase.s - enCiclo))
  const run = estado === 'corre'
  const fin = estado === 'fin'
  const reloj = useRef({ desde: 0, base: 0 })
  const ultimo = useRef('')

  // El audio de toda la sesión se arma antes de tocar "Empezar" (iOS solo deja reproducir desde un toque).
  useEffect(() => {
    if (!g.sonido) { setAudio(null); return }
    let vivo = true
    let url = ''
    renderRespiracion(r.fases, total).then((x) => {
      url = x.url
      if (!vivo) { URL.revokeObjectURL(url); return }
      const el = new Audio(x.url)
      el.preload = 'auto'
      setAudio({ el, url })
    }).catch(() => setAudio(null))
    return () => { vivo = false; if (url) URL.revokeObjectURL(url) }
  }, [g.sonido, total, r.fases])
  useEffect(() => () => { audio?.el.pause() }, [audio])

  // Reloj: con sonido manda el audio (queda sincronizado aunque se bloquee la pantalla); sin sonido, el tiempo real.
  useEffect(() => {
    if (!run) return
    const id = window.setInterval(() => {
      const ahora = audio ? audio.el.currentTime - 0.3 : reloj.current.base + (performance.now() - reloj.current.desde) / 1000
      setT(ahora)
      if (ahora >= duracion) terminar()
    }, 100)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, audio, duracion])

  // Vibración en cada cambio de fase.
  const clave = `${Math.floor(Math.max(0, t) / ciclo)}:${idx}`
  useEffect(() => {
    if (!run || t < 0 || clave === ultimo.current) return
    ultimo.current = clave
    if (g.vibracion) vibrar(fase.f)
    if (!audio && g.sonido) sonar(fase.f)
  }, [clave, run, t, g.vibracion, g.sonido, fase.f, audio])

  useEffect(() => {
    const ms = navigator.mediaSession
    if (!ms || !run) return
    try {
      ms.metadata = new MediaMetadata({ title: r.nombre, artist: 'Producti-me · Cuerpo', album: `${Math.round(duracion / 60)} min` })
      ms.setActionHandler('pause', () => pausar())
      ms.setActionHandler('play', () => empezar())
    } catch { /* sin controles en la pantalla bloqueada */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run])
  useEffect(() => () => { void mantenerPantalla(false) }, [])

  const empezar = () => {
    if (audio) { void audio.el.play().catch(() => { /* sin audio */ }) }
    else reloj.current = { desde: performance.now(), base: Math.max(0, t) }
    if (estado === 'listo') ultimo.current = ''
    // Sin sonido hace falta la pantalla encendida para que los temporizadores sigan.
    void mantenerPantalla(true)
    setEstado('corre')
  }
  const pausar = () => { audio?.el.pause(); reloj.current.base = t; setEstado('pausa') }
  function terminar() {
    audio?.el.pause()
    if (g.vibracion) vibrar('fin')
    void mantenerPantalla(false)
    setEstado('fin')
  }
  const reiniciar = () => { if (audio) audio.el.currentTime = 0; setT(0); ultimo.current = ''; setEstado('listo') }
  const probar = () => {
    let k = 0
    const seq: Fase[] = ['inhala', 'sostiene', 'exhala']
    const paso = () => { const f = seq[k++]; if (!f) return; if (g.sonido) sonar(f); if (g.vibracion) vibrar(f); window.setTimeout(paso, 1400) }
    paso()
  }
  // Escala del círculo: crece al inhalar, se queda al sostener, se achica al exhalar.
  const escala = fase.f === 'exhala' ? 0.55 : fase.f === 'sostiene' ? (r.fases[idx - 1]?.f === 'exhala' ? 0.55 : 1) : fase.f === 'inhala2' ? 1.08 : 1
  const seg = Math.max(0, Math.min(t, duracion))
  return (
    <div className="player" role="dialog" aria-label={r.nombre} data-s="cuerpo">
      <div className="pl-top"><button className="icon-btn" aria-label="Cerrar" onClick={() => { audio?.el.pause(); onClose() }}><Icon name="x" size={20} /></button><span className="eyebrow">{r.nombre}</span><span style={{ width: 40 }} /></div>
      <div className="pl-stage">
        <div className={`breath ${run ? 'on' : ''}`} style={{ ['--sc' as string]: run ? escala : 0.7, ['--dur' as string]: `${fase.s}s` }}>
          <span className="br-ring" /><span className="br-core" />
          <span className="br-label">{fin ? 'Listo' : run || estado === 'pausa' ? FASE_LABEL[fase.f] : 'Preparado'}<small className="num">{fin ? mins(duracion) : run ? restoFase : estado === 'pausa' ? 'en pausa' : r.para}</small></span>
        </div>
      </div>
      <div className="pl-bottom">
        {estado === 'listo' && <>
          <div className="chips" style={{ justifyContent: 'center' }}>{[60, 180, 300].map((s) => <button key={s} className="chip" aria-pressed={total === s} onClick={() => setTotal(s)}>{s / 60} min</button>)}</div>
          <GuiaChips onProbar={probar} />
          <p className="cap" style={{ textAlign: 'center' }}>Inhalar: {g.sonido ? 'cling agudo' : ''}{g.sonido && g.vibracion ? ' + ' : ''}{g.vibracion ? '1 vibración' : ''} · Sostener: {g.sonido ? 'dos clings' : ''}{g.sonido && g.vibracion ? ' + ' : ''}{g.vibracion ? '2 vibraciones' : ''} · Exhalar: {g.sonido ? 'cling grave' : ''}{g.sonido && g.vibracion ? ' + ' : ''}{g.vibracion ? '1 vibración larga' : ''}{!g.sonido && !g.vibracion ? ' solo en pantalla' : ''}</p>
        </>}
        {estado !== 'listo' && <>
          <Bar value={seg / duracion} />
          <div className="row cap num" style={{ justifyContent: 'space-between' }}><span>{Math.floor(seg / 60)}:{String(Math.floor(seg) % 60).padStart(2, '0')}</span><span>{mins(duracion)}</span></div>
        </>}
        <div className="row" style={{ justifyContent: 'center', flexWrap: 'nowrap' }}>
          {fin || estado === 'pausa' ? <>
            {estado === 'pausa' && <button className="btn btn-primary" onClick={empezar}><Icon name="play" size={16} />Seguir</button>}
            {fin && <button className="btn btn-ghost" onClick={reiniciar}>Repetir</button>}
            <button className={`btn ${fin ? 'btn-primary' : 'btn-ghost'}`} onClick={() => { audio?.el.pause(); guardar({ tipo: 'respiracion', nombre: r.nombre, minutos: Math.max(1, Math.round(seg / 60)) }); onClose() }}>Guardar y cerrar</button>
          </> : <button className="btn btn-primary pl-main" disabled={g.sonido && !audio} onClick={() => (run ? pausar() : empezar())}><Icon name={run ? 'pause' : 'play'} size={18} />{run ? 'Pausa' : g.sonido && !audio ? 'Preparando…' : 'Empezar'}</button>}
        </div>
        {run && <p className="cap" style={{ textAlign: 'center' }}>{audio ? 'Podés bloquear el teléfono o dejarlo boca abajo: el sonido te guía.' : 'La pantalla queda encendida mientras dure la sesión.'}</p>}
      </div>
    </div>
  )
}

function RutinaPlayer({ r, onClose }: { r: Rutina; onClose: () => void }) {
  const guardar = useGuardar()
  const [g] = useGuia()
  const [i, setI] = useState(0)
  const [run, setRun] = useState(false)
  const [left, setLeft] = useState(r.pasos[0].s)
  const [hecho, setHecho] = useState(0) // segundos hechos
  const p = r.pasos[i]
  const fin = i >= r.pasos.length
  const anunciado = useRef(-1)
  const gr = useRef(g)
  gr.current = g
  // Al empezar cada ejercicio: aviso + nombre en voz alta, para no tener que mirar.
  useEffect(() => {
    if (!run || anunciado.current === i) return
    anunciado.current = i
    const G = gr.current
    if (fin) {
      if (G.sonido) sonar('fin'); if (G.vibracion) vibrar('fin'); if (G.voz) decir('Listo. Rutina terminada.')
      return
    }
    if (G.sonido) sonar('cambio')
    if (G.vibracion) vibrar('cambio')
    if (G.voz) window.setTimeout(() => decir(`${r.pasos[i].n.replace(' · ', ', ')}. ${r.pasos[i].s} segundos.`), G.sonido ? 500 : 0)
  }, [i, run, fin, r.pasos])
  useEffect(() => {
    if (!run || fin) return
    const id = window.setInterval(() => {
      setHecho((x) => x + 1)
      setLeft((x) => {
        if (x > 1) {
          if (x === 4) { if (gr.current.sonido) sonar('aviso', 0.12); if (gr.current.vibracion) vibrar('aviso') }
          return x - 1
        }
        setI((k) => { const n = k + 1; if (n < r.pasos.length) setLeft(r.pasos[n].s); else { setRun(false); void mantenerPantalla(false) } return n })
        return 0
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [run, fin, r.pasos])
  useEffect(() => () => { void mantenerPantalla(false); try { window.speechSynthesis?.cancel() } catch { /* */ } }, [])
  const ir = (n: number) => { if (n < 0 || n > r.pasos.length) return; anunciado.current = -1; setI(n); if (n < r.pasos.length) setLeft(r.pasos[n].s) }
  const toggle = () => {
    if (!run) { sonar('aviso', 0.0001); void mantenerPantalla(true); anunciado.current = hecho ? i : -1 } else void mantenerPantalla(false)
    setRun(!run)
  }
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
        {!run && !hecho && !fin && <GuiaChips voz />}
        <div className="row" style={{ justifyContent: 'center', flexWrap: 'nowrap' }}>
          {fin ? <button className="btn btn-primary pl-main" onClick={() => { guardar({ tipo: 'estiramiento', nombre: r.nombre, minutos: Math.max(1, Math.round(hecho / 60)) }); onClose() }}>Guardar y cerrar</button> : <>
            <button className="icon-btn" aria-label="Anterior" disabled={i === 0} onClick={() => ir(i - 1)}><Icon name="chevron-left" size={22} /></button>
            <button className="btn btn-primary pl-main" onClick={toggle}><Icon name={run ? 'pause' : 'play'} size={18} />{run ? 'Pausa' : hecho ? 'Seguir' : 'Empezar'}</button>
            <button className="icon-btn" aria-label="Siguiente" onClick={() => ir(i + 1)}><Icon name="chevron-right" size={22} /></button>
          </>}
        </div>
        {run && <p className="cap" style={{ textAlign: 'center' }}>{g.voz ? 'Te aviso en voz alta cada ejercicio: dejá el teléfono en el piso.' : 'Suena al cambiar de ejercicio y 3 segundos antes.'}</p>}
        {!fin && hecho > 30 && !run && <button className="btn btn-ghost" style={{ alignSelf: 'center' }} onClick={() => setI(r.pasos.length)}>Terminar acá</button>}
      </div>
    </div>
  )
}
