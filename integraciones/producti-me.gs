/**
 * Producti-me · Conexión con Google (sincronización entre dispositivos + correo de pagos)
 *
 * Corre en TU cuenta de Google (Apps Script). Solo responde a quien tenga la URL y la clave:
 *   1. Guarda una copia de los datos de la app en un archivo de tu Google Drive
 *      ("producti-me-datos.json"), para que el iPhone, el iPad y la PC vean lo mismo.
 *   2. Expone los correos de Mercado Pago, Santander y Visa de los últimos 30 días
 *      para que la app anote los pagos.
 *   3. Recibe pasos, sueño y pulsaciones que manda Atajos de iOS desde la app Salud.
 *   4. Sirve un resumen del día para el widget de la pantalla de inicio (Scriptable).
 *   5. Sirve un calendario (.ics) con avisos para suscribirlo en el iPhone: avisa aunque la app esté cerrada.
 * Nada pasa por servidores de terceros.
 *
 * Instalación: docs/14-sincronizacion.md · correo: docs/12 · Salud y widget: docs/15.
 */

// =====================================================================================
// 1) CAMBIÁ LA CLAVE ACÁ ABAJO: reemplazá solo el texto entre las comillas simples.
//    Usá letras y números, sin espacios ni comillas (ej. 'Constantino-Rugby-2026-xK9p').
//    Pegá exactamente la misma clave en Producti-me → Ajustes → Conexión con Google.
//    Después de cambiarla: Implementar → Gestionar implementaciones → lápiz → Versión: Nueva → Implementar.
// =====================================================================================
var CLAVE = 'CAMBIAR-por-una-clave-larga-y-secreta';
var CLAVE_EJEMPLO = 'CAMBIAR-por-una-clave-larga-y-secreta';

// 2) Remitentes y palabras que se buscan. Ajustalo si tu banco usa otra dirección.
var BUSQUEDA = '(from:mercadopago.com OR from:santander.com.ar OR from:visa.com.ar OR from:prismamediosdepago.com '
  + 'OR subject:(pagaste OR compraste OR consumo OR transferencia OR "recibiste dinero" OR "pago aprobado")) newer_than:30d';

var ARCHIVO = 'producti-me-datos.json';

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (CLAVE === CLAVE_EJEMPLO) return json({ error: 'clave_sin_cambiar' });
  if (p.token !== CLAVE) return json({ error: 'unauthorized' });
  if (p.accion === 'rev') return json(cabecera());
  if (p.accion === 'leer') return json(leer());
  if (p.accion === 'salud') return json({ salud: saludDesde(p.desde || '') });
  if (p.accion === 'anotar') return json(anotarSalud(p));
  if (p.accion === 'widget') return json(widget());
  if (p.accion === 'ics') return ics();
  return json({ mensajes: correos(Number(p.desde || 0)) });
}

function doPost(e) {
  var b;
  try { b = JSON.parse(e.postData.contents); } catch (x) { return json({ error: 'bad_request' }); }
  if (CLAVE === CLAVE_EJEMPLO) return json({ error: 'clave_sin_cambiar' });
  if (b.token !== CLAVE) return json({ error: 'unauthorized' });
  if (b.accion === 'anotar') return json(anotarSalud(b));
  if (b.accion === 'resumen') {
    PropertiesService.getScriptProperties().setProperty('resumen', JSON.stringify(b.resumen || {}));
    return json({ ok: true });
  }
  if (b.accion !== 'guardar') return json({ error: 'accion' });
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var props = PropertiesService.getScriptProperties();
    var rev = Number(props.getProperty('rev') || 0);
    // Si otro dispositivo guardó en el medio, la app vuelve a combinar y reintenta.
    if (Number(b.rev) !== rev) return json({ error: 'conflict', rev: rev });
    var nueva = rev + 1;
    var modificado = new Date().toISOString();
    archivo().setContent(JSON.stringify({ rev: nueva, modificado: modificado, dispositivo: b.dispositivo || '', data: b.data }));
    props.setProperties({ rev: String(nueva), modificado: modificado, dispositivo: b.dispositivo || '' });
    return json({ ok: true, rev: nueva });
  } finally {
    lock.releaseLock();
  }
}

function cabecera() {
  var p = PropertiesService.getScriptProperties().getProperties();
  return { rev: Number(p.rev || 0), modificado: p.modificado || null, dispositivo: p.dispositivo || null };
}

function leer() {
  if (!cabecera().rev) return { rev: 0 };
  return JSON.parse(archivo().getBlob().getDataAsString());
}

function archivo() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('archivo');
  if (id) { try { return DriveApp.getFileById(id); } catch (x) { /* se borró: se crea otro */ } }
  var f = DriveApp.createFile(ARCHIVO, '{}', MimeType.PLAIN_TEXT);
  props.setProperty('archivo', f.getId());
  return f;
}

function correos(desde) {
  var hilos = GmailApp.search(BUSQUEDA, 0, 60);
  var mensajes = [];
  hilos.forEach(function (h) {
    h.getMessages().forEach(function (m) {
      if (m.getDate().getTime() <= desde) return;
      mensajes.push({
        id: m.getId(),
        fecha: m.getDate().toISOString(),
        de: m.getFrom(),
        asunto: m.getSubject(),
        texto: m.getPlainBody().replace(/\s+\n/g, '\n').slice(0, 2000),
      });
    });
  });
  return mensajes;
}

