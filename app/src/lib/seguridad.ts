// Capa de seguridad: detección por reglas fijas (sin IA) de frases de riesgo en español.
// Si aparece una, la app muestra las líneas de ayuda y el coach deja de "coachear".
// Las líneas son de alcance nacional (el usuario vive en Corrientes; la 135 atiende solo CABA y GBA).

const RIESGO: RegExp[] = [
  /\bno quiero (seguir )?vivir\b/i,
  /\b(me )?quiero morir(me)?\b/i,
  /\bme quiero matar\b(?!\s+(estudiando|entrenando|laburando|trabajando|de risa))/i,
  /\b(voy a|quiero|pienso en) matarme\b(?!\s+(estudiando|entrenando|laburando|trabajando))/i,
  /\bsuicid/i,
  /\bquitarme la vida\b/i,
  /\b(terminar|acabar) con todo\b/i,
  /\b(hacerme|me hago) da[ñn]o\b/i,
  /\b(lastimarme|cortarme)\b/i,
  /\bno (tiene|le encuentro) sentido (seguir|vivir)\b/i,
  /\bmejor (estar|estaría) muerto\b/i,
  /\bdesaparecer para siempre\b/i,
  /\bno (aguanto|soporto) m[aá]s (vivir|esta vida)\b/i,
]

export const hayRiesgo = (texto: string) => RIESGO.some((r) => r.test(texto))

export interface Linea { nombre: string; numero: string; tel: string; detalle: string }
/** Verificar periódicamente en argentina.gob.ar. Si un número no responde, llamá al 911. */
export const LINEAS: Linea[] = [
  { nombre: 'Línea de salud mental', numero: '0800-999-0091', tel: '08009990091', detalle: 'Nacional · gratuita · 24 h, todos los días' },
  { nombre: 'Centro de Asistencia al Suicida', numero: '(011) 5275-1135', tel: '01152751135', detalle: 'Desde todo el país · también 0800-345-1435' },
  { nombre: 'Emergencias', numero: '911', tel: '911', detalle: 'Si hay peligro inmediato' },
  { nombre: 'Emergencias médicas', numero: '107', tel: '107', detalle: 'SAME / servicio de emergencias' },
]
