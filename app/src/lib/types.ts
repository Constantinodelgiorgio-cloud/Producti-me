export type Lang = 'es' | 'en'
export type AreaId = 'fisico' | 'salud' | 'mente' | 'estudio' | 'trabajo' | 'estetica' | 'finanzas' | 'social' | 'disfrute'
export type Medal = 'oro' | 'plata' | 'bronce' | 'malo'
export type Intensity = 'roja' | 'amarilla' | 'baja' | 'partido' | 'libre'

export interface Area { id: AreaId; nombre: string; nameEn: string; emoji: string; peso: number }

export interface Habit {
  id: string
  area: AreaId
  nombre: string
  minimo?: string
  /** días de la semana (0 = lunes) en los que aplica; vacío = todos */
  dias: number[]
  xp: number
  activo: boolean
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
export interface Meal { id: string; fecha: string; nombre: string; kcal: number; prot: number; carb: number; grasa: number }
export interface Food { nombre: string; kcal: number; prot: number; carb: number; grasa: number }

export interface Subject { id: string; nombre: string; estado: 'cursando' | 'final pendiente' | 'aprobada'; nota?: number }
export interface Exam { id: string; materiaId: string; tipo: 'parcial' | 'final' | 'TP'; fecha: string; nota?: number }
export interface StudySession { id: string; fecha: string; tema: string; tipo: 'facultad' | 'ia' | 'ingles' | 'lectura'; minutos: number; foco: number }

export interface Snapshot { fecha: string; valor: number }
export interface MoneyMove { id: string; fecha: string; tipo: 'ingreso' | 'gasto'; monto: number; categoria: string; nota?: string }

export interface SocialLog { id: string; fecha: string; tipo: 'juntada' | 'mensaje' | 'llamada' | 'plan propuesto'; con: string; nota?: string }
export interface JournalEntry { id: string; fecha: string; texto: string; emocion?: string }
export interface Idea { id: string; fecha: string; titulo: string; nota?: string; estado: 'cruda' | 'investigando' | 'validando' | 'descartada' }

export interface Penalty { id: string; fecha: string; motivo: string; tarea: string; hecho: boolean }
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
}

export interface Settings { lang: Lang; apiKey: string; coachModel: string }
