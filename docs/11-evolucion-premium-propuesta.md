# 11 · Evolución premium · Fase A (relectura) y Fase B (propuesta)

> Estado: **propuesta, pendiente de aprobación**. No se tocó código de producción (`app/src`).
> Base: auditoría ([08](08-rediseno-auditoria-y-direcciones.md)), prototipo ([09](09-rediseno-prototipo.md)) y sistema "Precision Dark" ([10](10-sistema-de-diseno.md)), ya implementado.
> Cada hallazgo indica dónde está en el código para que se pueda verificar.

---

## FASE A · Relectura

### A.1 Qué cambió desde la auditoría anterior

El rediseño B + A resolvió el **aspecto**: tokens, tipografía, íconos, barra Fijada, hojas, Deshacer y rendimiento. Este mandato pide resolver la **experiencia**. Hay que pasar de "pantallas bien pintadas" a "un sistema que entiende mi día y lo opera conmigo".

El diagnóstico de fondo, en una frase: **la app registra bien, pero no conversa, no se adapta y no jerarquiza.**

| Síntoma que describís | Causa real en el código |
|---|---|
| "Hoy no tengo facultad" no se puede resolver | La agenda es **fija por día de la semana** (`profile.agenda[dow]` en `seed.ts`). No hay forma de cambiar un día puntual, y los hábitos tampoco se pueden excusar por fecha (`habitsFor` en `logic.ts:7`) |
| El coach es decorativo | `askCoach` (`coach.ts`) hace **una sola llamada sin herramientas**: lee un resumen y devuelve texto. No puede modificar nada. Vive en una tarjeta "Briefing" al final de Hoy |
| Registrar comida es tedioso | `FOODS` tiene **16 porciones fijas** ("Carne vacuna magra 200 g"). No hay gramos, unidades, alias ni categorías, y la búsqueda es un `includes` literal sin tolerancia a acentos (`Comida.tsx`) |
| Todo se parece | Las 8 pantallas usan el mismo patrón: `PageHead` + `two-col` + `Card` apiladas. Lo único que cambia es el texto del título |
| Los hábitos son un listado | `HabitRow` es una fila de 48 px; los 23 hábitos del día se leen como una tabla |
| Los castigos están escondidos | Viven en una `Card` del costado de **Hábitos** (`Habitos.tsx`, `Penalties`). Hoy solo los menciona si `avisos()` los incluye, y no hay ningún badge |
| Finanzas mezcla todo | `MoneyMove` **no tiene moneda** y el formulario dice "Monto (USD)", aunque los gastos diarios son en pesos. El rendimiento del portafolio resta los movimientos con categoría "Aporte a inversiones" (`portfolioReturn`, `logic.ts:192`): las dos áreas están **acopladas por una categoría de gasto** |
| IA, inglés y lectura están mezclados | `StudySession.tipo` tiene 4 valores en un mismo `select`; no hay objetivos por área, ni evidencia, ni "programación" |
| La estructura AE1–AE4 no existe | `Subject` tiene `estado` y una sola `nota`; `Exam.tipo` es `parcial` / `TP` / `final`. La estructura AE se arma "de cabeza" |
| El diario no invita | Es una `textarea` de 5 líneas dentro de un panel, con chips de emoción arriba y la lista de entradas abajo |
| La barra inferior queda alta | Ver medición en A.2 |
| El ícono no va | `public/icon.svg` es un gráfico de línea **ámbar con un punto verde** sobre azul marino: es de la estética anterior a Precision Dark |

### A.2 Barra inferior: medición

Alto real de la barra en un iPhone con indicador de inicio (`styles.css:40-46`):

```
8 px  padding superior
48 px pestaña (ícono + texto alineados ARRIBA: align-items: flex-start)
10 px padding inferior extra
34 px zona segura (env(safe-area-inset-bottom))
─────
100 px  ← la barra nativa de iOS mide 83 px (49 + 34)
```

Además, el botón ＋ tiene `margin-top: -4px`, así que **sube** en vez de bajar. Su centro queda a unos **68 px del borde inferior**; en una barra nativa, el centro de los íconos está a unos 58 px. Son ~10 px más arriba, y la barra entera ocupa 17 px más que la nativa, justo en la zona donde el pulgar tiene que estirarse. Tu sensación tiene una causa medible.

### A.3 Impacto técnico por área

| Área | Datos | Lógica | UI | Esfuerzo |
|---|---|---|---|---|
| Coach IA | Nuevo: conversaciones, cambios por fecha, registro de cambios | Herramientas estructuradas, aplicar y revertir | Página nueva | **Alto** |
| Nutrición | Nuevo: base de alimentos (archivo aparte), favoritos; `Meal` suma campos opcionales | Búsqueda tolerante, porciones | Rediseño de Comida | Medio-alto |
| Interfaz general | Ninguno | Ninguna | Identidad por sección, encabezados, transiciones | Medio |
| Hábitos | Ninguno (opcional: ícono propio) | Ninguna | Grilla de íconos | Medio |
| Castigos | `Penalty` suma `vence` y `evidencia` | Vencimiento y prioridad en Hoy | Badge, banda en Hoy, hoja de detalle | Bajo-medio |
| Finanzas | `MoneyMove` suma `moneda` y `cuenta`; nuevo: posiciones de inversión y comprobantes | Separar el rendimiento de los gastos | Dos espacios | **Alto** |
| Estudio | `Subject` suma AE1–AE4 y final; nuevo: rutas de aprendizaje y evidencias | Niveles de verificación | Rediseño parcial | Medio-alto |
| Diario | `JournalEntry` suma `modo`, `pregunta`, `animo` | Generador de preguntas | Modo escritura dedicado | Medio |
| Hoy | Ninguno | Reutiliza todo | Reestructuración fuerte | Medio |
| Barra inferior | Ninguno | Ninguna | CSS y estructura | Bajo |
| Ícono | Ninguno | Ninguna | SVG y PNG | Bajo |