// ---------- Salud (desde Atajos de iOS) ----------
// Acepta "8.234", "8234", "7,5" o "7.5" (Atajos escribe los números con el formato del teléfono).
function numero(v) {
  if (v === undefined || v === null || v === '') return undefined;
  var t = String(v).trim().replace(/\s/g, '');
  if (t.indexOf(',') >= 0) t = t.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '');
  var n = Number(t);
  return isFinite(n) ? n : undefined;
}

function leerSalud() {
  return JSON.parse(PropertiesService.getScriptProperties().getProperty('salud') || '{}');
}

function anotarSalud(p) {
  var fecha = /^\d{4}-\d{2}-\d{2}$/.test(p.fecha || '') ? p.fecha : Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var campos = { pasos: numero(p.pasos), sueno: numero(p.sueno), fcReposo: numero(p.fc), kcalActivas: numero(p.kcal), distanciaKm: numero(p.km) };
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var salud = leerSalud();
    var dia = salud[fecha] || {};
    Object.keys(campos).forEach(function (k) { if (campos[k] !== undefined) dia[k] = Math.round(campos[k] * 100) / 100; });
    dia.actualizado = new Date().toISOString();
    salud[fecha] = dia;
    // Se guardan los últimos 100 días (límite de tamaño de las propiedades del script).
    Object.keys(salud).sort().slice(0, -100).forEach(function (f) { delete salud[f]; });
    PropertiesService.getScriptProperties().setProperty('salud', JSON.stringify(salud));
    return { ok: true, fecha: fecha, dia: dia };
  } finally {
    lock.releaseLock();
  }
}

function saludDesde(desde) {
  var salud = leerSalud();
  var out = {};
  Object.keys(salud).forEach(function (f) { if (f >= desde) out[f] = salud[f]; });
  return out;
}

// ---------- Widget ----------
function widget() {
  var r = JSON.parse(PropertiesService.getScriptProperties().getProperty('resumen') || '{}');
  var hoy = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return { resumen: r, salud: leerSalud()[hoy] || {}, hoy: hoy };
}

// ---------- Calendario de avisos (suscripción desde el iPhone) ----------
function ics() {
  var r = JSON.parse(PropertiesService.getScriptProperties().getProperty('resumen') || '{}');
  var avisos = r.avisos || [];
  var tz = 'America/Argentina/Buenos_Aires';
  var esc = function (t) { return String(t || '').replace(/\\/g, '\\\\').replace(/[,;]/g, function (c) { return '\\' + c; }).replace(/\n/g, '\\n'); };
  var ahora = Utilities.formatDate(new Date(), 'UTC', "yyyyMMdd'T'HHmmss'Z'");
  var L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Producti-me//ES', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'X-WR-CALNAME:Producti-me', 'X-WR-TIMEZONE:' + tz, 'REFRESH-INTERVAL;VALUE=DURATION:PT1H', 'X-PUBLISHED-TTL:PT1H',
    'BEGIN:VTIMEZONE', 'TZID:' + tz, 'BEGIN:STANDARD', 'DTSTART:19700101T000000', 'TZOFFSETFROM:-0300', 'TZOFFSETTO:-0300', 'TZNAME:-03', 'END:STANDARD', 'END:VTIMEZONE'];
  avisos.forEach(function (a) {
    var ini = String(a.inicio).replace(/[-:]/g, '') + '00';
    L.push('BEGIN:VEVENT', 'UID:' + a.id + '@producti-me', 'DTSTAMP:' + ahora, 'DTSTART;TZID=' + tz + ':' + ini,
      'DURATION:PT' + (a.minutos || 5) + 'M', 'SUMMARY:' + esc(a.titulo), 'DESCRIPTION:' + esc(a.nota || ''),
      'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + esc(a.titulo), 'TRIGGER:-PT' + (a.alarma || 0) + 'M', 'END:VALARM', 'END:VEVENT');
  });
  L.push('END:VCALENDAR');
  return ContentService.createTextOutput(L.join('\r\n')).setMimeType(ContentService.MimeType.ICAL);
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// Para probar desde el editor: elegí "probar" en el menú de funciones (arriba), tocá Ejecutar,
// aceptá los permisos y mirá el registro. No ejecutes doGet ni doPost desde el editor: los llama la app.
function probar() {
  Logger.log(CLAVE === CLAVE_EJEMPLO ? 'FALTA: cambiá la CLAVE (línea de arriba de todo).' : 'Clave cambiada: OK (' + CLAVE.length + ' caracteres).');
  try { Logger.log('Drive: OK · datos guardados (rev ' + cabecera().rev + ') en ' + archivo().getName()); } catch (x) { Logger.log('Drive: ERROR · ' + x); }
  try { Logger.log('Gmail: OK · ' + correos(0).length + ' correos de pagos en 30 días'); } catch (x) { Logger.log('Gmail: ERROR · ' + x); }
  Logger.log('Si todo dice OK: Implementar → Nueva implementación (o Gestionar → Versión nueva) → Aplicación web, ejecutar como "Yo", acceso "Cualquier usuario".');
}
