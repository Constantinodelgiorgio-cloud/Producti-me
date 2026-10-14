# 14 · Conexión con Google: iPhone + iPad sincronizados y correo de pagos

**Problema que resuelve:** Producti-me guardaba los datos solo en cada dispositivo. Lo que cargabas en el iPad no aparecía en el iPhone.

**Solución:** un script de Google que corre en **tu** cuenta guarda una copia de tus datos en tu Google Drive (`producti-me-datos.json`). Cada dispositivo trae lo nuevo y sube lo suyo. El mismo script lee los correos de pagos (ver [doc 12](12-correo-de-pagos.md)). Nada pasa por servidores de terceros.

## Instalación (5 minutos, una sola vez, desde la computadora)

1. Entrá a [script.google.com](https://script.google.com) con tu Gmail → **Nuevo proyecto**. Ponele de nombre *Producti-me*.
2. Borrá lo que haya y pegá todo el contenido de [`integraciones/producti-me.gs`](../integraciones/producti-me.gs).
3. En la línea `const CLAVE = '…'` poné un texto largo y secreto (30 letras y números al azar). Guardá (⌘S).
4. Arriba elegí la función **probar** → **Ejecutar**. Google pide permisos (Gmail para leer los pagos y Drive para guardar el archivo) → **Revisar permisos** → tu cuenta → *Configuración avanzada* → *Ir a Producti-me* → **Permitir**.
5. **Implementar → Nueva implementación** → ícono de engranaje → **Aplicación web**:
   - *Ejecutar como*: **Yo**
   - *Quién tiene acceso*: **Cualquier usuario** (la clave es la que protege; sin ella responde `unauthorized`)
6. **Implementar** y copiá la URL que termina en `/exec`.

## Conectar los dispositivos

**En el iPad (donde están tus datos):**
1. Producti-me → Áreas → **Ajustes → Conexión con Google**.
2. Pegá la URL y la clave → activá **Sincronizar mis dispositivos**. Tus datos suben a tu Drive.
3. Tocá **Copiar código de vínculo** y mandátelo (por ejemplo, por WhatsApp a vos mismo o con AirDrop).

**En el iPhone:**
1. Ajustes → Conexión con Google → pegá el código en **¿Ya lo configuraste en otro dispositivo?** → **Vincular**.
2. Listo: los datos del iPad aparecen en el iPhone y lo que tenías en el iPhone se suma (no se borra nada).

Desde ahí se sincroniza solo: al abrir la app, al volver a ella, unos segundos después de cada cambio y cada minuto mientras está abierta.

## Cómo se combinan los cambios

- Lo que cargás en un dispositivo se suma a lo del otro.
- Lo que borrás en uno se borra en el otro.
- Si cambiaste lo mismo en los dos antes de sincronizar, gana el dispositivo que sincroniza en ese momento.
- La clave de la IA (Anthropic) **no** se sincroniza: cargala en cada dispositivo.

## Si ya tenías instalado el script del correo (versión anterior)

Reemplazá el código por el de `integraciones/producti-me.gs` (conservá tu `CLAVE`) y hacé **Implementar → Gestionar implementaciones → editar (lápiz) → Versión: nueva versión → Implementar**. La URL no cambia.

## Sin script (alternativa manual)

Ajustes → Tus datos → **Exportar copia** en un dispositivo y **Combinar una copia** en el otro. No borra nada de ninguno de los dos.

## Importante sobre el ícono nuevo

iOS no actualiza el ícono de una app ya agregada a la pantalla de inicio. Para ver el logo nuevo hay que quitarla y volver a agregarla, **pero eso borra los datos de ese dispositivo**. Hacelo solo **después** de activar la sincronización (y comprobar que el otro dispositivo tiene todo): al volver a abrirla, vinculás con el código y los datos vuelven.

## Límites

- Sin conexión, la app funciona igual y sincroniza cuando vuelve internet.
- Quien tenga la URL **y** la clave puede leer tus datos y tus correos de pagos. No las compartas. Para revocar: Apps Script → Implementar → Gestionar implementaciones → Archivar.
- Las fotos de progreso viajan dentro del archivo: si cargás muchas, la sincronización tarda más.
