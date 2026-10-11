import { useMemo, useState } from 'react'
import { useStore } from '../lib/store'
import { useUI } from '../lib/ui'
import { dayNutrition } from '../lib/logic'
import { fmtShort, today, uid } from '../lib/date'
import { FOODS } from '../lib/seed'
import type { Food } from '../lib/types'
import { Icon } from '../components/Icon'
import { Bar, Card, Field, PageHead } from '../components/ui'

export default function Comida() {
  const d = useStore()
  const ui = useUI()
  const [fecha, setFecha] = useState(today())
  const [q, setQ] = useState('')
  const [sel, setSel] = useState<Food[]>([])
  const [custom, setCustom] = useState({ nombre: '', kcal: '', prot: '', carb: '', grasa: '' })
  const P = d.profile
  const base = dayNutrition(d, fecha)
  const add = sel.reduce((a, f) => ({ kcal: a.kcal + f.kcal, prot: a.prot + f.prot }), { kcal: 0, prot: 0 })

  // Frecuentes: tus comidas más registradas primero, después la lista base.
  const foods = useMemo(() => {
    const count = new Map<string, { f: Food; n: number }>()
    for (const m of d.meals) { const c = count.get(m.nombre); count.set(m.nombre, { f: { nombre: m.nombre, kcal: m.kcal, prot: m.prot, carb: m.carb, grasa: m.grasa }, n: (c?.n ?? 0) + 1 }) }
    const mine = [...count.values()].sort((a, b) => b.n - a.n).map((x) => x.f)
    return [...mine, ...FOODS.filter((f) => !count.has(f.nombre))]
  }, [d.meals])
  const shown = foods.filter((f) => f.nombre.toLowerCase().includes(q.toLowerCase()))
  const toggle = (f: Food) => setSel((s) => (s.some((x) => x.nombre === f.nombre) ? s.filter((x) => x.nombre !== f.nombre) : [...s, f]))

  const save = () => {
    const ids = sel.map(() => uid())
    d.set((s) => ({ meals: [...s.meals, ...sel.map((f, i) => ({ id: ids[i], fecha, nombre: f.nombre, kcal: f.kcal, prot: f.prot, carb: f.carb, grasa: f.grasa }))] }))
    ui.notify(`${sel.length > 1 ? `${sel.length} alimentos guardados` : 'Guardado'} · +${add.kcal} kcal · ${add.prot} g de proteína`, () => d.set((s) => ({ meals: s.meals.filter((m) => !ids.includes(m.id)) })))
    setSel([])
    ui.go(ui.prev && ui.prev !== 'comida' ? ui.prev : 'hoy')
  }
  const addCustom = (e: React.FormEvent) => {
    e.preventDefault()
    const n = (v: string) => Math.max(0, Number(v) || 0)
    if (!custom.nombre.trim()) return
    setSel((s) => [...s, { nombre: custom.nombre.trim(), kcal: n(custom.kcal), prot: n(custom.prot), carb: n(custom.carb), grasa: n(custom.grasa) }])
    setCustom({ nombre: '', kcal: '', prot: '', carb: '', grasa: '' })
  }
  const delMeal = (id: string) => {
    const m = d.meals.find((x) => x.id === id)
    d.set((s) => ({ meals: s.meals.filter((x) => x.id !== id) }))
    if (m) ui.notify(`${m.nombre} borrado`, () => d.set((s) => ({ meals: [...s.meals, m] })), 'neutral')
  }
  const dayMeals = d.meals.filter((m) => m.fecha === fecha)

  return (
    <div className="view">
      <PageHead back eyebrow={`Registrar · ${fmtShort(fecha)}`} title="Comida" right={<input type="date" aria-label="Fecha" value={fecha} max={today()} onChange={(e) => setFecha(e.target.value || today())} style={{ width: 150 }} />} />
      <div className="two-col">
        <div className="stack">
          <div className="search"><Icon name="search" size={16} /><input aria-label="Buscar un alimento" placeholder="Buscar un alimento" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <div className="eyebrow" style={{ marginTop: 6 }}>Frecuentes</div>
          {shown.length ? (
            <div className="foods">{shown.map((f) => {
              const on = sel.some((x) => x.nombre === f.nombre)
              return <button key={f.nombre} className="food" aria-pressed={on} onClick={() => toggle(f)}>{on && <Icon name="check" size={14} />}{f.nombre}<small>{f.prot} g P · {f.kcal}</small></button>
            })}</div>
          ) : <p className="body-2">Sin resultados para "{q}". Cargalo abajo como comida nueva.</p>}
          <Card title="Comida nueva" icon="plus">
            <form className="form-grid" onSubmit={addCustom}>
              <Field label="Nombre" id="cn"><input id="cn" value={custom.nombre} placeholder={q || 'Ej. tarta de verdura'} onChange={(e) => setCustom({ ...custom, nombre: e.target.value })} /></Field>
              {(['kcal', 'prot', 'carb', 'grasa'] as const).map((k) => (
                <Field key={k} label={{ kcal: 'Calorías', prot: 'Proteína (g)', carb: 'Carbos (g)', grasa: 'Grasas (g)' }[k]} id={`c-${k}`}>
                  <input id={`c-${k}`} type="number" inputMode="decimal" min={0} value={custom[k]} onChange={(e) => setCustom({ ...custom, [k]: e.target.value })} />
                </Field>
              ))}
              <button className="btn btn-quiet" disabled={!custom.nombre.trim()}><Icon name="plus" size={16} />Sumar</button>
            </form>
          </Card>
        </div>

        <aside className="stack rail">
          <section className="panel pad" aria-live="polite">
            <div className="sec" style={{ margin: '0 0 8px' }}><span className="eyebrow">Cómo queda tu día</span><span className="cap">rayado = lo que sumás</span></div>
            <div className="proj-row"><span className="cap">Calorías</span><Bar value={base.kcal / P.kcalObjetivo} ghost={(base.kcal + add.kcal) / P.kcalObjetivo} tone={base.kcal + add.kcal > P.kcalObjetivo * 1.05 ? 'over' : undefined} /><span className="v num"><b>{Math.round(base.kcal + add.kcal).toLocaleString('es-AR')}</b> / {P.kcalObjetivo.toLocaleString('es-AR')}</span></div>
            <div className="proj-row"><span className="cap">Proteína</span><Bar value={base.prot / P.protObjetivo} ghost={(base.prot + add.prot) / P.protObjetivo} /><span className="v num"><b>{Math.round(base.prot + add.prot)}</b> / {P.protObjetivo} g</span></div>
            {sel.length ? <div style={{ marginTop: 10 }}>{sel.map((f) => (
              <div className="list-row" key={f.nombre}>{f.nombre}<span className="k">{f.kcal} kcal · {f.prot} g</span><button className="icon-btn sm" aria-label={`Quitar ${f.nombre}`} onClick={() => toggle(f)}><Icon name="x" size={15} /></button></div>
            ))}</div> : <p className="cap" style={{ marginTop: 10 }}>Elegí uno o varios alimentos. La proyección se actualiza antes de guardar.</p>}
            <div className="savebar"><button className="btn btn-primary grow" disabled={!sel.length} onClick={save}>{sel.length ? `Guardar ${sel.length} ${sel.length > 1 ? 'alimentos' : 'alimento'}` : 'Elegí un alimento'}</button></div>
          </section>
          <Card title={fecha === today() ? 'Registrado hoy' : `Registrado el ${fmtShort(fecha)}`} icon="utensils">
            {dayMeals.length === 0 ? <p className="cap">Todavía nada.</p> : dayMeals.map((m) => (
              <div className="list-row" key={m.id}>{m.nombre}<span className="k">{m.kcal} kcal · {m.prot} g</span><button className="icon-btn sm" aria-label={`Borrar ${m.nombre}`} onClick={() => delMeal(m.id)}><Icon name="trash" size={15} /></button></div>
            ))}
          </Card>
        </aside>
      </div>
    </div>
  )
}
