# 05 · Perfil sintetizado y decisiones de diseño

> Síntesis de las respuestas del [cuestionario inicial](03-cuestionario-inicial.md).
> Es la "ficha Yo" que va a usar la app. Lo marcado con ❓ falta confirmar en la [ronda 2](06-preguntas-ronda-2.md).

## 1. Perfil

| Campo | Valor |
|---|---|
| Edad / altura / peso | 20 años · 1,82 m · ~102 kg |
| Ocupación | Lic. en Administración de Empresas (3.º año y medio) + apoyo en la marmolería familiar (informal) |
| Deporte | Rugby, **pilar izquierdo**. Gimnasio casi a diario, entrenamiento martes (rojo) y jueves (amarillo), partido los sábados |
| Situación de salud | Recuperándose de **erisipela** (3 semanas sin entrenar) ❓ fecha de alta |
| Cronotipo | Nocturno. Duerme entre las 00:00 y las 02:00 y se despierta a las 6–7 los días de facultad presencial → **deuda de sueño probable** |
| Valores | Confianza · Voluntad · Perseverancia |
| Identidad buscada | "Alguien que pelee por sus sueños, los cumpla y nunca deje de soñar" |
| Referentes | Marcos Galperin, su mamá (odontóloga y empresaria), fundadores de empresas innovadoras, Manu Ginóbili |
| Motivador principal | El objetivo concreto. **Odia perder, ama ganar y ser el mejor** |
| Causa de abandono | Falta de constancia y de hábito |
| Coach | **Exigente y directo**, con castigos y exigencias cuando falla |
| Gamificación | Sí. Sistema de **arenas/ligas que suben y bajan** (estilo Clash Royale) + permitidos como premio |
| Dispositivos | iPhone (en inglés), iPad, PC Windows (pronto propia). Báscula común |
| Apps actuales | Cocos, IOL (inversiones). Quiere que Producti-Me reemplace al resto |
| Idioma | Español + inglés (para practicar) |
| Estética de la app | Limpia y seria con toques de videojuego. **Muchos gráficos**: velas, barras, líneas, tortas |
| Pantalla de inicio | Pendientes del día + recomendaciones + recuerdos + avisos |

## 2. Punto de partida (autoevaluación 1–10)

| Área | Hoy | Comentario |
|---|---|---|
| Cuerpo | 3 | Lo vive como inseguridad principal |
| Salud | 8 | |
| Energía | 7 | |
| Mente | 2 | "Estoy bastante mal" |
| Emociones | 2 | Enojo, cansancio, estrés; tristeza por soledad |
| Trabajo | 5 | |
| Estética | 5 | No le gusta su cuerpo |
| Finanzas | 6 | |
| Relaciones | 3 | Se siente solo y extraña a sus amigos |
| Disfrute | 3 | |

## 3. Prioridades de los próximos 3 meses

1. **Físico / inseguridades corporales**: volver al nivel previo a la enfermedad y bajar ≥ 4 kg de grasa manteniendo el peso funcional para pilar.
2. **Relaciones sociales**: reconectar con los amigos.
3. **Finanzas**: llegar a USD 5.000 ahorrados y hacer crecer el portafolio.

Siempre presente como base, aunque no esté en el top 3: **mente/emociones** (2/10) y **sueño**, porque afectan a todo lo demás.

## 4. Objetivos traducidos a metas medibles (borrador)

| Área | 3 meses | 1 año | Métrica en la app |
|---|---|---|---|
| Físico | Recuperar fuerza/condición previa + −4 kg de grasa | Mismo peso, < 17 % de grasa | Peso, % de grasa ❓ método, medidas, cargas por ejercicio, asistencia |
| Sueño/energía | Mejorar el descanso, hábitos alimentarios estables | Horario de sueño ordenado, energía plena | Horas, hora de acostarse, calidad, energía |
| Mente | Hábitos de disciplina | Estar "mucho mejor" | Ánimo, estrés, enojo, cumplimiento de hábitos, journaling |
| Estudio | Todas las materias aprobadas por promoción | Carrera al día, subir el promedio | Materias, parciales, notas, horas de estudio |
| IA | Saber de IA más que cualquier conocido | Nivel senior | Horas, proyectos construidos, cursos ❓ definición de "senior" |
| Inglés | Mejorar | Avanzado | Nivel ❓ actual, minutos diarios, app bilingüe |
| Trabajo/ingresos | — | Ingresos mensuales + proyectos propios a flote | Ingresos por fuente |
| Ahorro | De USD 1.200 a USD 5.000 (≈ USD 290 por semana) | Independencia económica | Ahorro acumulado |
| Inversiones | **+12 % en USD en el 2.º semestre 2026 (1/7 → 31/12)** sobre todo el portafolio (CEDEARs) | Patrimonio de USD 25–30k (a 3 años) | Valor del portafolio, rendimiento sin contar aportes, gráfico de velas |
| Estética | Mejor estilo + hábitos de cuidado | Cuerpo del que no se avergüence | Rutina de cuidado, fotos de progreso, autopercepción |
| Relaciones | Reconectar con los amigos | Amistades sólidas | Contactos/juntadas por semana, satisfacción social |
| Experiencias | — | Experiencia de estudio/trabajo en el exterior | Pasos concretos (idioma, ahorro, postulaciones) |

## 5. Decisiones de diseño tomadas

