# 09 · Rediseño · Prototipo navegable (para evaluar)

> Estado: **decisiones tomadas** (Hoy = Enfoque con Línea secundaria · navegación Fijada · izquierda = No hecho). Siguiente: [10 · Sistema de diseño](10-sistema-de-diseno.md). No se tocó código de producción (`app/src`).
> Prototipo: [`design/prototipo/index.html`](design/prototipo/index.html) (abrir en el navegador, con internet para las tipografías).
> También está publicado como página privada para probarlo en el iPhone.

La barra superior del prototipo **no es parte de la app**: permite cambiar pantalla, composición de Hoy, navegación, datos (normal, vacío, completado) y vista (pantalla completa o marco de iPhone). En escritorio, la app pasa sola a barra lateral y tablero de dos columnas.

---

## 1. Identidad: "la luz se gana"

El riesgo de B+A era terminar en otro tablero oscuro genérico. La identidad sale de **una sola idea aplicada con disciplina**: en Producti-Me la luz no decora, **mide**.

| Elemento | Qué hace | Por qué es propio |
|---|---|---|
| **Horizonte** | El borde superior del panel principal es una línea de luz que avanza con tu día, con un punto brillante en la punta. Al completar el día, el borde entero se ilumina y el panel proyecta un halo tenue | Es la firma visual: el mismo gesto en Hoy, en el isotipo y en el día completo. Nadie más usa el borde como medidor |
| **Isotipo** | Un cuadrado con una línea de horizonte iluminada hasta la mitad | Reemplaza el gráfico genérico. Funciona a 16 px |
| **Etiquetas grabadas** | Geist Mono en mayúsculas con espaciado amplio ("AHORA", "SIGUIENTE ACCIÓN", "SEÑALES"), como las inscripciones de un instrumento | Da materialidad de herramienta de precisión sin decorar |
| **Barra de ticks** | Los hábitos del día son 18 marcas: altas y luminosas = hecho, medianas = mínimo, bajas = pendiente | Muestra el día entero en una línea; reemplaza el número de XP como protagonista |
| **Metales** | Oro `#D4B26A`, plata `#C2C7D0`, bronce `#C08C6A`: etiquetas con un punto metálico. "Bajo meta" es neutro | Exigente sin rojo de alarma, como aprobaste |
| **Superficies** | Negro `#08090B` → superficie `#0E1013` → elevada `#13151A`. Solo el panel principal y las hojas tienen borde con gradiente de luz. El resto, borde plano de 1 px | Jerarquía: lo luminoso es lo que importa ahora |
| **Acento** | Azul hielo `#8EA8FF` (8,7:1 sobre el fondo), con tinta oscura `#0A0D18` encima (8,5:1) | Un solo acento: progreso, foco, acción principal, completado |

## 2. Hoy: dos composiciones

### A · Instrumento (orientada a la acción)
Jerarquía: **qué hago ahora → qué hago después → cómo vengo**.

1. **Panel "Ahora"** con el horizonte. Contiene el próximo bloque de la agenda con cuenta regresiva, la prioridad del día (se tilda ahí mismo) y la barra de ticks.
2. **Siguiente acción**: un solo hábito, elegido por contexto. Si te falta proteína, aparece "Llegar a la proteína" con el botón **Registrar comida**, que lleva directo al formulario. Debajo, los 3 siguientes y "N más hoy". Elimina la decisión de "qué sigue".
3. **Señales**: sueño, proteína, ahorro y amigos, con su meta. Al tocar una, se expande en el lugar y muestra la semana. Esta métrica sola vale por un gráfico.
4. **Requiere atención**: solo los avisos con acción. Cada uno tiene su botón.
5. **Briefing** del coach, y el check-in pendiente como botón discreto (no se abre solo).

En escritorio: columna principal (Ahora + Siguiente) y una columna lateral fija (Señales, Atención, Briefing).

### B · Línea del día (orientada al tiempo)
Jerarquía: **cuándo → qué → cuánto**.