### A.4 Conflictos y dependencias

1. **El Coach depende del modelo de "cambios por fecha".** Si la agenda sigue siendo fija por día de la semana, el chat no tiene nada real que modificar. Primero hay que construir `planDia` (A.5); después el chat.
2. **Excusar un hábito afecta las medallas.** "No puedo entrenar hoy" tiene que poder resolverse sin castigarte, pero sin abrir una puerta para vaciar el día. Esto necesita una regla tuya (pregunta 3).
3. **Separar finanzas rompe el cálculo de rendimiento** si no se migra la categoría "Aporte a inversiones" a una transferencia entre cartera y portafolio.
4. **Barra inferior + Coach + identidad de secciones son una sola decisión de navegación.** El Coach necesita un lugar de primer nivel y la barra actual no tiene lugar libre (pregunta 1).
5. **La verificación de estudio y la de castigos comparten mecanismo** (evidencia: link, foto, cuestionario). Conviene construirlo una vez, como componente común.
6. **Toda la IA depende de la clave de Anthropic que ya cargás en Ajustes.** Sin clave, el Coach, la lectura de comprobantes y los cuestionarios no funcionan. Lo demás sí funciona sin conexión.

### A.5 Oportunidades que aparecen al cruzar los pedidos

- **Un solo "motor de cambios"** sirve para el Coach, para el Deshacer, para la revisión semanal ("esta semana excusaste 2 hábitos") y para los comprobantes ("el coach propone este gasto: ¿lo guardo?").
- **El Coach como forma de registrar.** "Comí una milanesa con puré" o "Gasté 8.500 en el súper con Mercado Pago" son más rápidos de escribir que de cargar en un formulario. La misma herramienta que mueve el gimnasio puede registrar una comida.
- **La base de alimentos mejora al Coach.** Con alimentos estructurados, el Coach puede convertir "dos huevos y una tostada con palta" en un registro exacto en lugar de inventar macros.

---

## FASE B · Propuesta

### B.1 Resumen de los cambios solicitados

| # | Pedido | Mi interpretación | Ajuste que propongo |
|---|---|---|---|
| 1 | Página de Coach IA | Un **operador** del día y la semana que entiende lenguaje natural y modifica datos reales con confirmación | Además, que pueda **registrar** (comida, gasto, contacto) y que sea accesible desde Hoy con una línea de entrada |
| 2 | Base de alimentos real | Unos 450 alimentos argentinos y comunes, con porciones reales, alias y búsqueda tolerante | Agregar **comidas guardadas** ("mi desayuno") y registro por texto vía Coach |
| 3 | Claridad e identidad | Saber siempre dónde estoy, que cada sección tenga presencia propia | Identidad por **forma y tono**, sin romper el acento único (ver B.5) |
| 4 | Hábitos icónicos | Grilla de íconos por momento del día, rápida de marcar | Mantener la lista como vista alternativa para editar el pasado |
| 5 | Castigos visibles | Presencia constante y elegante, con detalle y resolución | Agregar **vencimiento** y **evidencia**, más el badge en el ícono de la app |
| 6 | Finanzas separadas | Cartera diaria (ARS) y Patrimonio (USD) dentro de Finanzas | Carga semiautomática **por etapas**: primero comprobantes y texto pegado, después correo |
| 7 | Estudio verificable | Facultad AE1–AE4 + Final; IA, Inglés, Lectura y Programación como rutas separadas con evidencia | Tres niveles de verificación, honestos sobre lo que pueden probar |
| 8 | Diario | Una experiencia de reflexión, no una caja de texto | Modo escritura a pantalla completa, con preguntas guiadas opcionales |
| 9 | Hoy | Entender en 3 segundos qué importa, qué falta y qué alerta hay | Tres niveles de jerarquía y una sola acción principal |
| 10 | Experiencia general | Que la app "viaje conmigo" | Continuidad espacial: elementos que se transforman en vez de reemplazarse |
| 11 | Barra inferior | Bajarla a la zona del pulgar | 83 px como iOS, contenido centrado, ＋ integrado |
| 12 | Ícono | Coherente con Precision Dark | 4 direcciones; recomiendo "Horizonte" (B.5.6) |

### B.2 Impacto por módulo

| Módulo | Archivos afectados | Datos | Riesgo para datos existentes |
|---|---|---|---|
| Navegación | `App.tsx`, `Sheets.tsx` (Más), `ui.ts` (rutas), `styles.css` | Ninguno | Nulo |
| Coach | Nuevo `pages/Coach.tsx`, `lib/coach.ts` (se reescribe), nuevo `lib/actions.ts` | `chats`, `planDia`, `cambios` | Nulo: todo es nuevo |
| Hoy | `pages/Hoy.tsx` (se reescribe) | Ninguno | Nulo |
| Hábitos | `pages/Habitos.tsx`, `components/HabitRow.tsx` → nuevo `HabitTile.tsx` | `Habit.icono?` opcional | Nulo |
| Castigos | Nuevo `components/Castigos.tsx`, `logic.ts` (`processRules`) | `Penalty.vence?`, `evidencia?` | Nulo: los castigos actuales quedan sin vencimiento |
| Comida | `pages/Comida.tsx` (se reescribe), nuevo `lib/foods/*.ts` | `Meal.foodId?`, `gramos?`, `momento?`; `favoritos`, `comidasGuardadas` | Nulo: las comidas viejas se siguen mostrando y sumando |
| Finanzas | `pages/Finanzas.tsx` (dos subpáginas), `logic.ts` | `MoneyMove.moneda`, `cuenta?`; `cuentas`, `posiciones`, `comprobantes` | **Medio**: hay que asignar moneda a lo cargado (pregunta 6) |
| Estudio | `pages/Estudio.tsx` | `Subject.ae?`; `rutas`, `evidencias` | Bajo: la `nota` actual pasa a "Final" |
| Vida · Diario | `pages/Vida.tsx` (`Diario`) | `JournalEntry.modo?`, `pregunta?` | Nulo |
| Ícono | `public/icon*.png/svg`, `vite.config.ts` | Ninguno | Nulo |

