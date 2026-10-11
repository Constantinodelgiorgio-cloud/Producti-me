import { useStore, exportData, initialData, type Data } from '../lib/store'
import { Card, Field } from '../components/ui'
import type { Profile } from '../lib/types'

export default function Ajustes() {
  const d = useStore()
  const P = d.profile
  const up = (p: Partial<Profile>) => d.set((s) => ({ profile: { ...s.profile, ...p } }))
  const num = (k: keyof Profile, label: string, step = 1) => (
    <Field label={label}><input type="number" step={step} value={P[k] as number} onChange={(e) => up({ [k]: +e.target.value } as Partial<Profile>)} /></Field>
  )
  const exportar = () => {
    const blob = new Blob([JSON.stringify(exportData())], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `producti-me-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
  }
  const importar = async (f: File) => {
    const data = JSON.parse(await f.text()) as Data
    if (confirm('Esto reemplaza todos los datos de este dispositivo. ¿Seguir?')) d.replaceAll(data)
  }
  return (
    <>
      <Card title="🌐 Idioma / Language">
        <div className="row">
          <button className={`btn ${d.settings.lang === 'es' ? 'primary' : ''}`} onClick={() => d.set((s) => ({ settings: { ...s.settings, lang: 'es' } }))}>Español</button>
          <button className={`btn ${d.settings.lang === 'en' ? 'primary' : ''}`} onClick={() => d.set((s) => ({ settings: { ...s.settings, lang: 'en' } }))}>English</button>
        </div>
        <p className="small muted">En inglés cambian la interfaz y el coach (para practicar).</p>
      </Card>
      <Card title="🧢 Coach con IA (Claude)">
        <Field label="API key de Anthropic (queda guardada solo en este dispositivo)">
          <input type="password" value={d.settings.apiKey} onChange={(e) => d.set((s) => ({ settings: { ...s.settings, apiKey: e.target.value.trim() } }))} placeholder="sk-ant-…" />
        </Field>
        <Field label="Modelo">
          <select value={d.settings.coachModel} onChange={(e) => d.set((s) => ({ settings: { ...s.settings, coachModel: e.target.value } }))}>
            <option value="claude-opus-5-5">Claude Opus 5.5 (mejor calidad)</option>
            <option value="claude-sonnet-5-5">Claude Sonnet 5.5 (más barato)</option>
            <option value="claude-haiku-5-5">Claude Haiku 5.5 (el más barato)</option>
          </select>
        </Field>
        <p className="small muted">Creá la key en console.anthropic.com → API Keys y poné un límite de gasto mensual de USD 12 en Billing. Se envía un resumen de tus datos (sin fotos ni textos completos del diario).</p>
      </Card>
      <Card title="🎯 Metas">
        <div className="row">{num('pesoObjetivo', 'Peso objetivo (kg)', 0.5)}{num('grasaObjetivo', '% grasa objetivo', 0.5)}{num('suenoMin', 'Sueño mínimo (h)', 0.25)}</div>
        <div className="row" style={{ marginTop: 8 }}>{num('kcalObjetivo', 'Calorías por día', 50)}{num('protObjetivo', 'Proteína (g)', 5)}{num('horasAprendizaje', 'Horas IA+inglés+lectura / semana')}</div>
        <div className="row" style={{ marginTop: 8 }}>{num('ahorroObjetivo', 'Ahorro objetivo (USD)', 100)}
          <Field label="Fecha límite del ahorro"><input type="date" value={P.ahorroFecha} onChange={(e) => up({ ahorroFecha: e.target.value })} /></Field>
          {num('rendimientoObjetivo', 'Rendimiento objetivo (%)', 0.5)}</div>
        <h3>Hora de despertar por día</h3>
        <div className="row">{['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((l, i) => (
          <Field key={l} label={l}><input type="time" value={P.despertar[i]} onChange={(e) => up({ despertar: P.despertar.map((x, j) => j === i ? e.target.value : x) })} /></Field>
        ))}</div>
      </Card>
      <Card title="💾 Datos">
        <p className="small muted">Por ahora los datos viven en este dispositivo. Exportá una copia cada domingo y, para pasar al iPad o la PC, importala allá. La sincronización automática entre dispositivos llega en la próxima fase.</p>
        <div className="row">
          <button className="btn primary" onClick={exportar}>Exportar copia</button>
          <label className="btn">Importar copia<input type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importar(e.target.files[0])} /></label>
          <span className="grow" />
          <button className="btn ghost" onClick={() => confirm('¿Borrar TODOS los datos?') && confirm('¿Seguro? No se puede deshacer.') && d.replaceAll(initialData())}>Reiniciar</button>
        </div>
      </Card>
    </>
  )
}
