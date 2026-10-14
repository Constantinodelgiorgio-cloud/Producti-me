// Producti-me · Widget para iPhone (app Scriptable, gratis en el App Store)
//
// Muestra tu día en la pantalla de inicio o en la pantalla bloqueada: hábitos hechos,
// lo que toca ahora, pasos (desde Salud), proteína y el castigo más urgente.
// Lee el resumen que publica la app a través de TU script de Google.
//
// Instalación: docs/15-salud-widget-y-app-nativa.md

// 1) Pegá acá la misma URL y clave que cargaste en Producti-me → Ajustes → Conexión con Google.
const URL_SCRIPT = 'https://script.google.com/macros/s/PEGAR-ACA/exec'
const CLAVE = 'PEGAR-LA-CLAVE'
// 2) Dirección de la app (al tocar el widget se abre).
const APP = 'https://constantinodelgiorgio-cloud.github.io/Producti-me/'

const C = {
  bg1: new Color('#0C0E13'), bg2: new Color('#060708'), t1: new Color('#F5F6F8'), t2: new Color('#A0A6B2'), t3: new Color('#7C828E'),
  line: new Color('#2A2E36'), tone: new Color('#8EA8FF'), tone2: new Color('#C3D0FF'), ok: new Color('#5FBF92'), warn: new Color('#E0A852'),
}

const pad = (n) => String(n).padStart(2, '0')
const hhmm = (min) => `${pad(Math.floor(((min % 1440) + 1440) % 1440 / 60))}:${pad(min % 60)}`
const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes() }
const miles = (n) => Math.round(n).toLocaleString('es-AR')
const restante = (iso) => {
  const ms = new Date(iso).getTime() - Date.now()
  if (ms <= 0) return 'vencido'
  const h = Math.floor(ms / 3600e3)
  return h >= 1 ? `${h} h ${pad(Math.floor((ms % 3600e3) / 60e3))}` : `${Math.floor(ms / 60e3)} min`
}

async function datos() {
  try {
    const r = new Request(`${URL_SCRIPT}?token=${encodeURIComponent(CLAVE)}&accion=widget`)
    r.timeoutInterval = 15
    const j = await r.loadJSON()
    if (j.error) throw new Error(j.error)
    Keychain.set('producti-me-widget', JSON.stringify(j))
    return j
  } catch (e) {
    // Sin conexión: se muestra lo último que se descargó.
    return Keychain.contains('producti-me-widget') ? JSON.parse(Keychain.get('producti-me-widget')) : null
  }
}

/** Línea de horizonte con el "sol" en el punto de avance del día (la misma idea del logo). */
function horizonte(p, w = 280, h = 14) {
  const dc = new DrawContext()
  dc.size = new Size(w, h)
  dc.opaque = false
  dc.respectScreenScale = true
  const y = h / 2 - 1.5
  dc.setFillColor(C.line)
  dc.fillRect(new Rect(0, y, w, 3))
  const x = Math.max(4, Math.min(w - 4, w * p))
  dc.setFillColor(C.tone)
  dc.fillRect(new Rect(0, y, x, 3))
  dc.setFillColor(new Color('#8EA8FF', 0.25))
  dc.fillEllipse(new Rect(x - 7, h / 2 - 7, 14, 14))
  dc.setFillColor(new Color('#F4F6FF'))
  dc.fillEllipse(new Rect(x - 3.5, h / 2 - 3.5, 7, 7))
  return dc.getImage()
}

/** Anillo para la pantalla bloqueada. */
function anillo(p, s = 60) {
  const dc = new DrawContext()
  dc.size = new Size(s, s)
  dc.opaque = false
  dc.respectScreenScale = true
  const r = s / 2 - 4
  const paso = (a) => new Point(s / 2 + r * Math.sin(a), s / 2 - r * Math.cos(a))
  dc.setStrokeColor(new Color('#ffffff', 0.25)); dc.setLineWidth(5)
  dc.strokeEllipse(new Rect(4, 4, s - 8, s - 8))
  const path = new Path()
  const n = Math.max(1, Math.round(60 * p))
  path.move(paso(0))
  for (let i = 1; i <= n; i++) path.addLine(paso((i / 60) * 2 * Math.PI))
  dc.addPath(path); dc.setStrokeColor(Color.white()); dc.setLineWidth(5); dc.strokePath()
  return dc.getImage()
}

function texto(stack, t, size, color, weight = 'regular', mono = false) {
  const x = stack.addText(t)
  x.font = mono ? Font.regularMonospacedSystemFont(size) : weight === 'bold' ? Font.boldSystemFont(size) : weight === 'semibold' ? Font.semiboldSystemFont(size) : Font.systemFont(size)
  x.textColor = color
  x.lineLimit = 1
  x.minimumScaleFactor = 0.7
  return x
}

function ahoraDe(agenda) {
  const n = nowMin()
  const cur = agenda.find((a) => a.ini <= n && a.fin > n)
  if (cur) return { etiqueta: `AHORA · hasta ${hhmm(cur.fin)}`, que: cur.que }
  const next = agenda.find((a) => a.ini > n)
  if (next) return { etiqueta: `A LAS ${hhmm(next.ini)}`, que: next.que }
  return { etiqueta: 'RESTO DEL DÍA', que: 'Cerrar el día' }
}

