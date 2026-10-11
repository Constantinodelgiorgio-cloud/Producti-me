import Anthropic from '@anthropic-ai/sdk'
import type { Data } from './store'
import { today, weekStart } from './date'
import { avisos, dayNutrition, last, levelInfo, portfolioReturn, recomendaciones, totalXp, weekMedals, weekSoFar } from './logic'

const SYSTEM = `Sos el coach personal de Constantino (20 años, pilar izquierdo de rugby, estudiante de Administración de Empresas en Corrientes, Argentina).
Tono: exigente y directo, como un buen preparador físico. Duro con las acciones, nunca con la persona. Sin rodeos ni frases vacías.
Sus valores: confianza, voluntad, perseverancia. Le motiva ganar y odia perder; abandona por falta de constancia.
Prioridades de los próximos 3 meses: 1) físico (recuperar nivel post-erisipela y bajar 4 kg de grasa; meta anual <17 %), 2) reconectar con su grupo de amigos, 3) finanzas (USD 5.000 ahorrados; +12 % del portafolio en el 2.º semestre).
Su ánimo viene bajo (soledad, amigos, familia, sensación de "bucle"). Si los registros muestran ánimo muy bajo sostenido, bajá la exigencia, sé humano y recomendá hablar con un psicólogo. Nunca des indicaciones médicas; derivá a su médico o nutricionista.
Respondé en el idioma pedido, en menos de 180 palabras, con: 1) diagnóstico en 1–2 frases basado en los datos, 2) 3 órdenes concretas para hoy, 3) una frase de cierre que lo desafíe.`

/** Resumen compacto de los datos (no se envían fotos ni textos completos del diario). */
export const buildContext = (d: Data) => {
  const t = today()
  const wm = weekMedals(d, weekStart(t))
  const ci = d.checkins[t]
  const ultimos = Object.values(d.checkins).sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 7)
  const nut = dayNutrition(d, t)
  const lvl = levelInfo(totalXp(d))
  const peso = d.body.filter((b) => b.peso).sort((a, b) => a.fecha.localeCompare(b.fecha))
  return JSON.stringify({
    fecha: t,
    nivel: { n: lvl.lvl, liga: lvl.league.name },
    semana: { cumplimientoGlobal: wm.global, medallas: Object.fromEntries(Object.entries(wm.areas).map(([k, v]) => [k, v?.m])) },
    hoy: { checkin: ci, nutricion: nut, objetivoKcal: d.profile.kcalObjetivo, objetivoProt: d.profile.protObjetivo },
    ultimosCheckins: ultimos.map((c) => ({ f: c.fecha, animo: c.animoNoche ?? c.animoManana, estres: c.estres, enojo: c.enojo, energia: c.energia, dormir: c.horaDormir, despertar: c.horaDespertar })),
    entrenosUltimos7: d.workouts.filter((w) => weekSoFar().includes(w.fecha)).map((w) => ({ f: w.fecha, tipo: w.tipo, int: w.intensidad, rpe: w.rpe })),
    peso: peso.slice(-4),
    ahorro: last(d.savings)?.valor,
    rendimientoPortafolio: portfolioReturn(d),
    castigosPendientes: d.penalties.filter((p) => !p.hecho).map((p) => p.tarea),
    contactosSocialesUltimos7: d.social.filter((s) => weekSoFar().includes(s.fecha)).length,
    avisos: avisos(d).map((a) => a.text),
    reglas: recomendaciones(d).map((r) => r.text),
  })
}

export const askCoach = async (d: Data, pregunta?: string) => {
  const client = new Anthropic({ apiKey: d.settings.apiKey, dangerouslyAllowBrowser: true })
  const lang = d.settings.lang === 'es' ? 'español rioplatense' : 'English (simple, he is practicing)'
  const res = await client.beta.messages.create({
    model: d.settings.coachModel || 'claude-opus-5-5',
    max_tokens: 2000,
    system: SYSTEM,
    output_config: { effort: 'low' },
    betas: ['server-side-fallback-2026-07-01'],
    // Si el modelo rechaza la consulta, el servidor la reintenta en el modelo recomendado.
    fallbacks: 'default',
    messages: [{ role: 'user', content: `Idioma: ${lang}.\nDatos:\n${buildContext(d)}\n\n${pregunta ? `Pregunta: ${pregunta}` : 'Dame el briefing de hoy.'}` }],
  } as unknown as Anthropic.Beta.Messages.MessageCreateParamsNonStreaming)
  if (res.stop_reason === 'refusal') return 'El coach no pudo responder esta consulta. Probá reformularla.'
  return res.content.map((b) => (b.type === 'text' ? b.text : '')).join('').trim()
}
