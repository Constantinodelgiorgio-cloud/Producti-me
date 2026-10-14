import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useStore } from '../lib/store'
import { useUI, type Route } from '../lib/ui'
import { dow, today, uid } from '../lib/date'
import { bedtimeFor, sleepHours } from '../lib/logic'
import type { CheckIn, Pinned } from '../lib/types'
import { Icon } from './Icon'
import { LINEAS } from '../lib/seguridad'
import { Field, NumInput, Scale, VoiceText } from './ui'

/** Hoja inferior (diálogo centrado en escritorio): arrastrar para cerrar, Esc, foco atrapado. */
export const Sheet = ({ label, children }: { label: string; children: ReactNode }) => {
  const close = useUI((s) => s.closeSheet)
  const ref = useRef<HTMLElement>(null)
  const drag = useRef<{ y0: number; dy: number } | null>(null)
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    const first = ref.current?.querySelector<HTMLElement>('button, input, select, textarea')
    first?.focus({ preventScroll: true })
    return () => prev?.focus?.({ preventScroll: true })
  }, [])
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.stopPropagation(); close(); return }
    if (e.key !== 'Tab' || !ref.current) return
    const f = [...ref.current.querySelectorAll<HTMLElement>('button:not([disabled]), input, select, textarea')]
    if (!f.length) return
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1)!.focus() }
    else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus() }
  }
  return (
    <>
      <div className="scrim" onClick={close} />
      <section className="sheet" ref={ref} role="dialog" aria-modal="true" aria-label={label} onKeyDown={onKey}>
        <div className="grab"
          onPointerDown={(e) => { drag.current = { y0: e.clientY, dy: 0 }; ref.current?.classList.add('dragging'); try { (e.target as HTMLElement).setPointerCapture(e.pointerId) } catch { /* sin captura */ } }}
          onPointerMove={(e) => { if (!drag.current || !ref.current) return; drag.current.dy = Math.max(0, e.clientY - drag.current.y0); ref.current.style.transform = `translateY(${drag.current.dy}px)` }}
          onPointerUp={() => { if (!ref.current) return; ref.current.classList.remove('dragging'); if ((drag.current?.dy ?? 0) > 90) close(); else ref.current.style.transform = ''; drag.current = null }}>
          <i />
        </div>
        <div className="sheet-body">{children}</div>
      </section>
    </>
  )
}

const TILES: { icon: string; n: string; s: string; go?: [Route, string?]; act?: 'checkin'; tone: string }[] = [
  { icon: 'utensils', n: 'Comida', s: 'Buscá o repetí', go: ['comida'], tone: 'fisico' },
  { icon: 'receipt', n: 'Gasto', s: 'En pesos', go: ['finanzas', 'movimientos'], tone: 'finanzas' },
  { icon: 'file-text', n: 'Comprobante', s: 'Foto o texto', go: ['finanzas', 'comprobante'], tone: 'finanzas' },
  { icon: 'dumbbell', n: 'Entrenamiento', s: 'Sesión del día', go: ['fisico', 'entreno'], tone: 'fisico' },
  { icon: 'timer', n: 'Estudio', s: 'Con evidencia', go: ['estudio'], tone: 'estudio' },
  { icon: 'message-circle', n: 'Contacto', s: 'Amigos', go: ['vida', 'amigos'], tone: 'vida' },
  { icon: 'feather', n: 'Diario', s: 'Escribir', go: ['vida', 'diario'], tone: 'vida' },
  { icon: 'sun', n: 'Check-in', s: 'Mañana o noche', act: 'checkin', tone: 'hoy' },
  { icon: 'wind', n: 'Respirar', s: '1 a 5 min', go: ['cuerpo', 'respirar'], tone: 'cuerpo' },
  { icon: 'stretch', n: 'Estirar', s: 'Rutina guiada', go: ['cuerpo', 'estirar'], tone: 'cuerpo' },
  { icon: 'footprints', n: 'Pasos o cardio', s: 'Movimiento suave', go: ['cuerpo', 'moverse'], tone: 'cuerpo' },
  { icon: 'sparkles', n: 'Coach', s: 'Contale algo', go: ['coach'], tone: 'coach' },
]

export const RegistrarSheet = () => {
  const ui = useUI()
  const meals = useStore((s) => s.meals)
  const set = useStore((s) => s.set)
  const recent: typeof meals = []
  for (const m of [...meals].reverse()) { if (!recent.find((r) => r.nombre === m.nombre)) recent.push(m); if (recent.length === 4) break }
  const repeat = (m: (typeof meals)[number]) => {
    const id = uid()
    set((s) => ({ meals: [...s.meals, { ...m, id, fecha: today() }] }))
    ui.closeSheet()
    ui.notify(`${m.nombre} · +${m.kcal} kcal · ${m.prot} g de proteína`, () => set((s) => ({ meals: s.meals.filter((x) => x.id !== id) })))
  }
  return (
    <Sheet label="Registrar">
      <div className="sheet-head"><h2>Registrar</h2><span className="kbd only-desk">R</span></div>
      {recent.length > 0 && <>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Repetir lo último</div>
        <div className="hscroll" style={{ marginBottom: 16 }}>{recent.map((m) => <button key={m.id} className="food" onClick={() => repeat(m)}><Icon name="undo" size={14} />{m.nombre}<small>{m.prot} g P</small></button>)}</div>
      </>}
      <div className="log-grid">
        {TILES.map((t) => (
          <button key={t.n} className="log-tile" data-s={t.tone} onClick={() => t.act ? ui.openSheet(new Date().getHours() >= 17 ? 'checkin-noche' : 'checkin-manana') : ui.go(t.go![0] as Route, t.go![1])}>
            <Icon name={t.icon} size={19} /><span>{t.n}<small>{t.s}</small></span>
          </button>
        ))}
      </div>
    </Sheet>
  )
}

