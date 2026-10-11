# 08 · Rediseño · Fase 1 (auditoría) y Fase 2 (direcciones visuales)

> Estado: **propuesta, pendiente de aprobación**. No se modificó código de producción (`app/src`).
> Las maquetas están en [`design/mockups/`](design/mockups). Abrilas en el navegador; necesitan internet para cargar las tipografías.

---

## FASE 1 · Auditoría

### 1.1 Qué hay hoy (inventario verificado en el código)

| Aspecto | Hallazgo |
|---|---|
| Stack | React 18 + TypeScript + Vite 8 + `vite-plugin-pwa`. Estado con Zustand persistido en IndexedDB (`idb-keyval`). Gráficos con Recharts 3 + un SVG de velas propio. SDK de Anthropic para el coach |
| Estructura | `src/lib` (tipos, store, lógica, seed, i18n, coach, fechas) · `src/components` (`ui.tsx`, `charts.tsx`, `HabitList.tsx`, `LevelCard.tsx`) · `src/pages` (8 pantallas) · un único `styles.css` de 78 líneas |
| Pantallas | Hoy · Hábitos · Físico (3 pestañas) · Estudio · Finanzas · Vida (4 pestañas) · Revisión · Ajustes |
| Navegación | Barra inferior fija con 6 destinos + 2 botones en el encabezado (Revisión, Ajustes). Ruteo por `location.hash`, sin transiciones |
| Componentes reutilizables | `Card`, `Bar`, `Notes`, `Scale`, `Field`, `VoiceText`, `HabitList`, `LevelCard`, `LineC`, `BarC`, `PieC`, `Candles` |
| Tokens | 11 variables CSS en `:root`. No hay escala tipográfica, de espaciado, de radios ni de elevación |
| Funciones reales con datos aprovechables para motivar | Cumplimiento diario y semanal por área, medallas, XP/nivel/liga, rachas por hábito, check-ins (sueño, energía, ánimo, estrés, enojo, prioridad), entrenamientos y 1RM estimado, calorías y proteína, peso/grasa, horas de estudio por tipo, exámenes, ahorro y portafolio, contactos sociales, diario, castigos y permitidos, revisiones semanales |

### 1.2 Hallazgos

Cada hallazgo indica dónde está en el código. Las capturas de la versión actual están en el historial del chat.

#### Crítico

| # | Hallazgo | Evidencia |
|---|---|---|
| C1 | **109 emojis usados como iconos** en 13 archivos: navegación, títulos de tarjetas, áreas, medallas, avisos y recomendaciones | `App.tsx` (8), `logic.ts` (22), `Fisico.tsx` (14), `Habitos.tsx` (11), `Vida.tsx` (10), `Hoy.tsx` (10), `seed.ts` (9)… Se ven distintos en iOS y en Windows y no tienen estados ni un grosor de trazo controlable |
| C2 | **No hay tipografía definida.** La pila es `-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto`, pero Inter nunca se carga: en iPhone se ve SF y en Windows Segoe UI, así que la app cambia de identidad según el dispositivo. No hay cifras tabulares, así que los números "bailan" | `styles.css:17` |
| C3 | **Los campos con letra de 15 px hacen que Safari en iPhone haga zoom al tocarlos**: iOS amplía cualquier campo con letra menor a 16 px y rompe el diseño en cada carga de datos. Es el uso principal de la app | `styles.css:17-18` (`font: inherit` hereda 15 px) |
| C4 | **"Hoy" mide unos 7.100 px de alto (8,4 pantallas de iPhone).** Mezcla resumen, 23 hábitos, recomendaciones, recuerdos, coach y dos formularios completos de check-in, con 6 escalas de 5 a 10 botones cada una. No hay una jerarquía que diga qué importa ahora | Medido con Playwright a 390 px. `Hoy.tsx` renderiza 6 `<Scale>` |
| C5 | **Accesibilidad de teclado nula.** No hay ningún estilo `:focus`/`:focus-visible`. Hay un solo atributo `aria-*` en todo el proyecto. Los botones de hábito son solo glifos (`✓ ½ ✕`) y los de Revisión y Ajustes, solo emojis | `grep focus styles.css` → 0 · `grep aria-` → 1 |