| Tema | Decisión | Por qué |
|---|---|---|
| **Plataforma** | **App web instalable (PWA)** en iPhone, iPad y Windows, con **sincronización en la nube** | Usa 3 dispositivos con sistemas distintos; una PWA funciona en todos sin App Store |
| **Backend** | Base de datos en la nube con login privado (ej. Supabase) | Le da igual dónde se guarden los datos mientras sean privados, y necesita sincronizar entre dispositivos |
| **Idioma** | ES/EN intercambiable con un botón | Practicar inglés en el día a día |
| **Coach IA** | Sí, con Claude. Tono exigente y directo | Lo pidió explícitamente; acepta la nube |
| **Entrada de datos** | Botones + texto + voz | Quiere todas las opciones |
| **Notificaciones** | Sin límite de cantidad ni horario, pero inteligentes | Sin restricciones; igual evitamos el spam para que no las ignore |
| **Gamificación** | Sistema de **arenas/ligas** con ascensos y descensos semanales, XP por acción, rachas, skins/temas de la app que se desbloquean | Motivador competitivo ("odio perder") y premios visuales |
| **Castigos** | Pérdida de XP/arena, permitidos bloqueados, **retos de compensación** (ej. tarea extra al día siguiente) | Los pidió; ver nota de diseño abajo |
| **Recompensas** | Permitidos (comidas), ascensos de arena, mejoras visuales | Respuesta 34 |
| **Gráficos** | Velas (portafolio, peso semanal), barras (hábitos), líneas (tendencias), tortas (gastos, uso del tiempo) | Le encantan y le resultan funcionales |
| **Finanzas** | Módulo propio de portafolio (registro manual de Cocos/IOL al inicio) | Reemplazar las demás apps |
| **Rugby** | El módulo físico se organiza por la semana de rugby (intensidad roja/amarilla/baja, partido) | Su entrenamiento real gira en torno a eso |
| **Domingo** | Propuesta: día de **revisión semanal + planificación** (15–20 min) ❓ | Es el único día libre de estructura |

### Nota de diseño: exigencia sí, autodestrucción no
El coach va a ser duro con las **acciones** ("dijiste 3 sesiones, hiciste 1, mañana compensás"),
nunca con la **persona**. Los castigos siempre son recuperables (se puede volver a subir de arena) y
no se aplican sobre lo emocional ni el descanso. Si los registros de ánimo se mantienen muy bajos
varias semanas, la app cambia a modo "recuperación": menos exigencia, más apoyo, y sugiere hablar con
un profesional. Con Mente 2/10 y Emociones 2/10 esto es una pieza central, no un detalle.

## 6. Observaciones iniciales (lo que ya se ve en los datos)

- **Sueño**: acostarse entre las 00 y las 02 y levantarse a las ~6 para la facultad de las 7 da 4–6 h de sueño varios días. Para un pilar que entrena a alta intensidad y quiere bajar grasa, este es probablemente **el factor con más impacto**: afecta la recuperación, el hambre, el ánimo y el enojo.
- **Siestas**: aparecen varios días. Bien usadas (20–30 min o 90 min) ayudan; largas empujan el horario nocturno más tarde.
- **Rugby como canal social**: el sábado ya pasa varias horas con sus compañeros. Puede ser el punto de partida para el objetivo de relaciones.
- **Bucle**: lo que más le baja el ánimo es sentirse en un bucle. La app debe mostrar **progreso visible y variedad** (retos nuevos, metas que avanzan) para romperlo.
- **Objetivos financieros**: el 12 % es para el 2.º semestre en USD (≈ 25 % anualizado): exigente pero posible. La app separa la meta de ahorro (controlable) de la de rendimiento (no controlable) y no cuenta los aportes como rendimiento.
- **Ahorro**: pasar de USD 1.200 a 5.000 en 3 meses con ingresos variables (0–900/mes) requiere ≈ USD 1.270 por mes. Es la meta menos realista del plan: conviene revisarla en la primera revisión mensual.

## 7. Ronda 2 · datos clave incorporados

| Tema | Dato |
|---|---|
| Salud | Erisipela en la tibia, con alta. Termina la clindamicina (incluida como hábito diario temporal) |
| Composición | ~24 % de grasa (nutricionista). Antes de la enfermedad: 103 kg, banca 140 × 8, sentadilla ~200, peso muerto ~200 |
| Entrenamiento | Lo planifica el preparador físico (por períodos). La app **registra y recomienda**, no arma rutinas |
| Nutrición | Quiere contar calorías. 3–4 comidas. Objetivo inicial estimado: 3.000 kcal y 200 g de proteína (validar con la nutricionista) |
| Sueño | Se levanta 6:00 (L/X/V), 7:50 (M/J), 7:00 (S), ~13:00 (D). Lo desvelan el celular y los pensamientos. Mínimo: 6,5 h |
| Mente | Bucle = días iguales. Enojo cuando las cosas no salen. Causas: amigos, incomodidad, familia. Abierto a terapia y journaling |
| Amigos | Un solo grupo grande (jardín + otros círculos). Se alejó por conflictos con su novia. Meta: volver a ser parte del grupo |
| Estudio | Parciales en noviembre, finales en diciembre. 5 materias + finales de Matemática Financiera y Costos. 24 h/semana para IA + inglés + lectura |
| Finanzas | USD 1.200 ahorrados. Ingresos variables (0–900/mes). Invierte en CEDEARs (Cocos, IOL). Está armando un portafolio automatizado |
| Estética | Rutina de skincare completa pero inconstante. Punto a mejorar: manos y uñas. Referentes: James Leung, Daniel Simmons, Tim Dessaint |
| Juego | Acepta todos los castigos propuestos. Prefiere barras de progreso y **podio oro/plata/bronce/malo** antes que arenas |
| Tecnología | Presupuesto de USD 12–13 por mes. Quiere Apple Health y calendario integrados. Quiere aprender a mantener la app |