- Resumen compacto con anillo, medalla semanal y XP del día.
- Una línea de tiempo vertical desde que te despertás hasta la hora de acostarte. Combina tu agenda (revisión 18:00), los hábitos agrupados por momento (mañana, durante el día, tarde, noche) y la recomendación de sueño (23:15). Una línea de luz marca "ahora" (17:35). Lo pasado se atenúa.

**Requiere un dato nuevo:** cada hábito necesitaría un "momento del día" (mañana, día, tarde o noche). Hoy no existe en la app; en el prototipo lo asigné yo.

### Comparación

| | A · Instrumento | B · Línea del día |
|---|---|---|
| Responde mejor a | "¿Qué hago ahora?" | "¿Cómo se organiza mi día?" |
| Días en que brilla | Facultad + gimnasio + rugby, con mucho para hacer | Domingos y días sin estructura |
| Toques para marcar un hábito | 1 (el sugerido) o 1 desde la lista | 1, pero hay que encontrarlo en la línea |
| Cambios en datos | Ninguno | Agregar "momento" a cada hábito |
| Riesgo | Si la sugerencia no acierta, molesta | Más larga; en días cargados se vuelve densa |

**Recomendación: A como pantalla Hoy**, y B más adelante como vista alternativa ("Línea") dentro de Hábitos, si te resulta útil.

## 3. Interacciones (cada una con su función)

| Interacción | Función | Duración |
|---|---|---|
| **El horizonte avanza** al marcar un hábito | Vincula la acción con el progreso del día | 360 ms |
| **El check se dibuja** y aparece "+15 XP" | Confirma qué se ganó, sin pantalla extra | 220 ms + 700 ms |
| **Aviso con Deshacer** (4 s) al marcar, guardar o cumplir | Corrige un toque accidental sin diálogo de confirmación | 4,2 s |
| **Deslizar un hábito**: derecha = hecho, izquierda = mínimo (en móvil) | Marcar sin apuntar al círculo. Los botones siguen estando para teclado y lectores de pantalla | Sigue el dedo |
| **Hojas inferiores con arrastre**: bajar para cerrar, fondo atenuado, foco atrapado, Esc cierra. En escritorio se vuelven un diálogo centrado | Registrar sin perder el contexto de la pantalla | 360 ms con rebote leve |
| **Proyección rayada** en Registro de comida | Muestra cómo queda tu día **antes** de guardar | Inmediata |
| **Las cifras cuentan** hasta el nuevo valor después de registrar | Ver qué cambió al volver a Hoy | 420 ms |
| **Señal expandible** | El detalle aparece en el lugar, sin navegar | Inmediata |
| **Transición entre pantallas**: fundido corto entre pestañas, deslizamiento lateral al entrar en un detalle | Indica si cambiaste de lugar o bajaste un nivel | 220 / 360 ms |
| **Paleta de comandos** (⌘K o Ctrl+K), **R** para registrar, **1–6** para pantallas | Acceso rápido en la PC | — |
| **Punto que late** en la cuenta regresiva | Lo único animado en reposo: indica que algo está por empezar | 2,4 s, sutil |

Con `prefers-reduced-motion` activo, todas las animaciones se vuelven instantáneas. Todo control tiene un foco visible (anillo azul hielo) y una etiqueta accesible.

## 4. Navegación

### Frecuencia real de uso (estimada desde tus hábitos y rutinas)
La mayoría de las acciones frecuentes son **escrituras** (marcar, registrar comida, gasto, entreno, diario). Las **lecturas** de un área (ver Físico, Finanzas…) son semanales.

| Tarea | Por semana | Actual (6 pestañas) | Áreas (hub) | Fijada |
|---|---|---|---|---|
| Marcar un hábito | ~120 | 1 | 1 | 1 |
| Registrar comida frecuente | ~25 | 3 + scroll | **2** | **2** |
| Registrar gasto | ~7 | 2 + scroll | 2 | 2 |
| Registrar entrenamiento | ~6 | 2 + scroll | 2 | 2 |
| Escribir en el diario | ~7 | 3 | 2 | 2 |
| Iniciar estudio | ~7 | 2 | 2 | 2 |
| Ver Físico | ~5 | **1** | 2 | **1** |
| Ver Estudio, Finanzas o Vida | ~8 | **1** | 2 | 2 |