#### Alto impacto

| # | Hallazgo | Evidencia |
|---|---|---|
| A1 | **Paleta saturada tipo "arcoíris"** (ámbar, verde neón, rojo, azul, violeta, turquesa…) usada sin jerarquía semántica | `charts.tsx:6` (`PALETTE` de 9 colores), `styles.css:1-14` |
| A2 | **El color de acento cambia con la liga** a partir del nivel 4: toda la app cambia de identidad por una mecánica de juego | `App.tsx:39` |
| A3 | **Señales punitivas visualmente agresivas**: un cuadrado rojo para "malo", fondo rojo para "no hecho" y el podio entero en rojo. Comunican fracaso más que dirección | `logic.ts` (`MEDAL_ICON`), `.tri button.on-no` |
| A4 | **Áreas táctiles de 34 px**, por debajo de los 44 px que recomienda Apple: botones de hábitos, escalas y botones `sm` | `styles.css:54, 59` |
| A5 | **Diálogos nativos `confirm()`/`prompt()`** (7 llamadas) para crear y borrar. Rompen la experiencia en la PWA instalada. Borrar una foto se hace tocando la imagen, sin ninguna indicación | `Habitos.tsx`, `Estudio.tsx:122`, `Fisico.tsx:208`, `Ajustes.tsx` |
| A6 | **Hay 3 niveles de navegación mezclados**: barra inferior, botones de encabezado y pestañas internas. Revisión y Ajustes quedan escondidos detrás de dos emojis | `App.tsx` |
| A7 | **Sin sistema de componentes**: 62 estilos *inline* (`style={{…}}`) con márgenes y tamaños arbitrarios. Cada pantalla resuelve su propio espaciado | `grep style={{` → 62 |
| A8 | **Gráficos sin estilo propio**: grillas punteadas, ejes grises genéricos y colores de la paleta saturada. Los tooltips de Recharts no siguen la identidad | `charts.tsx` |

#### Impacto medio

| # | Hallazgo | Evidencia |
|---|---|---|
| M1 | **La app arranca con una pantalla negra**: mientras carga IndexedDB devuelve `null`, sin un estado de carga | `App.tsx:41` |
| M2 | **Los estados vacíos son una línea de texto gris** ("Sin datos todavía") sin explicar qué hacer ni dar un botón para hacerlo | `charts.tsx` (`Candles`), varias páginas |
| M3 | **Sin feedback inmediato**: marcar un hábito no anima nada ni muestra los XP ganados, y guardar un formulario no confirma | `HabitList.tsx` |
| M4 | **Inglés incompleto**: el diccionario solo cubre unos 30 textos (navegación y algunos títulos). El resto de la app está fija en español, así que el modo inglés queda a medias | `i18n.ts` vs. textos en `pages/*` |
| M5 | **En escritorio la barra inferior sigue abajo**, en una columna de 920 px que desperdicia la pantalla de la PC | `styles.css:19, 61, 77` |
| M6 | **Las tablas** de Finanzas, Físico y Estudio no se adaptan a 390 px y mezclan `input` dentro de celdas | `Finanzas.tsx`, `Estudio.tsx` |
| M7 | **Paquete JS de 834 KB** (237 KB gzip) en un solo archivo: Recharts y el SDK de Anthropic cargan aunque no se usen al abrir | `dist/assets/index-*.js` |
| M8 | **Bordes de campos con contraste 1,2:1** (`#243046` sobre el fondo del campo `#1a2333`). WCAG 1.4.11 pide 3:1 para identificar controles | `styles.css:38` |

#### Mejora opcional

| # | Hallazgo |
|---|---|
| O1 | No hay *haptics* ni sonido sutil al completar (Safari no tiene vibración; se puede compensar con microanimación) |
| O2 | No hay atajos de teclado en escritorio (por ejemplo, abrir "Registrar" con una tecla) |
| O3 | Las fotos de progreso no tienen una vista para comparar imágenes con un deslizador |
| O4 | El ícono de la app es un dibujo simple, no un isotipo |

### 1.3 Lo que funciona y conviene conservar

