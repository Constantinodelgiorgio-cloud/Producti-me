# 13 · Evolución premium · Implementación

> Estado: **implementado y publicado**. Base: propuesta [11](11-evolucion-premium-propuesta.md) con tus respuestas (B.9).

## Qué cambió, pantalla por pantalla

| Área | Cambio |
|---|---|
| **Navegación** | Barra inferior **Hoy · Hábitos · ＋ · Coach · Áreas** (opción A). La línea de luz se desliza entre pestañas. Al bajar en una pantalla aparece una barra superior con el nombre de la sección. En escritorio, barra lateral con atajos 1–7. |
| **Identidad por sección** | Cada sección tiene su tono: Hoy hielo, Coach plata, Físico cobre, Estudio índigo, Finanzas jade, Vida malva. El cambio es **gradual** (900 ms, color interpolado). Nunca hay saltos bruscos. Se aplica al halo superior, al horizonte, a los íconos y a la pestaña activa. Los botones de acción mantienen el azul hielo. |
| **Barra inferior** | Antes medía 100 px y el ＋ estaba subido. Ahora mide 52 px + zona segura, con íconos centrados y el ＋ en la línea de la barra. El centro del ＋ quedó a unos 60 px del borde en un iPhone con indicador de inicio (antes, unos 68). |
| **Hoy** | Tres niveles. Arriba: anillo del día, tarjeta **Ahora** (bloque actual, cuenta regresiva, prioridad, ticks del día), **banda del castigo** más urgente y **Para completar** (6 tarjetas grandes que se marcan desde ahí). Debajo, la entrada al Coach. Más abajo: check-ins, señales, atención, recomendaciones y recuerdos. Subpestañas **Ahora · Agenda**. Cuando el día está completo, la tarjeta cambia de estado y el horizonte se ilumina una vez. |
| **Coach** | Página propia. Entiende lenguaje natural y opera los datos reales con herramientas: propone cambios de agenda, excusas, momentos y prioridad en una **tarjeta de propuesta** (Aplicar · Editar · Descartar · Revertir). Registra comidas, gastos, contactos y hábitos directamente, con Deshacer. Tiene historial de cambios, sugerencias según el día y dictado por voz. |
| **Plan por día** | Nuevo `planDia`: agenda, excusas y momentos para una fecha puntual, sin tocar la agenda base. Hoy, Agenda, medallas y el Coach leen de ahí. |
| **Excusas** | Tienen que estar fundamentadas: tipo de causa (externa, compromiso real, salud o fuerza mayor) más un motivo específico (al menos 5 palabras). Se rechazan "me dormí", "no tenía ganas", "me olvidé" y similares. Si hiciste una **alternativa** ("el gimnasio cerró pero salí a correr"), cuenta como versión mínima y suma media XP. Un hábito excusado sin alternativa no cuenta para las medallas. Todas las excusas aparecen en la revisión semanal. |
| **Hábitos** | Grilla de íconos agrupada por momento del día. **Tocar** marca hecho. **Mantener presionado** (o ⋯) abre: versión mínima, no hecho, excusar, cambiar ícono. Las tarjetas muestran el dato real cuando existe (proteína 84/200 g, minutos de estudio, horas de sueño, comidas). La vista Lista se conserva, con deslizar. |
| **Castigos** | Vencen a las **48 h**. Un reloj de arena muestra el tiempo que se consume, ordenados del más urgente al menos urgente. Están presentes en la banda de Hoy, en un número sobre la pestaña Hoy, en el número del ícono de la app instalada y en una hoja de detalle (motivo, cuenta regresiva, evidencia opcional, "Lo cumplí"). **Si vence**: 72 h sin ganar XP y sin permitidos. |
| **Comida** | Base de **308 alimentos** argentinos y comunes, cada uno con porciones reales y alias (palta = aguacate). Búsqueda que tolera acentos y errores de tipeo, con el alimento típico primero ("milanesa" → milanesa de carne). Porción + cantidad o gramos, macros al instante, momento (desayuno…cena), recientes, favoritos, **comidas guardadas** y alimentos propios. |
| **Finanzas** | Dos espacios: **Cartera diaria (pesos)** y **Patrimonio (USD)**. Cartera: gastado del mes, ingresos, neto, presupuesto por categoría, gasto por cuenta (Efectivo, Mercado Pago, Santander, Débito Visa, Crédito Visa), movimientos con su origen, **comprobantes** (foto, PDF o texto pegado, leídos por IA) y la bandeja **Por confirmar**. Patrimonio: ahorro, rendimiento, **posiciones**, **aportes y retiros** en USD (el rendimiento ya no depende de una categoría de gasto) y velas. |
| **Correo** | Script de Google en tu propia cuenta ([guía](12-correo-de-pagos.md)). Al abrir la app y cada 10 minutos se leen los pagos de Mercado Pago, Santander y Visa. Lo claro se anota solo; lo dudoso queda para confirmar. Nunca se anota dos veces. |
| **Estudio** | **Facultad**: cada materia con AE1 y AE2 (entregado / incompleto), AE3 parcial, AE4 integrador y Final (notas de 1 a 10, validadas). **Rutas separadas**: Inglés, Lectura, IA y Programación, cada una con objetivo de largo plazo y una **meta por mes**. **Evidencia** en cada sesión (texto, link, foto o commit). Sin evidencia la sesión rinde la mitad de XP; con evidencia suma +25, y +40 si está verificada (un commit público de GitHub de hoy se verifica solo). **Mini test mensual** de 5 preguntas generado por el coach a partir de la meta y de lo que registraste: aprobar (70 %) vale +150 XP. |
| **Diario** | Modo escritura a pantalla completa con serif de lectura (Newsreader), borrador automático y dictado. Tres modos: **Libre**, **Guiado** (3 preguntas) y **Profundo** (tema: soledad, enojo, bucle, orgullo, futuro o amistad; o una pregunta del coach armada solo con los números de tus check-ins). Ánimo de 1 a 10 y emoción. Las entradas se ven como páginas y se leen en el mismo formato. |
| **Áreas** | Hub con 4 tarjetas grandes con identidad (Físico, Estudio, Finanzas, Vida), su dato principal y progreso, más accesos a Comida, Revisión y Ajustes. |
| **Ícono** | "Horizonte": negro profundo, la línea del horizonte iluminada hasta un punto de luz. Versiones de 512, 192, 180 (iPhone) y maskable. |

