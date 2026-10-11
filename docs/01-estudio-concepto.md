# 01 · Estudio del concepto

## 1. Visión

> Una app que me conoce mejor cada semana y me ayuda a convertirme en la versión de mí que yo definí.

No mide "lo saludable en general": mide **mi** vida contra **mis** objetivos. Si mi objetivo es ganar masa
muscular, aprobar un examen, ascender en el trabajo, mejorar mi imagen o dormir mejor, la app se organiza
alrededor de eso — y cambia cuando yo cambio.

## 2. Principios de diseño (por ser 100 % personal)

| Principio | Qué significa en la práctica |
|---|---|
| **Un único usuario** | Sin registro, sin multiusuario, sin onboarding genérico. Los textos, categorías y métricas son los míos. |
| **Todo es configurable por mí** | Áreas, métricas, escalas, rutinas y reglas se editan sin tocar código (archivo de configuración o pantalla de ajustes). |
| **Registrar cuesta < 30 segundos** | Si cargar datos es lento, se abandona. Check-ins de 1 toque, valores por defecto, automatizaciones. |
| **Los datos son míos** | Almacenamiento local o en mi propia nube. Exportables. Nada se vende ni se comparte. |
| **Honesta, no complaciente** | Me muestra la verdad (tendencias, incumplimientos), pero el tono lo elijo yo (coach exigente, amigo, neutral). |
| **Mejora por ciclos** | Cada semana/mes la app revisa qué funcionó y propone ajustes. El sistema evoluciona conmigo. |
| **Visión completa** | Todas las áreas se cruzan: sueño ↔ ánimo ↔ rendimiento en estudio/trabajo ↔ entrenamiento ↔ estética. |

## 3. Áreas de vida (dominios)

Propuesta inicial de 9 áreas. Se pueden fusionar, renombrar o eliminar según el cuestionario.

| # | Área | Qué cubre |
|---|---|---|
| 1 | **Cuerpo y físico** | Entrenamiento, fuerza, resistencia, composición corporal, movilidad, deporte |
| 2 | **Salud y energía** | Sueño, alimentación, hidratación, suplementos, controles médicos, energía diaria |
| 3 | **Mente y emociones** | Estado de ánimo, estrés, ansiedad, motivación, gratitud, diario personal, terapia/meditación |
| 4 | **Estudio y aprendizaje** | Cursos, carrera, idiomas, lectura, horas de foco, exámenes, habilidades |
| 5 | **Trabajo y carrera** | Proyectos, tareas, productividad, objetivos profesionales, ingresos por trabajo, red de contactos |
| 6 | **Estética e imagen** | Piel, cabello, barba/maquillaje, ropa y estilo, postura, fotos de progreso, rutina de cuidado |
| 7 | **Finanzas** | Gastos, ahorro, inversiones, metas económicas (soporte para el resto de objetivos) |
| 8 | **Relaciones y vida social** | Pareja, familia, amistades, tiempo de calidad, eventos |
| 9 | **Estilo de vida y disfrute** | Gustos, hobbies, ocio, viajes, música, experiencias, "cosas que me hacen bien" |

Cada área tiene: **objetivos**, **hábitos/rutinas**, **métricas** y **un puntaje** (0–100) calculado
a partir de mis propios datos.

## 4. Módulos de la app

### 4.1 Perfil "Yo" (el núcleo)
Ficha viva con quién soy hoy y quién quiero ser: valores, identidad deseada, gustos, cronotipo,
restricciones, situación actual por área. Todo lo demás se adapta a este perfil.

### 4.2 Objetivos (sistema de metas en cascada)
```
Visión de vida (5-10 años)
 └─ Objetivos anuales por área
     └─ Metas trimestrales (medibles)
         └─ Hitos mensuales
             └─ Acciones semanales / hábitos diarios
```
Cada acción diaria sabe a qué objetivo grande contribuye → motivación con sentido.

### 4.3 Hoy (panel diario)
- Check-in de la mañana (≈20 s): sueño, energía, ánimo, intención del día.
- Plan del día: 1–3 prioridades + hábitos del día + entrenamiento + bloques de estudio/trabajo.
- Check-in de la noche (≈60 s): qué hice, cómo me sentí, una victoria, un aprendizaje.

### 4.4 Hábitos y rutinas
Rutinas por momento del día (mañana, entreno, skincare, cierre), con rachas, flexibilidad
(ej. "4 de 7 días cuenta como éxito") y niveles mínimos para días malos.

### 4.5 Registro por área
Pantallas específicas: entrenamientos (series/peso/RPE), comidas, sesiones de estudio (pomodoro),
tareas de trabajo, rutina estética + fotos, diario emocional, gastos.

### 4.6 Análisis e insights
- Tendencias por métrica y puntaje por área.
- **Correlaciones personales**: "cuando duermo < 6 h mi foco cae 30 %", "los días que entreno mi ánimo sube 1,5 pts".
- Detección de patrones (días de la semana flojos, desencadenantes de estrés).

### 4.7 Coach personal (motor de motivación)
Ver sección 5.

### 4.8 Revisiones periódicas
- **Semanal** (15 min): puntaje por área, logros, fallos, ajustar plan de la semana siguiente.
- **Mensual**: progreso hacia metas trimestrales, fotos/medidas, recalibrar.
- **Trimestral/anual**: redefinir objetivos y la "versión de mí" buscada.

## 5. Cómo genera motivación y mejora real

| Mecanismo | Implementación |
|---|---|
| **Identidad** | Los hábitos se formulan como "soy alguien que…". La app muestra evidencia acumulada de esa identidad. |
| **Progreso visible** | Gráficos, fotos antes/después, récords personales, "hace 3 meses eras así". |
| **Rachas flexibles** | Rachas que no se rompen por un día malo (regla "nunca dos días seguidos sin…"). |
| **Sistema de niveles** | XP por acción ligada a objetivos; niveles por área (estilo RPG de mi propia vida). Opcional. |
| **Mínimo viable** | Cada hábito tiene versión de 2 minutos para días de baja energía → nunca cero. |
| **Feedback adaptativo** | Si un hábito falla 3 semanas seguidas, la app propone hacerlo más fácil o cambiarlo, no culpa. |
| **Recordatorios inteligentes** | En el momento en que suelo cumplir, no a hora fija; silenciosos si ya lo hice. |
| **Coach con IA (opcional)** | Un asistente que conoce mi perfil y mis datos y me da un resumen diario, retos y respuestas honestas. |
| **Recompensas propias** | Yo defino premios ligados a hitos (una prenda, un viaje, una cena) usando mis gustos. |
| **Por qué** | Cada objetivo guarda mi motivo personal; aparece cuando la motivación baja. |

## 6. El ciclo de adaptación (lo que la hace "a mi medida")

```
  Registrar  →  Analizar  →  Ajustar  →  Actuar
     ↑                                      │
     └──────────────────────────────────────┘
```
1. **Registrar** datos mínimos diarios.
2. **Analizar**: tendencias + correlaciones con MIS datos (no promedios de población).
3. **Ajustar**: la revisión semanal cambia metas, carga de hábitos, horarios y tono.
4. **Actuar**: plan del día más realista y alineado a lo que realmente me funciona.

Al principio (semanas 1–4) la app solo observa y aprende una línea base; después empieza a proponer.

## 7. Qué NO es

- No es una app comercial: no hay marketing, monetización ni diseño para "cualquier usuario".
- No es un médico/psicólogo: puede sugerir consultar a un profesional si detecta señales persistentes
  (ánimo muy bajo varias semanas, dolor, etc.).
- No es un registro obsesivo: si algo no aporta a una decisión, no se mide.
