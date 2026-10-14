import { useEffect, useState } from 'react'
import { useStore } from '../lib/store'
import { useUI } from '../lib/ui'
import { castigosPendientes, comoReparar, fmtLeft, penaltyTime, sancionActiva, SANCION_HOURS } from '../lib/logic'
import { fmtShort, today, uid } from '../lib/date'
import type { Penalty } from '../lib/types'
import { Icon } from './Icon'
import { Sheet } from './Sheets'

/** Refresca cada 30 s para que el tiempo restante se mueva. */
export const useTick = (ms = 30_000) => {
  const [, t] = useState(0)
  useEffect(() => { const id = setInterval(() => t((x) => x + 1), ms); return () => clearInterval(id) }, [ms])
}

const urg = (frac: number) => (frac < 0.2 ? 'crit' : frac < 0.5 ? 'warn' : 'ok')

/** Reloj de arena: la arena de arriba baja a medida que se consume el tiempo. */
export const Hourglass = ({ frac, size = 40 }: { frac: number; size?: number }) => {
  const f = Math.max(0, Math.min(1, frac))
  const top = 4 + 22 * (1 - f) // nivel de arena arriba
  const bot = 52 - 22 * (1 - f) // pila de abajo
  const id = `hg${Math.round(f * 1000)}${size}`
  return (
    <svg className={`hourglass ${urg(f)}`} width={size} height={size * 1.4} viewBox="0 0 40 56" role="img" aria-label={`Queda el ${Math.round(f * 100)} % del tiempo`}>
      <defs>
        <clipPath id={`${id}t`}><path d="M7 4h26c0 9-8 14-11 19v1h-4v-1C15 18 7 13 7 4Z" /></clipPath>
        <clipPath id={`${id}b`}><path d="M7 52h26c0-9-8-14-11-19v-1h-4v1C15 38 7 43 7 52Z" /></clipPath>
      </defs>
      <path d="M5 2.5h30M5 53.5h30" stroke="currentColor" strokeOpacity=".55" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M7 4c0 9 8 14 11 19v10c-3 5-11 10-11 19M33 4c0 9-8 14-11 19v10c3 5 11 10 11 19" fill="none" stroke="currentColor" strokeOpacity=".35" strokeWidth="1.4" />
      <rect x="0" y={top} width="40" height={26 - top + 4} fill="currentColor" fillOpacity=".85" clipPath={`url(#${id}t)`} className="sand" />
      <rect x="0" y={bot} width="40" height={56 - bot} fill="currentColor" fillOpacity=".45" clipPath={`url(#${id}b)`} className="sand" />
      {f > 0 && f < 1 && <line x1="20" y1="24" x2="20" y2={bot} stroke="currentColor" strokeOpacity=".7" strokeWidth="1" className="stream" />}
    </svg>
  )
}

/** Banda de Hoy: el castigo más urgente, siempre visible mientras exista. */
export const CastigoBand = () => {
  useTick()
  const d = useStore()
  const ui = useUI()
  const list = castigosPendientes(d)
  const san = sancionActiva(d)
  if (san) return (
    <button className="pen-band sancion" onClick={() => ui.go('habitos', 'castigos')}>
      <Icon name="lock" size={18} />
      <span className="grow"><b>Sanción activa</b><span className="cap">Sin XP y sin permitidos hasta {new Date(san.hasta).toLocaleString('es-AR', { weekday: 'short', hour: '2-digit', minute: '2-digit' })} · {san.motivo}</span></span>
      <Icon name="chevron-right" size={16} />
    </button>
  )
  if (!list.length) return null
  const p = list[0]
  const t = penaltyTime(p)
  return (
    <button className={`pen-band ${urg(t.frac)}`} onClick={() => ui.openSheet('castigo', p.id)} style={{ ['--f' as string]: t.frac }}>
      <Hourglass frac={t.frac} size={22} />
      <span className="grow">
        <b>{p.tarea}</b>
        <span className="cap">Castigo{list.length > 1 ? ` · ${list.length} pendientes` : ''} · vence en {fmtLeft(t.left)}{comoReparar(d, p) ? ' · se anula si volvés' : ''}</span>
        <span className="pen-time" aria-hidden="true"><i /></span>
      </span>
      <Icon name="chevron-right" size={16} />
    </button>
  )
}

