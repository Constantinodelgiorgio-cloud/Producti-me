export type Lang = 'es' | 'en'
export type AreaId = 'fisico' | 'salud' | 'mente' | 'estudio' | 'trabajo' | 'estetica' | 'finanzas' | 'social' | 'disfrute'
export type Medal = 'oro' | 'plata' | 'bronce' | 'malo'
export type Intensity = 'roja' | 'amarilla' | 'baja' | 'partido' | 'libre'

export type Momento = 'manana' | 'dia' | 'tarde' | 'noche'
export interface Area { id: AreaId; nombre: string; nameEn: string; icon: string; peso: number }

export interface Habit {
  id: string
  area: AreaId
  nombre: string
  minimo?: string
  /** días de la semana (0 = lunes) en los que aplica; vacío = todos */
  dias: number[]
  xp: number
  activo: boolean
  /** momento del día para la vista Línea; si falta se deduce del nombre */
  momento?: Momento
  /** ícono elegido (nombre del mapa de Icon.tsx); si falta se deduce del nombre */
  icono?: string
  /** hora fija en la agenda (HH:MM); si falta, la agenda le busca un hueco */
  hora?: string
}
export type HabitState = 'hecho' | 'minimo' | 'no'

export interface CheckIn {
  fecha: string
  // mañana
  horaDormir?: string
  horaDespertar?: string
  calidadSueno?: number
  energia?: number
  animoManana?: number
  prioridad?: string
  // noche
  animoNoche?: number
  estres?: number
  enojo?: number
  prioridadCumplida?: 'si' | 'parcial' | 'no'
  victoria?: string
  nota?: string
}

export interface Exercise { nombre: string; series: number; reps: number; kg: number }
export interface Workout {
  id: string
  fecha: string
  tipo: 'gimnasio' | 'rugby' | 'partido' | 'movilidad' | 'cardio'
  intensidad: Intensity
  minutos: number
  rpe: number
  ejercicios: Exercise[]
  nota?: string
}

export interface BodyEntry { fecha: string; peso?: number; grasa?: number; cintura?: number }
export type MomentoComida = 'desayuno' | 'almuerzo' | 'merienda' | 'cena' | 'snack'
export interface Meal { id: string; fecha: string; nombre: string; kcal: number; prot: number; carb: number; grasa: number; foodId?: string; gramos?: number; momento?: MomentoComida }
export interface Food { nombre: string; kcal: number; prot: number; carb: number; grasa: number }

export type Entrega = 'entregado' | 'incompleto'
/** AE1 y AE2: entregado / incompleto. AE3 (parcial), AE4 (integrador) y Final: nota de 1 a 10. */
export interface AE { ae1?: Entrega; ae2?: Entrega; ae3?: number; ae4?: number; final?: number }
export interface Subject { id: string; nombre: string; estado: 'cursando' | 'final pendiente' | 'aprobada'; nota?: number; ae?: AE }
export interface Exam { id: string; materiaId: string; tipo: 'parcial' | 'final' | 'TP'; fecha: string; nota?: number }
export type EvidenciaTipo = 'link' | 'foto' | 'texto' | 'commit'
export interface Evidencia { tipo: EvidenciaTipo; valor: string; verificado?: boolean; detalle?: string }
export type RutaId = 'ingles' | 'lectura' | 'ia' | 'programacion'
export interface StudySession { id: string; fecha: string; tema: string; tipo: 'facultad' | RutaId; minutos: number; foco: number; actividad?: string; evidencia?: Evidencia }
export interface Pregunta { p: string; opciones: string[]; correcta: number }
export interface MiniTest { fecha: string; preguntas: Pregunta[]; respuestas: number[]; aciertos: number; aprobado: boolean }
export interface MetaMes { mes: string; texto: string; test?: MiniTest }
export interface Ruta { id: RutaId; objetivo: string; metas: MetaMes[]; repo?: string }

export interface Snapshot { fecha: string; valor: number }
export type Moneda = 'ARS' | 'USD'
export type CuentaId = 'efectivo' | 'mp' | 'santander' | 'debito' | 'credito'
export type Origen = 'manual' | 'correo' | 'comprobante' | 'coach'
export interface MoneyMove { id: string; fecha: string; tipo: 'ingreso' | 'gasto'; monto: number; categoria: string; nota?: string; moneda?: Moneda; cuenta?: CuentaId; origen?: Origen; ref?: string; comercio?: string }
/** Movimiento leído de un correo o comprobante que espera confirmación. */
export interface Pendiente extends Omit<MoneyMove, 'id'> { id: string; fuente: string; confianza: 'alta' | 'baja' }
export type Activo = 'cedear' | 'accion' | 'cripto' | 'fci' | 'plazo fijo' | 'dolares' | 'bono' | 'otro'
export interface Posicion { id: string; activo: string; tipo: Activo; cantidad: number; valorUSD: number; actualizado: string }
export interface Aporte { id: string; fecha: string; usd: number; nota?: string; retiro?: boolean }

export interface SocialLog { id: string; fecha: string; tipo: 'juntada' | 'mensaje' | 'llamada' | 'plan propuesto'; con: string; nota?: string }
export type ModoDiario = 'libre' | 'guiado' | 'profundo'
export interface JournalEntry { id: string; fecha: string; texto: string; emocion?: string; modo?: ModoDiario; preguntas?: { p: string; r: string }[]; animo?: number; hora?: string }
export interface Idea { id: string; fecha: string; titulo: string; nota?: string; estado: 'cruda' | 'investigando' | 'validando' | 'descartada' }