- La lógica de negocio (`logic.ts`) está separada de la interfaz: el rediseño puede cambiar la presentación sin tocar reglas.
- La estructura por áreas, el ciclo diario (check-in → hábitos → revisión) y el sistema de recomendaciones son sólidos.
- Las medallas, el XP y los castigos **los pediste vos** en el cuestionario (preguntas 32–36). No propongo eliminarlos, sino **reexpresarlos con sobriedad**: etiquetas metálicas discretas en lugar de emojis y progreso lineal en lugar de "juego".

### 1.4 Sobre tu paleta propuesta (medido)

| Par | Contraste | Veredicto |
|---|---|---|
| Texto principal `#F5F6F8` / `#08090B` | 18,4:1 | ✓ |
| Secundario `#A0A6B2` / `#101216` | 7,7:1 | ✓ |
| **Terciario `#707783` / `#171A20`** | **3,9:1** | ✗ No llega a 4,5:1 para texto chico. **Ajuste: `#7C828E` → 4,5:1** sobre superficie elevada y 5,2:1 sobre el fondo |
| Borde `#292D35` / `#08090B` | 1,4:1 | Sirve para separar tarjetas (decorativo), **no para delimitar campos**. Para inputs: `#60676F` → 3,3:1 sobre la superficie y 3,0:1 sobre la elevada |

---

## FASE 2 · Tres direcciones visuales

Las tres maquetas muestran **la misma pantalla "Hoy" con datos reales del modelo** (hábitos, agenda, prioridad, sueño, proteína, ahorro, amigos, avisos, coach) y la misma navegación existente. Lo que cambia es solo la identidad visual.

También proponen una **reestructuración de "Hoy" común a las tres**, basada en el hallazgo C4:

1. **Encabezado**: fecha y saludo. Revisión y Ajustes pasan a iconos vectoriales con etiqueta accesible.
2. **Resumen del día**: anillo con los hábitos hechos sobre el total, cumplimiento semanal con su medalla y progreso al próximo nivel.
3. **Ahora / Prioridad**: el próximo bloque de la agenda y la prioridad n.º 1 del check-in, que hoy están perdidos en la página.
4. **Pulso**: 4 métricas reales con meta (sueño, proteína, ahorro, amigos).
5. **Hábitos de hoy**: solo los pendientes, con un control de check único (tocar = hecho, mantener = mínimo).
6. **Avisos** y **Coach**.
7. Los **check-in** salen del scroll y pasan a una hoja inferior que se abre desde el resumen o automáticamente a la mañana y a la noche.

| | **A · Precision Minimal** | **B · Luminous Professional** | **C · Modern Editorial** |
|---|---|---|---|
| Maqueta | [`mockup-a.html`](design/mockups/mockup-a.html) | [`mockup-b.html`](design/mockups/mockup-b.html) | [`mockup-c.html`](design/mockups/mockup-c.html) |
| Concepto | Una planilla perfecta: sin tarjetas, solo líneas finas, grillas y blanco sobre negro | Instrumental de precisión: superficies negras con un contorno de luz y profundidad medida | Revista de diseño: la tipografía es la protagonista, con números grandes y mucho aire |
| Paleta | Negro `#08090B`, grises fríos, **sin color de acento** (blanco). Ámbar solo para advertencias | Negro + superficies `#0F1114`–`#15181D`. **Acento azul hielo `#8EA8FF`** (8,7:1), éxito `#5FBF92`, advertencia `#E0A852` | Negro cálido `#0A0A0B`, marfil `#F2EFE9`, acento champagne `#E9D3B0` |
| Tipografía | Inter (variable, con cifras tabulares) | **Geist** para la interfaz + **Geist Mono** para métricas | **Instrument Serif** para títulos y números + Inter Tight |
| Iconos | Lucide, trazo 1,75, sin contenedor | Lucide, trazo 1,75, contenedor de 30 px | Lucide dentro de círculos con línea fina |
| Superficies | Ninguna: grilla con divisores de 1 px | Contorno con gradiente (luz arriba), sombra larga y difusa, brillo radial muy tenue en la tarjeta principal | Líneas horizontales gruesas, sin contenedores |
| Interacciones | Cambios de opacidad y subrayados. Movimiento mínimo | El borde se ilumina al pasar el cursor o al enfocar. El anillo se completa con animación. El check aparece con un brillo breve | Transiciones de desplazamiento de texto y números que cuentan hasta su valor |
| Ventajas | Máxima claridad y velocidad. Envejece muy bien | La identidad más reconocible. Se siente "premium" y tecnológica | La más distintiva y emocional |
| Riesgos | Puede sentirse fría y **no resolver tu crítica de motivación** | Si se aplica en todas partes se vuelve "gamer". Exige disciplina | El serif reduce la densidad. Los números en serif se leen peor en tablas y gráficos. Poco práctica para cargar datos rápido |
| Encaje con Producti-Me | Medio | Alto | Medio-bajo: tu uso es diario y de carga rápida |