**Migración segura.** `store.ts` usa `persist` en la versión 1 y no tiene función `migrate`. Propongo:

1. Subir a la versión 2 con una función `migrate` que **solo agrega** campos (nunca borra ni renombra).
2. Antes de migrar, guardar una copia completa en IndexedDB (`producti-me-respaldo-v1`) y ofrecer descargarla desde Ajustes.
3. Probar la migración con una copia exportada de tus datos reales antes de publicarla.

### B.3 Decisiones de UX

#### B.3.1 Coach IA

**Forma.** Una página propia, de pantalla completa, con tres zonas:

```
┌──────────────────────────────────────┐
│ Coach            Hoy · lun 12 oct    │ ← contexto visible: qué día se está editando
│ ┌──────────────────────────────────┐ │
│ │ Tu día: 4 bloques · 23 hábitos   │ │ ← "estado del plan", se actualiza en vivo
│ └──────────────────────────────────┘ │
│                                      │
│  Hoy no tengo facultad               │ ← tus mensajes
│                                      │
│  Saco "Facultad presencial 7:00" de  │
│  hoy. Te sugiero usar ese bloque:    │
│  ┌ Propuesta · 3 cambios ─────────┐  │ ← tarjeta de cambios (no texto)
│  │ − 07:00 Facultad presencial     │  │
│  │ + 07:30 Estudio IO (60 min)     │  │
│  │ ~ Gimnasio 14:30 → 10:00        │  │
│  │ [Aplicar]  [Editar]  [Descartar]│  │
│  └─────────────────────────────────┘  │
│                                      │
│ [No tengo facultad] [Mover gimnasio] │ ← sugerencias según la hora y el día
│ ┌──────────────────────────────┐ 🎙 ↑ │
│ │ Contale algo al coach…       │     │
└──────────────────────────────────────┘
```

**Reglas de interacción**
- **Los cambios se muestran como tarjeta, nunca como párrafo.** Cada línea indica qué se agrega (+), qué se quita (−) y qué se mueve (~).
- **Confirmar según el riesgo:**
  - *Sin confirmación* (con Deshacer en el aviso): registrar una comida, un gasto o un contacto, o marcar un hábito.
  - *Con confirmación*: cambiar la agenda, excusar hábitos, cambiar objetivos, cualquier cosa que afecte la semana o borre algo.
  - *Nunca*: borrar historial, cambiar metas del perfil sin que lo pidas literalmente, tocar finanzas de inversión.
- **"Editar"** abre los cambios propuestos como lista editable antes de aplicarlos.
- **Historial de cambios**: cada conversación tiene una línea "3 cambios aplicados · Revertir". Revertir deshace el grupo entero.
- **Dictado por voz**: el componente `VoiceText` ya existe; se reutiliza.
- **Acceso**: desde la barra (ver B.3.9), desde una línea "Contale algo al coach…" en Hoy, desde ⌘K y desde la hoja Registrar.
- **El briefing diario se mueve acá**: es el primer mensaje del día, si lo pedís.

#### B.3.2 Comida

```
Buscar: "palta"            → Palta · 1/2 unidad (100 g) · 160 kcal · 2 g P
Buscar: "aguacate"         → Palta  (alias)
Buscar: "carne"            → Carne vacuna: bife de chorizo, asado, nalga, peceto,
                              carne picada común / magra, milanesa de carne…
Buscar: "milanesa napo"    → Milanesa napolitana (tolera palabras incompletas)
```

- **Al abrir**: momento del día deducido por la hora (Desayuno, Almuerzo, Merienda, Cena, Snack), y tres filas: **Recientes**, **Favoritos** y **Comidas guardadas**.
- **Elegir un alimento** abre un selector de porción con las porciones reales ("1 unidad", "1 porción de plato", "100 g", "1 taza") y un control − / + de cantidad. Los macros se recalculan al instante y la proyección del día (ya existe, rayada) se actualiza.
- **Comidas guardadas**: guardar una combinación ("Desayuno habitual: avena 80 g + whey + banana") para cargarla con un toque.
- **Carga manual** se mantiene para lo raro: queda como "alimento personal" y aparece en búsquedas futuras.
- **Por texto vía Coach**: "almorcé milanesa con puré" → el Coach busca en la base y propone el registro con porciones; vos confirmás.

#### B.3.3 Hábitos

**Grilla de íconos agrupada por momento del día** (Mañana · Durante el día · Tarde · Noche):

```
MAÑANA                                   3/5
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│  ◐     │ │  ●     │ │  ○     │ │  ○     │   ← anillo = estado
│ [icono]│ │ [icono]│ │ [icono]│ │ [icono]│
│Skincare│ │Movilid.│ │ Agua   │ │Proteína│
│  ½     │ │  ✓     │ │ 0/3 L  │ │ 84/200 │   ← progreso real si existe dato
└────────┘ └────────┘ └────────┘ └────────┘
```

