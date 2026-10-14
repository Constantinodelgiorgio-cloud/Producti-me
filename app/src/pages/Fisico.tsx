import { useState } from 'react'
import { useStore } from '../lib/store'
import { useUI } from '../lib/ui'
import { bestE1rm, dayNutrition, e1rm } from '../lib/logic'
import { addDays, fmtShort, today, uid, weekStart } from '../lib/date'
import type { Exercise, Intensity, Photo, Workout } from '../lib/types'
import { Icon } from '../components/Icon'
import { Bar, Card, Empty, Field, NumInput, PageHead, parseNum, Seg } from '../components/ui'
import { BarC, LineC, PieC } from '../components/charts'

type Tab = 'entreno' | 'nutricion' | 'cuerpo'

export default function Fisico() {
  const ui = useUI()
  const tab: Tab = ui.sub === 'nutricion' || ui.sub === 'cuerpo' ? ui.sub : 'entreno'
  return (
    <div className="view">
      <PageHead eyebrow="Pilar izquierdo · rugby" title="Físico" />
      <div style={{ marginBottom: 16 }}><Seg label="Sección" value={tab} onChange={(v) => ui.go('fisico', v)} options={[['entreno', 'Entrenamiento'], ['nutricion', 'Nutrición'], ['cuerpo', 'Peso y fotos']]} /></div>
      {tab === 'entreno' && <Entreno />}
      {tab === 'nutricion' && <Nutricion />}
      {tab === 'cuerpo' && <Cuerpo />}
    </div>
  )
}

const TIPOS: Workout['tipo'][] = ['gimnasio', 'rugby', 'partido', 'movilidad', 'cardio']
const INTS: Intensity[] = ['roja', 'amarilla', 'baja', 'partido', 'libre']

