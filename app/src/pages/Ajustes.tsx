import { useState } from 'react'
import { get as idbGet } from 'idb-keyval'
import { useStore, exportData, initialData, BACKUP_KEY, type Data } from '../lib/store'
import { useUI } from '../lib/ui'
import type { Profile } from '../lib/types'
import { useScrollToSub } from '../components/useScrollTo'
import { Icon } from '../components/Icon'
import { Card, Field, PageHead, Seg } from '../components/ui'

export default function Ajustes() {
  useScrollToSub()
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
        <Card title="Idioma" icon="globe">
          <div className="field"><label>Idioma del coach y del dictado por voz</label><Seg label="Idioma" value={d.settings.lang} onChange={(v) => d.set((s) => ({ settings: { ...s.settings, lang: v } }))} options={[['es', 'Español'], ['en', 'English']]} /><span className="cap">La interfaz completa en inglés llega en una próxima etapa.</span></div>
        </Card>
        <Card title="Coach con IA" icon="sparkles">
          <div className="stack">
            <Field label="Clave de Anthropic (queda solo en este dispositivo)" id="api"><input id="api" type="password" autoComplete="off" value={d.settings.apiKey} placeholder="sk-ant-…" onChange={(e) => d.set((s) => ({ settings: { ...s.settings, apiKey: e.target.value.trim() } }))} /></Field>
            <Field label="Modelo" id="model"><select id="model" value={d.settings.coachModel} onChange={(e) => d.set((s) => ({ settings: { ...s.settings, coachModel: e.target.value } }))}>
              <option value="claude-opus-5-5">Claude Opus 5.5 · mejor calidad</option>
              <option value="claude-sonnet-5-5">Claude Sonnet 5.5 · más barato</option>
              <option value="claude-haiku-5-5">Claude Haiku 5.5 · el más barato</option>
            </select></Field>
            <p className="cap">Creá la clave en console.anthropic.com y poné un límite de gasto mensual. El coach recibe un resumen de tus datos y el plan de la semana, sin fotos ni textos del diario.</p>
            <label className="row cap" style={{ gap: 8 }}><input type="checkbox" checked={!!d.settings.coachLeeDiario} onChange={(e) => d.set((s) => ({ settings: { ...s.settings, coachLeeDiario: e.target.checked } }))} />Permitir que el coach lea mis últimas 3 entradas del diario</label>
          </div>
        </Card>
        <Correo />
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
          <p className="cap" style={{ marginBottom: 12 }}>Antes de la actualización de la versión 2 se guardó una copia automática de tus datos anteriores. <button className="link-inline" onClick={async () => { const raw = await idbGet<string>(BACKUP_KEY); if (!raw) { ui.notify('No hay copia previa en este dispositivo', undefined, 'neutral'); return } const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([raw], { type: 'application/json' })); a.download = 'producti-me-respaldo-v1.json'; a.click() }}>Descargar respaldo v1</button></p>
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

function Correo() {
  const d = useStore()
  const ui = useUI()
  const [busy, setBusy] = useState(false)
  const st = d.settings
  const set = (p: Partial<typeof st>) => d.set((s) => ({ settings: { ...s.settings, ...p } }))
  const probar = async () => {
    setBusy(true)
    try { const { syncCorreo } = await import('../lib/correo'); const r = await syncCorreo(); ui.notify(`Conectado · ${r.nuevos} anotados · ${r.pendientes} para confirmar`) }
    catch (e) { ui.notify(`No se pudo conectar: ${e instanceof Error ? e.message : String(e)}`, undefined, 'neutral') } finally { setBusy(false) }
  }
  return (
    <section className="panel pad" id="sec-correo">
      <h2 className="h2" style={{ marginBottom: 12 }}><Icon name="mail" size={16} />Correo de pagos (Gmail)</h2>
      <div className="stack">
        <p className="body-2">Un script de Google que corre en tu propia cuenta lee los correos de Mercado Pago, Santander y Visa, y la app los anota al abrirse. Instalación de 5 minutos: <a href="https://github.com/constantinodelgiorgio-cloud/Producti-me/blob/claude/personal-productivity-wellness-app-mt7jbv/docs/12-correo-de-pagos.md" target="_blank" rel="noreferrer">ver la guía</a>.</p>
        <Field label="URL del script (termina en /exec)" id="c-url"><input id="c-url" inputMode="url" autoComplete="off" value={st.correoUrl ?? ''} placeholder="https://script.google.com/macros/s/…/exec" onChange={(e) => set({ correoUrl: e.target.value.trim() || undefined })} /></Field>
        <Field label="Clave del script" id="c-tok"><input id="c-tok" type="password" autoComplete="off" value={st.correoToken ?? ''} onChange={(e) => set({ correoToken: e.target.value.trim() || undefined })} /></Field>
        <label className="row cap" style={{ gap: 8 }}><input type="checkbox" checked={st.correoAuto !== false} onChange={(e) => set({ correoAuto: e.target.checked })} />Anotar automáticamente lo que se lee con claridad (lo dudoso queda para confirmar)</label>
        <div className="row"><button className="btn btn-quiet" disabled={!st.correoUrl || busy} onClick={probar}><Icon name="refresh" size={16} />{busy ? 'Revisando…' : 'Probar y revisar ahora'}</button>{d.correo.error && <span className="err">{d.correo.error}</span>}</div>
      </div>
    </section>
  )
}
