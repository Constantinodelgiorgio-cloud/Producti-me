# 04 · Arquitectura y hoja de ruta

> Las decisiones finales dependen de las respuestas del cuestionario (sobre todo la sección 7).
> Aquí se dejan las opciones y una recomendación por defecto.

## 1. Opciones de plataforma

| Opción | Pros | Contras | Ideal si… |
|---|---|---|---|
| **A. PWA (web instalable)** – React/Next + almacenamiento local (IndexedDB) | Funciona en móvil y PC, sin tiendas de apps, rápido de iterar, gratis | Acceso limitado a Apple Health / sensores | Quiero empezar ya y usarla en todos lados |
| **B. App nativa multiplataforma** – React Native (Expo) o Flutter | Acceso a HealthKit / Health Connect, notificaciones fiables, widgets | Más trabajo, instalación vía Expo/TestFlight | Uso reloj/báscula y quiero automatizar datos |
| **C. Sistema sobre Notion/Obsidian + scripts** | Cero desarrollo inicial | Poco motivador, sin lógica adaptativa real | Solo quiero probar el concepto 2–3 semanas |

**Recomendación por defecto:** empezar con **A (PWA)** con datos locales y exportación,
diseñada para migrar a **B** cuando haga falta leer datos de salud automáticamente.

## 2. Arquitectura propuesta (PWA)

```
┌──────────────────────── Dispositivo (móvil / PC) ────────────────────────┐
│  UI (React)                                                               │
│   ├─ Hoy (check-ins, plan del día)                                        │
│   ├─ Áreas (registro específico)                                          │
│   ├─ Objetivos (cascada visión → hábitos)                                 │
│   ├─ Insights (gráficos, correlaciones)                                   │
│   └─ Revisión semanal / Ajustes (todo configurable)                       │
│                                                                           │
│  Motor local                                                              │
│   ├─ Puntajes por área y de vida                                          │
│   ├─ Correlaciones y tendencias                                           │
│   ├─ Reglas de adaptación (simplificar hábitos, reprogramar recordatorios)│
│   └─ Gamificación (opcional)                                              │
│                                                                           │
│  Datos: IndexedDB cifrado  ──►  Export/backup JSON  ──► (opcional) mi nube│
└───────────────────────────────────────────────────────────────────────────┘
                 │ (opcional, solo resúmenes)
                 ▼
          Coach IA (API de Claude) → resumen diario, revisión semanal, preguntas
```

## 3. Modelo de datos (borrador)

```
Perfil        { valores, visión, gustos, disgustos, cronotipo, tonoCoach, ... }
Area          { id, nombre, peso, color, activa }
Objetivo      { id, areaId, nivel(vision|anual|trimestral|mensual), titulo, porQue, metrica, valorMeta, fecha, padreId }
Habito        { id, objetivoId, nombre, frecuencia, versionMinima, momentoDelDia, activo }
RegistroHabito{ habitoId, fecha, estado(hecho|minimo|no), nota }
Metrica       { id, areaId, nombre, tipo(numero|escala|bool|texto|foto), unidad, frecuencia }
Registro      { metricaId, fechaHora, valor }
CheckIn       { fecha, tipo(manana|noche), sueno, energia, animo, estres, prioridad, victoria, texto }
Sesion        { tipo(entreno|estudio|trabajo|cuidado), inicio, fin, detalle(JSON), foco }
Foto          { fecha, categoria(progreso|piel|outfit), ruta }
Revision      { periodo(semanal|mensual), fecha, puntajes, aprendizajes, ajustes }
```
La clave: **Metrica** es genérica → puedo crear cualquier métrica nueva sin cambiar código.

## 4. Hoja de ruta

### Fase 0 · Definición (ahora)
- [x] Estudio del concepto y datos necesarios
- [ ] Completar el cuestionario
- [ ] Elegir 3–4 áreas prioritarias para arrancar y sus métricas
- [ ] Elegir plataforma

### Fase 1 · MVP "Hoy + Hábitos" (2–3 semanas de desarrollo)
- Perfil básico y áreas configurables
- Check-in mañana/noche
- Hábitos con versión mínima y rachas flexibles
- Historial simple y export de datos
- **Uso real 3–4 semanas para crear línea base**

### Fase 2 · Objetivos e insights
- Cascada de objetivos y vínculo hábito → objetivo
- Puntaje por área y de vida
- Gráficos de tendencia y primeras correlaciones personales
- Revisión semanal guiada

### Fase 3 · Módulos profundos por área
- Entrenamiento (series/peso/récords), estudio (temporizador de foco), trabajo (prioridades/proyectos)
- Estética: rutinas + fotos de progreso comparables
- Diario emocional con etiquetas

### Fase 4 · Coach y automatización
- Coach IA con mi perfil y tono elegido (resumen diario, revisión semanal, retos)
- Recordatorios inteligentes
- Integraciones (salud, calendario, reloj) — posible paso a app nativa

### Fase 5 · Refinamiento continuo
- Reglas de adaptación automáticas
- Nuevas áreas/métricas según evolución personal
- Gamificación si la elegí

## 5. Criterios de éxito (para saber si la app funciona para mí)
- La uso ≥ 6 de 7 días durante 2 meses.
- Registrar me lleva < 2 min diarios.
- Puedo nombrar 3 cosas que aprendí de mí gracias a los datos.
- Al menos 2 objetivos trimestrales con avance medible.
- Mi satisfacción con la vida (1–10) sube en el promedio trimestral.
