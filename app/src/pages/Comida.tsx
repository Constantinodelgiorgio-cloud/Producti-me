import { useMemo, useState } from 'react'
import { useStore } from '../lib/store'
import { useUI } from '../lib/ui'
import { dayNutrition } from '../lib/logic'
import { fmtShort, today, uid } from '../lib/date'
import { ALIMENTOS, buscar, CATEGORIAS, macros } from '../lib/foods'
import type { Alimento, CategoriaAlimento, ComidaGuardada, MomentoComida } from '../lib/types'
import { Icon } from '../components/Icon'
import { Bar, Card, Field, NumInput, PageHead, parseNum, Seg } from '../components/ui'

type Sel = { key: string; foodId?: string; nombre: string; gramos?: number; kcal: number; prot: number; carb: number; grasa: number }
const MOMENTOS: [MomentoComida, string][] = [['desayuno', 'Desayuno'], ['almuerzo', 'Almuerzo'], ['merienda', 'Merienda'], ['cena', 'Cena'], ['snack', 'Snack']]
const momentoAhora = (): MomentoComida => { const h = new Date().getHours(); return h < 11 ? 'desayuno' : h < 15 ? 'almuerzo' : h < 19 ? 'merienda' : h < 23 ? 'cena' : 'snack' }
const r1 = (n: number) => Math.round(n * 10) / 10
const dec = (n: number) => String(r1(n)).replace('.', ',')

