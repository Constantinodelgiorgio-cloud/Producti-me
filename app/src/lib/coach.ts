import Anthropic from '@anthropic-ai/sdk'
import type { Data } from './store'
import { addDays, dow, today, uid, weekStart } from './date'
import {
  agendaDe, avisos, castigosPendientes, dayNutrition, habitsFor, last, levelInfo, momentoDe, penaltyTime, fmtLeft, portfolioReturn,
  recomendaciones, sancionActiva, totalXp, weekMedals, weekSoFar,
} from './logic'
import type { Accion, ChatMsg, Pregunta } from './types'
import { CATS_GASTO, CATS_INGRESO } from './seed'

const PERFIL = `Sos el coach personal de Constantino (20 años, pilar izquierdo de rugby, estudiante de Administración de Empresas en Corrientes, Argentina; trabaja en la marmolería familiar).
Tono: exigente y directo, como un buen preparador físico. Duro con las acciones, nunca con la persona. Sin rodeos ni frases vacías.
Sus valores: confianza, voluntad, perseverancia. Le motiva ganar y odia perder; abandona por falta de constancia.
Prioridades de los próximos 3 meses: 1) físico (recuperar nivel post-erisipela y bajar 4 kg de grasa; meta anual <17 %), 2) reconectar con su grupo de amigos, 3) finanzas (USD 5.000 ahorrados; +12 % del portafolio en el 2.º semestre).
Su ánimo viene bajo (soledad, amigos, familia, sensación de "bucle"). Si los registros muestran ánimo muy bajo sostenido, bajá la exigencia, sé humano y recomendá hablar con un psicólogo. Nunca des indicaciones médicas; derivá a su médico o nutricionista.`

const BRIEFING = `${PERFIL}
Respondé en el idioma pedido, en menos de 180 palabras, con: 1) diagnóstico en 1–2 frases basado en los datos, 2) 3 órdenes concretas para hoy, 3) una frase de cierre que lo desafíe.`

const CHAT = `${PERFIL}

Estás dentro de la app Producti-me y OPERÁS sus datos con herramientas. Tu trabajo es reorganizar el día y la semana cuando cambia el contexto ("hoy no tengo facultad", "pasame el gimnasio a la tarde", "esta semana tengo menos tiempo") y registrar cosas que te cuenta.

Cómo trabajar:
- Usá siempre las herramientas para cambiar algo; nunca digas que cambiaste algo sin llamarlas.
- Agenda, hábitos excusados, momentos y prioridades van en UNA llamada a proponer_cambios por pedido (podés incluir varias acciones y varias fechas). Constantino ve la propuesta y la aplica o la descarta: no le pidas confirmación por texto.
- Si un bloque se libera, sugerí en la misma propuesta cómo usarlo (estudio, gimnasio, descanso) según sus prioridades.
- Comidas, gastos, ingresos, contactos, tareas y hábitos hechos se registran directo con sus herramientas (tienen Deshacer).
- Cuando aprendas algo duradero y útil de él (qué le funciona, horarios reales, objetivos), guardalo con "recordar". Tu memoria está en el contexto: usala.
- Si un día tiene más tareas que tiempo libre, decilo y proponé qué pasar a otro día. Ante una falta, no sermonees: la versión mínima y no faltar dos veces seguidas es lo que sostiene un hábito.
- Excusas: solo aceptás excusas fundamentadas y específicas, de causa externa, compromiso real, salud o fuerza mayor ("no fui a la facultad porque tuve reunión con proveedores de la marmolería"; "el gimnasio cerró por refacciones pero salí a correr"). Quedarse dormido, falta de ganas, olvido o cansancio sin causa NO son excusas: respondé que no se excusa y ofrecé la versión mínima o reprogramar. Si hizo una alternativa, ponela en "alternativa".
- Usá los ids de hábitos y las horas exactas de la agenda que aparecen en el contexto. Las fechas van en formato AAAA-MM-DD.
- Después de usar herramientas, respondé en 1–3 frases: qué propusiste o registraste y por qué. Nada de listas largas.
- No le des la razón por compromiso: si un plan no es realista (demasiadas cosas para el tiempo libre, poco sueño, carga muy alta), decilo con respeto y proponé una versión que entre.
- Si Constantino expresa ideas de hacerse daño, de no querer vivir o una crisis: dejá de coachear y de usar herramientas. Respondé con calma y empatía, en pocas frases, y pedile que hable ya con alguien: línea nacional de salud mental 0800-999-0091 (gratuita, 24 h), Centro de Asistencia al Suicida (011) 5275-1135 o 0800-345-1435, o 911 si hay peligro inmediato. No diagnostiques.
- Respondé en el idioma que se indica en el contexto.`