export interface Penalty { id: string; fecha: string; motivo: string; tarea: string; hecho: boolean; creado?: string; vence?: string; cumplidoEl?: string; evidencia?: string; sancionado?: boolean }
/** Sanción por castigo vencido: sin permitidos y sin ganar XP entre `desde` y `hasta` (ISO). */
export interface Sancion { id: string; desde: string; hasta: string; motivo: string }
export interface Reward { id: string; fecha: string; motivo: string; premio: string; usado: boolean }
export interface CareLog { fecha: string; items: string[] }
export interface Photo { id: string; fecha: string; tipo: 'frente' | 'perfil' | 'espalda' | 'outfit'; data: string }

export interface Review {
  semana: string
  bien: string
  mal: string
  ajuste: string
  prioridades: string[]
  medallas: Partial<Record<AreaId, Medal>>
}

export interface Profile {
  nombre: string
  pesoObjetivo: number
  grasaObjetivo: number
  ahorroObjetivo: number
  ahorroFecha: string
  rendimientoObjetivo: number
  rendimientoDesde: string
  rendimientoHasta: string
  kcalObjetivo: number
  protObjetivo: number
  suenoMin: number
  horasAprendizaje: number
  marcasPrevias: { nombre: string; kg: number; reps: number }[]
  /** hora de despertar por día de la semana (0 = lunes) */
  despertar: string[]
  /** agenda base por día (0 = lunes) */
  agenda: { hora: string; que: string; intensidad?: Intensity }[][]
  /** Cuerpo: pasos por día y minutos de cardio suave por semana */
  pasosObjetivo?: number
  cardioObjetivo?: number
}

export type Pinned = 'fisico' | 'estudio' | 'finanzas' | 'vida'
export interface Settings {
  lang: Lang; apiKey: string; coachModel: string; pinned?: Pinned; hoyView?: 'ahora' | 'agenda' | 'enfoque' | 'linea'
  habitView?: 'grilla' | 'lista'
  /** URL del script de Google (Apps Script) que expone los correos de pagos, y su clave */
  correoUrl?: string; correoToken?: string; correoAuto?: boolean
  /** permite que el coach lea el texto del diario */
  coachLeeDiario?: boolean
  /** sincronizar los datos entre dispositivos usando el mismo script de Google */
  syncOn?: boolean
}

// ---------- Cuerpo: recuperación y movimiento suave ----------
export type TipoCuerpo = 'respiracion' | 'estiramiento' | 'cardio' | 'caminata'
export interface SesionCuerpo { id: string; fecha: string; tipo: TipoCuerpo; nombre: string; minutos: number; nota?: string; fc?: number }

// ---------- Plan por día (lo que el Coach o vos cambian para una fecha puntual) ----------
export interface AgendaItem { hora: string; que: string; intensidad?: Intensity }
export type CategoriaExcusa = 'causa externa' | 'compromiso real' | 'salud' | 'fuerza mayor'
export interface Excusa { motivo: string; categoria: CategoriaExcusa; alternativa?: string }
export interface PlanDia {
  agenda?: AgendaItem[]
  excusas?: Record<string, Excusa>
  momentos?: Record<string, Momento>
}

export type Accion =
  | { tipo: 'agenda_quitar'; fecha: string; hora: string; que: string }
  | { tipo: 'agenda_mover'; fecha: string; hora: string; que: string; nueva_hora: string }
  | { tipo: 'agenda_agregar'; fecha: string; hora: string; que: string; intensidad?: Intensity }
  | { tipo: 'habito_excusar'; fecha: string; habito_id: string; motivo: string; categoria: CategoriaExcusa; alternativa?: string }
  | { tipo: 'habito_momento'; fecha: string; habito_id: string; momento: Momento }
  | { tipo: 'prioridad'; fecha: string; texto: string }

/** Grupo de cambios aplicado: guarda el estado anterior de cada fecha tocada para revertir. */
export interface Cambio {
  id: string
  creado: string
  origen: 'coach' | 'manual'
  resumen: string
  acciones: Accion[]
  antes: { planDia: Record<string, PlanDia | null>; prioridad: Record<string, string | null> }
  revertido?: boolean
}

export interface ChatMsg {
  id: string
  rol: 'user' | 'coach' | 'propuesta' | 'registro' | 'error'
  texto?: string
  propuesta?: { toolUseId: string; resumen: string; acciones: Accion[]; estado: 'pendiente' | 'aplicada' | 'descartada' | 'revertida'; cambioId?: string; errores?: string[] }
  undoKey?: string
}
export interface Chat { id: string; fecha: string; msgs: ChatMsg[]; api: unknown[] }

// ---------- Comida ----------
export type CategoriaAlimento = 'carnes' | 'aves' | 'pescados' | 'huevos' | 'lacteos' | 'quesos' | 'cereales' | 'panificados' | 'pastas'
  | 'legumbres' | 'verduras' | 'frutas' | 'grasas' | 'platos' | 'rapida' | 'bebidas' | 'snacks' | 'dulces' | 'suplementos' | 'propios'
export interface Alimento {
  id: string
  nombre: string
  alias: string[]
  cat: CategoriaAlimento
  /** por 100 g (o 100 ml) */
  kcal: number; prot: number; carb: number; grasa: number
  porciones: { n: string; g: number }[]
}
export interface ComidaGuardada { id: string; nombre: string; items: { foodId?: string; nombre: string; gramos?: number; kcal: number; prot: number; carb: number; grasa: number }[] }
