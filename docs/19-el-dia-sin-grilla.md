# 19 · El día sin grilla: obligatorias y lo que va pasando

Los días no son fijos: una clase se suspende, el gimnasio pasa a la noche o aparece un turno médico.
La vista **Agenda** repartía cada hábito en un horario sugerido (08:10 movilidad, 08:25 skincare…);
cuando el día cambiaba, todo quedaba desfasado. Ahora la pestaña de Hoy se llama **El día** y tiene tres partes.

## Obligatorias de hoy

Lo que pasa sí o sí, con o sin hora:

- Los bloques de la agenda (facultad, gimnasio, rugby, marmolería), con su hora.
- Los hábitos marcados como **obligatorios** (no negociables). Se marcan desde el hábito (tres puntos → Obligatorio) o en Editar hábitos → Tipo.
- Lo que agregás en el momento: "Agregar obligatoria", con hora opcional, **solo hoy** o **todos los martes** (el día de la semana actual).

Cada obligatoria se marca hecha con el círculo. Con los tres puntos podés:

- cambiarle la hora (solo hoy);
- dejarla sin hora;
- marcar que hoy no se hizo;
- sacarla de hoy (con deshacer);
- sacarla de todos los martes.

Si una obligatoria con hora pasó hace más de 30 minutos sin marcarse, aparece un aviso suave. No es un castigo: el día cambió y se acomoda.

El hábito de entrenar aparece adentro del primer bloque de gimnasio, rugby o partido que siga pendiente. El de marmolería aparece adentro de su turno.

## Lo que va pasando

Un registro del día con hora, con lo más reciente arriba:

- **Tus notas rápidas**: nota, imprevisto, cambio de plan o algo bueno. Se borran con la cruz y tienen deshacer.
- **Lo que ya registraste en la app**, sin cargar nada dos veces:
  - a qué hora te despertaste;
  - los hábitos y obligatorias que marcaste (la app guarda la hora en que los marcaste);
  - las comidas numeradas;
  - entrenamientos y sesiones de Cuerpo;
  - estudio, diario, gastos e ingresos;
  - contactos y tareas hechas.

Tocar un evento lleva a su sección.

Si una nota contiene una frase de riesgo, se abren las líneas de ayuda, igual que en el diario.

El Coach recibe las notas del día y qué obligatorias están hechas, para proponer cambios con el contexto real.

## Cuando puedas

Los hábitos flexibles, sin horario fijo:

- Se ordenan para que primero aparezca lo que encaja con este momento. La mañana, la tarde y la noche siguen existiendo como **sugerencia**, no como franja.
- Se muestran 6 y el resto queda detrás de "N más para hoy".
- Lo marcado baja a "Marcados".

En **Hábitos**, la vista de íconos ya no agrupa por mañana, tarde y noche. Agrupa por **Obligatorios**, **Cuando puedas** y **Marcados**.

## Datos

Todo se agrega sin migración y viaja con la sincronización:

- `Habit.obligatorio`.
- `PlanDia.hechos`: el estado de cada obligatoria, con clave igual al texto del bloque.
- `PlanDia.horas`: la hora en que se marcó cada cosa.
- `Data.sucesos`: las notas del día.
- `AgendaItem.hora` puede quedar vacía: es una obligatoria sin hora. Las funciones que calculan con la hora (ahora, ayuno, widget, carga) ignoran esas obligatorias.

## Widget

El resumen que la app publica para el widget ya no trae los bloques que marcaste como hechos o que hoy no van. Así, "Ahora" y "A las…" muestran lo que de verdad falta.

El resumen también incluye cuántas obligatorias hiciste. El widget grande muestra "OBLIGATORIAS · 1/4" en lugar de "AGENDA". Cuando ya no quedan bloques con hora, el widget mediano muestra cuántas obligatorias sin hora quedan pendientes.

Para ver estos cambios hay que volver a copiar `integraciones/widget-scriptable.js` en Scriptable. El widget viejo sigue funcionando: ya deja de mostrar los bloques hechos, pero no muestra el conteo de obligatorias.

## Mejoras chicas posteriores

- **Ahora**
  - De madrugada, antes de la hora de despertar, muestra "Es hora de dormir" y lo primero del día.
  - Durante el día muestra "Después: 14:30 Gimnasio · 21:00 Rugby · +1 sin hora". Al tocarlo se abre El día.
  - Los títulos se muestran sin "(hasta 11:40)", porque la hora de fin ya aparece aparte.
- **Bloques con hábitos adentro**: al marcar el bloque de gimnasio o rugby, el hábito de entrenar que va adentro se marca solo. Deshacer revierte las dos cosas.
- **Avisos y "ahora"**
  - El aviso de obligatoria pendiente aparece 15 minutos después de que termina el bloque, no a la media hora de empezar.
  - La marca "ahora" usa la duración real de cada bloque.
- **Cierre del día**
  - Muestra el conteo de obligatorias.
  - Las obligatorias de "solo hoy" que no se hicieron se pueden pasar a mañana o soltar.
  - La victoria viene completada con lo último anotado como "Algo bueno".
  - Desde las 19 h aparece también en El día, junto a una vista de lo que hay mañana.
- **Anotar rápido**
  - "Anotar lo que pasó…" está arriba de todo en Registrar (+).
  - En la paleta de comandos (⌘K): "Ver el día", "Anotar lo que pasó", "Agregar una obligatoria de hoy" y "Sincronizar ahora". Si escribís una frase que no es un comando, se anota en el día.
- **Coach**
  - Herramienta `anotar_suceso`: anota imprevistos, cambios y cosas buenas en el día.
  - Puede agregar obligatorias sin hora.
  - La revisión semanal le pasa lo que fue pasando.
- **Revisión semanal**: sección "Lo que fue pasando", con obligatorias cumplidas, imprevistos y cosas buenas. Un botón pasa las cosas buenas a "¿Qué salió bien?".
- **Hábitos**
  - Cada hábito muestra a qué hora se marcó.
  - El orden sigue el momento del día, con los obligatorios primero.
  - Un aviso, que se puede cerrar, explica cómo marcar uno como obligatorio.
- **Ajustes → Obligatorias de cada semana**: para editar lo fijo de cada día (hora, texto, agregar, sacar).
- **Sin conexión**
  - Aparece una pastilla discreta.
  - La sincronización no se intenta sin internet y corre sola cuando vuelve la conexión.
- **Teclado en el celular**: las hojas ya no abren el teclado solas en pantallas táctiles.