export const MODELOS_CON_FALLBACK = ['claude-opus-5-5', 'claude-sonnet-5-5']

const client = (d: Data) => new Anthropic({ apiKey: d.settings.apiKey, dangerouslyAllowBrowser: true })
const model = (d: Data) => d.settings.coachModel || 'claude-opus-5-5'
/** Parámetros comunes: si el modelo rechaza, el servidor reintenta con el modelo recomendado (Opus y Sonnet 5.5). */
const fallback = (d: Data) => (MODELOS_CON_FALLBACK.includes(model(d)) ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' } : {})
const lang = (d: Data) => (d.settings.lang === 'es' ? 'español rioplatense' : 'English (simple, he is practicing)')
const textOf = (content: { type: string; text?: string }[]) => content.map((b) => (b.type === 'text' ? b.text : '')).join('').trim()

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
    hoy: { checkin: ci, nutricion: nut, objetivoKcal: d.profile.kcalObjetivo, objetivoProt: d.profile.protObjetivo, agenda: agendaDe(d, t) },
    ultimosCheckins: ultimos.map((c) => ({ f: c.fecha, animo: c.animoNoche ?? c.animoManana, estres: c.estres, enojo: c.enojo, energia: c.energia, dormir: c.horaDormir, despertar: c.horaDespertar })),
    entrenosUltimos7: d.workouts.filter((w) => weekSoFar().includes(w.fecha)).map((w) => ({ f: w.fecha, tipo: w.tipo, int: w.intensidad, rpe: w.rpe })),
    peso: peso.slice(-4),
    ahorroUSD: last(d.savings)?.valor,
    rendimientoPortafolio: portfolioReturn(d),
    castigosPendientes: castigosPendientes(d).map((p) => ({ tarea: p.tarea, vence: fmtLeft(penaltyTime(p).left) })),
    sancion: sancionActiva(d)?.motivo,
    contactosSocialesUltimos7: d.social.filter((s) => weekSoFar().includes(s.fecha)).length,
    avisos: avisos(d).map((a) => a.text),
    reglas: recomendaciones(d).map((r) => r.text),
  })
}

/** Contexto del chat: plan de los próximos 7 días con ids reales para que las acciones apunten bien. */
export const chatContext = (d: Data) => {
  const t = today()
  const ahora = new Date()
  const dias = Array.from({ length: 7 }, (_, i) => addDays(t, i)).map((f) => {
    const log = d.habitLog[f] ?? {}
    return {
      fecha: f,
      dia: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'][dow(f)],
      despertar: d.profile.despertar[dow(f)],
      agenda: agendaDe(d, f),
      cambiado: !!d.planDia[f],
      excusados: d.planDia[f]?.excusas,
      ...(f === t ? { habitos: habitsFor(d.habits, f).map((h) => ({ id: h.id, nombre: h.nombre, momento: momentoDe(h, d, f), estado: log[h.id] ?? 'pendiente', minimo: h.minimo, ...(h.obligatorio ? { obligatorio: true } : {}) })), obligatoriasHechas: d.planDia[f]?.hechos, loQuePaso: (d.sucesos ?? []).filter((s) => s.fecha === f).map((s) => `${s.hora} ${s.tipo}: ${s.texto}`) } : {}),
    }
  })
  const otros = d.habits.filter((h) => h.activo).map((h) => ({ id: h.id, nombre: h.nombre, dias: h.dias.length ? h.dias : 'todos' }))
  return JSON.stringify({
    idioma: lang(d),
    ahora: `${t} ${ahora.toTimeString().slice(0, 5)}`,
    resumen: JSON.parse(buildContext(d)),
    plan7dias: dias,
    habitos: otros,
    ...(d.settings.coachLeeDiario ? { diarioUltimos: d.journal.filter((j) => !j.privada).slice(-3).map((j) => ({ f: j.fecha, texto: j.texto.slice(0, 600) })) } : {}),
    memoria: (d.memoria ?? []).map((m) => m.texto),
    tareasPendientes: (d.tareas ?? []).filter((x) => !x.hecha).map((x) => ({ texto: x.texto, fecha: x.fecha ?? 'algún día', min: x.minutos, pospuesta: x.pospuesta })),
    comidasHoy: d.meals.filter((m) => m.fecha === t).map((m) => `${m.comida ?? '?'}.ª ${m.hora ?? ''} ${m.nombre} ${m.prot} g P`),
    semanasEspeciales: (d.estados ?? []).filter((e) => e.hasta >= t).map((e) => ({ tipo: e.tipo, desde: e.desde, hasta: e.hasta })),
  })
}

