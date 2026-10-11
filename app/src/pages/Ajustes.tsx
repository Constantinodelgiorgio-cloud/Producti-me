import { useStore, exportData, initialData, type Data } from '../lib/store'
import { useUI } from '../lib/ui'
import type { Pinned, Profile } from '../lib/types'
import { Icon } from '../components/Icon'
import { Card, Field, PageHead, Seg } from '../components/ui'

export default function Ajustes() {
  const d = useStore()
  const ui = useUI()
  const P = d.profile
  const up = (p: Partial<Profile>) => d.set((s) => ({ profile: { ...s.profile, ...p } }))
  const num = (k: keyof Profile, label: string, step = 1) => (
    <Field label={label} id={`p-${k}`}><input id={`p-${k}`} type="number" inputMode="decimal" step={step} value={P[k] as number} onChange={(e) => up({ [k]: Number(e.target.value) } as Partial<Profile>)} /></Field>
  )
  const exportar = () => {
    const blob = new Blob([JSON.stringify(exportData())], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `producti-me-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    ui.notify('Copia exportada')
  }
  const importar = async (f: File) => {
    let data: Data
    try { data = JSON.parse(await f.text()) as Data } catch { ui.notify('El archivo no es una copia válida de Producti-Me', undefined, 'neutral'); return }
    if (await ui.confirm({ title: '¿Importar esta copia?', body: 'Reemplaza todos los datos de este dispositivo por los del archivo.', confirm: 'Importar', danger: true })) {
      d.replaceAll(data)
      ui.notify('Copia importada')
    }
  }
  const reiniciar = async () => {
    if (await ui.confirm({ title: '¿Borrar todos los datos?', body: 'Se borran hábitos marcados, registros, fotos y revisiones de este dispositivo. No se puede deshacer. Exportá una copia antes si la querés conservar.', confirm: 'Borrar todo', danger: true }))
      d.replaceAll(initialData())
  }
  return (
    <div className="view">
      <PageHead eyebrow="Producti-Me" title="Ajustes" />
      <div className="grid">
        <Card title="Idioma y navegación" icon="globe">
          <div className="stack">
            <div className="field"><label>Idioma del coach y del dictado por voz</label><Seg label="Idioma" value={d.settings.lang} onChange={(v) => d.set((s) => ({ settings: { ...s.settings, lang: v } }))} options={[['es', 'Español'], ['en', 'English']]} /><span className="cap">La interfaz completa en inglés llega en una próxima etapa.</span></div>
            <div className="field"><label>Pantalla fijada en la barra inferior</label><Seg label="Pantalla fijada" value={d.settings.pinned ?? 'fisico'} onChange={(v: Pinned) => d.set((s) => ({ settings: { ...s.settings, pinned: v } }))} options={[['fisico', 'Físico'], ['estudio', 'Estudio'], ['finanzas', 'Finanzas'], ['vida', 'Vida']]} /></div>
          </div>
        </Card>
        <Card title="Coach con IA" icon="sparkles">
          <div className="stack">
            <Field label="Clave de Anthropic (queda solo en este dispositivo)" id="api"><input id="api" type="password" autoComplete="off" value={d.settings.apiKey} placeholder="sk-ant-…" onChange={(e) => d.set((s) => ({ settings: { ...s.settings, apiKey: e.target.value.trim() } }))} /></Field>
            <Field label="Modelo" id="model"><select id="model" value={d.settings.coachModel} onChange={(e) => d.set((s) => ({ settings: { ...s.settings, coachModel: e.target.value } }))}>
              <option value="claude-opus-5-5">Claude Opus 5.5 · mejor calidad</option>
              <option value="claude-sonnet-5-5">Claude Sonnet 5.5 · más barato</option>
              <option value="claude-haiku-5-5">Claude Haiku 5.5 · el más barato</option>
            </select></Field>
            <p className="cap">Creá la clave en console.anthropic.com y poné un límite de gasto mensual de USD 12. El coach recibe un resumen de tus datos, sin fotos ni textos completos del diario.</p>
          </div>
        </Card>
        <Card title="Metas" icon="target">
          <div className="form-grid">
            {num('pesoObjetivo', 'Peso objetivo (kg)', 0.5)}{num('grasaObjetivo', '% de grasa objetivo', 0.5)}{num('suenoMin', 'Sueño mínimo (h)', 0.25)}
            {num('kcalObjetivo', 'Calorías por día', 50)}{num('protObjetivo', 'Proteína (g)', 5)}{num('horasAprendizaje', 'IA + inglés + lectura (h/sem)')}
            {num('ahorroObjetivo', 'Ahorro objetivo (USD)', 100)}
            <Field label="Fecha límite del ahorro" id="p-af"><input id="p-af" type="date" value={P.ahorroFecha} onChange={(e) => up({ ahorroFecha: e.target.value })} /></Field>
            {num('rendimientoObjetivo', 'Rendimiento objetivo (%)', 0.5)}
          </div>
        </Card>
        <Card title="Hora de despertar" icon="sun">
          <div className="form-grid">{['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((l, i) => (
            <Field key={l} label={l} id={`w-${i}`}><input id={`w-${i}`} type="time" value={P.despertar[i]} onChange={(e) => up({ despertar: P.despertar.map((x, j) => (j === i ? e.target.value : x)) })} /></Field>
          ))}</div>
        </Card>
        <Card title="Tus datos" icon="download">
          <p className="body-2" style={{ marginBottom: 12 }}>Los datos viven en este dispositivo. Exportá una copia cada domingo; para pasar al iPad o a la PC, importala allá.</p>
          <div className="row">
            <button className="btn btn-primary" onClick={exportar}><Icon name="download" size={16} />Exportar copia</button>
            <label className="btn btn-quiet"><Icon name="upload" size={16} />Importar copia<input type="file" accept="application/json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) importar(f); e.target.value = '' }} /></label>
            <span className="grow" />
            <button className="btn btn-danger" onClick={reiniciar}><Icon name="trash" size={16} />Borrar todo</button>
          </div>
        </Card>
      </div>
    </div>
  )
}