export default function Comida() {
  const d = useStore()
  const ui = useUI()
  const [fecha, setFecha] = useState(today())
  const [momento, setMomento] = useState<MomentoComida>(momentoAhora())
  const [q, setQ] = useState('')
  const [tab, setTab] = useState<'recientes' | 'favoritos' | 'guardadas' | 'categorias'>('recientes')
  const [cat, setCat] = useState<CategoriaAlimento | null>(null)
  const [open, setOpen] = useState<string | null>(null)
  const [sel, setSel] = useState<Sel[]>([])
  const [nombreCombo, setNombreCombo] = useState('')
  const [nuevo, setNuevo] = useState(false)
  const P = d.profile
  const base = dayNutrition(d, fecha)
  const add = sel.reduce((a, f) => ({ kcal: a.kcal + f.kcal, prot: a.prot + f.prot, carb: a.carb + f.carb, grasa: a.grasa + f.grasa }), { kcal: 0, prot: 0, carb: 0, grasa: 0 })
  const pool = useMemo(() => [...d.alimentosPropios, ...ALIMENTOS], [d.alimentosPropios])
  const byId = useMemo(() => new Map(pool.map((a) => [a.id, a])), [pool])

  // Frecuencia de uso para ordenar resultados: lo que más comés aparece primero.
  const freq = useMemo(() => { const m = new Map<string, number>(); for (const x of d.meals) if (x.foodId) m.set(x.foodId, (m.get(x.foodId) ?? 0) + 1); return m }, [d.meals])
  const fav = new Set(d.favoritos)
  const prio = (a: Alimento) => (fav.has(a.id) ? 3 : 0) + Math.min(3, (freq.get(a.id) ?? 0) / 3)
  const results = q.trim() ? buscar(q, pool, prio) : []
  const recientes = useMemo(() => {
    const out: Sel[] = []
    for (const m of [...d.meals].reverse()) { if (!out.find((r) => r.nombre === m.nombre && r.gramos === m.gramos)) out.push({ key: m.id, foodId: m.foodId, nombre: m.nombre, gramos: m.gramos, kcal: m.kcal, prot: m.prot, carb: m.carb, grasa: m.grasa }); if (out.length === 12) break }
    return out
  }, [d.meals])

  const push = (s: Omit<Sel, 'key'>) => { setSel((x) => [...x, { ...s, key: uid() }]); setOpen(null) }
  const toggleFav = (id: string) => d.set((s) => ({ favoritos: s.favoritos.includes(id) ? s.favoritos.filter((x) => x !== id) : [...s.favoritos, id] }))

  const save = () => {
    const ids = sel.map(() => uid())
    d.set((s) => ({ meals: [...s.meals, ...sel.map((f, i) => ({ id: ids[i], fecha, nombre: f.nombre, foodId: f.foodId, gramos: f.gramos, momento, kcal: Math.round(f.kcal), prot: r1(f.prot), carb: r1(f.carb), grasa: r1(f.grasa) }))] }))
    ui.notify(`${sel.length > 1 ? `${sel.length} alimentos` : sel[0].nombre} · +${Math.round(add.kcal)} kcal · ${Math.round(add.prot)} g de proteína`, () => d.set((s) => ({ meals: s.meals.filter((m) => !ids.includes(m.id)) })))
    setSel([]); setQ('')
  }
  const guardarCombo = () => {
    if (!nombreCombo.trim() || !sel.length) return
    const c: ComidaGuardada = { id: uid(), nombre: nombreCombo.trim(), items: sel.map(({ key: _k, ...x }) => x) }
    d.set((s) => ({ comidasGuardadas: [...s.comidasGuardadas, c] }))
    setNombreCombo('')
    ui.notify(`"${c.nombre}" guardada para cargarla con un toque`)
  }
  const delMeal = (id: string) => {
    const m = d.meals.find((x) => x.id === id)
    d.set((s) => ({ meals: s.meals.filter((x) => x.id !== id) }))
    if (m) ui.notify(`${m.nombre} borrado`, () => d.set((s) => ({ meals: [...s.meals, m] })), 'neutral')
  }
  const dayMeals = d.meals.filter((m) => m.fecha === fecha)

  const lista = q.trim() ? results : tab === 'favoritos' ? d.favoritos.map((id) => byId.get(id)).filter(Boolean) as Alimento[] : tab === 'categorias' && cat ? pool.filter((a) => a.cat === cat) : []

  return (
    <div className="view">
      <PageHead back eyebrow={`Registrar · ${fmtShort(fecha)}`} title="Comida" right={<input type="date" aria-label="Fecha" value={fecha} max={today()} onChange={(e) => setFecha(e.target.value || today())} style={{ width: 150 }} />} />
      <div style={{ marginBottom: 12 }}><Seg label="Momento" value={momento} onChange={setMomento} options={MOMENTOS} /></div>
      <div className="two-col">
        <div className="stack">
          <div className="search big"><Icon name="search" size={18} /><input aria-label="Buscar un alimento" placeholder="Buscá: palta, bife, milanesa, café con leche…" value={q} onChange={(e) => { setQ(e.target.value); setOpen(null) }} autoComplete="off" />{q && <button className="icon-btn sm clear" aria-label="Borrar búsqueda" onClick={() => setQ('')}><Icon name="x" size={15} /></button>}</div>
          {!q.trim() && <Seg label="Atajos" value={tab} onChange={(v) => { setTab(v); setCat(null) }} options={[['recientes', 'Recientes'], ['favoritos', 'Favoritos'], ['guardadas', 'Guardadas'], ['categorias', 'Categorías']]} />}

          {!q.trim() && tab === 'recientes' && (recientes.length ? <div className="food-list">{recientes.map((r) => (
            <button key={r.key} className="food-row" onClick={() => push(r)}>
              <span className="grow"><b>{r.nombre}</b><span className="cap">{r.gramos ? `${r.gramos} g · ` : ''}{Math.round(r.kcal)} kcal · {dec(r.prot)} g P</span></span>
              <span className="fr-add"><Icon name="plus" size={16} /></span>
            </button>
          ))}</div> : <p className="cap">Lo que registres va a aparecer acá para repetirlo con un toque.</p>)}

          {!q.trim() && tab === 'guardadas' && (d.comidasGuardadas.length ? <div className="food-list">{d.comidasGuardadas.map((c) => {
            const t = c.items.reduce((a, x) => ({ kcal: a.kcal + x.kcal, prot: a.prot + x.prot }), { kcal: 0, prot: 0 })
            return (
              <div key={c.id} className="food-row as-div">
                <button className="grow fr-btn" onClick={() => { setSel((x) => [...x, ...c.items.map((i) => ({ ...i, key: uid() }))]) }}>
                  <b>{c.nombre}</b><span className="cap">{c.items.map((i) => i.nombre).join(' + ')} · {Math.round(t.kcal)} kcal · {Math.round(t.prot)} g P</span>
                </button>
                <button className="icon-btn sm" aria-label={`Borrar ${c.nombre}`} onClick={() => d.set((s) => ({ comidasGuardadas: s.comidasGuardadas.filter((x) => x.id !== c.id) }))}><Icon name="trash" size={15} /></button>
              </div>
            )
          })}</div> : <p className="cap">Elegí varios alimentos y guardalos como una comida ("Desayuno habitual") para cargarla con un toque.</p>)}

          {!q.trim() && tab === 'categorias' && !cat && <div className="cat-grid">{CATEGORIAS.filter((c) => c.id !== 'propios' || d.alimentosPropios.length).map((c) => (
            <button key={c.id} className="cat-tile" onClick={() => setCat(c.id)}><Icon name={c.icon} size={18} /><span>{c.nombre}</span><small className="num">{pool.filter((a) => a.cat === c.id).length}</small></button>
          ))}</div>}
          {!q.trim() && tab === 'categorias' && cat && <button className="link-row" onClick={() => setCat(null)}><Icon name="chevron-left" size={16} />{CATEGORIAS.find((c) => c.id === cat)?.nombre}</button>}
          {!q.trim() && tab === 'favoritos' && !lista.length && <p className="cap">Marcá con la estrella los alimentos que comés seguido.</p>}

          {lista.length > 0 && <div className="food-list">{lista.map((a) => <FoodRow key={a.id} a={a} open={open === a.id} fav={fav.has(a.id)} onOpen={() => setOpen(open === a.id ? null : a.id)} onFav={() => toggleFav(a.id)} onAdd={push} />)}</div>}
          {q.trim() && !results.length && <div className="panel pad"><p className="body-2">No encontré "{q}". Cargalo una vez como alimento propio y queda para siempre.</p><button className="btn btn-quiet" style={{ marginTop: 10 }} onClick={() => setNuevo(true)}><Icon name="plus" size={16} />Crear "{q}"</button></div>}

          <button className="link-row" onClick={() => setNuevo(!nuevo)}><Icon name="pencil" size={16} />Alimento propio o macros a mano<Icon name={nuevo ? 'chevron-down' : 'chevron-right'} size={16} /></button>
          {nuevo && <NuevoAlimento inicial={q} onCreate={(a, g) => { d.set((s) => ({ alimentosPropios: [...s.alimentosPropios, a] })); push({ foodId: a.id, nombre: a.nombre, gramos: g, ...macros(a, g) }); setNuevo(false); setQ('') }} />}
        </div>

        <aside className="stack rail">
          <section className="panel pad" aria-live="polite">
            <div className="sec" style={{ margin: '0 0 8px' }}><span className="eyebrow">Cómo queda tu día</span><span className="cap">rayado = lo que sumás</span></div>
            <div className="proj-row"><span className="cap">Calorías</span><Bar value={base.kcal / P.kcalObjetivo} ghost={(base.kcal + add.kcal) / P.kcalObjetivo} tone={base.kcal + add.kcal > P.kcalObjetivo * 1.05 ? 'over' : undefined} /><span className="v num"><b>{Math.round(base.kcal + add.kcal).toLocaleString('es-AR')}</b> / {P.kcalObjetivo.toLocaleString('es-AR')}</span></div>
            <div className="proj-row"><span className="cap">Proteína</span><Bar value={base.prot / P.protObjetivo} ghost={(base.prot + add.prot) / P.protObjetivo} /><span className="v num"><b>{dec(r1(base.prot + add.prot))}</b> / {P.protObjetivo} g</span></div>
            <div className="macro-mini num"><span>C <b>{Math.round(base.carb + add.carb)}</b> g</span><span>G <b>{Math.round(base.grasa + add.grasa)}</b> g</span></div>
            {sel.length ? <div style={{ marginTop: 10 }}>{sel.map((f) => (
              <div className="list-row" key={f.key}><span className="grow">{f.nombre}{f.gramos ? <span className="cap"> · {dec(f.gramos)} g</span> : null}</span><span className="k">{Math.round(f.kcal)} kcal · {dec(f.prot)} g</span><button className="icon-btn sm" aria-label={`Quitar ${f.nombre}`} onClick={() => setSel((x) => x.filter((y) => y.key !== f.key))}><Icon name="x" size={15} /></button></div>
            ))}</div> : <p className="cap" style={{ marginTop: 10 }}>Elegí uno o varios alimentos. La proyección se actualiza antes de guardar.</p>}
            <div className="savebar"><button className="btn btn-primary grow" disabled={!sel.length} onClick={save}>{sel.length ? `Guardar en ${MOMENTOS.find((m) => m[0] === momento)?.[1].toLowerCase()}` : 'Elegí un alimento'}</button></div>
            {sel.length > 1 && <form className="row" style={{ flexWrap: 'nowrap', marginTop: 6 }} onSubmit={(e) => { e.preventDefault(); guardarCombo() }}><input className="grow" aria-label="Nombre de la comida guardada" placeholder="Guardar como… (ej. Desayuno habitual)" value={nombreCombo} onChange={(e) => setNombreCombo(e.target.value)} /><button className="btn btn-quiet" disabled={!nombreCombo.trim()}><Icon name="star" size={15} /></button></form>}
          </section>
          <Card title={fecha === today() ? 'Registrado hoy' : `Registrado el ${fmtShort(fecha)}`} icon="utensils">
            {dayMeals.length === 0 ? <p className="cap">Todavía nada.</p> : MOMENTOS.map(([k, n]) => {
              const ms = dayMeals.filter((m) => (m.momento ?? 'snack') === k)
              if (!ms.length) return null
              return <div key={k} style={{ marginBottom: 8 }}><div className="eyebrow" style={{ margin: '6px 0 2px' }}>{n} · {Math.round(ms.reduce((a, m) => a + m.kcal, 0))} kcal</div>
                {ms.map((m) => <div className="list-row" key={m.id}><span className="grow">{m.nombre}{m.gramos ? <span className="cap"> · {dec(m.gramos)} g</span> : null}</span><span className="k">{m.kcal} kcal · {dec(m.prot)} g</span><button className="icon-btn sm" aria-label={`Borrar ${m.nombre}`} onClick={() => delMeal(m.id)}><Icon name="trash" size={15} /></button></div>)}</div>
            })}
          </Card>
        </aside>
      </div>
    </div>
  )
}