- **Tocar** marca "hecho": el anillo se llena con un trazo de luz y aparece +XP.
- **Mantener presionado** (o el botón ⋯ en escritorio) abre: Versión mínima · No hecho · Excusar (con motivo) · Ver racha.
- **Tarjetas vivas**: "Proteína" y "Agua" muestran el avance real del dato vinculado, no solo un check.
- **Racha** como un punto pequeño en la esquina (no números grandes ni fuego).
- **Lo completo se atenúa** pero queda en su lugar: no hay saltos de posición, así no se pierde la memoria espacial.
- Se mantiene **"Lista"** como vista secundaria (útil para editar días pasados y en escritorio).
- **Cambio frente a lo aprobado**: deslizar en la grilla no tiene sentido (los gestos chocan con el scroll horizontal). "No hecho" pasa a mantener presionado. En la vista Lista, deslizar se mantiene.

#### B.3.4 Castigos

Tres niveles de presencia, de menor a mayor:

1. **Badge**: un punto ámbar con número sobre "Hoy" en la barra, y en el ícono de la app instalada (Badging API, que funciona en PWAs instaladas en iOS 16.4 o posterior).
2. **Banda en Hoy**, justo debajo de "Ahora", con borde ámbar suave (`--warn`) y sin rojo:
   `Castigo pendiente · 50 burpees · por: ayer 42 % · vence en 18 h  [Ver]`
3. **Hoja de detalle**: motivo con los datos que lo causaron, tarea, vencimiento, estado y resolución ("Lo hice" con evidencia opcional, foto o nota). Aclara que **los permitidos están bloqueados** hasta resolverlo.

Agregados funcionales:
- **Vencimiento**: 48 h por defecto. Si vence, el castigo no se duplica (sería infantil): queda registrado como "vencido" y resta el XP que ya resta hoy. Se ve en la revisión semanal.
- **Un castigo nunca tapa la acción principal**: la banda ocupa una línea; la tarjeta "Ahora" sigue arriba.

#### B.3.5 Finanzas

Dos espacios con un selector arriba, y cada uno con su moneda base:

| Cartera diaria (ARS) | Patrimonio (USD) |
|---|---|
| Disponible del mes y gastado hoy | Patrimonio total y rendimiento del semestre (meta 12 %) |
| Presupuesto por categoría (barra por categoría) | Posiciones: activo, tipo (CEDEAR, acción, cripto, FCI, plazo fijo, dólares), cantidad, valor |
| Movimientos por cuenta: Efectivo · Mercado Pago · Banco · Tarjeta | Aportes y retiros (transferencias desde la cartera) |
| **Comprobantes**: subir foto o PDF, o pegar el texto de un mail o notificación | Ahorro en USD hacia la meta de 5.000 |
| Bandeja "Por confirmar": lo que la IA leyó y espera tu OK | Velas semanales (ya existen) |

- **"Aporte a inversiones" deja de ser un gasto**: pasa a ser una **transferencia** entre Cartera y Patrimonio. Así el rendimiento queda limpio y el gasto mensual no se infla.
- **Nada se guarda automáticamente**: todo lo que entra por comprobante o correo queda en "Por confirmar".

#### B.3.6 Estudio

**Facultad** (se conserva lo que te gusta, se agrega la estructura que pediste):

```
Investigación Operativa                      cursando
AE1 ● entregado   AE2 ○ incompleto   AE3 7   AE4 —   Final —
```

AE1 y AE2 con dos estados (entregado / incompleto); AE3, AE4 y Final con nota de 1 a 10 y validación. Promedio y estado ("en condiciones de final") calculados.

**Rutas de aprendizaje** (cada una es una tarjeta propia con objetivo y su forma de verificar):

| Ruta | Objetivo (ejemplo, lo definís vos) | Unidad de avance | Verificación |
|---|---|---|---|
| Inglés | B2 para julio 2027 | Minutos por tipo: escuchar, leer, hablar, escribir | Escribir 5 líneas y que el coach las corrija; cuestionario de 3 preguntas sobre lo escuchado |
| Lectura | 12 libros en el año | Páginas (desde → hasta) por libro | 3 preguntas de recuerdo generadas a partir de tu resumen; foto de la página opcional |
| IA | Construir 1 proyecto por mes | Sesiones con tema | Link (curso, notebook, repo) + "qué aprendí" en 2 líneas |
| Programación | Ruta propia (lenguaje y proyecto) | Sesiones y entregas | Link a commit o repo de GitHub: si es público, la app puede leer los commits del día sin clave |

**Niveles de verificación** (se muestran como una marca chica en cada sesión):
- **Marcado**: lo declaraste.
- **Con evidencia**: hay link, foto o texto.
- **Verificado**: pasaste el cuestionario, o la app comprobó el commit.

Los hábitos de estudio pueden exigir, si querés, al menos "con evidencia" para contar como hechos. Una aclaración honesta: esto **no impide** hacer trampa (nada en una app personal puede impedirlo), pero vuelve el registro creíble y hace visible cuándo solo marcaste.

#### B.3.7 Diario

- **Entrada**: una tarjeta propia en Vida ("Escribir hoy") que abre un **modo escritura a pantalla completa**: fondo negro absoluto, márgenes amplios, tipografía de lectura más grande, sin la barra inferior, fecha y hora arriba y guardado automático del borrador.
- **Tres modos**, elegidos con un toque al empezar:
  - *Libre*: hoja en blanco.
  - *Guiado*: 3 preguntas cortas en secuencia (qué pasó, qué sentí, qué haría distinto).
  - *Profundo*: una pregunta elegida de una biblioteca por tema (soledad, enojo, bucle, amistad, orgullo, futuro) o generada por el coach a partir de tus check-ins.