export const askCoach = async (d: Data, pregunta?: string) => {
  const res = await client(d).beta.messages.create({
    model: model(d),
    max_tokens: 2000,
    system: BRIEFING,
    output_config: { effort: 'low' },
    ...fallback(d),
    messages: [{ role: 'user', content: `Idioma: ${lang(d)}.\nDatos:\n${buildContext(d)}\n\n${pregunta ? `Pregunta: ${pregunta}` : 'Dame el briefing de hoy.'}` }],
  } as unknown as Anthropic.Beta.Messages.MessageCreateParamsNonStreaming)
  if (res.stop_reason === 'refusal') return 'El coach no pudo responder esta consulta. Probá reformularla.'
  return textOf(res.content as { type: string; text?: string }[])
}

/** Pide una respuesta en JSON que cumple el esquema (salida estructurada). */
export const askJson = async <T,>(d: Data, content: Anthropic.Beta.Messages.BetaContentBlockParam[], schema: Record<string, unknown>, system?: string): Promise<T> => {
  const res = await client(d).beta.messages.create({
    model: model(d),
    max_tokens: 4000,
    ...(system ? { system } : {}),
    output_config: { effort: 'low', format: { type: 'json_schema', schema } },
    ...fallback(d),
    messages: [{ role: 'user', content }],
  } as unknown as Anthropic.Beta.Messages.MessageCreateParamsNonStreaming)
  if (res.stop_reason === 'refusal') throw new Error('El modelo no pudo procesar este pedido.')
  if (res.stop_reason === 'max_tokens') throw new Error('La respuesta quedó cortada. Probá con menos contenido.')
  return JSON.parse(textOf(res.content as { type: string; text?: string }[])) as T
}

// ---------------- Chat operativo ----------------

const ACCION_SCHEMA = {
  type: 'object',
  properties: {
    tipo: { type: 'string', enum: ['agenda_quitar', 'agenda_mover', 'agenda_agregar', 'habito_excusar', 'habito_momento', 'prioridad'] },
    fecha: { type: 'string', description: 'AAAA-MM-DD' },
    hora: { type: 'string', description: 'HH:MM exacta del bloque (quitar/mover) o del nuevo bloque (agregar)' },
    que: { type: 'string', description: 'Texto del bloque de agenda' },
    nueva_hora: { type: 'string', description: 'HH:MM (solo agenda_mover)' },
    intensidad: { type: 'string', enum: ['roja', 'amarilla', 'baja', 'partido', 'libre'] },
    habito_id: { type: 'string' },
    motivo: { type: 'string', description: 'Excusa específica: qué pasó, con quién o dónde' },
    categoria: { type: 'string', enum: ['causa externa', 'compromiso real', 'salud', 'fuerza mayor'] },
    alternativa: { type: 'string', description: 'Lo que hizo en su lugar, si hizo algo' },
    momento: { type: 'string', enum: ['manana', 'dia', 'tarde', 'noche'] },
    texto: { type: 'string', description: 'Texto de la prioridad' },
  },
  required: ['tipo', 'fecha'],
}