function FoodRow({ a, open, fav, onOpen, onFav, onAdd }: { a: Alimento; open: boolean; fav: boolean; onOpen: () => void; onFav: () => void; onAdd: (s: Omit<Sel, 'key'>) => void }) {
  const [pi, setPi] = useState(0)
  const [n, setN] = useState(1)
  const [g, setG] = useState('')
  const por = a.porciones[pi] ?? a.porciones[0]
  const grams = g ? (parseNum(g) ?? 0) : r1(por.g * n)
  const m = macros(a, grams || 0)
  const def = macros(a, a.porciones[0].g)
  return (
    <div className={`food-row as-div ${open ? 'open' : ''}`}>
      <div className="fr-top">
        <button className="grow fr-btn" onClick={onOpen} aria-expanded={open}>
          <b>{a.nombre}</b>
          <span className="cap">{a.porciones[0].n} · {def.kcal} kcal · {dec(def.prot)} g P</span>
        </button>
        <button className={`icon-btn sm star ${fav ? 'on' : ''}`} aria-label={fav ? 'Quitar de favoritos' : 'Agregar a favoritos'} aria-pressed={fav} onClick={onFav}><Icon name="star" size={15} /></button>
        <button className="fr-add" aria-label={`Sumar ${a.porciones[0].n} de ${a.nombre}`} onClick={() => onAdd({ foodId: a.id, nombre: a.nombre, gramos: a.porciones[0].g, ...def })}><Icon name="plus" size={16} /></button>
      </div>
      {open && (
        <div className="portion">
          <div className="chips" style={{ flexWrap: 'wrap' }}>{a.porciones.map((p, i) => <button key={p.n} className="chip" aria-pressed={pi === i && !g} onClick={() => { setPi(i); setG('') }}>{p.n}</button>)}</div>
          <div className="row" style={{ flexWrap: 'nowrap', marginTop: 10 }}>
            <div className="stepper" role="group" aria-label="Cantidad">
              <button type="button" aria-label="Menos" onClick={() => { setG(''); setN(Math.max(0.5, n - (n > 1 ? 1 : 0.5))) }}><Icon name="minus" size={15} /></button>
              <span className="num">{String(n).replace('.', ',')}</span>
              <button type="button" aria-label="Más" onClick={() => { setG(''); setN(n < 1 ? 1 : n + 1) }}><Icon name="plus" size={15} /></button>
            </div>
            <NumInput aria-label="Gramos" className="grams-in" placeholder={`${dec(r1(por.g * n))} g`} value={g} onValue={(_, raw) => setG(raw)} />
            <span className="grow cap num" style={{ textAlign: 'right' }}>{m.kcal} kcal · {dec(m.prot)} P · {dec(m.carb)} C · {dec(m.grasa)} G</span>
          </div>
          <button className="btn btn-primary btn-block" style={{ marginTop: 10 }} disabled={!grams} onClick={() => onAdd({ foodId: a.id, nombre: a.nombre, gramos: grams, ...m })}>Sumar {dec(grams)} g</button>
        </div>
      )}
    </div>
  )
}