- **Ánimo con un control deslizante** de 1 a 10, en lugar de 10 chips; la emoción queda opcional.
- **Las entradas como páginas**: lista por fecha con la primera línea; abrir una la muestra en el mismo formato de lectura. "Hace un mes escribiste…" aparece en Recuerdos.
- **Privacidad**: el texto del diario **no se envía al coach** (como hoy). Para la pregunta profunda se usan solo los números de los check-ins, salvo que actives explícitamente "el coach puede leer mi diario".

#### B.3.8 Hoy

Tres niveles de jerarquía. El primero responde "¿qué hago ahora?" sin desplazar la pantalla:

```
NIVEL 1 · PRIMERA PANTALLA (390 × 844)
┌──────────────────────────────────────┐
│ lun 12 oct · 10:42           ◔ 9/23  │ ← anillo del día, siempre visible
│ Buen día, Constantino                │
│ ┌──────────────────────────────────┐ │
│ │ AHORA · en 1 h 48 min            │ │ ← tarjeta héroe: lo que viene + prioridad
│ │ Gimnasio enfocado en rugby       │ │
│ │ ☐ Prioridad: terminar TP de IO   │ │
│ │ ▬▬▬▬▬▬▬▬▬▬▬▬░░░░░░░░░░░░░░░░░░░░ │ │ ← horizonte de luz (firma)
│ └──────────────────────────────────┘ │
│ ⚠ Castigo · 50 burpees · vence 18 h ›│ ← solo si existe
│ PARA COMPLETAR                       │
│ ┌────────┐┌────────┐┌────────┐       │ ← siguientes 3 acciones, GRANDES
│ │Proteína││ Agua   ││Inglés  │  →    │   (88 px), tocables desde acá
│ │ 84/200 ││ 1/3 L  ││ 20 min │       │
│ └────────┘└────────┘└────────┘       │
│ ┌ Contale algo al coach…        ↑ ┐  │ ← entrada directa al Coach
├──────────────────────────────────────┤
│ NIVEL 2 · CÓMO VIENE MI DÍA          │
│ Check-ins · Señales (sueño, proteína,│
│ ahorro, amigos) · Requiere atención  │
├──────────────────────────────────────┤
│ NIVEL 3 · CONTEXTO                   │
│ Recomendaciones · Recuerdos · Semana │
└──────────────────────────────────────┘
```

- **Subpestañas**: `Ahora` (lo de arriba) y `Agenda` (la vista Línea actual, renombrada). Dos y no más.
- **Lo que se va**: la tarjeta "Briefing" (pasa al Coach) y el listado de hábitos debajo de "Siguiente acción" (pasa a la grilla de Hábitos).
- **Cuando el día está completo**, la tarjeta héroe cambia de estado (el horizonte se completa con luz) y muestra el XP del día y la hora de mañana. Es el único momento "wow" deliberado del día.

#### B.3.9 Navegación y barra inferior

Hoy no hay lugar en la barra para el Coach. Opciones:

| Opción | Barra | A favor | En contra |
|---|---|---|---|
| **A · Hub de áreas** (recomendada) | Hoy · Hábitos · ＋ · Coach · Áreas | El Coach queda a un toque. "Áreas" es una pantalla con 4 tarjetas grandes con identidad (Físico, Estudio, Finanzas, Vida) y accesos a Revisión y Ajustes: resuelve "no sé dónde estoy" | Reemplaza la barra "Fijada" que aprobaste: un área pasa a estar a 2 toques |
| B · Fijada + Coach en Hoy | Hoy · Hábitos · ＋ · Fijada · Más (sin cambios) | No cambia nada aprobado | El Coach queda como entrada secundaria y no tiene presencia de primer nivel |
| C · Coach en el ＋ | Hoy · Hábitos · ✦ · Fijada · Más | El botón central abre el Coach, que también registra | Mezcla dos gestos distintos (registrar rápido y conversar) en un mismo botón; registrar se vuelve más lento |

**Ergonomía de la barra (vale para cualquier opción):**
- Alto total = **49 px + zona segura** (83 px en iPhone con indicador de inicio), igual que la barra nativa.
- Íconos y textos **centrados verticalmente** (hoy están alineados arriba).
- Botón ＋ de 52 px, **integrado en la línea de la barra** (sin `margin-top` negativo) y con el centro a unos 58 px del borde.
- El indicador de pestaña activa (la línea de luz de arriba) **se desliza** entre pestañas en lugar de aparecer.
- El aviso con Deshacer se recalcula para quedar justo encima de la barra (hoy está fijo a 96 px).
- Hay que verificarlo en tu iPhone instalado como app: el simulador no reproduce bien la zona segura en modo `standalone`.

#### B.3.10 Experiencia general: que la app "viaje con vos"

"Viajar" se traduce en **continuidad**: los elementos se transforman en vez de desaparecer y reaparecer.

| Momento | Hoy | Propuesta |
|---|---|---|
| Tocar una tarjeta de área en Áreas | Cambio de pantalla con fundido | La tarjeta **se expande** y se convierte en el encabezado de la pantalla (View Transitions con elemento compartido; ya se usa la API) |
| Cambiar de pestaña | Corte | La línea de luz se desliza; la pantalla entra desde el lado de la pestaña |
| Marcar un hábito | Check | El anillo se llena, el XP sube con conteo en el encabezado y el anillo del día avanza |
| El Coach aplica cambios | — | Las filas de la agenda cambiadas brillan una vez al volver a Hoy |
| Desplazarse en una pantalla | Encabezado estático | El título grande se **compacta** en la barra superior y deja el nombre de la sección siempre visible |
| Día completo | Texto "Día completo" | El horizonte se completa con luz (una vez por día) |

Límites: duración máxima de 320 ms, nada se anima en reposo (salvo la cuenta regresiva que ya existe) y todo respeta "reducir movimiento" del sistema. iOS no permite vibración desde la web, así que no se promete respuesta háptica.

