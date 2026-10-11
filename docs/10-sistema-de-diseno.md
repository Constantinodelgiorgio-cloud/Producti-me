# 10 · Sistema de diseño · Producti-Me "Precision Dark"

> Fase 4. Base: dirección B + A aprobada, prototipo v2 ([`design/prototipo/`](design/prototipo/index.html)).
> Decisiones confirmadas: **Hoy = Enfoque (A) con Línea (B) como vista secundaria** · **Navegación móvil = Fijada** · **Deslizar a la izquierda = No hecho**.
> Pendiente de confirmar: horizonte como firma y azul hielo (punto 3 de la ronda anterior).

---

## 1. Principios

1. **La luz se gana.** El brillo solo indica progreso, foco o completado; nunca decora.
2. **Un acento.** Azul hielo para progreso, navegación activa, acción principal y completado. El verde y el ámbar son estados, no acentos.
3. **Primero la acción.** Cada pantalla responde primero "¿qué hago?", después "¿cómo voy?".
4. **Movimiento con función.** Cada animación confirma, orienta o muestra un cambio. Nada se anima en reposo salvo la cuenta regresiva.
5. **Exigente sin alarma.** "Bajo meta" y "No hecho" son neutros; los castigos se explican en texto.

## 2. Tokens

### 2.1 Color

| Token | Valor | Uso | Contraste |
|---|---|---|---|
| `--bg` | `#08090B` | Fondo de la app | — |
| `--bg-2` | `#0B0C0F` | Barra lateral (escritorio) | — |
| `--surface` | `#0E1013` | Paneles, filas, campos | — |
| `--surface-2` | `#13151A` | Hover, chips, iconos de fila | — |
| `--surface-3` | `#1A1D22` | Seleccionado, toast | — |
| `--line` | `#1E2127` | Divisores y bordes de paneles (decorativos) | 1,2:1 |
| `--line-2` | `#2A2E36` | Bordes de botones secundarios, foco suave | 1,4:1 |
| `--control` | `#60676F` | **Borde de campos y casillas** (WCAG 1.4.11) | 3,3:1 sobre `--surface` |
| `--t1` | `#F5F6F8` | Texto principal | 18,4:1 |
| `--t2` | `#A0A6B2` | Texto secundario | 7,8:1 |
| `--t3` | `#7C828E` | Texto terciario y etiquetas | 4,9:1 sobre `--surface` |
| `--accent` | `#8EA8FF` | Acento único | 8,3:1 sobre `--surface` |
| `--accent-2` | `#C3D0FF` | Cifras sobre acento suave, punta del horizonte | — |
| `--accent-ink` | `#0A0D18` | Texto sobre acento | 8,5:1 |
| `--accent-soft` | `rgba(142,168,255,.10)` | Fondos seleccionados | — |
| `--accent-glow` | `rgba(142,168,255,.45)` | Halos y anillos de foco | — |
| `--success` | `#5FBF92` | Meta cumplida | 8,5:1 |
| `--warn` | `#E0A852` | Requiere atención, castigo pendiente | 9,0:1 |
| `--danger` | `#E5766F` | Error de validación (no para "No hecho") | — |
| `--gold` / `--silver` / `--bronze` | `#D4B26A` / `#C2C7D0` / `#C08C6A` | Medallas | ≥ 6,5:1 |

**Gráficos:** serie principal en gradiente del acento (`#7C98F3 → #B4C5FF`), series secundarias en grises (`#C9D0DC`, `#5A616C`), meta en `--success` punteado. **No se usa la paleta arcoíris actual.** Si un gráfico necesita más de 3 series, se separa en pequeños múltiplos.

### 2.2 Tipografía

Familias: **Geist** (interfaz) y **Geist Mono** (etiquetas grabadas, unidades, horas, XP). Ambas son de licencia libre (SIL OFL). Se sirven desde Google Fonts con la pila de respaldo `system-ui, -apple-system, 'Segoe UI'`. Las cifras siempre son tabulares (`font-variant-numeric: tabular-nums`).

| Rol | Familia | Tamaño / interlineado | Peso | Tracking |
|---|---|---|---|---|
| Cifra principal | Geist | 44 / 1 | 600 | −0,045 em |
| Título de pantalla | Geist | 26 / 1,15 | 600 | −0,03 em |
| Cifra de tarjeta | Geist | 28 / 1 | 600 | −0,035 em |
| Título de bloque ("Ahora") | Geist | 21 / 1,2 | 600 | −0,025 em |
| Valor de señal | Geist | 19 / 1,1 | 600 | −0,02 em |
| Encabezado de sección | Geist | 15 / 1,3 | 600 | −0,01 em |
| Cuerpo | Geist | 15 / 1,45 | 400–500 | 0 |
| Fila (nombre de hábito) | Geist | 14,5 / 1,3 | 500 | 0 |
| Secundario | Geist | 13,5 / 1,45 | 400 | 0 |
| Pie / ayuda | Geist | 12 / 1,4 | 400 | 0 |
| Etiqueta grabada | Geist Mono | 10,5 / 1 | 500 | +0,14 em, mayúsculas |
| Unidad / hora / XP | Geist Mono | 11,5 / 1 | 400 | 0 |
| **Campos de texto** | Geist | **16** | 400 | 0 (evita el zoom de iOS) |