/** Panel completo: de más urgente a menos, permitidos, vencidos y sanciones. */
export const CastigosPanel = () => {
  useTick()
  const d = useStore()
  const ui = useUI()
  const [nuevo, setNuevo] = useState('')
  const pend = castigosPendientes(d)
  const vencidos = d.penalties.filter((p) => !p.hecho && penaltyTime(p).vencido).slice(-5).reverse()
  const reparados = d.penalties.filter((p) => p.reparadoEl).slice(-5).reverse()
  const duro = d.settings.castigos === 'duro'
  const san = sancionActiva(d)
  const rewards = d.rewards.filter((r) => !r.usado)
  const bloqueado = pend.length > 0 || !!san
  return (
    <section className="panel pad pen-panel" id="sec-castigos">
      <div className="sec" style={{ margin: '0 0 12px' }}><h2 className="h2"><Icon name="hourglass" size={16} />Castigos</h2><span className="cap">{pend.length ? `${pend.length} pendiente${pend.length > 1 ? 's' : ''}` : 'al día'}</span></div>
      {san && <div className="pen-row sancion"><Icon name="lock" size={18} /><span className="grow"><b>Sanción activa</b><span className="cap">{san.motivo}. Sin XP y sin permitidos hasta {new Date(san.hasta).toLocaleString('es-AR', { weekday: 'long', hour: '2-digit', minute: '2-digit' })}.</span></span></div>}
      {pend.length === 0 && !san && <p className="body-2">Sin castigos pendientes. Cuando aparezca uno tenés 48 h para cumplirlo{duro ? '' : ' o anularlo volviendo (un día al 70 %, o la semana del área al 75 %)'}; si vence, pasás {SANCION_HOURS} h sin ganar XP ni usar permitidos.</p>}
      <div className="pen-list">
        {pend.map((p) => {
          const t = penaltyTime(p)
          return (
            <button key={p.id} className={`pen-row ${urg(t.frac)}`} onClick={() => ui.openSheet('castigo', p.id)}>
              <Hourglass frac={t.frac} size={26} />
              <span className="grow"><b>{p.tarea}</b><span className="cap">{p.motivo}{comoReparar(d, p) ? ' · se anula si volvés' : ''}</span></span>
              <span className="pen-left num">{fmtLeft(t.left)}</span>
            </button>
          )
        })}
      </div>
      {reparados.length > 0 && <details style={{ marginTop: 8 }}><summary>Anulados por volver · {reparados.length}</summary>{reparados.map((p) => <div className="list-row" key={p.id}><Icon name="rotate-ccw" size={14} /><span className="grow">{p.tarea}<small className="cap" style={{ display: 'block' }}>{p.reparacion}</small></span><span className="cap">{fmtShort(p.fecha)}</span></div>)}</details>}
      {vencidos.length > 0 && <details style={{ marginTop: 8 }}><summary>Vencidos · {vencidos.length}</summary>{vencidos.map((p) => <div className="list-row" key={p.id}><span className="grow">{p.tarea}</span><span className="cap">{fmtShort(p.fecha)}</span></div>)}</details>}
      <div className="castigo-modo">
        <span className="grow"><b>{duro ? 'Modo duro' : 'Modo reparable'}</b><small>{duro ? 'Los castigos no se anulan: o los cumplís o vence la sanción.' : 'Volver anula el castigo. Mantiene la vara alta sin convertir un día malo en una semana perdida.'}</small></span>
        <button role="switch" aria-checked={duro} aria-label="Modo duro" className="switch" onClick={() => d.set((s) => ({ settings: { ...s.settings, castigos: duro ? 'reparable' : 'duro' } }))}><i /></button>
      </div>
      <div className="sec" style={{ margin: '16px 0 6px' }}><span className="eyebrow">Permitidos</span><span className="cap">{bloqueado ? 'bloqueados' : `${rewards.length} disponibles`}</span></div>
      {rewards.length === 0 ? <p className="cap">Se ganan con semanas de Oro y con cada punto de grasa corporal que bajás.</p> : rewards.map((r) => (
        <div className="attn-row" style={{ padding: '10px 0' }} key={r.id}>
          <Icon name={bloqueado ? 'lock' : 'gift'} size={16} /><span className="grow"><span style={{ display: 'block' }}>{r.premio}</span><span className="cap">{r.motivo}</span></span>
          <button className="btn btn-quiet btn-sm" disabled={bloqueado} onClick={() => { d.set((s) => ({ rewards: s.rewards.map((x) => x.id === r.id ? { ...x, usado: true } : x) })); ui.notify('Permitido usado. Disfrutalo.', () => d.set((s) => ({ rewards: s.rewards.map((x) => x.id === r.id ? { ...x, usado: false } : x) }))) }}>Usar</button>
        </div>
      ))}
      <form className="row" style={{ marginTop: 12, flexWrap: 'nowrap' }} onSubmit={(e) => {
        e.preventDefault(); if (!nuevo.trim()) return
        const now = Date.now()
        d.set((s) => ({ penalties: [...s.penalties, { id: uid(), fecha: today(), motivo: 'Autoimpuesto', tarea: nuevo.trim(), hecho: false, creado: new Date(now).toISOString(), vence: new Date(now + 48 * 3600e3).toISOString() }] })); setNuevo('')
      }}>
        <input className="grow" aria-label="Nuevo castigo" placeholder="Ponerme un castigo…" value={nuevo} onChange={(e) => setNuevo(e.target.value)} />
        <button className="btn btn-quiet" disabled={!nuevo.trim()}>Agregar</button>
      </form>
    </section>
  )
}