### B.4 Decisiones de arquitectura

#### B.4.1 Coach: herramientas estructuradas sobre los datos reales

**Recomendación: el modelo nunca escribe en los datos. Propone acciones tipadas; la app las valida, las muestra y las aplica.**

```
Mensaje ──► Claude (API, desde el navegador, con tu clave)
              │  system: perfil + reglas
              │  contexto: plan del día y de la semana, hábitos, pendientes
              │  tools: [ver_plan, proponer_cambios, registrar, buscar_alimento, …]
              ▼
        tool_use: proponer_cambios({ fecha, acciones: [...] })
              │
              ▼
   lib/actions.ts ── valida (fechas, ids existentes, horarios)
              │
              ▼
   Tarjeta de propuesta ── [Aplicar] ──► store.set(...)  +  registro en `cambios`
                                          (con el inverso para revertir)
```

**Catálogo inicial de acciones** (cada una con validación y su inversa):

| Acción | Ejemplo | Confirmación |
|---|---|---|
| `agenda.quitar(fecha, bloque)` | "Hoy no tengo facultad" | Sí |
| `agenda.mover(fecha, bloque, hora)` | "Pasame el gimnasio a la tarde" | Sí |
| `agenda.agregar(fecha, hora, qué, intensidad?)` | "Agregá una salida a las 22" | Sí |
| `habito.excusar(fecha, hábito, motivo)` | "No puedo entrenar hoy" | Sí |
| `habito.momento(fecha, hábito, momento)` | "Estudio de noche hoy" | Sí |
| `semana.restriccion(desde, hasta, texto, ajustes)` | "Esta semana tengo menos tiempo" → versiones mínimas por defecto | Sí |
| `prioridad.definir(fecha, texto)` | "Mi prioridad es el TP" | No (con Deshacer) |
| `registrar.comida / gasto / contacto / estudio` | "Comí 2 huevos y una tostada" | No (con Deshacer) |
| `ver_plan(fecha)` / `buscar_alimento(texto)` | Lectura | — |

**Modelo de datos nuevo** (sin tocar lo existente):

```ts
planDia: Record<fecha, {
  agenda?: AgendaItem[]          // si existe, reemplaza a profile.agenda[dow] SOLO ese día
  excusados?: Record<habitId, string>   // motivo
  momentos?: Record<habitId, Momento>
  nota?: string
}>
cambios: { id, fecha, origen: 'coach' | 'manual', resumen, acciones, inversas, revertido? }[]
chats: { id, fecha, mensajes: { rol, texto, propuestaId? }[] }[]
```

`agendaDe(fecha)` y `habitsFor(fecha)` pasan a consultar `planDia` primero; todas las pantallas (Hoy, Agenda, medallas) heredan el cambio sin tocarlas una por una.

**Alternativas descartadas**
- *Interpretar comandos con reglas locales* (sin IA): funciona para "no tengo facultad", pero no para "esta semana tengo menos tiempo". Lo dejo solo como **sugerencias rápidas** que arman el mensaje.
- *Dejar que el modelo devuelva el JSON completo del estado*: frágil, caro y peligroso para los datos.

**Costos y límites**
- Cada mensaje envía un contexto compacto (plan del día y de la semana, sin fotos ni diario).
- La clave sigue guardada en el dispositivo, como hoy. Es aceptable para una app de un solo usuario; para algo compartido haría falta un servidor.
- Sin conexión o sin clave, el Coach muestra el estado y las sugerencias rápidas no aplican cambios.

#### B.4.2 Base de alimentos

**Recomendación: base local curada, incluida en la app y cargada solo al abrir Comida.**

| Opción | A favor | En contra |
|---|---|---|
| **Local curada** (recomendada) | Instantánea, funciona sin conexión, alimentos y porciones argentinos, controlada | Hay que construirla y validarla una vez |
| Open Food Facts (API) | Millones de productos envasados y código de barras | Requiere conexión, datos irregulares, pocos alimentos sin envase. Útil más adelante para escanear envases |
| USDA FoodData Central (API) | Datos de laboratorio | En inglés, porciones de EE. UU., requiere conexión |

**Estructura:**

```ts
interface Alimento {
  id: string
  nombre: string                 // "Palta"
  alias: string[]                // ["aguacate", "avocado"]
  categoria: 'carnes' | 'aves' | 'pescados' | 'huevos' | 'lacteos' | 'quesos' | 'cereales' | 'panificados'
           | 'pastas' | 'legumbres' | 'verduras' | 'frutas' | 'grasas' | 'platos' | 'rapida' | 'bebidas' | 'snacks'
           | 'dulces' | 'suplementos'
  por100: { kcal: number; prot: number; carb: number; grasa: number }
  porciones: { nombre: string; g: number }[]   // "1 unidad mediana" 150 g, "1 porción" 250 g
  porDefecto: number                            // índice de la porción sugerida
}
```

- **Tamaño objetivo**: unos 450 alimentos (todos tus ejemplos más comidas argentinas: asado, vacío, matambre, milanesa napolitana, empanadas por tipo, tarta, ñoquis, locro, choripán, medialunas, facturas, dulce de leche, alfajor, mate, fernet…). Unos 60 KB comprimidos, cargados solo al abrir Comida.
- **Fuentes**: Tabla de Composición de Alimentos de Argentina (ARGENFOODS) como base, USDA para lo que falte, y para platos preparados una receta típica documentada. Cada alimento guarda su fuente. Se revisan a mano los 100 más comunes.
- **Búsqueda**: se normaliza el texto (minúsculas y sin acentos), se buscan coincidencias por palabras en nombre y alias, se tolera un error de tipeo por palabra y el orden prioriza recientes, después favoritos y después popularidad. Se implementa sin dependencias.
- **Compatibilidad**: `Meal` mantiene sus campos actuales y suma `foodId?`, `gramos?` y `momento?`. Las comidas ya guardadas se ven igual.