### 2.3 Espaciado (base 4 px)

`4 · 6 · 8 · 12 · 16 · 20 · 24 · 28 · 36 · 48`. Margen lateral de la página: **16 px en móvil, 36 px en escritorio**. Separación entre paneles: 12 px (móvil), 20 px (escritorio). Separación entre secciones: 26 px. Relleno de panel: 16–20 px.

### 2.4 Radios

| Token | Valor | Uso |
|---|---|---|
| `--r-1` | 8 px | Elementos chicos, anillo de foco |
| `--r-2` | 12 px | Botones, campos, filas, tarjetas de registro |
| `--r-3` | 16 px | Paneles |
| `--r-4` | 22 px | Panel principal (horizonte) |
| hoja | 26 px (arriba) | Hojas inferiores |
| píldora | 99 px | Chips, medallas, casillas |

### 2.5 Elevación y luz

| Nivel | Tratamiento | Dónde |
|---|---|---|
| 0 · Plano | `--surface` + borde `--line` | Paneles comunes, filas |
| 1 · Elevado | Gradiente `#121419 → #0D0F12` + borde con gradiente de luz (blanco 10 % → 2,5 %) + sombra `0 24px 48px -28px` | **Solo** el panel principal de Hoy |
| 2 · Flotante | Gradiente `#14161B → #0E1013` + borde de luz 16 % + sombra `0 -24px 60px -20px` | Hojas, paleta de comandos, toast |
| Horizonte | Línea de 1 px: luz `#C3D0FF → --accent` hasta el progreso, punto `#E6ECFF` con halo en la punta. Completo: línea entera + halo superior | Panel principal; isotipo |
| Foco | `0 0 0 1px --bg, 0 0 0 3px --accent-glow` | Todo control enfocable |

### 2.6 Movimiento

| Token | Valor | Uso |
|---|---|---|
| `--d-1` | 120 ms | Hover, presionado, cambios de color |
| `--d-2` | 220 ms | Check, entrada de pantalla, toast |
| `--d-3` | 360 ms | Horizonte, barras, hojas, deslizamiento a un detalle |
| `--ease` | `cubic-bezier(.2,.8,.2,1)` | Por defecto |
| `--spring` | `cubic-bezier(.34,1.3,.5,1)` | Hojas y toast (rebote leve) |

Con `prefers-reduced-motion: reduce`, todas las duraciones pasan a 1 ms. Las cifras no cuentan, y las transiciones entre pantallas se vuelven un corte.

### 2.7 Iconos

**Lucide** (licencia ISC), único set. Trazo 1,75 (2,2 en el botón ＋, 2,6 en el check). Tamaños de 14, 16, 19 y 21 px. Siempre `aria-hidden` con texto o `aria-label` en el control. **Ningún emoji en la interfaz**: los 109 actuales se reemplazan según la tabla de la sección 5.

## 3. Componentes

| Componente | Variantes | Estados | Reemplaza en la app actual |
|---|---|---|---|
| **Botón** | principal, secundario, fantasma; normal y chico | normal, hover, activo (escala .97), foco, deshabilitado | `.btn`, `.btn.primary`, `.btn.ghost` |
| **Botón de ícono** | 40 × 40 | normal, hover, foco | Botones con emoji del encabezado |
| **Campo** | texto, número, fecha, hora, búsqueda | normal, hover, foco, error (borde + mensaje), deshabilitado | `input`, `select`, `textarea` |
| **Escala** | 1–5 segmentada, 1–10 deslizador | sin elegir, elegido, foco | `Scale` (10 botones) |
| **Casilla de hábito** | — | pendiente, mínimo (medio lleno), hecho (check dibujado + halo), no hecho (raya) | `.tri` (3 botones ✓ ½ ✕) |
| **Fila de hábito** | completa, compacta | igual que la casilla + arrastre (derecha = hecho, izquierda = **no hecho**) | `HabitList` |
| **Panel** | plano, elevado (horizonte) | — | `Card` |
| **Señal** | — | colapsada, expandida (semana) | Bloques de métricas de Hoy |
| **Barra** | acento, neutral, cumplida, con proyección rayada | — | `Bar` |
| **Anillo** | 26 / 64 / 76 px | — | Nuevo |
| **Barra de ticks** | — | marca pendiente, mínimo, hecho | Nuevo |
| **Medalla** | Oro, Plata, Bronce, Bajo meta, Sin datos | — | Emojis 🥇🥈🥉🟥 |
| **Chip / filtro** | — | normal, seleccionado | `.chip` |
| **Aviso** | info, atención | con acción | `Notes` (avisos) |
| **Hoja inferior** | registrar, check-in, más, confirmación | abriendo, abierta, arrastrando, cerrando; en escritorio = diálogo | `confirm()` y `prompt()` nativos |
| **Toast** | confirmación, con Deshacer | visible 4,2 s | Nuevo |
| **Estado vacío** | ícono + título + explicación + acción | — | Textos grises sueltos |
| **Barra inferior** | Fijada: Hoy · Hábitos · ＋ · [fijada] · Más | activa (ícono acento + trazo luminoso) | `.nav` |
| **Barra lateral** | escritorio | activa, hover, atajo visible | Nuevo |
| **Paleta de comandos** | escritorio | abierta, resultado seleccionado | Nuevo |
| **Selector Enfoque / Línea** | segmentado | — | Nuevo (Hoy) |

