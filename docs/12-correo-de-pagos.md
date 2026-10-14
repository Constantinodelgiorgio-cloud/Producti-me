# 12 · Correo de pagos (Gmail → Producti-me)

Objetivo: que un pago con Mercado Pago, una transferencia o un consumo con Visa **se anote solo**. Llega el correo, abrís la app y ya está.

## Cómo funciona

```
Gmail ──► Script de Google (en TU cuenta) ──► Producti-me (al abrirse y cada 10 min)
              lee los correos de pagos            1. patrones locales: monto, comercio, cuenta
              de los últimos 30 días              2. lo dudoso lo lee la IA (si tenés clave)
                                                  3. claro → se anota · dudoso → "Por confirmar"
```

- El script corre en tu cuenta de Google, no en un servidor de terceros. Solo devuelve correos a quien tenga **la URL y la clave**.
- La app guarda qué correos ya vio: un mismo pago nunca se anota dos veces.
- Cada movimiento queda con su origen (ícono de sobre) y se puede borrar con Deshacer.

## Instalación (5 minutos, una sola vez)

1. Entrá a [script.google.com](https://script.google.com) con tu Gmail → **Nuevo proyecto**.
2. Borrá lo que haya y pegá el contenido de [`integraciones/producti-me.gs`](../integraciones/producti-me.gs) (el mismo script sirve para sincronizar tus dispositivos: ver [doc 14](14-sincronizacion.md)).
3. Cambiá `CLAVE` por un texto largo (por ejemplo, 30 letras y números al azar). Guardá.
4. Ejecutá la función **probar** (menú de arriba) → Google pide permiso para leer tu Gmail → **Permitir**. En el registro tienen que aparecer tus últimos pagos.
5. **Implementar → Nueva implementación → Aplicación web**:
   - *Ejecutar como*: **Yo**.
   - *Quién tiene acceso*: **Cualquier usuario** (la clave es lo que protege; sin ella el script responde `unauthorized`).
6. Copiá la URL que termina en `/exec`.
7. En Producti-me → **Ajustes → Conexión con Google**: pegá la URL y la clave → **Probar y revisar ahora**. Con el mismo script podés sincronizar tus dispositivos ([doc 14](14-sincronizacion.md)).

## Qué se anota solo y qué queda para confirmar

| Caso | Resultado |
|---|---|
| "Pagaste $ 8.500 a Carrefour" (monto + comercio claros) | Se anota solo, con cuenta y categoría deducidas |
| Monto claro pero sin comercio | Queda en **Por confirmar** |
| Formato que los patrones no entienden | Lo lee la IA (si hay clave) y queda en **Por confirmar** |
| Publicidad, resúmenes, códigos de seguridad | Se ignora |

Si preferís revisar todo antes, desactivá "Anotar automáticamente" en Ajustes.

## Límites y riesgos (honestos)

- **No es instantáneo con la app cerrada**: una app web no puede despertarse sola en el iPhone. Los pagos aparecen cuando abrís la app (o cada 10 minutos si está abierta). Para notificaciones push haría falta un servidor (fase 2).
- **Quien tenga la URL y la clave puede leer esos correos de pagos.** No compartas ninguna de las dos. Para revocar: en Apps Script → Implementar → Gestionar implementaciones → Archivar.
- Los formatos de Mercado Pago y del banco cambian. Si algo deja de anotarse, va a aparecer en "Por confirmar" o no aparecer: avisame y se ajustan los patrones (`app/src/lib/correo.ts`).
- Si un correo dudoso se manda a la IA, sale de tu dispositivo hacia la API de Anthropic con tu clave (como el resto del coach).

## Sobre MCP

MCP es la forma en que un asistente (Claude) se conecta con herramientas. Producti-me es una app web sin servidor, así que no puede *recibir* datos por MCP. El script de Google cumple ese rol hoy sin infraestructura extra. Cuando exista la sincronización en la nube (fase 2), Producti-me puede exponerse como servidor MCP para que Claude, con su conector de Gmail, registre gastos directamente.