const PINNABLE: [Pinned, string, string][] = [['fisico', 'Físico', 'dumbbell'], ['estudio', 'Estudio', 'book-open'], ['finanzas', 'Finanzas', 'wallet'], ['vida', 'Vida', 'users']]
export const MasSheet = () => {
  const ui = useUI()
  const pinned = useStore((s) => s.settings.pinned ?? 'fisico')
  const set = useStore((s) => s.set)
  const items: [Route, string, string][] = [...PINNABLE.filter(([k]) => k !== pinned), ['revision', 'Revisión semanal', 'calendar-check'], ['ajustes', 'Ajustes', 'settings']]
  return (
    <Sheet label="Más">
      <div className="sheet-head"><h2>Más</h2></div>
      <div className="stack" style={{ gap: 2 }}>
        {items.map(([k, n, i]) => <button key={k} className="side-btn" style={{ minHeight: 48 }} onClick={() => ui.go(k)}><Icon name={i} />{n}<Icon name="chevron-right" size={16} className="end" /></button>)}
      </div>
      <div className="eyebrow" style={{ margin: '20px 0 8px' }}>Pantalla fijada en la barra</div>
      <div className="chips">{PINNABLE.map(([k, n]) => (
        <button key={k} className="chip" aria-pressed={pinned === k} onClick={() => set((s) => ({ settings: { ...s.settings, pinned: k } }))}>{pinned === k && <Icon name="pin" size={13} />}{n}</button>
      ))}</div>
    </Sheet>
  )
}

