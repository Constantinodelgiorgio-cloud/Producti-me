import { useState } from 'react'
import { useStore } from '../lib/store'
import { bestE1rm, dayNutrition } from '../lib/logic'
import { addDays, fmtShort, today, uid, weekStart } from '../lib/date'
import { FOODS } from '../lib/seed'
import { Bar, Card, Field } from '../components/ui'
import { BarC, LineC, PieC } from '../components/charts'
import type { Exercise, Intensity, Photo, Workout } from '../lib/types'

const TABS = ['Entrenamiento', 'Nutrición', 'Cuerpo y fotos'] as const

export default function Fisico() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Entrenamiento')
  return (
    <>
      <div className="tabs">{TABS.map((x) => <button key={x} className={`btn sm ${tab === x ? 'on' : ''}`} onClick={() => setTab(x)}>{x}</button>)}</div>
      {tab === 'Entrenamiento' && <Entreno />}
      {tab === 'Nutrición' && <Nutricion />}
      {tab === 'Cuerpo y fotos' && <Cuerpo />}
    </>
  )
}

function Entreno() {
  const d = useStore()
  const blank = (): Workout => ({ id: uid(), fecha: today(), tipo: 'gimnasio', intensidad: 'libre', minutos: 90, rpe: 7, ejercicios: [] })
  const [w, setW] = useState<Workout>(blank)
  const [ex, setEx] = useState<Exercise>({ nombre: '', series: 4, reps: 8, kg: 0 })
  const nombres = [...new Set([...d.profile.marcasPrevias.map((m) => m.nombre), ...d.workouts.flatMap((x) => x.ejercicios.map((e) => e.nombre))])]

  // minutos por semana (últimas 8)
  const weeks = Array.from({ length: 8 }, (_, i) => addDays(weekStart(today()), -7 * (7 - i)))
  const chart = weeks.map((ws) => {
    const ww = d.workouts.filter((x) => weekStart(x.fecha) === ws)
    return { semana: ws.slice(5), min: ww.reduce((a, x) => a + x.minutos, 0), rpe: ww.length ? +(ww.reduce((a, x) => a + x.rpe, 0) / ww.length).toFixed(1) : null }
  })

  return (
    <>
      <Card title="📈 Recuperación de marcas (vs. antes de la erisipela)">
        {d.profile.marcasPrevias.map((m) => {
          const prev = m.reps <= 1 ? m.kg : m.kg * (1 + m.reps / 30)
          const now = bestE1rm(d, m.nombre)
          return (
            <div key={m.nombre} style={{ marginBottom: 10 }}>
              <div className="row small"><span>{m.nombre}</span><span className="grow" /><span className="muted">{now ? `${Math.round(now)} kg` : '—'} / {Math.round(prev)} kg 1RM est.</span></div>
              <Bar value={now / prev} color={now >= prev ? 'var(--good)' : undefined} />
            </div>
          )
        })}
        <p className="small muted">1RM estimado con la fórmula de Epley a partir de tus series.</p>
      </Card>

      <Card title="➕ Registrar sesión">
        <div className="row">
          <Field label="Fecha"><input type="date" value={w.fecha} onChange={(e) => setW({ ...w, fecha: e.target.value })} /></Field>
          <Field label="Tipo">
            <select value={w.tipo} onChange={(e) => setW({ ...w, tipo: e.target.value as Workout['tipo'] })}>
              {['gimnasio', 'rugby', 'partido', 'movilidad', 'cardio'].map((x) => <option key={x}>{x}</option>)}
            </select>
          </Field>
          <Field label="Intensidad">
            <select value={w.intensidad} onChange={(e) => setW({ ...w, intensidad: e.target.value as Intensity })}>
              {['roja', 'amarilla', 'baja', 'partido', 'libre'].map((x) => <option key={x}>{x}</option>)}
            </select>
          </Field>
        </div>
        <div className="row" style={{ marginTop: 8 }}>
          <Field label="Minutos"><input type="number" value={w.minutos} onChange={(e) => setW({ ...w, minutos: +e.target.value })} /></Field>
          <Field label="Esfuerzo (RPE 1–10)"><input type="number" min={1} max={10} value={w.rpe} onChange={(e) => setW({ ...w, rpe: +e.target.value })} /></Field>
        </div>
        <h3>Ejercicios</h3>
        {w.ejercicios.map((e, i) => (
          <div className="note small" key={i}><span>{e.nombre}</span><span className="grow" /><span className="muted">{e.series}×{e.reps} · {e.kg} kg</span>
            <button className="btn sm ghost" onClick={() => setW({ ...w, ejercicios: w.ejercicios.filter((_, j) => j !== i) })}>✕</button></div>
        ))}
        <div className="row">
          <Field label="Ejercicio"><input list="ejs" value={ex.nombre} onChange={(e) => setEx({ ...ex, nombre: e.target.value })} /></Field>
          <datalist id="ejs">{nombres.map((n) => <option key={n} value={n} />)}</datalist>
          <Field label="Series"><input type="number" value={ex.series} onChange={(e) => setEx({ ...ex, series: +e.target.value })} /></Field>
          <Field label="Reps"><input type="number" value={ex.reps} onChange={(e) => setEx({ ...ex, reps: +e.target.value })} /></Field>
          <Field label="Kg"><input type="number" value={ex.kg} onChange={(e) => setEx({ ...ex, kg: +e.target.value })} /></Field>
          <button className="btn" style={{ alignSelf: 'flex-end' }} disabled={!ex.nombre} onClick={() => { setW({ ...w, ejercicios: [...w.ejercicios, ex] }); setEx({ ...ex, nombre: '' }) }}>+</button>
        </div>
        <Field label="Nota"><input value={w.nota ?? ''} onChange={(e) => setW({ ...w, nota: e.target.value })} placeholder="Cómo te sentiste, molestias en la pierna…" /></Field>
        <button className="btn primary" style={{ marginTop: 10 }} onClick={() => { d.set((s) => ({ workouts: [...s.workouts, w] })); setW(blank()) }}>Guardar sesión (+30 XP)</button>
      </Card>

      <Card title="📊 Volumen semanal">
        <BarC data={chart} x="semana" ys={[{ key: 'min', name: 'Minutos' }]} height={170} />
        <LineC data={chart} x="semana" ys={[{ key: 'rpe', name: 'RPE promedio', color: '#f87171' }]} height={140} />
      </Card>

      <Card title="🗂️ Últimas sesiones">
        {d.workouts.length === 0 && <p className="muted small">Todavía no registraste sesiones.</p>}
        <table><tbody>
          {d.workouts.slice().sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 15).map((x) => (
            <tr key={x.id}><td>{fmtShort(x.fecha)}</td><td>{x.tipo}</td><td>{x.intensidad}</td><td>{x.minutos}′</td><td>RPE {x.rpe}</td>
              <td><button className="btn sm ghost" onClick={() => confirm('¿Borrar sesión?') && d.set((s) => ({ workouts: s.workouts.filter((y) => y.id !== x.id) }))}>✕</button></td></tr>
          ))}
        </tbody></table>
      </Card>
    </>
  )
}

