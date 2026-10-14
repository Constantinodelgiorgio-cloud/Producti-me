# 15 · Datos automáticos, widget y camino a la app nativa

Objetivo: que Producti-me **tome datos sola** (pasos, sueño, pulsaciones), que tenga **widget** en el iPhone y que se pueda usar **sin mirar la pantalla**.

## El límite real de una app web en iPhone

Producti-me hoy es una app web instalada (PWA). En iPhone, Apple no le permite a una PWA:

| Capacidad | PWA en iPhone | App nativa |
|---|---|---|
| Leer la app Salud (pasos, sueño, pulsaciones) | No | Sí, en segundo plano |
| Widget propio en inicio / pantalla bloqueada | No | Sí |
| Vibrar con patrones | No (solo un toque suave en iOS 18+) | Sí (Core Haptics) |
| Sonar con la pantalla bloqueada | Sí, si el audio arrancó con un toque | Sí |
| Notificaciones push | Sí (iOS 16.4+, con servidor) | Sí |

Por eso hay dos capas: **lo que se puede hoy sin app nativa** (abajo, ya implementado) y **la app nativa** (al final, propuesta).

---

## 1. Respirar y estirar sin mirar el teléfono (ya en la app)

En **Cuerpo**, antes de empezar elegís la guía: **Sonido**, **Vibración** y, en estiramientos, **Voz**. Con **Probar** escuchás/sentís el ejemplo.

| Fase | Sonido | Vibración |
|---|---|---|
| Inhalar | cling agudo | 1 vibración corta |
| Sostener | dos clings suaves | 2 vibraciones |
| Exhalar | cling grave | 1 vibración larga |
| Fin | tres clings ascendentes | patrón largo |

- **Respiración con sonido:** el audio de toda la sesión se genera antes de empezar, así **sigue sonando con la pantalla bloqueada** o el teléfono boca abajo. Se puede pausar desde la pantalla bloqueada.
- **Estiramientos con voz:** anuncia cada ejercicio ("Isquiotibiales, izquierda. 40 segundos"), suena 3 s antes del cambio y al cambiar. La pantalla queda encendida durante la rutina.
- **Vibración en iPhone:** Safari no permite vibrar a las apps web. En iOS 18 o posterior se usa el "toque" del sistema (suave, y Apple puede cambiarlo). En Android vibra de verdad. **Para no mirar en iPhone, usá el sonido** (con auriculares, nadie más lo escucha).

---

## 2. Pasos, sueño y pulsaciones automáticos (Atajos de iOS)

La app Atajos (Shortcuts) **sí** puede leer Salud. Un atajo manda los datos a tu script de Google y Producti-me los toma solo al abrirse.

**Requisito:** tener el script de Google instalado y actualizado ([doc 14](14-sincronizacion.md)). Si ya lo tenías, reemplazá el código por la versión nueva de `integraciones/producti-me.gs` y hacé *Implementar → Gestionar implementaciones → editar → Nueva versión*.

### Crear el atajo (una vez, 10 minutos)

Abrí **Atajos → +** y agregá estas acciones en orden:

1. **Buscar muestras de salud** → *Tipo*: **Pasos** · *Fecha de inicio*: **es hoy** · *Agrupar por*: **Día**.
2. **Calcular estadísticas** → **Suma** de las *Muestras de salud*. Tocá el resultado → *Cambiar nombre*: `Pasos`.
3. *(Opcional)* **Buscar muestras de salud** → *Tipo*: **Energía activa** · *es hoy* → **Calcular estadísticas → Suma** → nombre `Energía`.
4. *(Opcional)* **Buscar muestras de salud** → *Tipo*: **Frecuencia cardíaca en reposo** · *Ordenar por*: fecha de inicio, *más reciente primero* · *Límite*: 1 → nombre `FC`.
5. *(Opcional, si medís el sueño con el iPhone o el Apple Watch)* **Buscar muestras de salud** → *Tipo*: **Análisis del sueño** · *Fecha de inicio*: **en las últimas 18 horas** · *Valor*: **Dormido** → **Obtener detalles de las muestras de salud: Duración** → **Calcular estadísticas: Suma** → **Calcular**: dividir por **3600** → nombre `Sueño`.
6. **Fecha actual** → **Formatear fecha** → *Formato*: **Personalizado** → `yyyy-MM-dd` → nombre `Fecha`.
7. **Texto** (escribí en una sola línea, insertando las variables donde dice [ ]):
   ```
   URL-DEL-SCRIPT?token=TU-CLAVE&accion=anotar&fecha=[Fecha]&pasos=[Pasos]&kcal=[Energía]&fc=[FC]&sueno=[Sueño]
   ```
   Si no agregaste algún opcional, borrá su parte (por ejemplo `&fc=[FC]`).