#### B.4.3 Finanzas: comprobantes, correo y MCP

Lo que es posible **hoy**, sin servidor, y lo que necesita la fase 2 (nube):

| Vía | Cómo funciona | Requiere | Recomendación |
|---|---|---|---|
| **1. Comprobante** (foto, captura o PDF) | Lo subís; Claude lee monto, fecha, comercio y medio; queda en "Por confirmar" | Tu clave (ya está) | **Etapa 1** |
| **2. Texto pegado** | Copiás el mail o la notificación de Mercado Pago o del banco y lo pegás (o se lo pasás al Coach) | Tu clave | **Etapa 1** |
| 3. Reenvío de correo | Un filtro de Gmail reenvía los mails de Mercado Pago y del banco a una dirección propia; un servicio pequeño los procesa y la app los descarga | Servidor (fase 2) | **Etapa 2** |
| 4. Gmail vía OAuth | La app lee tus mails directamente | Servidor y verificación de Google. En modo prueba los permisos vencen cada 7 días | No recomendada |
| 5. Producti-me como servidor MCP | Producti-me expone acciones ("registrar gasto"). Claude, con su conector de Gmail, lee los mails y los registra en la app cuando se lo pedís | Servidor (fase 2) | **Etapa 2, alternativa a la 3** |
| 6. API de Mercado Pago | Token personal | Está pensada para cobros (vendedores), no para el detalle de tus gastos | Descartada por ahora |

**Sobre MCP, para ser preciso:** MCP es la forma en que un asistente (Claude) se conecta con herramientas. La app web en tu iPhone no puede "recibir" información por MCP por sí sola, porque no tiene servidor. La forma de aprovecharlo es la opción 5: convertir Producti-me en un servidor MCP cuando exista la sincronización en la nube. Eso se puede diseñar ya, pero no construir sin backend.

**Riesgos y permisos**
- Las imágenes de comprobantes se envían a la API de Anthropic para leerlas. No se guardan ahí más de lo que indica su política de datos de la API, pero salen del dispositivo.
- Las imágenes se guardan **comprimidas** en IndexedDB, como las fotos de progreso.
- Nunca se guardan números de tarjeta completos: la extracción se limita a los últimos 4 dígitos.

#### B.4.4 Notificaciones y badge

- **Badge en el ícono** (castigos pendientes): Badging API, sin servidor, en la PWA instalada en iOS 16.4 o posterior.
- **Notificaciones push reales** (vencimiento de un castigo, check-in): en iOS requieren la app instalada **y un servidor de push**. Quedan para la fase 2, como estaba en el plan.

### B.5 Decisiones de diseño

#### B.5.1 Identidad por sección, sin romper el acento único

El principio "un acento" de Precision Dark se mantiene para **acciones, progreso y foco**. Cada sección gana identidad por tres vías que no compiten con él:

1. **Tono ambiental**: un brillo muy tenue de color en el encabezado de la pantalla (máximo 8 % de opacidad) y en el ícono de la sección. Nunca en botones ni en barras de progreso.

   | Sección | Tono | Valor |
   |---|---|---|
   | Hoy | Hielo (el acento) | `#8EA8FF` |
   | Coach | Plata | `#C9D0DC` |
   | Físico | Cobre | `#D08A64` |
   | Estudio | Índigo | `#9A8CFF` |
   | Finanzas | Jade | `#6FBFA0` |
   | Vida | Malva | `#C59AD6` |

2. **Forma del encabezado**: cada sección tiene un gráfico de firma propio dentro del horizonte (Físico: el pulso de carga; Finanzas: la vela semanal; Estudio: las horas acumuladas; Vida: los puntos de contacto). Son datos reales, no decoración.
3. **Barra superior compacta** con el nombre de la sección y su ícono al desplazarse. Siempre sabés dónde estás.

Si preferís mantener un solo color en toda la app, la identidad funciona igual solo con los puntos 2 y 3 (pregunta 2).

#### B.5.2 Tamaños

- Acciones principales: **mínimo 52 px de alto** en Hoy (hoy son 40–44 px).
- Tarjetas de hábitos: 76–88 px; 4 por fila en 390 px.
- Cifras: se mantiene la escala del doc 10, con un nivel nuevo de 56 px solo para el anillo del día y el patrimonio.

#### B.5.3 Diario: tipografía propia

La única excepción tipográfica: el modo escritura usa una serif de lectura (**Newsreader**, licencia OFL, incluida en la app) a 19 px con interlineado 1,6. Marca el cambio de registro: de "operar" a "pensar".

#### B.5.4 Castigos: color

`--warn` (ámbar `#E0A852`) solo como borde de 1 px, punto de estado y número del badge. El fondo de la banda es `rgba(224,168,82,.06)`. Sin rojo, sin íconos de fuego ni calaveras.

#### B.5.5 Coach: estética

Mensajes tuyos alineados a la derecha en superficie `--surface-2`; los del coach, sin burbuja, como texto editorial a ancho completo (más legible y menos "chat genérico"). Las propuestas son el único elemento con borde luminoso. Mientras piensa, una línea de horizonte animada en lugar de los tres puntos clásicos.

#### B.5.6 Ícono de la app: direcciones