async function crear() {
  const j = await datos()
  const fam = config.widgetFamily || 'medium'
  const w = new ListWidget()
  w.url = APP
  w.refreshAfterDate = new Date(Date.now() + 15 * 60e3)

  if (!j || !j.resumen || !j.resumen.fecha) {
    w.backgroundColor = C.bg2
    texto(w, 'Producti-me', 13, C.t1, 'semibold')
    texto(w, 'Abrí la app con la conexión activada.', 11, C.t2)
    return w
  }
  const r = j.resumen
  const hoy = r.fecha === j.hoy
  const hab = hoy ? r.habitos : { hechos: 0, total: r.habitos.total }
  const p = hab.total ? hab.hechos / hab.total : 0
  const pasos = j.salud && j.salud.pasos !== undefined ? j.salud.pasos : hoy ? r.pasos : undefined

  // ---- Pantalla bloqueada ----
  if (fam === 'accessoryCircular') {
    const st = w.addStack(); st.layoutVertically(); st.centerAlignContent()
    st.addImage(anillo(p)).imageSize = new Size(44, 44)
    texto(w, `${hab.hechos}/${hab.total}`, 11, Color.white(), 'semibold').centerAlignText()
    return w
  }
  if (fam === 'accessoryRectangular') {
    texto(w, `${hab.hechos}/${hab.total} hábitos${pasos !== undefined ? ` · ${miles(pasos)} pasos` : ''}`, 13, Color.white(), 'semibold')
    const a = ahoraDe(r.agenda || [])
    texto(w, a.que, 12, new Color('#ffffff', 0.85))
    if (r.castigo) texto(w, `Castigo: ${restante(r.castigo.vence)}`, 11, new Color('#ffffff', 0.7))
    return w
  }
  if (fam === 'accessoryInline') {
    texto(w, `${hab.hechos}/${hab.total} · ${ahoraDe(r.agenda || []).que}`, 12, Color.white())
    return w
  }

  // ---- Pantalla de inicio ----
  const g = new LinearGradient()
  g.colors = [C.bg1, C.bg2]
  g.locations = [0, 1]
  w.backgroundGradient = g
  w.setPadding(14, 16, 14, 16)

  const top = w.addStack(); top.centerAlignContent()
  texto(top, 'HOY', 10, C.tone2, 'regular', true)
  top.addSpacer()
  if (r.castigo) texto(top, `CASTIGO ${restante(r.castigo.vence)}`, 10, C.warn, 'regular', true)
  else if (r.sancionHasta && new Date(r.sancionHasta) > new Date()) texto(top, 'SIN XP', 10, C.warn, 'regular', true)
  else texto(top, `NIVEL ${r.nivel}`, 10, C.t3, 'regular', true)
  w.addSpacer(6)

  const fila = w.addStack(); fila.layoutHorizontally()
  const izq = fila.addStack(); izq.layoutVertically()
  const num = izq.addStack(); num.bottomAlignContent()
  texto(num, String(hab.hechos), 34, C.t1, 'bold')
  texto(num, ` / ${hab.total}`, 14, C.t3)
  texto(izq, 'hábitos', 11, C.t2)

  if (fam !== 'small') {
    fila.addSpacer(18)
    const der = fila.addStack(); der.layoutVertically()
    const a = ahoraDe(r.agenda || [])
    texto(der, a.etiqueta, 9, C.tone2, 'regular', true)
    const q = der.addText(a.que); q.font = Font.semiboldSystemFont(14); q.textColor = C.t1; q.lineLimit = 2; q.minimumScaleFactor = 0.8
    der.addSpacer(4)
    if (r.prioridad) texto(der, `${r.prioridadHecha ? 'Hecha · ' : 'Prioridad · '}${r.prioridad}`, 11, r.prioridadHecha ? C.ok : C.t2)
    else texto(der, `Proteína ${r.proteina.g} / ${r.proteina.meta} g`, 11, C.t2)
  }
  w.addSpacer()
  w.addImage(horizonte(p, fam === 'small' ? 130 : 290)).imageSize = new Size(fam === 'small' ? 130 : 290, 14)
  w.addSpacer(6)
  const pie = w.addStack(); pie.centerAlignContent()
  texto(pie, pasos !== undefined ? `${miles(pasos)} pasos` : 'pasos —', 11, pasos !== undefined && pasos >= r.pasosMeta ? C.ok : C.t2)
  pie.addSpacer()
  if (fam !== 'small') texto(pie, `${r.kcal.v} kcal · ${r.proteina.g} g P`, 11, C.t3)
  else texto(pie, `${r.proteina.g} g P`, 11, C.t3)

  if (fam === 'large') {
    w.addSpacer(12)
    texto(w, 'AGENDA', 9, C.tone2, 'regular', true)
    w.addSpacer(4)
    const n = nowMin()
    for (const a of (r.agenda || []).filter((x) => x.fin > n).slice(0, 5)) {
      const s = w.addStack()
      texto(s, hhmm(a.ini), 11, C.t3, 'regular', true)
      s.addSpacer(10)
      texto(s, a.que, 12, a.ini <= n ? C.t1 : C.t2)
      w.addSpacer(3)
    }
  }
  return w
}

const widget = await crear()
if (config.runsInWidget) Script.setWidget(widget)
else await widget.presentMedium()
Script.complete()