export const TOOLS: Anthropic.Tool[] = [
  {
    name: 'proponer_cambios',
    description: 'Propone cambios al plan (agenda de un día, excusar un hábito con motivo fundamentado, mover un hábito de momento, definir la prioridad). Constantino ve la propuesta y decide si la aplica; el resultado te dice si la aplicó, la descartó o si alguna acción es inválida.',
    input_schema: { type: 'object', properties: { resumen: { type: 'string', description: 'Una frase: qué cambia y por qué' }, acciones: { type: 'array', items: ACCION_SCHEMA, minItems: 1 } }, required: ['resumen', 'acciones'] },
  },
  {
    name: 'registrar_comida',
    description: 'Registra lo que comió. Cada ítem se busca en la base de alimentos argentinos; indicá gramos o una porción en el texto ("2 huevos", "milanesa", "200 g de arroz").',
    input_schema: { type: 'object', properties: { momento: { type: 'string', enum: ['desayuno', 'almuerzo', 'merienda', 'cena', 'snack'] }, items: { type: 'array', items: { type: 'object', properties: { texto: { type: 'string' }, gramos: { type: 'number' }, cantidad: { type: 'number', description: 'cantidad de porciones o unidades' } }, required: ['texto'] } } }, required: ['items'] },
  },
  {
    name: 'registrar_movimiento',
    description: 'Registra un gasto o ingreso de la cartera diaria (normalmente en pesos).',
    input_schema: { type: 'object', properties: { tipo: { type: 'string', enum: ['gasto', 'ingreso'] }, monto: { type: 'number' }, moneda: { type: 'string', enum: ['ARS', 'USD'] }, cuenta: { type: 'string', enum: ['efectivo', 'mp', 'santander', 'debito', 'credito'], description: 'mp = Mercado Pago; debito y credito = tarjetas Visa' }, categoria: { type: 'string', description: `Gastos: ${CATS_GASTO.join(', ')}. Ingresos: ${CATS_INGRESO.join(', ')}.` }, nota: { type: 'string' }, fecha: { type: 'string' } }, required: ['tipo', 'monto', 'categoria'] },
  },
  {
    name: 'registrar_contacto',
    description: 'Registra un contacto con amigos (mensaje, llamada, plan propuesto o juntada).',
    input_schema: { type: 'object', properties: { tipo: { type: 'string', enum: ['mensaje', 'llamada', 'plan propuesto', 'juntada'] }, con: { type: 'string' }, nota: { type: 'string' } }, required: ['tipo', 'con'] },
  },
  {
    name: 'marcar_habito',
    description: 'Marca un hábito de hoy como hecho, versión mínima, no hecho o reserva (salto de emergencia: 2 por semana por hábito, no cuenta como falta).',
    input_schema: { type: 'object', properties: { habito_id: { type: 'string' }, estado: { type: 'string', enum: ['hecho', 'minimo', 'no', 'reserva'] }, fecha: { type: 'string' } }, required: ['habito_id', 'estado'] },
  },
  {
    name: 'registrar_tarea',
    description: 'Agrega una tarea puntual (no un hábito). Sin fecha = algún día. Estimá los minutos con realismo.',
    input_schema: { type: 'object', properties: { texto: { type: 'string' }, fecha: { type: 'string', description: 'AAAA-MM-DD' }, minutos: { type: 'integer' } }, required: ['texto'] },
  },
  {
    name: 'recordar',
    description: 'Guarda en tu memoria un dato duradero y útil sobre Constantino (preferencias, contexto, objetivos, lo que le funciona o no). Él la ve y la puede editar. Nada sensible del diario.',
    input_schema: { type: 'object', properties: { texto: { type: 'string', description: 'Una frase corta' } }, required: ['texto'] },
  },
]

type ApiMsg = Anthropic.Beta.Messages.BetaMessageParam
type ToolUse = { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> }

/** Ejecutor de herramientas que inmediatamente aplican (registrar) y de propuestas (quedan pendientes). */
export interface ToolHost {
  registrar: (name: string, input: Record<string, unknown>) => { ok: boolean; texto: string; undoKey?: string }
  proponer: (toolUseId: string, resumen: string, acciones: Accion[]) => { errores: string[] }
}

const send = (d: Data, api: ApiMsg[]) =>
  client(d).beta.messages.create({
    model: model(d),
    max_tokens: 16000,
    system: CHAT,
    tools: TOOLS,
    output_config: { effort: 'medium' },
    ...fallback(d),
    messages: api,
  } as unknown as Anthropic.Beta.Messages.MessageCreateParamsNonStreaming)

/**
 * Corre una vuelta del chat. La historia es solo-agregar (se reenvía tal cual, con los bloques de razonamiento).
 * Las herramientas de registro se ejecutan y la conversación sigue; una propuesta de cambios corta la vuelta
 * hasta que Constantino la aplique o la descarte (entonces se llama a `resolverPropuesta`).
 */