## 4. Reglas de diseño adaptable

| Ancho del contenedor | Diseño |
|---|---|
| < 980 px | Una columna, barra inferior Fijada, hojas desde abajo, deslizamiento activo |
| ≥ 980 px | Barra lateral de 236 px con **todas** las pantallas, tablero de 2 columnas (principal + columna lateral fija), hojas como diálogo centrado, paleta ⌘K, atajos R y 1–6 |

Se usan *container queries*, así el mismo componente funciona dentro del marco móvil y en escritorio. Las áreas táctiles miden **44 px como mínimo** (las casillas tienen 30 px visibles y 44 px de área). Se respetan las zonas seguras del iPhone.

## 5. Reemplazo de emojis (muestra)

| Hoy | Lucide |
|---|---|
| 🏠 ✅ 🏉 📚 💵 🤝 (navegación) | `house` `list-checks` `dumbbell` `book-open` `wallet` `users` |
| 🗓️ ⚙️ | `calendar-check` `settings-2` |
| 🛌 🧠 ✨ 🛠️ 🌍 (áreas) | `heart-pulse` `brain` `scan-face` `hammer` `compass` |
| 🥇 🥈 🥉 🟥 | Componente Medalla |
| ⚠️ 📅 🍔 💡 🕰️ (avisos) | Punto de severidad + texto |
| 🎙️ ⏹️ | `mic` `square` |

## 6. Accesibilidad (criterios de aceptación)

- Contraste de texto ≥ 4,5:1 (≥ 3:1 para texto grande y bordes de controles).
- Todo control alcanzable con Tab, con un foco visible y una etiqueta accesible.
- Las hojas atrapan el foco, se cierran con Esc y devuelven el foco al control que las abrió.
- Gestos siempre con una alternativa por botón.
- `prefers-reduced-motion` respetado.
- Los estados no dependen solo del color: el check tiene forma, el mínimo está medio lleno y el "no hecho" lleva una raya.

---

## 7. Plan de implementación (Fase 5, cuando lo apruebes)

Por etapas. Cada una se puede publicar sola y no cambia reglas ni datos.

| # | Etapa | Contenido | Riesgo |
|---|---|---|---|
| 1 | **Base** | Tokens, Geist, Lucide (solo los íconos usados), reset, campos a 16 px, foco visible, componentes Botón, Campo, Panel, Barra, Medalla, Toast y Hoja | Bajo |
| 2 | **Navegación** | Barra Fijada + hoja Más + barra lateral de escritorio + ⌘K, atajos y transiciones | Medio: cambia rutas |
| 3 | **Hoy** | Enfoque (A) + vista Línea (B). La Línea requiere agregar el campo opcional "momento" a cada hábito, con un valor por defecto asignado automáticamente y editable | Medio: un campo nuevo, sin migración destructiva |
| 4 | **Hábitos** | Fila con casilla única y deslizamiento, semana con anillos, podio con medallas, castigos y permitidos sin diálogos nativos | Medio |
| 5 | **Registrar** | Hoja central con "Repetir lo último" + formulario de Comida con proyección | Bajo |
| 6 | **Resto** | Físico, Estudio, Finanzas, Vida, Revisión y Ajustes con los mismos componentes; gráficos con la nueva paleta | Alto en volumen, bajo en lógica |
| 7 | **QA** | Revisión de emojis (0), contraste, teclado, lector de pantalla, 390 / 768 / 1440 px, rendimiento (Recharts cargado solo donde se usa) y recorrido completo de funciones | — |

Al final de cada etapa: compilación y tipos sin errores, capturas a 390 y 1440 px, y una prueba automatizada que recorre la etapa en el navegador.