## Datos: migración v1 → v2

- La versión del almacenamiento pasó de 1 a 2 con una migración que **solo agrega** campos.
- Antes de migrar se guarda una **copia completa** en el dispositivo. Se descarga desde Ajustes → Tus datos → "Descargar respaldo v1".
- Movimientos ya cargados → marcados como **pesos** (eran gastos diarios; el formulario decía USD por error).
- La nota de cada materia → pasa a "Final".
- Castigos pendientes → reciben 48 h desde la actualización (no vencen de golpe).
- Se agrega el hábito "Programación 30 min" (lunes a viernes) si no existía.
- Importar una copia vieja desde Ajustes también la migra.

## Verificado

- `tsc` sin errores y `vite build` correcto.
- Recorrido automatizado en Chromium a 390 px (iPhone 13, táctil) y a 1440 px:
  - migración de una copia v1 real: versión 2, respaldo creado, monedas, notas, vencimientos;
  - tocar y mantener presionado en la grilla; excusa floja rechazada; excusa con alternativa aceptada;
  - banda de castigo y su hoja;
  - búsqueda de comida (palta, aguacate, carne, milanesa, café con leche, yogurt, empanadas, fernet) y guardado con porción;
  - diario guiado; comprobante por texto pegado → "Por confirmar".
- **Coach con la API simulada**: "hoy no tengo facultad" → propuesta de 2 cambios → aplicar → la agenda de hoy cambia → el coach recibe "Aplicada" → revertir restaura la agenda. "Almorcé milanesa con puré" → 2 alimentos registrados con Deshacer.
- Sin errores de consola y sin desplazamiento horizontal en ninguna pantalla.

## No verificado / límites

- **Con la API real de Anthropic**: el recorrido usó respuestas simuladas con el mismo formato. La primera conversación real puede necesitar ajustar el texto del sistema.
- **iPhone físico**: zona segura, gestos de mantener presionado, número en el ícono (requiere la app instalada y iOS 16.4 o posterior) y desenfoques.
- **Correos reales de Mercado Pago y Santander**: los patrones se escribieron sin muestras reales. Lo que no entiendan va a "Por confirmar" (o a la IA). Mandame un par de correos de ejemplo y los ajusto.
- **Valores nutricionales**: son de referencia (ARGENFOODS y USDA, más recetas típicas para los platos). Revisá los que más comés y corregilos con un alimento propio si hace falta.
- Notificaciones push y sincronización entre dispositivos siguen en la fase 2 (necesitan servidor).