function NuevoAlimento({ inicial, onCreate }: { inicial: string; onCreate: (a: Alimento, gramos: number) => void }) {
  const [v, setV] = useState({ nombre: inicial, porcion: '1 porción', g: '100', kcal: '', prot: '', carb: '', grasa: '' })
  const n = (x: string) => Math.max(0, parseNum(x) ?? 0)
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const g = n(v.g) || 100
    // Los valores se cargan por porción y se guardan por 100 g.
    const k = 100 / g
    onCreate({ id: `propio-${uid()}`, nombre: v.nombre.trim(), alias: [], cat: 'propios', kcal: Math.round(n(v.kcal) * k), prot: n(v.prot) * k, carb: n(v.carb) * k, grasa: n(v.grasa) * k, porciones: [{ n: v.porcion || '1 porción', g }, { n: '100 g', g: 100 }] }, g)
  }
  return (
    <form className="panel pad form-grid" onSubmit={submit}>
      <Field label="Nombre" id="na-n"><input id="na-n" value={v.nombre} onChange={(e) => setV({ ...v, nombre: e.target.value })} placeholder="Ej. tarta de mi vieja" /></Field>
      <Field label="Porción" id="na-p"><input id="na-p" value={v.porcion} onChange={(e) => setV({ ...v, porcion: e.target.value })} /></Field>
      <Field label="Gramos de la porción" id="na-g"><NumInput id="na-g" value={v.g} onValue={(_, raw) => setV({ ...v, g: raw })} /></Field>
      {(['kcal', 'prot', 'carb', 'grasa'] as const).map((k) => (
        <Field key={k} label={`${{ kcal: 'Calorías', prot: 'Proteína (g)', carb: 'Carbos (g)', grasa: 'Grasas (g)' }[k]} por porción`} id={`na-${k}`}><NumInput id={`na-${k}`} value={v[k]} onValue={(_, raw) => setV({ ...v, [k]: raw })} /></Field>
      ))}
      <button className="btn btn-quiet" disabled={!v.nombre.trim() || !v.kcal}><Icon name="plus" size={16} />Crear y sumar</button>
    </form>
  )
}