function Entreno() {
  const d = useStore()
  const ui = useUI()
  const blank = (): Workout => ({ id: uid(), fecha: today(), tipo: 'gimnasio', intensidad: 'libre', minutos: 90, rpe: 7, ejercicios: [] })
  const [w, setW] = useState<Workout>(blank)
  const [ex, setEx] = useState<Exercise>({ nombre: '', series: 4, reps: 8, kg: 0 })
  const nombres = [...new Set([...d.profile.marcasPrevias.map((m) => m.nombre), ...d.workouts.flatMap((x) => x.ejercicios.map((e) => e.nombre))])]
  const weeks = Array.from({ length: 8 }, (_, i) => addDays(weekStart(today()), -7 * (7 - i)))
  const chart = weeks.map((ws) => {
    const ww = d.workouts.filter((x) => weekStart(x.fecha) === ws)
    return { semana: ws.slice(5).replace('-', '/'), min: ww.reduce((a, x) => a + x.minutos, 0), rpe: ww.length ? +(ww.reduce((a, x) => a + x.rpe, 0) / ww.length).toFixed(1) : null }
  })
  const save = () => {
    const id = w.id
    d.set((s) => ({ workouts: [...s.workouts, w] }))
    ui.notify('Sesión guardada · +30 XP', () => d.set((s) => ({ workouts: s.workouts.filter((x) => x.id !== id) })))
    setW(blank())
  }
  const del = async (x: Workout) => {
    if (await ui.confirm({ title: '¿Borrar esta sesión?', body: `${x.tipo} del ${fmtShort(x.fecha)}, ${x.minutos} min.`, confirm: 'Borrar', danger: true }))
      d.set((s) => ({ workouts: s.workouts.filter((y) => y.id !== x.id) }))
  }
  return (
    <div className="two-col">
      <div className="stack">
        <Card title="Registrar sesión" icon="dumbbell">
          <div className="stack">
            <div className="form-grid">
              <Field label="Fecha" id="w-f"><input id="w-f" type="date" value={w.fecha} max={today()} onChange={(e) => setW({ ...w, fecha: e.target.value })} /></Field>
              <Field label="Tipo" id="w-t"><select id="w-t" value={w.tipo} onChange={(e) => setW({ ...w, tipo: e.target.value as Workout['tipo'] })}>{TIPOS.map((x) => <option key={x}>{x}</option>)}</select></Field>
              <Field label="Intensidad" id="w-i"><select id="w-i" value={w.intensidad} onChange={(e) => setW({ ...w, intensidad: e.target.value as Intensity })}>{INTS.map((x) => <option key={x}>{x}</option>)}</select></Field>
              <Field label="Minutos" id="w-m"><input id="w-m" type="number" inputMode="numeric" value={w.minutos} onChange={(e) => setW({ ...w, minutos: Number(e.target.value) })} /></Field>
              <Field label="Esfuerzo (RPE 1–10)" id="w-r"><input id="w-r" type="number" inputMode="numeric" min={1} max={10} value={w.rpe} onChange={(e) => setW({ ...w, rpe: Number(e.target.value) })} /></Field>
            </div>
            <div className="eyebrow">Ejercicios</div>
            {w.ejercicios.map((e, i) => (
              <div className="list-row" key={i}>{e.nombre}<span className="k">{e.series}×{e.reps} · {e.kg} kg</span><button className="icon-btn sm" aria-label={`Quitar ${e.nombre}`} onClick={() => setW({ ...w, ejercicios: w.ejercicios.filter((_, j) => j !== i) })}><Icon name="x" size={15} /></button></div>
            ))}
            <form className="form-grid" onSubmit={(e) => { e.preventDefault(); if (!ex.nombre.trim()) return; setW({ ...w, ejercicios: [...w.ejercicios, { ...ex, nombre: ex.nombre.trim() }] }); setEx({ ...ex, nombre: '' }) }}>
              <Field label="Ejercicio" id="e-n"><input id="e-n" list="ejs" value={ex.nombre} onChange={(e) => setEx({ ...ex, nombre: e.target.value })} /></Field>
              <datalist id="ejs">{nombres.map((n) => <option key={n} value={n} />)}</datalist>
              <Field label="Series" id="e-s"><input id="e-s" type="number" inputMode="numeric" value={ex.series} onChange={(e) => setEx({ ...ex, series: Number(e.target.value) })} /></Field>
              <Field label="Reps" id="e-r"><input id="e-r" type="number" inputMode="numeric" value={ex.reps} onChange={(e) => setEx({ ...ex, reps: Number(e.target.value) })} /></Field>
              <Field label="Kg" id="e-k"><NumInput id="e-k" value={ex.kg} onValue={(n) => setEx({ ...ex, kg: (n ?? 0) })} /></Field>
              <button className="btn btn-quiet" disabled={!ex.nombre.trim()}><Icon name="plus" size={16} />Sumar</button>
            </form>
            <Field label="Nota" id="w-n"><input id="w-n" value={w.nota ?? ''} placeholder="Cómo te sentiste, molestias en la pierna…" onChange={(e) => setW({ ...w, nota: e.target.value })} /></Field>
            <button className="btn btn-primary" onClick={save}>Guardar sesión</button>
          </div>
        </Card>
        <Card title="Últimas sesiones" icon="clock">
          {d.workouts.length === 0 ? <p className="cap">Todavía no registraste sesiones.</p> : (
            <div className="tbl-wrap"><table><thead><tr><th>Fecha</th><th>Tipo</th><th>Intensidad</th><th className="num">Min</th><th className="num">RPE</th><th /></tr></thead><tbody>
              {d.workouts.slice().sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 15).map((x) => (
                <tr key={x.id}><td>{fmtShort(x.fecha)}</td><td>{x.tipo}</td><td><span className={`int ${x.intensidad}`}>{x.intensidad}</span></td><td className="num">{x.minutos}</td><td className="num">{x.rpe}</td>
                  <td><button className="icon-btn sm" aria-label="Borrar sesión" onClick={() => del(x)}><Icon name="trash" size={15} /></button></td></tr>
              ))}
            </tbody></table></div>
          )}
        </Card>
      </div>
      <aside className="stack">
        <Card title="Recuperación de marcas" icon="trending-up">
          <div className="stack" style={{ gap: 14 }}>
            {d.profile.marcasPrevias.map((m) => {
              const prev = e1rm(m.kg, m.reps)
              const now = bestE1rm(d, m.nombre)
              return (
                <div key={m.nombre} className="stack" style={{ gap: 6 }}>
                  <div className="row small" style={{ justifyContent: 'space-between' }}><span>{m.nombre}</span><span className="cap num">{now ? `${Math.round(now)} kg` : 'sin registro'} / {Math.round(prev)} kg</span></div>
                  <Bar value={now / prev} tone={now >= prev ? 'ok' : undefined} />
                </div>
              )
            })}
            <p className="cap">1RM estimado (fórmula de Epley) contra tus marcas de antes de la erisipela.</p>
          </div>
        </Card>
        <Card title="Volumen semanal" icon="layout-grid">
          <BarC data={chart} x="semana" ys={[{ key: 'min', name: 'Minutos' }]} height={160} />
          <LineC data={chart} x="semana" ys={[{ key: 'rpe', name: 'RPE promedio', color: '#C9D0DC' }]} height={130} />
        </Card>
      </aside>
    </div>
  )
}