Toques desde cualquier pantalla. La hoja **Registrar** muestra arriba lo último que cargaste: por eso una comida repetida queda en 2 toques.

### Las tres opciones (las tres se pueden probar en el prototipo)
- **Actual:** Hoy · Hábitos · Físico · Estudio · Finanzas · Vida. La lectura es directa, pero cada registro depende de entrar a la pantalla correcta y bajar hasta el formulario. Revisión y Ajustes quedan escondidos.
- **Áreas:** Hoy · Hábitos · **＋** · Áreas · Revisión. "Áreas" es un tablero con 4 tarjetas vivas (cifra principal, mini gráfico y estado) que llevan cada una a su pantalla completa. **No agrupa las pantallas:** Físico, Estudio, Finanzas y Vida siguen siendo independientes; el tablero es solo la puerta de entrada.
- **Fijada:** Hoy · Hábitos · **＋** · Físico · Más. Físico, tu prioridad n.º 1, queda a un toque. El resto va en "Más", y el lugar fijado se puede cambiar.

### Recomendación
**Móvil: "Fijada".** Es la única que no empeora ninguna tarea frecuente respecto de "Áreas" y mantiene a 1 toque el área en la que más trabajás. Cuando cambien tus prioridades, cambiás el lugar fijado.
**Escritorio (todas las opciones):** barra lateral con **todas** las pantallas visibles, el botón Registrar arriba, atajos de teclado y ⌘K. En escritorio no se agrupa nada.

Si preferís ver las cuatro áreas de un vistazo, "Áreas" es la segunda mejor opción. "Actual" es la que más toques exige para registrar, que es lo que más hacés.

## 5. Qué podés evaluar en el prototipo

| Qué | Cómo |
|---|---|
| Hoy A y B | Barra superior → Hoy |
| Hábitos | Marcá, deslizá (móvil), filtrá por área, mirá el podio y "Hechos hoy" |
| Pantalla de registro | ＋ → Comida, o "Registrar comida" en Siguiente acción. Elegí alimentos y mirá la proyección; al guardar, volvé a Hoy y mirá la proteína |
| Check-in | Hoy B → Check-in, o "Hacer el check-in" en datos vacíos |
| Navegación | Barra superior → Navegación (Actual, Áreas, Fijada); en Fijada, tocá "Más" |
| Estados | Datos → Normal, Vacío y Completado. Pantalla "Estados" para botones, campos, hábitos, medallas y horizonte en cada estado |
| Móvil y escritorio | Vista → Pantalla completa o Marco de iPhone. En una PC, la pantalla completa muestra la versión de escritorio |
| Teclado | Tab para recorrer, ⌘K o Ctrl+K, R, 1–6, Esc |

## 6. Limitaciones del prototipo
- Físico, Estudio, Finanzas, Vida, Revisión y Ajustes aparecen como pantallas de marcador: conservan sus funciones y se rediseñan con el mismo sistema en la implementación.
- Los datos son de ejemplo coherentes con los tuyos, a las 17:35 del domingo 11 de octubre. El domingo tiene **18 hábitos**, no 23: en las maquetas anteriores puse 23 por error.
- No pude probarlo en un iPhone físico. Lo verifiqué en Chromium a 390 px y a 1440 px. El deslizamiento táctil y el desenfoque de fondo conviene probarlos en tu teléfono.

## 7. Decisiones que necesito
1. **Hoy:** ¿A (Instrumento), B (Línea del día) o A con B como vista secundaria?
2. **Navegación móvil:** ¿Fijada, Áreas o Actual?
3. **Identidad:** ¿el horizonte como firma visual te convence? ¿Ajustarías el azul hielo después de verlo en tu teléfono?
4. **Gestos:** ¿deslizar a la izquierda = mínimo te resulta natural, o preferís que la izquierda sea "no hecho"?
