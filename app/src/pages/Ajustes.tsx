import { useEffect, useState } from 'react'
import { get as idbGet } from 'idb-keyval'
import { useStore, exportData, initialData, reiniciarDias, BACKUP_KEY, BACKUP_KEY_V2, type Data } from '../lib/store'
import { codigoVinculo, combinarCopia, leerVinculo, sincronizar, useSync } from '../lib/sync'
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
  const exportar = async () => {
    const nombre = `producti-me-${new Date().toISOString().slice(0, 10)}.json`
    const blob = new Blob([JSON.stringify(exportData())], { type: 'application/json' })
    // En iPhone y iPad: hoja de compartir (guardar en Archivos, AirDrop, mandarlo por WhatsApp).
    try {
      const file = new File([blob], nombre, { type: 'application/json' })
      const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean }
      if (nav.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: 'Copia de Producti-Me' }); return }
    } catch (e) { if (e instanceof DOMException && e.name === 'AbortError') return }
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = nombre
    a.click()
    ui.notify('Copia exportada')
  }
  const importar = async (f: File) => {
    let data: Data
    try { data = JSON.parse(await f.text()) as Data } catch { ui.notify('El archivo no es una copia válida de Producti-Me', undefined, 'neutral'); return }
    if (await ui.confirm({ title: '¿Sumar esta copia a tus datos?', body: 'Se combinan los registros del archivo con los de este dispositivo. No se borra nada de ninguno de los dos.', confirm: 'Combinar' })) {
      combinarCopia(data)
      ui.notify('Copia combinada con tus datos')
    }
  }
  const reemplazar = async (f: File) => {
    let data: Data
    try { data = JSON.parse(await f.text()) as Data } catch { ui.notify('El archivo no es una copia válida de Producti-Me', undefined, 'neutral'); return }
    if (await ui.confirm({ title: '¿Reemplazar todo por esta copia?', body: 'Los datos de este dispositivo se cambian por los del archivo.', confirm: 'Reemplazar', danger: true })) {
      d.replaceAll(data)
      ui.notify('Copia importada')
    }
  }
  const deCero = async () => {
    if (await ui.confirm({ title: '¿Empezar de cero desde hoy?', body: 'Hoy pasa a ser el día 1: el nivel, las medallas y los castigos arrancan de nuevo. Tus registros (comidas, gastos, estudio, diario, entrenamientos) se conservan.', confirm: 'Empezar desde hoy' })) {
      d.set((s) => reiniciarDias(s))
      ui.notify('Hoy es tu día 1')
    }
  }
  const bajar = async (key: string, nombre: string) => {
    const raw = await idbGet<string>(key)
    if (!raw) { ui.notify('No hay esa copia en este dispositivo', undefined, 'neutral'); return }
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([raw], { type: 'application/json' })); a.download = nombre; a.click()
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
            <label className="check-row cap"><input type="checkbox" checked={!!d.settings.coachLeeDiario} onChange={(e) => d.set((s) => ({ settings: { ...s.settings, coachLeeDiario: e.target.checked } }))} />Permitir que el coach lea mis últimas 3 entradas del diario</label>
          </div>
        </Card>
        <Conexion />
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
          <p className="body-2" style={{ marginBottom: 14 }}>Con la sincronización activada, tus dispositivos se mantienen iguales solos. Sin ella, exportá una copia acá y combinala en el otro dispositivo.</p>
          <div className="row" style={{ marginBottom: 14 }}>
            <button className="btn btn-primary" onClick={exportar}><Icon name="download" size={16} />Exportar copia</button>
            <label className="btn btn-quiet"><Icon name="upload" size={16} />Combinar una copia<input type="file" accept="application/json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) importar(f); e.target.value = '' }} /></label>
          </div>
          <Almacenamiento />
          <p className="cap" style={{ marginBottom: 14 }}>Copias automáticas previas a cada actualización: <button className="link-inline" onClick={() => bajar(BACKUP_KEY, 'producti-me-respaldo-v1.json')}>versión 1</button> · <button className="link-inline" onClick={() => bajar(BACKUP_KEY_V2, 'producti-me-respaldo-v2.json')}>antes del día 1</button></p>
          <div className="row danger-zone">
            <button className="btn btn-quiet" onClick={deCero}><Icon name="refresh" size={16} />Empezar de cero desde hoy</button>
            <label className="btn btn-ghost"><Icon name="upload" size={16} />Reemplazar con una copia<input type="file" accept="application/json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) reemplazar(f); e.target.value = '' }} /></label>
            <span className="grow" />
            <button className="btn btn-danger" onClick={reiniciar}><Icon name="trash" size={16} />Borrar todo</button>
          </div>
        </Card>
      </div>
    </div>
  )
}