function Nutricion() {
  const d = useStore()
  const ui = useUI()
  const f = today()
  const tot = dayNutrition(d, f)
  const P = d.profile
  const last7 = Array.from({ length: 7 }, (_, i) => addDays(f, i - 6)).map((x) => { const n = dayNutrition(d, x); return { dia: x.slice(5).replace('-', '/'), kcal: Math.round(n.kcal), prot: Math.round(n.prot) } })
  return (
    <div className="two-col">
      <div className="stack">
        <Card title="Hoy" icon="utensils" right={<button className="btn btn-primary btn-sm" onClick={() => ui.go('comida')}><Icon name="plus" size={15} />Registrar comida</button>}>
          <div className="stack" style={{ gap: 12 }}>
            <div className="proj-row"><span className="cap">Calorías</span><Bar value={tot.kcal / P.kcalObjetivo} tone={tot.kcal > P.kcalObjetivo * 1.05 ? 'over' : undefined} /><span className="cap num">{Math.round(tot.kcal).toLocaleString('es-AR')} / {P.kcalObjetivo.toLocaleString('es-AR')}</span></div>
            <div className="proj-row"><span className="cap">Proteína</span><Bar value={tot.prot / P.protObjetivo} tone={tot.prot >= P.protObjetivo ? 'ok' : undefined} /><span className="cap num">{Math.round(tot.prot)} / {P.protObjetivo} g</span></div>
            {tot.kcal > 0 ? <PieC data={[{ name: 'Proteína', value: tot.prot * 4 }, { name: 'Carbohidratos', value: tot.carb * 4 }, { name: 'Grasas', value: tot.grasa * 9 }]} height={180} />
              : <Empty icon="utensils" title="Sin comidas registradas hoy" action={<button className="btn btn-quiet" onClick={() => ui.go('comida')}>Registrar la primera</button>}>Cargá lo que comés para ver calorías, proteína y macros.</Empty>}
            <p className="cap">Objetivos iniciales estimados ({P.kcalObjetivo.toLocaleString('es-AR')} kcal y {P.protObjetivo} g de proteína). Validalos con tu nutricionista y ajustalos en Ajustes.</p>
          </div>
        </Card>
      </div>
      <aside className="stack">
        <Card title="Calorías · 7 días" icon="flame"><BarC data={last7} x="dia" ys={[{ key: 'kcal', name: 'kcal' }]} target={P.kcalObjetivo} height={170} /></Card>
        <Card title="Proteína · 7 días" icon="beef"><BarC data={last7} x="dia" ys={[{ key: 'prot', name: 'Proteína (g)', color: '#C9D0DC' }]} target={P.protObjetivo} height={150} /></Card>
      </aside>
    </div>
  )
}

const resize = (file: File): Promise<string> => new Promise((res, rej) => {
  const img = new Image()
  img.onload = () => {
    const s = Math.min(1, 900 / Math.max(img.width, img.height))
    const c = document.createElement('canvas')
    c.width = img.width * s; c.height = img.height * s
    c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
    res(c.toDataURL('image/jpeg', 0.8))
  }
  img.onerror = rej
  img.src = URL.createObjectURL(file)
})