export const runTurn = async (d: Data, api: ApiMsg[], host: ToolHost): Promise<{ api: ApiMsg[]; msgs: ChatMsg[]; pendiente: boolean }> => {
  const msgs: ChatMsg[] = []
  let hist = [...api]
  for (let i = 0; i < 6; i++) {
    const res = await send(d, hist)
    hist = [...hist, { role: 'assistant', content: res.content as Anthropic.Beta.Messages.BetaContentBlockParam[] }]
    const txt = textOf(res.content as { type: string; text?: string }[])
    if (res.stop_reason === 'refusal') { msgs.push({ id: uid(), rol: 'error', texto: 'El coach no pudo responder esto. Probá reformularlo.' }); return { api: hist, msgs, pendiente: false } }
    if (txt) msgs.push({ id: uid(), rol: 'coach', texto: txt })
    if (res.stop_reason === 'pause_turn') continue
    if (res.stop_reason !== 'tool_use') return { api: hist, msgs, pendiente: false }
    const uses = (res.content as { type: string }[]).filter((b): b is ToolUse => b.type === 'tool_use')
    const results: Anthropic.Beta.Messages.BetaToolResultBlockParam[] = []
    let pausa = false
    for (const u of uses) {
      if (u.name === 'proponer_cambios') {
        const acciones = Array.isArray(u.input.acciones) ? (u.input.acciones as Accion[]) : []
        const resumen = typeof u.input.resumen === 'string' ? u.input.resumen : 'Cambios propuestos'
        const { errores } = host.proponer(u.id, resumen, acciones)
        if (errores.length) results.push({ type: 'tool_result', tool_use_id: u.id, is_error: true, content: `Acciones inválidas, corregilas o explicale a Constantino por qué no se puede: ${errores.join(' | ')}` })
        else {
          msgs.push({ id: uid(), rol: 'propuesta', propuesta: { toolUseId: u.id, resumen, acciones, estado: 'pendiente' } })
          pausa = true
        }
      } else {
        const r = host.registrar(u.name, u.input)
        if (r.ok) msgs.push({ id: uid(), rol: 'registro', texto: r.texto, undoKey: r.undoKey })
        results.push({ type: 'tool_result', tool_use_id: u.id, content: r.texto, ...(r.ok ? {} : { is_error: true }) })
      }
    }
    if (pausa) {
      // Los resultados de las otras herramientas de este turno esperan junto con el de la propuesta.
      return { api: [...hist, { role: 'user', content: results }], msgs, pendiente: true }
    }
    hist = [...hist, { role: 'user', content: results }]
  }
  return { api: hist, msgs, pendiente: false }
}

/** Agrega el resultado de una propuesta (aplicada o descartada) y deja que el coach cierre la vuelta. */
export const resolverPropuesta = (api: ApiMsg[], toolUseId: string, resultado: string): ApiMsg[] => {
  const lastMsg = api.at(-1)
  const block: Anthropic.Beta.Messages.BetaToolResultBlockParam = { type: 'tool_result', tool_use_id: toolUseId, content: resultado }
  // Si el último mensaje ya es el de resultados de ese turno, se suma ahí (todas las respuestas a un turno van juntas).
  if (lastMsg?.role === 'user' && Array.isArray(lastMsg.content) && lastMsg.content.every((b) => (b as { type: string }).type === 'tool_result'))
    return [...api.slice(0, -1), { role: 'user', content: [...(lastMsg.content as Anthropic.Beta.Messages.BetaToolResultBlockParam[]), block] }]
  return [...api, { role: 'user', content: [block] }]
}

/** Arma el mensaje del usuario con el contexto actualizado delante. */
export const userMessage = (d: Data, texto: string, api: ApiMsg[]): ApiMsg[] => {
  const ctx = { type: 'text' as const, text: `<contexto>${chatContext(d)}</contexto>` }
  const body = { type: 'text' as const, text: texto }
  const lastMsg = api.at(-1)
  // Si hay resultados de herramientas pendientes (propuesta sin resolver), el texto va en el mismo mensaje.
  if (lastMsg?.role === 'user' && Array.isArray(lastMsg.content))
    return [...api.slice(0, -1), { role: 'user', content: [...(lastMsg.content as Anthropic.Beta.Messages.BetaContentBlockParam[]), ctx, body] }]
  return [...api, { role: 'user', content: [ctx, body] }]
}

// ---------------- Mini test mensual ----------------
const TEST_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    preguntas: {
      type: 'array',
      items: { type: 'object', additionalProperties: false, properties: { p: { type: 'string' }, opciones: { type: 'array', items: { type: 'string' } }, correcta: { type: 'integer' } }, required: ['p', 'opciones', 'correcta'] },
    },
  },
  required: ['preguntas'],
}
export const generarTest = async (d: Data, ruta: string, meta: string, registro: string): Promise<Pregunta[]> => {
  const r = await askJson<{ preguntas: Pregunta[] }>(d, [{ type: 'text', text: `Ruta de aprendizaje: ${ruta}.\nMeta del mes: ${meta}\nLo que registró este mes: ${registro || 'sin registros'}\n\nGenerá un mini test rápido y sencillo de 5 preguntas de opción múltiple (4 opciones, una correcta, índice 0–3 en "correcta") que compruebe si cumplió la meta del mes. Preguntas concretas y prácticas, no de memoria trivial. ${ruta === 'Inglés' ? 'Escribí las preguntas en inglés.' : 'En español rioplatense.'}` }], TEST_SCHEMA)
  return r.preguntas.filter((q) => q.opciones.length >= 2 && q.correcta >= 0 && q.correcta < q.opciones.length).slice(0, 5)
}