| # | Dirección | Descripción | Evaluación |
|---|---|---|---|
| 1 | **Horizonte** (recomendada) | Cuadrado negro profundo; una línea horizontal fina con la parte izquierda iluminada en azul hielo hasta un punto de luz al 62 % | Es la firma que ya usa la app ("la luz se gana"); legible a 29 px; no se parece a ningún ícono de productividad conocido |
| 2 | Anillo incompleto | Un anillo al 80 % con el extremo brillante | Muy claro, pero lo usan muchas apps de actividad y de hábitos: poco distintivo |
| 3 | Monograma P | Una "P" construida con un trazo y un arco de progreso | Reconocible, pero los monogramas tienden a verse corporativos o genéricos |
| 4 | Ascenso | Tres barras crecientes, la última iluminada | Comunica progreso, pero se lee como una app de finanzas o de señal |

Todas en negro `#08090B` con un borde interior de 1 px sutil, sin degradados de colores ni sombras, y probadas a 1024, 180, 120 y 29 px. Las maquetas de las cuatro van en la Fase C.

### B.6 Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| El Coach aplica un cambio equivocado | Alto | Acciones tipadas y validadas, confirmación en lo sensible, revertir por grupo, registro visible |
| Excusar hábitos vacía las medallas | Medio | Límite semanal y registro visible en la revisión (pregunta 3) |
| Migración de datos | Alto | Solo agregar campos, respaldo automático previo, prueba con tu copia exportada |
| Moneda de los movimientos ya cargados | Medio | Pregunta 6 antes de migrar |
| Calidad de la base de alimentos | Medio | Fuentes registradas, revisión manual de los 100 más comunes, edición de macros siempre disponible |
| Costo de la API | Bajo-medio | Contexto compacto, sin historial infinito (resumen de chats viejos), modelo configurable en Ajustes |
| Alcance demasiado grande | Alto | Etapas cortas con algo usable al final de cada una (B.7) |
| Limitaciones de iOS (push, vibración, compartir hacia la app) | Medio | Se diseña sin depender de ellas; se dice explícitamente qué no hace |
| Peso de la app | Bajo | La base de alimentos y el Coach se cargan al abrirlos (como ya pasa con los gráficos) |

### B.7 Recomendaciones: orden de implementación

Cada etapa termina con algo que podés usar en el iPhone, verificado a 390 y 1440 px.

| Etapa | Contenido | Por qué en este orden |
|---|---|---|
| 1 | **Barra inferior + ícono + migración v2 con respaldo** | Arreglos rápidos que sentís todos los días; la migración prepara todo lo demás |
| 2 | **Hoy + castigos + identidad de secciones + navegación** | Es la pantalla que más abrís; la navegación define dónde vive el Coach |
| 3 | **Hábitos en grilla** | Depende de los componentes de la etapa 2 |
| 4 | **Comida + base de alimentos** | Independiente; el Coach la va a usar |
| 5 | **Coach IA** con `planDia` y acciones | El cambio más grande; ya tiene dónde vivir y qué operar |
| 6 | **Finanzas** separadas + comprobantes | Requiere decidir la moneda de lo ya cargado |
| 7 | **Estudio** (AE y rutas con evidencia) | Reutiliza el componente de evidencia de los castigos |
| 8 | **Diario** | Cierra Vida |
| Fase 2 | Nube, push, correo y servidor MCP | Requiere servidor |

### B.8 Dudas que necesitan tu aprobación

1. **Navegación**: ¿Opción A (Hoy · Hábitos · ＋ · Coach · Áreas), que reemplaza la barra Fijada aprobada? ¿O preferís B o C (B.3.9)?
2. **Identidad por sección**: ¿tonos ambientales por sección (cobre, índigo, jade, malva, plata) o un solo color en toda la app (B.5.1)?
3. **Excusar hábitos**: cuando el Coach excusa un hábito ("no puedo entrenar hoy"), ¿no cuenta para las medallas? ¿Con qué límite? Propongo **2 excusas por semana en total**, con motivo obligatorio y visibles en la revisión.
4. **Coach sin confirmación**: ¿estás de acuerdo con que registrar comida, gasto o contacto se aplique directo (con Deshacer), y que solo la agenda, los hábitos y la semana pidan confirmación?
5. **Hábitos**: ¿grilla como vista principal y lista como secundaria? ¿"No hecho" con mantener presionado (deja de ser deslizar en la grilla)?
6. **Finanzas, datos existentes**: los movimientos ya cargados dicen USD en el formulario. ¿Eran pesos o dólares? (Si hay pocos, propongo marcarlos todos como ARS y que corrijas los que no.)
7. **Cuentas de la cartera diaria**: ¿cuáles usás? (Efectivo, Mercado Pago, ¿qué banco?, ¿qué tarjeta?) ¿Querés presupuesto mensual por categoría?
8. **Correo**: para la etapa 2 de finanzas, ¿preferís reenvío de correo (automático) o el servidor MCP (lo pedís a Claude cuando querés)?
9. **Rutas de estudio**: ¿cuáles son tus objetivos concretos para Inglés, Lectura, IA y Programación? ¿Qué lenguaje o proyecto de programación?
10. **Verificación**: ¿los hábitos de estudio cuentan como hechos solo con evidencia, o la evidencia suma XP extra sin ser obligatoria?
11. **Castigos**: ¿vencimiento de 48 h te parece bien? ¿Qué pasa si vence: solo queda registrado o resta XP adicional?
12. **Diario**: ¿la serif de lectura en el modo escritura, o mantener Geist en toda la app?
13. **Ícono**: ¿confirmás "Horizonte" para maquetar con más detalle, o querés ver las cuatro antes de elegir?

---

## Próximo paso

Con tus respuestas a B.8, paso a la **Fase C**: maquetas de alta fidelidad navegables (en `docs/design/v3/`, como el prototipo anterior) de Hoy, Coach, Hábitos, Finanzas, Diario, navegación, barra inferior e ícono, con datos reales de tu perfil. No toco `app/src` hasta que apruebes la Fase D.
