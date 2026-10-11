# 07 · App · Fase 1

Código en [`app/`](../app). Web app instalable (PWA) hecha con React, TypeScript y Vite.

## Qué incluye

| Pantalla | Funciones |
|---|---|
| **Hoy** | Nivel, XP y liga · agenda del día según la semana de rugby · avisos (castigos, exámenes, revisión del domingo) · hábitos del día · recomendaciones · recuerdos · coach con IA · check-in de mañana y de noche (con dictado por voz) |
| **Hábitos** | Podio semanal por área 🥇🥈🥉🟥 · gráfico de cumplimiento · navegación por días · castigos y permitidos · editor de hábitos (días, versión mínima, XP) |
| **Físico** | Recuperación de marcas previas (1RM estimado) · registro de sesiones (tipo, intensidad, RPE, ejercicios) · volumen semanal · contador de calorías y macros con carga rápida · peso, % de grasa y masa magra · fotos de progreso con comparación |
| **Estudio** | Temporizador de foco · horas de IA, inglés, lectura y facultad · parciales, TPs y finales con cuenta regresiva · materias, notas y promedio |
| **Finanzas** | Ahorro → USD 5.000 · rendimiento del portafolio en el 2.º semestre vs. 12 % · velas semanales · ingresos y gastos por categoría (torta y barras) |
| **Vida** | Amigos (meta semanal de juntadas y contactos) · diario con emociones y gráficos de ánimo, estrés y enojo · banco de ideas · apoyo (terapia, anti-bucle, líneas de ayuda) |
| **Revisión** 🗓️ | Resumen semanal, tendencia de 12 semanas, reflexión guiada, 3 prioridades, revisión del coach |
| **Ajustes** ⚙️ | Idioma ES/EN · API key y modelo del coach · metas · horario de despertar · exportar, importar o reiniciar datos |

## Reglas del juego

- **Medallas** por área y global cada semana: 🥇 ≥ 90 % · 🥈 ≥ 75 % · 🥉 ≥ 60 % · 🟥 menos de 60 %. La versión mínima de un hábito vale medio. Solo cuentan los días desde que empezaste a usar la app.
- **Castigos automáticos:** un día con menos del 50 % genera un reto al día siguiente; cada área en 🟥 al cerrar la semana genera un castigo de esa área; una semana global 🟥 resta 150 XP.
- **Permitidos:** semana global 🥇 = 1 hamburguesa; cada punto de grasa corporal bajado = 1 hamburguesa. **Quedan bloqueados mientras haya castigos pendientes.**
- **Niveles y ligas:** Hierro → Bronce (nivel 4) → Plata (8) → Oro (13) → Platino (19) → Diamante (26) → Leyenda (35). Desde el nivel 4 el color de la app cambia al de tu liga.

## Probarla en la computadora

```bash
cd app
npm install
npm run dev        # http://localhost:5173
npm run build      # genera app/dist
```

## Publicarla para usarla en el iPhone (gratis, con Vercel)

1. Entrá a https://vercel.com con tu cuenta de GitHub.
2. **Add New → Project** → elegí `Producti-me`.
3. En **Root Directory** poné `app`. El resto lo detecta solo (Vite). Tocá **Deploy**.
4. Si Vercel no toma esta rama como producción: **Settings → Git → Production Branch** = `claude/personal-productivity-wellness-app-mt7jbv`.
5. En el iPhone, abrí la URL en **Safari** → botón **Compartir** → **Agregar a inicio**. Queda como app, a pantalla completa.

Cada vez que se suben cambios al repositorio, Vercel la actualiza sola.

## Coach con IA

1. Creá una cuenta en https://console.anthropic.com, cargá saldo y creá una API key.
2. En **Billing → Limits**, poné un límite mensual de USD 12.
3. Pegá la key en **Ajustes** dentro de la app. Queda guardada solo en ese dispositivo.

Uso estimado con Claude Opus 5.5: un briefing diario más la revisión semanal cuestan aproximadamente USD 1–3 por mes.

## Privacidad

- Los datos se guardan en el dispositivo (IndexedDB), no en un servidor.
- El coach recibe un **resumen** (números, medallas y avisos), sin fotos ni textos completos del diario.
- ⚠️ El repositorio es **público**: cualquiera puede ver el código y los documentos de `docs/` (con tus respuestas del cuestionario). Recomendado: **Settings → General → Danger Zone → Change visibility → Private**. Vercel funciona igual con repositorios privados.

## Limitaciones conocidas de la fase 1

- **Todavía no se sincroniza entre dispositivos:** por ahora se usa exportar/importar desde Ajustes. La fase 2 suma una base en la nube (Supabase, plan gratuito) con login.
- Apple Health y el calendario todavía no están conectados.
- El dictado por voz depende del navegador. Si no aparece el micrófono, usá el dictado del teclado del iPhone.

## Próximas fases

1. **Fase 2:** sincronización en la nube + login · notificaciones push (iOS 16.4+ con la app instalada) · calendario integrado de facultad y rugby.
2. **Fase 3:** Apple Health (pasos y sueño) vía Atajos de iOS · seguimiento de cada activo del portafolio.
3. **Fase 4:** coach con memoria (lee tus revisiones anteriores) · retos personalizados generados por IA.