function Nutricion() {
  const d = useStore()
  const [fecha, setFecha] = useState(today())
  const [custom, setCustom] = useState({ nombre: '', kcal: 0, prot: 0, carb: 0, grasa: 0 })
  const tot = dayNutrition(d, fecha)
  const P = d.profile
  const add = (f: typeof custom) => d.set((s) => ({ meals: [...s.meals, { id: uid(), fecha, ...f }] }))
  const last7 = Array.from({ length: 7 }, (_, i) => addDays(today(), i - 6)).map((f) => ({ dia: f.slice(5), kcal: dayNutrition(d, f).kcal, prot: dayNutrition(d, f).prot }))
  return (
    <>
      <Card title="🍽️ Hoy" right={<input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={{ width: 150 }} />}>
        {[
          ['Calorías', tot.kcal, P.kcalObjetivo, 'kcal'],
          ['Proteína', tot.prot, P.protObjetivo, 'g'],
        ].map(([n, v, o, u]) => (
          <div key={n as string} style={{ marginBottom: 10 }}>
            <div className="row small"><span>{n}</span><span className="grow" /><span className="muted">{Math.round(v as number)} / {o} {u}</span></div>
            <Bar value={(v as number) / (o as number)} color={(v as number) > (o as number) * 1.05 && n === 'Calorías' ? 'var(--warn)' : undefined} />
          </div>
        ))}
        {tot.kcal > 0 && <PieC data={[{ name: 'Proteína', value: tot.prot * 4 }, { name: 'Carbos', value: tot.carb * 4 }, { name: 'Grasas', value: tot.grasa * 9 }]} height={180} />}
        <p className="small muted">Objetivos iniciales estimados ({P.kcalObjetivo} kcal, {P.protObjetivo} g de proteína). Validalos con tu nutricionista y cambialos en Ajustes.</p>
      </Card>
      <Card title="⚡ Carga rápida">
        <div className="row">{FOODS.map((f) => <button key={f.nombre} className="btn sm" onClick={() => add(f)}>{f.nombre}</button>)}</div>
        <h3>Otra comida</h3>
        <div className="row">
          <Field label="Nombre"><input value={custom.nombre} onChange={(e) => setCustom({ ...custom, nombre: e.target.value })} /></Field>
          {(['kcal', 'prot', 'carb', 'grasa'] as const).map((k) => (
            <Field key={k} label={k}><input type="number" value={custom[k]} onChange={(e) => setCustom({ ...custom, [k]: +e.target.value })} /></Field>
          ))}
          <button className="btn primary" style={{ alignSelf: 'flex-end' }} disabled={!custom.nombre} onClick={() => { add(custom); setCustom({ nombre: '', kcal: 0, prot: 0, carb: 0, grasa: 0 }) }}>+</button>
        </div>
      </Card>
      <Card title="Registro del día">
        {d.meals.filter((m) => m.fecha === fecha).map((m) => (
          <div className="note small" key={m.id}><span>{m.nombre}</span><span className="grow" /><span className="muted">{m.kcal} kcal · {m.prot} g P</span>
            <button className="btn sm ghost" onClick={() => d.set((s) => ({ meals: s.meals.filter((x) => x.id !== m.id) }))}>✕</button></div>
        ))}
      </Card>
      <Card title="📊 Últimos 7 días">
        <BarC data={last7} x="dia" ys={[{ key: 'kcal', name: 'kcal' }]} height={170} />
        <BarC data={last7} x="dia" ys={[{ key: 'prot', name: 'Proteína (g)', color: '#60a5fa' }]} height={150} />
      </Card>
    </>
  )
}

