/**
 * Producti-me · Conexión con Google (sincronización entre dispositivos + correo de pagos)
 *
 * Corre en TU cuenta de Google (Apps Script). Hace dos cosas, solo para quien tenga la URL y la clave:
 *   1. Guarda una copia de los datos de la app en un archivo de tu Google Drive
 *      ("producti-me-datos.json"), para que el iPhone, el iPad y la PC vean lo mismo.
 *   2. Expone los correos de Mercado Pago, Santander y Visa de los últimos 30 días
 *      para que la app anote los pagos.
 * Nada pasa por servidores de terceros.
 *
 * Instalación: docs/14-sincronizacion.md (y docs/12-correo-de-pagos.md para el correo).
 */

// 1) Cambiá esta clave por un texto largo y difícil de adivinar (y pegá el mismo en Producti-me → Ajustes).
const CLAVE = 'CAMBIAR-por-una-clave-larga-y-secreta';

// 2) Remitentes y palabras que se buscan. Ajustalo si tu banco usa otra dirección.
const BUSQUEDA = '(from:mercadopago.com OR from:santander.com.ar OR from:visa.com.ar OR from:prismamediosdepago.com '
  + 'OR subject:(pagaste OR compraste OR consumo OR transferencia OR "recibiste dinero" OR "pago aprobado")) newer_than:30d';

const ARCHIVO = 'producti-me-datos.json';

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.token !== CLAVE) return json({ error: 'unauthorized' });
  if (p.accion === 'rev') return json(cabecera());
  if (p.accion === 'leer') return json(leer());
  return json({ mensajes: correos(Number(p.desde || 0)) });
}

function doPost(e) {
  let b;
  try { b = JSON.parse(e.postData.contents); } catch (x) { return json({ error: 'bad_request' }); }
  if (b.token !== CLAVE) return json({ error: 'unauthorized' });
  if (b.accion !== 'guardar') return json({ error: 'accion' });
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const props = PropertiesService.getScriptProperties();
    const rev = Number(props.getProperty('rev') || 0);
    // Si otro dispositivo guardó en el medio, la app vuelve a combinar y reintenta.
    if (Number(b.rev) !== rev) return json({ error: 'conflict', rev: rev });
    const nueva = rev + 1;
    const modificado = new Date().toISOString();
    archivo().setContent(JSON.stringify({ rev: nueva, modificado: modificado, dispositivo: b.dispositivo || '', data: b.data }));
    props.setProperties({ rev: String(nueva), modificado: modificado, dispositivo: b.dispositivo || '' });
    return json({ ok: true, rev: nueva });
  } finally {
    lock.releaseLock();
  }
}

function cabecera() {
  const p = PropertiesService.getScriptProperties().getProperties();
  return { rev: Number(p.rev || 0), modificado: p.modificado || null, dispositivo: p.dispositivo || null };
}

function leer() {
  if (!cabecera().rev) return { rev: 0 };
  return JSON.parse(archivo().getBlob().getDataAsString());
}

function archivo() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('archivo');
  if (id) { try { return DriveApp.getFileById(id); } catch (x) { /* se borró: se crea otro */ } }
  const f = DriveApp.createFile(ARCHIVO, '{}', MimeType.PLAIN_TEXT);
  props.setProperty('archivo', f.getId());
  return f;
}

function correos(desde) {
  const hilos = GmailApp.search(BUSQUEDA, 0, 60);
  const mensajes = [];
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

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// Para probar desde el editor: ejecutá esta función, aceptá los permisos y mirá el registro.
function probar() {
  Logger.log(JSON.stringify(cabecera()));
  Logger.log(JSON.stringify(correos(0).slice(0, 3), null, 2));
}