### Recomendación: **B con la limpieza de A** ([`mockup-r.html`](design/mockups/mockup-r.html))

Coincide con tu preferencia, pero con una regla que la hace sostenible: **la luz se gana**.

- **El contorno luminoso y el brillo solo aparecen en lo que importa ahora**: el resumen del día, el elemento con foco o hover y el estado "completado". El resto son superficies planas `#0E1013` con un borde de 1 px `#1E2127`. Así la luz comunica jerarquía, no decoración. Si todo brilla, nada brilla, y ahí está el riesgo "gamer" que querés evitar.
- **Un solo acento** (`#8EA8FF`), reservado para el progreso, la navegación activa, la acción principal y lo completado. El verde y el ámbar quedan solo para estados.
- **Geist + Geist Mono, pero con mono solo en datos chicos** (unidades, XP, fechas técnicas). En la maqueta B, el mono en cifras grandes se ve ancho ("1. 200"). En la recomendada, las cifras grandes van en Geist con cifras tabulares.
- **Medallas metálicas discretas** (oro `#D4B26A`, plata `#C2C7D0`, bronce `#B98563`) como etiquetas de texto. "Malo" pasa a un estado neutro "Bajo meta", con el castigo explicado en texto. Es exigente, como pediste, sin rojo de alarma.
- **Barra inferior de 5 destinos** en vez de 6 + 2 escondidos: Hoy · Hábitos · **Registrar** (botón central que abre una hoja con comida, entrenamiento, gasto, estudio, contacto y diario, es decir, los formularios que ya existen) · Progreso (Físico, Estudio y Finanzas como pestañas) · Vida. Revisión pasa a "Progreso" y Ajustes al encabezado. Es la única propuesta de navegación que cambia la estructura. **Necesito tu aprobación específica.**

### Cómo sería la sensación de "motivación" (solo con datos que ya existen)

| Hoy | Propuesta |
|---|---|
| Lista larga de pendientes | Anillo del día + "Ahora / Prioridad": abrir la app responde en 2 segundos "¿qué hago ahora?" |
| XP como número grande | Progreso al próximo nivel como barra fina, con el XP ganado apareciendo junto al check (+15) durante 600 ms |
| Podio con emojis | Medallas metálicas sobrias + tendencia de las últimas 4 semanas en la revisión |
| Recuerdos en texto plano | "Hace un mes", con la cifra comparada (peso, % de grasa, ahorro) en una línea |
| Pantalla negra al abrir | Pantalla de carga con la marca (150–300 ms) |

### Lo que NO voy a hacer

- Agregar estadísticas, rachas o insignias que no salgan de tus datos reales.
- Animaciones de más de 250 ms en interacciones frecuentes. Todo respetará `prefers-reduced-motion`.
- Cambiar reglas de negocio, borrar datos o migrar el almacenamiento.

---

## Próximo paso (FASE 3)

Necesito tu aprobación sobre:

1. **Dirección**: ¿la recomendada (B + A)? ¿Algún ajuste de acento (azul hielo) o de tipografía?
2. **Navegación de 5 destinos con "Registrar" central**: ¿sí o no?
3. **Check-ins en hoja inferior** en vez de en el scroll de "Hoy": ¿sí o no?
4. **Medallas**: ¿te sirve "Bajo meta" en lugar de "malo"? Los castigos se mantienen igual.

Con eso armo el sistema de diseño (FASE 4) y lo implemento pantalla por pantalla (FASE 5).