export const CheckinSheet = ({ kind }: { kind: 'manana' | 'noche' }) => {
  const f = today()
  const ci = useStore((s) => s.checkins[f])
  const profile = useStore((s) => s.profile)
  const lang = useStore((s) => s.settings.lang)
  const set = useStore((s) => s.set)
  const ui = useUI()
  const [d, setD] = useState<CheckIn>(() => ci ?? { fecha: f, horaDespertar: profile.despertar[dow(f)] })
  const pesoHoy = useStore((s) => s.body.find((b) => b.fecha === f)?.peso)
  const [peso, setPeso] = useState<number | undefined>(pesoHoy)
  const up = (p: Partial<CheckIn>) => setD((x) => ({ ...x, ...p }))
  const hs = sleepHours(d.horaDormir, d.horaDespertar)
  const save = () => {
    set((s) => ({
      checkins: { ...s.checkins, [f]: { ...(s.checkins[f] ?? { fecha: f }), ...d } },
      // Pesarse en el mismo momento que el check-in casi duplica los días registrados.
      ...(peso && peso !== pesoHoy ? { body: [...s.body.filter((b) => b.fecha !== f), { ...(s.body.find((b) => b.fecha === f) ?? { fecha: f }), peso }] } : {}),
    }))
    ui.closeSheet()
    ui.notify(kind === 'manana' ? 'Check-in de la mañana guardado' : 'Check-in de la noche guardado')
  }
  return (
    <Sheet label={kind === 'manana' ? 'Check-in de la mañana' : 'Check-in de la noche'}>
      <div className="sheet-head"><h2>{kind === 'manana' ? 'Check-in de la mañana' : 'Check-in de la noche'}</h2><span className="cap">{kind === 'manana' ? '≈ 30 s' : '≈ 1 min'}</span></div>
      <div className="stack" style={{ gap: 16 }}>
        {kind === 'manana' ? <>
          <div className="form-grid">
            <Field label="Me acosté" id="ci-dormir"><input id="ci-dormir" type="time" value={d.horaDormir ?? ''} onChange={(e) => up({ horaDormir: e.target.value })} /></Field>
            <Field label="Me levanté" id="ci-desp"><input id="ci-desp" type="time" value={d.horaDespertar ?? ''} onChange={(e) => up({ horaDespertar: e.target.value })} /></Field>
          </div>
          {hs !== null && <p className="cap" style={{ marginTop: -8 }}>{hs.toFixed(1).replace('.', ',')} h de sueño · {hs >= profile.suenoMin ? 'meta cumplida' : `${(profile.suenoMin - hs).toFixed(1).replace('.', ',')} h menos que tu meta`}</p>}
          <Scale id="ci-cal" max={5} label="Calidad del sueño" value={d.calidadSueno} onChange={(n) => up({ calidadSueno: n })} />
          <Scale id="ci-en" max={5} label="Energía" value={d.energia} onChange={(n) => up({ energia: n })} />
          <Scale id="ci-do" max={5} label="Dolor muscular (1 = nada, 5 = mucho)" value={d.dolor} onChange={(n) => up({ dolor: n })} />
          <Scale id="ci-fa" max={5} label="Fatiga (1 = nada, 5 = mucha)" value={d.fatiga} onChange={(n) => up({ fatiga: n })} />
          <Scale id="ci-am" label="Ánimo" value={d.animoManana} onChange={(n) => up({ animoManana: n })} />
          <Field label="Peso de hoy (opcional, en ayunas)" id="ci-peso"><NumInput id="ci-peso" value={peso} placeholder="kg" onValue={(n) => setPeso(n)} /></Field>
          <VoiceText id="ci-prio" rows={1} label="Prioridad n.º 1 de hoy" lang={lang} value={d.prioridad ?? ''} onChange={(v) => up({ prioridad: v })} placeholder="Si hoy solo hacés una cosa, ¿cuál es?" />
        </> : <>
          <Scale id="ci-an" label="Ánimo" value={d.animoNoche} onChange={(n) => up({ animoNoche: n })} />
          <Scale id="ci-es" label="Estrés" value={d.estres} onChange={(n) => up({ estres: n })} />
          <Scale id="ci-eo" label="Enojo" value={d.enojo} onChange={(n) => up({ enojo: n })} />
          <div className="field"><label>¿Cumpliste la prioridad{d.prioridad ? `: "${d.prioridad}"` : ''}?</label>
            <div className="scale5" role="radiogroup" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
              {(['si', 'parcial', 'no'] as const).map((v) => <button key={v} type="button" role="radio" aria-checked={d.prioridadCumplida === v} style={{ fontFamily: 'var(--font)' }} onClick={() => up({ prioridadCumplida: v })}>{v === 'si' ? 'Sí' : v === 'parcial' ? 'Parcial' : 'No'}</button>)}
            </div></div>
          <VoiceText id="ci-vic" rows={1} label="Victoria del día" lang={lang} value={d.victoria ?? ''} onChange={(v) => up({ victoria: v })} placeholder="Algo que salió bien, aunque sea chico" />
          <VoiceText id="ci-nota" label="Nota libre" lang={lang} value={d.nota ?? ''} onChange={(v) => up({ nota: v })} placeholder="Qué pasó hoy, qué te afectó…" />
          <p className="cap">Para dormir {String(profile.suenoMin).replace('.', ',')} h, acostate antes de las {bedtimeFor(profile.despertar[(dow(f) + 1) % 7], profile.suenoMin)}.</p>
        </>}
        <div className="row" style={{ flexWrap: 'nowrap' }}><button className="btn btn-ghost" onClick={ui.closeSheet}>Ahora no</button><button className="btn btn-primary grow" onClick={save}>Guardar check-in</button></div>
      </div>
    </Sheet>
  )
}

export const ConfirmSheet = () => {
  const req = useUI((s) => s.confirmReq)
  if (!req) return null
  const done = (ok: boolean) => { req.resolve(ok); useUI.setState({ sheet: null, confirmReq: null }) }
  return (
    <Sheet label={req.title}>
      <div className="sheet-head"><h2>{req.title}</h2></div>
      {req.body && <p className="body-2" style={{ marginBottom: 20 }}>{req.body}</p>}
      <div className="row" style={{ flexWrap: 'nowrap' }}><button className="btn btn-quiet grow" onClick={() => done(false)}>Cancelar</button><button className={`btn grow ${req.danger ? 'btn-danger' : 'btn-primary'}`} onClick={() => done(true)}>{req.confirm}</button></div>
    </Sheet>
  )
}

/** Ayuda inmediata: líneas nacionales, sin juicio y sin coach. */
export const AyudaSheet = () => {
  const ui = useUI()
  return (
    <Sheet label="Ayuda ahora">
      <div className="sheet-head"><h2>No estás solo</h2></div>
      <p className="body-2" style={{ marginBottom: 16 }}>Si estás pensando en hacerte daño o sentís que no podés más, hablá ahora con alguien. Las líneas son gratuitas y atienden personas preparadas para escucharte. También podés escribirle ya a alguien de confianza o ir a la guardia más cercana.</p>
      <div className="stack" style={{ gap: 10 }}>
        {LINEAS.map((l) => (
          <a key={l.tel} className="linea" href={`tel:${l.tel}`}>
            <Icon name="phone" size={18} />
            <span className="grow"><b>{l.nombre}</b><small>{l.detalle}</small></span>
            <span className="num">{l.numero}</span>
          </a>
        ))}
      </div>
      <p className="cap" style={{ marginTop: 14 }}>Si un número no responde, llamá al 911. Producti-me no reemplaza a un profesional.</p>
      <button className="btn btn-ghost" style={{ marginTop: 10, width: '100%' }} onClick={ui.closeSheet}>Cerrar</button>
    </Sheet>
  )
}