/** Hoja de detalle: motivo, tiempo, resolución con evidencia opcional. */
export const CastigoSheet = () => {
  useTick(1000)
  const d = useStore()
  const ui = useUI()
  const p = d.penalties.find((x) => x.id === ui.sheetArg)
  const [ev, setEv] = useState('')
  if (!p) return null
  const t = penaltyTime(p)
  const cumplir = () => {
    const prev: Penalty = p
    d.set((s) => ({ penalties: s.penalties.map((x) => x.id === p.id ? { ...x, hecho: true, cumplidoEl: new Date().toISOString(), evidencia: ev.trim() || undefined } : x) }))
    ui.closeSheet()
    ui.notify('Castigo cumplido · +20 XP', () => d.set((s) => ({ penalties: s.penalties.map((x) => x.id === prev.id ? prev : x) })))
  }
  const h = Math.floor(Math.max(0, t.left) / 3600e3)
  const m = Math.floor((Math.max(0, t.left) % 3600e3) / 60e3)
  const sec = Math.floor((Math.max(0, t.left) % 60e3) / 1000)
  return (
    <Sheet label="Castigo">
      <div className="pen-detail">
        <div className={`pen-clock ${urg(t.frac)}`}>
          <Hourglass frac={t.frac} size={56} />
          <div><div className="eyebrow">{t.vencido ? 'Vencido' : 'Tiempo restante'}</div><div className="val-xl num">{String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}<span className="unit">:{String(sec).padStart(2, '0')}</span></div></div>
        </div>
        <h2 className="pen-title">{p.tarea}</h2>
        <div className="kv"><span className="cap">Por qué</span><span>{p.motivo}</span></div>
        <div className="kv"><span className="cap">Desde</span><span>{fmtShort(p.fecha)}{p.vence ? ` · vence ${new Date(p.vence).toLocaleString('es-AR', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}` : ''}</span></div>
        {comoReparar(d, p) && <div className="kv"><span className="cap">Para anularlo</span><span>{comoReparar(d, p)}</span></div>}
        <div className="kv"><span className="cap">Si vence</span><span>{SANCION_HOURS} h sin ganar XP y sin permitidos.</span></div>
        <div className="kv"><span className="cap">Mientras tanto</span><span>Permitidos bloqueados.</span></div>
        <div className="field" style={{ marginTop: 14 }}><label htmlFor="pen-ev">Evidencia (opcional): cómo lo cumpliste</label><input id="pen-ev" value={ev} onChange={(e) => setEv(e.target.value)} placeholder="Ej. 50 burpees en 4 series, a las 19:30" /></div>
        <div className="row" style={{ marginTop: 16, flexWrap: 'nowrap' }}>
          <button className="btn btn-ghost" onClick={ui.closeSheet}>Cerrar</button>
          <button className="btn btn-primary grow" disabled={t.vencido} onClick={cumplir}><Icon name="check" size={16} />Lo cumplí</button>
        </div>
      </div>
    </Sheet>
  )
}
