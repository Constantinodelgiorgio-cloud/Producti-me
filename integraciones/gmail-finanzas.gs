/**
 * Producti-me · Correo de pagos
 *
 * Corre en TU cuenta de Google (Apps Script) y expone, a quien tenga la URL y la clave,
 * los correos de Mercado Pago, Santander y Visa de los últimos 30 días.
 * La app los lee al abrirse y anota los pagos. Nada pasa por servidores de terceros.
 *
 * Instalación: docs/12-correo-de-pagos.md
 */

// 1) Cambiá esta clave por un texto largo y difícil de adivinar (y pegá el mismo en Producti-me → Ajustes).
const CLAVE = 'CAMBIAR-por-una-clave-larga-y-secreta';

// 2) Remitentes y palabras que se buscan. Ajustalo si tu banco usa otra dirección.
const BUSQUEDA = '(from:mercadopago.com OR from:santander.com.ar OR from:visa.com.ar OR from:prismamediosdepago.com '
  + 'OR subject:(pagaste OR compraste OR consumo OR transferencia OR "recibiste dinero" OR "pago aprobado")) newer_than:30d';

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.token !== CLAVE) return json({ error: 'unauthorized' });
  const desde = Number(p.desde || 0);
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
  return json({ mensajes: mensajes });
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// Para probar desde el editor: ejecutá esta función y mirá el registro.
function probar() {
  Logger.log(JSON.stringify(JSON.parse(doGet({ parameter: { token: CLAVE } }).getContent()).mensajes.slice(0, 3), null, 2));
}