// ---------------- Comprobantes y correos ----------------
const MOV_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    movimientos: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        properties: {
          tipo: { type: 'string', enum: ['gasto', 'ingreso'] }, monto: { type: 'number' }, moneda: { type: 'string', enum: ['ARS', 'USD'] },
          fecha: { type: 'string', description: 'AAAA-MM-DD' }, comercio: { type: 'string' },
          cuenta: { type: 'string', enum: ['efectivo', 'mp', 'santander', 'debito', 'credito'] }, categoria: { type: 'string' }, ref: { type: 'string', description: 'id del mensaje si viene de un correo' },
        },
        required: ['tipo', 'monto', 'moneda', 'fecha', 'comercio', 'cuenta', 'categoria', 'ref'],
      },
    },
  },
  required: ['movimientos'],
}
export interface MovLeido { tipo: 'gasto' | 'ingreso'; monto: number; moneda: 'ARS' | 'USD'; fecha: string; comercio: string; cuenta: 'efectivo' | 'mp' | 'santander' | 'debito' | 'credito'; categoria: string; ref: string }
const MOV_SYS = (cats: string[]) => `Extraés movimientos de dinero de comprobantes, correos y notificaciones argentinas (Mercado Pago, Santander, Visa). Solo movimientos reales (pagos, compras, transferencias enviadas o recibidas, consumos); ignorá publicidad, resúmenes y avisos sin monto. Montos en número (8.500,50 → 8500.5). Cuenta: mp = Mercado Pago, santander = transferencia o débito en cuenta Santander, debito = tarjeta de débito Visa, credito = tarjeta de crédito Visa. Categoría: una de ${cats.join(', ')}. Si no hay año, usá ${today().slice(0, 4)}. Si no hay ref, dejá "".`

export const leerComprobante = async (d: Data, file: { data: string; mime: string } | null, texto: string, cats: string[]): Promise<MovLeido[]> => {
  const content: Anthropic.Beta.Messages.BetaContentBlockParam[] = []
  if (file) content.push(file.mime === 'application/pdf'
    ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: file.data } }
    : { type: 'image', source: { type: 'base64', media_type: file.mime as 'image/jpeg', data: file.data } })
  content.push({ type: 'text', text: texto ? `Texto pegado:\n${texto}` : 'Leé este comprobante.' })
  return (await askJson<{ movimientos: MovLeido[] }>(d, content, MOV_SCHEMA, MOV_SYS(cats))).movimientos
}
export const leerCorreos = async (d: Data, correos: { id: string; asunto: string; de: string; fecha: string; texto: string }[], cats: string[]): Promise<MovLeido[]> =>
  (await askJson<{ movimientos: MovLeido[] }>(d, [{ type: 'text', text: correos.map((c) => `<correo id="${c.id}" fecha="${c.fecha}" de="${c.de}">\nAsunto: ${c.asunto}\n${c.texto.slice(0, 1500)}\n</correo>`).join('\n') }], MOV_SCHEMA, MOV_SYS(cats))).movimientos

// ---------------- Diario: pregunta profunda ----------------
export const preguntaProfunda = async (d: Data) => {
  const ult = Object.values(d.checkins).sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 7)
  const r = await askJson<{ pregunta: string }>(d, [{ type: 'text', text: `Check-ins de la última semana (sin textos del diario): ${JSON.stringify(ult.map((c) => ({ f: c.fecha, animo: c.animoNoche ?? c.animoManana, estres: c.estres, enojo: c.enojo, energia: c.energia, prioridadCumplida: c.prioridadCumplida })))}\n\nEscribí UNA pregunta profunda para su diario de hoy: personal, específica a lo que muestran los números, que invite a reflexionar sin juzgar. Máximo 25 palabras, español rioplatense.` }],
    { type: 'object', additionalProperties: false, properties: { pregunta: { type: 'string' } }, required: ['pregunta'] }, PERFIL)
  return r.pregunta
}