const resize = (file: File): Promise<string> => new Promise((res) => {
  const img = new Image()
  img.onload = () => {
    const s = Math.min(1, 900 / Math.max(img.width, img.height))
    const c = document.createElement('canvas')
    c.width = img.width * s; c.height = img.height * s
    c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
    res(c.toDataURL('image/jpeg', 0.8))
  }
  img.src = URL.createObjectURL(file)
})

function Cuerpo() {
  const d = useStore()
  const [e, setE] = useState({ fecha: today(), peso: '', grasa: '', cintura: '' })
  const [tipo, setTipo] = useState<Photo['tipo']>('frente')
  const body = d.body.slice().sort((a, b) => a.fecha.localeCompare(b.fecha))
  const data = body.map((b) => ({ f: b.fecha.slice(5), peso: b.peso, grasa: b.grasa, magra: b.peso && b.grasa ? +(b.peso * (1 - b.grasa / 100)).toFixed(1) : undefined }))
  const fotos = d.photos.filter((p) => p.tipo === tipo).sort((a, b) => a.fecha.localeCompare(b.fecha))
  return (
    <>
      <Card title="⚖️ Registrar medidas">
        <div className="row">
          <Field label="Fecha"><input type="date" value={e.fecha} onChange={(x) => setE({ ...e, fecha: x.target.value })} /></Field>
          <Field label="Peso (kg)"><input type="number" step="0.1" value={e.peso} onChange={(x) => setE({ ...e, peso: x.target.value })} /></Field>
          <Field label="% grasa"><input type="number" step="0.1" value={e.grasa} onChange={(x) => setE({ ...e, grasa: x.target.value })} /></Field>
          <Field label="Cintura (cm)"><input type="number" step="0.5" value={e.cintura} onChange={(x) => setE({ ...e, cintura: x.target.value })} /></Field>
          <button className="btn primary" style={{ alignSelf: 'flex-end' }} onClick={() => {
            const n = (v: string) => (v ? Number(v) : undefined)
            d.set((s) => ({ body: [...s.body.filter((b) => b.fecha !== e.fecha), { fecha: e.fecha, peso: n(e.peso), grasa: n(e.grasa), cintura: n(e.cintura) }] }))
            setE({ fecha: today(), peso: '', grasa: '', cintura: '' })
          }}>Guardar</button>
        </div>
      </Card>
      <Card title="📉 Peso y masa magra"><LineC data={data} x="f" ys={[{ key: 'peso', name: 'Peso' }, { key: 'magra', name: 'Masa magra', color: '#4ade80' }]} target={d.profile.pesoObjetivo} /></Card>
      <Card title="🔥 % de grasa"><LineC data={data} x="f" ys={[{ key: 'grasa', name: '% grasa', color: '#f87171' }]} target={d.profile.grasaObjetivo} height={170} />
        <p className="small muted">Meta: menos de {d.profile.grasaObjetivo} % manteniendo ~{d.profile.pesoObjetivo} kg. Cada punto que bajás = 1 permitido.</p></Card>
      <Card title="📸 Fotos de progreso" right={
        <label className="btn sm primary">+ Foto<input type="file" accept="image/*" capture="environment" hidden onChange={async (x) => {
          const f = x.target.files?.[0]; if (!f) return
          const data = await resize(f)
          d.set((s) => ({ photos: [...s.photos, { id: uid(), fecha: today(), tipo, data }] }))
        }} /></label>}>
        <div className="tabs">{(['frente', 'perfil', 'espalda', 'outfit'] as const).map((x) => <button key={x} className={`btn sm ${tipo === x ? 'on' : ''}`} onClick={() => setTipo(x)}>{x}</button>)}</div>
        {fotos.length >= 2 && (
          <>
            <h3>Primera vs. última</h3>
            <div className="photos" style={{ gridTemplateColumns: '1fr 1fr' }}>
              {[fotos[0], fotos.at(-1)!].map((p) => <figure key={p.id} style={{ margin: 0 }}><img src={p.data} alt="" /><figcaption className="small muted">{fmtShort(p.fecha)}</figcaption></figure>)}
            </div>
          </>
        )}
        <h3>Todas</h3>
        <div className="photos">{fotos.slice().reverse().map((p) => <img key={p.id} src={p.data} alt="" title={p.fecha} onClick={() => confirm('¿Borrar foto?') && d.set((s) => ({ photos: s.photos.filter((y) => y.id !== p.id) }))} />)}</div>
        <p className="small muted">Misma luz, mismo lugar, misma hora (ej. domingo a la mañana). Las fotos quedan solo en este dispositivo.</p>
      </Card>
    </>
  )
}