8. **Obtener contenido de URL** → con el *Texto* anterior (método GET).

Probalo con ▶︎: tiene que responder `{"ok":true,...}`. Abrí Producti-me → **Cuerpo → Pasos y cardio**: dice *"Llegan solos desde Salud"*.

### Que corra solo

**Atajos → Automatización → + → Hora del día** → elegí la hora → **Ejecutar inmediatamente** (sin preguntar) → elegí el atajo. Repetí para varias horas, por ejemplo **12:00, 18:00 y 23:30**. Cada vez se actualiza el día (no duplica: reemplaza los valores de esa fecha).

Los pasos que llegan de Salud reemplazan a los cargados a mano ese día y suman XP si llegás a la meta. El sueño aparece en Hoy cuando no hiciste el check-in.

---

## 3. Widget en la pantalla de inicio y bloqueada (Scriptable)

**Scriptable** es una app gratuita que permite widgets programados. El widget lee un resumen que Producti-me publica en tu script cada vez que cambia algo (sin textos del diario ni montos).

1. Instalá **Scriptable** del App Store.
2. Abrila → **+** → pegá el contenido de [`integraciones/widget-scriptable.js`](../integraciones/widget-scriptable.js).
3. Arriba completá `URL_SCRIPT` y `CLAVE` (las mismas de Ajustes). Ponele de nombre *Producti-me*. Tocá ▶︎ para ver la vista previa.
4. En la pantalla de inicio: mantené presionado → **Editar → Agregar widget → Scriptable** → elegí tamaño → tocá el widget → *Script*: **Producti-me**.

| Tamaño | Qué muestra |
|---|---|
| Chico | Hábitos hechos, línea de avance del día, pasos, proteína, castigo urgente |
| Mediano | Lo anterior + qué toca ahora y tu prioridad |
| Grande | Lo anterior + la agenda que queda |
| Pantalla bloqueada (circular / rectangular / en línea) | Anillo de hábitos, pasos, lo que toca ahora, tiempo del castigo |

Al tocarlo se abre Producti-me. iOS lo refresca solo cada 15–30 minutos (lo decide el sistema).

---

## 4. La app nativa (propuesta)

Con app nativa se resuelve todo de forma "profesional": Salud en segundo plano sin Atajos, widget propio (también en StandBy y pantalla bloqueada), **Live Activity** con la cuenta regresiva del castigo o la respiración en la Isla Dinámica, vibraciones reales y una app para **Apple Watch** que te toca la muñeca para inhalar/sostener/exhalar (lo ideal para no mirar nada).

### Opciones

| | A. Envolver la app actual (Capacitor) + piezas nativas | B. Reescribir en Swift | C. Seguir como app web |
|---|---|---|---|
| Qué es | La misma app React dentro de una app iOS; widget, Salud, vibración y Watch en Swift | Todo de cero en SwiftUI | Lo de las secciones 1–3 |
| Tiempo | 2–4 semanas de trabajo | 3–6 meses | 0 |
| Reusa lo hecho | ~95 % | 0 % | 100 % |
| Salud automática | Sí | Sí | Vía Atajos |
| Widget / Live Activity / Watch | Sí | Sí | Widget vía Scriptable |
| Riesgo | Bajo | Alto | Nulo, pero con techo |

**Recomendación: A.** Conserva todo lo construido, publica en tu iPhone vía TestFlight y agrega solo lo que una app web no puede hacer. Orden sugerido:
1. App iOS con Capacitor + lectura de Salud (pasos, sueño, FC) en segundo plano.
2. Widget (WidgetKit) en inicio, pantalla bloqueada y StandBy.
3. Vibración real con Core Haptics y Live Activity para respiración y castigos.
4. App de Apple Watch para respirar con toques en la muñeca.

### Qué hace falta de tu lado
- Una **Mac** con Xcode (para compilar; se puede alquilar una Mac en la nube).
- Cuenta de **Apple Developer** (USD 99 por año) para instalar por TestFlight sin que venza. Con una cuenta gratuita también funciona, pero hay que reinstalar cada 7 días.
- Mientras tanto, las secciones 1–3 ya funcionan.