function Conexion() {
  const d = useStore()
  const ui = useUI()
  const sync = useSync()
  const [busy, setBusy] = useState(false)
  const [codigo, setCodigo] = useState('')
  const st = d.settings
  const set = (p: Partial<typeof st>) => d.set((s) => ({ settings: { ...s.settings, ...p } }))
  const probar = async () => {
    setBusy(true)
    try {
      if (st.syncOn) { await sincronizar(); const e = useSync.getState(); if (e.estado === 'error') throw new Error(e.error) }
      const { syncCorreo } = await import('../lib/correo'); const r = await syncCorreo()
      ui.notify(`Conectado${st.syncOn ? ' · datos sincronizados' : ''} · ${r.nuevos} pagos anotados · ${r.pendientes} para confirmar`)
    } catch (e) { ui.notify(`No se pudo conectar: ${e instanceof Error ? e.message : String(e)}`, undefined, 'neutral') } finally { setBusy(false) }
  }
  const activar = async (on: boolean) => {
    set({ syncOn: on })
    if (on) { await sincronizar(); const e = useSync.getState(); ui.notify(e.estado === 'error' ? `No se pudo sincronizar: ${e.error}` : 'Sincronización activada', undefined, e.estado === 'error' ? 'neutral' : 'ok') }
  }
  const copiar = async () => {
    try { await navigator.clipboard.writeText(codigoVinculo()); ui.notify('Código copiado: pegalo en el otro dispositivo') } catch { setCodigo(codigoVinculo()) }
  }
  const vincular = async () => {
    const v = leerVinculo(codigo)
    if (!v) { ui.notify('Ese código no es válido', undefined, 'neutral'); return }
    set({ correoUrl: v.u, correoToken: v.k, syncOn: true })
    setCodigo('')
    await sincronizar()
    const e = useSync.getState()
    ui.notify(e.estado === 'error' ? `No se pudo sincronizar: ${e.error}` : 'Dispositivo vinculado: tus datos ya están acá', undefined, e.estado === 'error' ? 'neutral' : 'ok')
  }
  const estado = !st.syncOn ? 'Apagada' : sync.estado === 'sincronizando' ? 'Sincronizando…' : sync.estado === 'error' ? `Error: ${sync.error}` : sync.ultima ? `Al día · ${new Date(sync.ultima).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}` : 'Activada'
  return (
    <section className="panel pad" id="sec-correo">
      <h2 className="h2" style={{ marginBottom: 14 }}><Icon name="refresh" size={16} />Conexión con Google</h2>
      <div className="stack">
        <p className="body-2">Un script que corre en tu propia cuenta de Google guarda tus datos en tu Drive (así el iPhone, el iPad y la PC ven lo mismo) y lee los correos de pagos. Instalación de 5 minutos: <a href="https://github.com/constantinodelgiorgio-cloud/Producti-me/blob/claude/personal-productivity-wellness-app-mt7jbv/docs/14-sincronizacion.md" target="_blank" rel="noreferrer">ver la guía</a>.</p>
        {!st.correoUrl && (
          <div className="link-box">
            <div className="eyebrow">¿Ya lo configuraste en otro dispositivo?</div>
            <p className="cap">En ese dispositivo tocá "Copiar código de vínculo" y pegalo acá.</p>
            <div className="row"><input className="grow" aria-label="Código de vínculo" placeholder="PM1-…" value={codigo} onChange={(e) => setCodigo(e.target.value)} /><button className="btn btn-primary" disabled={!codigo.trim()} onClick={vincular}>Vincular</button></div>
          </div>
        )}
        <Field label="URL del script (termina en /exec)" id="c-url"><input id="c-url" inputMode="url" autoComplete="off" value={st.correoUrl ?? ''} placeholder="https://script.google.com/macros/s/…/exec" onChange={(e) => set({ correoUrl: e.target.value.trim() || undefined })} /></Field>
        <Field label="Clave del script" id="c-tok"><input id="c-tok" type="password" autoComplete="off" value={st.correoToken ?? ''} onChange={(e) => set({ correoToken: e.target.value.trim() || undefined })} /></Field>
        <div className={`sync-row ${st.syncOn ? 'on' : ''} ${sync.estado === 'error' && st.syncOn ? 'err' : ''}`}>
          <span className="sync-dot" aria-hidden="true" />
          <span className="grow"><b>Sincronizar mis dispositivos</b><small>{estado}</small></span>
          <button role="switch" aria-checked={!!st.syncOn} aria-label="Sincronizar mis dispositivos" className="switch" disabled={!st.correoUrl} onClick={() => activar(!st.syncOn)}><i /></button>
        </div>
        <label className="check-row cap"><input type="checkbox" checked={st.correoAuto !== false} onChange={(e) => set({ correoAuto: e.target.checked })} />Anotar automáticamente los pagos que se leen con claridad (lo dudoso queda para confirmar)</label>
        <div className="row">
          <button className="btn btn-quiet" disabled={!st.correoUrl || busy} onClick={probar}><Icon name="refresh" size={16} />{busy ? 'Revisando…' : 'Probar y revisar ahora'}</button>
          {st.correoUrl && <button className="btn btn-ghost" onClick={copiar}><Icon name="link" size={16} />Copiar código de vínculo</button>}
        </div>
        {codigo && st.correoUrl && <textarea readOnly rows={3} value={codigo} aria-label="Código de vínculo" onFocus={(e) => e.target.select()} />}
        {d.correo.error && <span className="err">Correo: {d.correo.error}</span>}
        <p className="cap">La clave de la IA no se sincroniza: cargala en cada dispositivo.</p>
      </div>
    </section>
  )
}

function Almacenamiento() {
  const [info, setInfo] = useState<{ usado: number; cuota: number; persistente: boolean } | null>(null)
  const sync = useSync()
  useEffect(() => {
    (async () => {
      try {
        const e = await navigator.storage?.estimate?.()
        const p = await navigator.storage?.persisted?.()
        if (e) setInfo({ usado: e.usage ?? 0, cuota: e.quota ?? 0, persistente: !!p })
      } catch { /* sin soporte */ }
    })()
  }, [])
  const mb = (b: number) => `${(b / 1048576).toFixed(1).replace('.', ',')} MB`
  return (
    <div className="almac">
      <span><Icon name="layers" size={14} />{info ? `${mb(info.usado)} usados` : 'Calculando espacio…'}{info?.persistente ? ' · protegido contra borrado automático' : info ? ' · sin protección: instalá la app en la pantalla de inicio' : ''}</span>
      <span><Icon name="refresh" size={14} />{sync.ultima ? `Última sincronización ${new Date(sync.ultima).toLocaleString('es-AR', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}` : 'Sin sincronizar en esta sesión'}</span>
    </div>
  )
}