function Cuerpo() {
  const d = useStore()
  const ui = useUI()
  const [e, setE] = useState({ fecha: today(), peso: '', grasa: '', cintura: '' })
  const [tipo, setTipo] = useState<Photo['tipo']>('frente')
  const body = d.body.slice().sort((a, b) => a.fecha.localeCompare(b.fecha))
  const data = body.map((b) => ({ f: b.fecha.slice(5).replace('-', '/'), peso: b.peso, grasa: b.grasa, magra: b.peso && b.grasa ? +(b.peso * (1 - b.grasa / 100)).toFixed(1) : undefined }))
  const fotos = d.photos.filter((p) => p.tipo === tipo).sort((a, b) => a.fecha.localeCompare(b.fecha))
  const lastB = body.at(-1)
  const save = (ev: React.FormEvent) => {
    ev.preventDefault()
    const n = (v: string) => (v ? parseNum(v) : undefined)
    d.set((s) => ({ body: [...s.body.filter((b) => b.fecha !== e.fecha), { fecha: e.fecha, peso: n(e.peso), grasa: n(e.grasa), cintura: n(e.cintura) }] }))
    ui.notify('Medidas guardadas')
    setE({ fecha: today(), peso: '', grasa: '', cintura: '' })
  }
  const delPhoto = async (p: Photo) => {
    if (await ui.confirm({ title: '¿Borrar esta foto?', body: `Foto de ${p.tipo} del ${fmtShort(p.fecha)}. No se puede recuperar.`, confirm: 'Borrar', danger: true }))
      d.set((s) => ({ photos: s.photos.filter((y) => y.id !== p.id) }))
  }
  return (
    <div className="two-col">
      <div className="stack">
        <div className="kpis">
          <div className="kpi"><span className="cap">Peso</span><span><span className="val-l">{lastB?.peso?.toLocaleString('es-AR') ?? '—'}</span><span className="unit">kg</span></span></div>
          <div className="kpi"><span className="cap">Grasa</span><span><span className="val-l">{lastB?.grasa?.toLocaleString('es-AR') ?? '—'}</span><span className="unit">% · meta {d.profile.grasaObjetivo}</span></span></div>
          <div className="kpi"><span className="cap">Masa magra</span><span><span className="val-l">{lastB?.peso && lastB.grasa ? (lastB.peso * (1 - lastB.grasa / 100)).toFixed(1).replace('.', ',') : '—'}</span><span className="unit">kg</span></span></div>
        </div>
        <Card title="Peso y masa magra" icon="trending-down"><LineC data={data} x="f" ys={[{ key: 'peso', name: 'Peso' }, { key: 'magra', name: 'Masa magra', color: '#C9D0DC' }]} target={d.profile.pesoObjetivo} /></Card>
        <Card title="Grasa corporal" icon="flame"><LineC data={data} x="f" ys={[{ key: 'grasa', name: '% grasa' }]} target={d.profile.grasaObjetivo} height={170} />
          <p className="cap" style={{ marginTop: 8 }}>Meta: menos de {d.profile.grasaObjetivo} % manteniendo ~{d.profile.pesoObjetivo} kg. Cada punto que bajás suma un permitido.</p></Card>
      </div>
      <aside className="stack">
        <Card title="Registrar medidas" icon="ruler">
          <form className="form-grid" onSubmit={save}>
            <Field label="Fecha" id="b-f"><input id="b-f" type="date" value={e.fecha} max={today()} onChange={(x) => setE({ ...e, fecha: x.target.value })} /></Field>
            <Field label="Peso (kg)" id="b-p"><NumInput id="b-p" value={e.peso} onValue={(_, raw) => setE({ ...e, peso: raw })} /></Field>
            <Field label="% grasa" id="b-g"><NumInput id="b-g" value={e.grasa} onValue={(_, raw) => setE({ ...e, grasa: raw })} /></Field>
            <Field label="Cintura (cm)" id="b-c"><NumInput id="b-c" value={e.cintura} onValue={(_, raw) => setE({ ...e, cintura: raw })} /></Field>
            <button className="btn btn-primary" disabled={!e.peso && !e.grasa && !e.cintura}>Guardar</button>
          </form>
        </Card>
        <Card title="Fotos de progreso" icon="camera" right={
          <label className="btn btn-quiet btn-sm"><Icon name="plus" size={15} />Foto<input type="file" accept="image/*" capture="environment" hidden onChange={async (x) => {
            const file = x.target.files?.[0]; if (!file) return
            const data = await resize(file)
            d.set((s) => ({ photos: [...s.photos, { id: uid(), fecha: today(), tipo, data }] }))
            ui.notify('Foto guardada en este dispositivo')
            x.target.value = ''
          }} /></label>}>
          <div style={{ marginBottom: 12 }}><Seg label="Tipo de foto" value={tipo} onChange={setTipo} options={[['frente', 'Frente'], ['perfil', 'Perfil'], ['espalda', 'Espalda'], ['outfit', 'Outfit']]} /></div>
          {fotos.length === 0 ? <Empty icon="camera" title="Sin fotos de este tipo">Misma luz, mismo lugar y misma hora (por ejemplo, domingo a la mañana). Las fotos quedan solo en este dispositivo.</Empty> : <>
            {fotos.length >= 2 && <><div className="eyebrow" style={{ marginBottom: 8 }}>Primera y última</div>
              <div className="photos" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 14 }}>{[fotos[0], fotos.at(-1)!].map((p) => <figure className="photo" key={p.id} style={{ margin: 0 }}><img src={p.data} alt={`${p.tipo} del ${fmtShort(p.fecha)}`} /><figcaption>{fmtShort(p.fecha)}</figcaption></figure>)}</div></>}
            <div className="photos">{fotos.slice().reverse().map((p) => (
              <figure className="photo" key={p.id} style={{ margin: 0 }}><img src={p.data} alt={`${p.tipo} del ${fmtShort(p.fecha)}`} /><figcaption>{fmtShort(p.fecha)}</figcaption>
                <button className="icon-btn sm" aria-label={`Borrar foto del ${fmtShort(p.fecha)}`} onClick={() => delPhoto(p)}><Icon name="trash" size={14} /></button></figure>
            ))}</div>
          </>}
        </Card>
      </aside>
    </div>
  )
}
