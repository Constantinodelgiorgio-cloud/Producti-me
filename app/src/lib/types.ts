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
  /** plan si-entonces: "Después de [ancla], hago [versión mínima] en [lugar]" */
  ancla?: string
  /** meta de N veces por semana en vez de todos los días que aplica */
  porSemana?: number
  /** en formación (se construye) o en mantenimiento (ya automático) */
  etapa?: 'formacion' | 'mantenimiento'
  /** fecha en que empezó (para la graduación) */
  desde?: string
  /** no negociable: aparece en "Obligatorias" del día */
  obligatorio?: boolean
}
/** reserva = salto de emergencia (2 por semana por hábito): no cuenta como falta */
export type HabitState = 'hecho' | 'minimo' | 'no' | 'reserva'

/** Período en el que ciertas áreas no cuentan (partido, parciales, lesión, enfermedad, semana pesada, viaje). */
export type TipoEstado = 'partido' | 'parciales' | 'lesion' | 'enfermo' | 'semana pesada' | 'viaje'
export interface EstadoPlan { id: string; tipo: TipoEstado; desde: string; hasta: string; areas: AreaId[]; nota?: string }
/** Tarea puntual (no hábito). Sin fecha = "algún día". */
export interface Tarea { id: string; texto: string; fecha?: string; hecha?: string; creada: string; pospuesta?: number; minutos?: number; dificil?: boolean; primerPaso?: string; origen?: string }
/** Lo que se cruzó cuando un hábito no salió: para aprender, no es una excusa. */
export interface Aprendizaje { id: string; fecha: string; habitId: string; que: string; distinto?: string }

export interface CheckIn {
  fecha: string
  // mañana
  horaDormir?: string
  horaDespertar?: string
  calidadSueno?: number
  energia?: number
  animoManana?: number
  /** dolor muscular y fatiga (1 = nada, 5 = mucho), núcleo de los cuestionarios de bienestar en rugby */
  dolor?: number
  fatiga?: number
  /** corrección manual del "listo para hoy" */
  ajuste?: 'mejor' | 'peor'
  /** cierre del día hecho */
  cerrado?: boolean
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
export interface Meal { id: string; fecha: string; nombre: string; kcal: number; prot: number; carb: number; grasa: number; foodId?: string; gramos?: number; momento?: MomentoComida; /** hora (HH:MM) y número de comida del día (1.ª, 2.ª…) */ hora?: string; comida?: number }
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
/** Compra en cuotas: se carga una vez y se proyecta sobre los resúmenes de la tarjeta. */
export interface Cuota { id: string; descripcion: string; total: number; cantidad: number; primerMes: string; fecha: string }
/** Datos de mercado cacheados: dólar MEP e IPC mensual (INDEC vía datos.gob.ar). */
export interface Mercado { mep?: { venta: number; fecha: string }; ipc?: Record<string, number>; actualizado?: string }

export interface SocialLog { id: string; fecha: string; tipo: 'juntada' | 'mensaje' | 'llamada' | 'plan propuesto'; con: string; nota?: string; charla?: string; minutos?: number }
/** Persona que importa: cada cuánto querés hablarle, cumpleaños y teléfono para un mensaje de un toque. */
export interface Persona { id: string; nombre: string; cadencia: number; cumple?: string; tel?: string; nota?: string }
/** Lo que el coach sabe de vos: visible, editable y borrable. */
export interface Memoria { id: string; texto: string; fecha: string; origen: 'coach' | 'vos' }
export type ModoDiario = 'libre' | 'guiado' | 'profundo' | 'enojo'
export interface JournalEntry {
  id: string; fecha: string; texto: string; emocion?: string; modo?: ModoDiario; preguntas?: { p: string; r: string }[]; animo?: number; hora?: string
  /** medidor de ánimo de 2 ejes: agrado y energía, de −5 a 5 */
  valencia?: number; activacion?: number
  /** no la lee el coach / no aparece en recuerdos */
  privada?: boolean; sinRecuerdo?: boolean
  /** módulo de enojo: intensidad antes y después (1–10) */
  antes?: number; despues?: number
}
export interface Idea { id: string; fecha: string; titulo: string; nota?: string; estado: 'cruda' | 'investigando' | 'validando' | 'descartada' }

export interface Penalty { id: string; fecha: string; motivo: string; tarea: string; hecho: boolean; creado?: string; vence?: string; cumplidoEl?: string; evidencia?: string; sancionado?: boolean; clave?: string; reparadoEl?: string; reparacion?: string }
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
  lang: Lang; apiKey: string; coachModel: string; pinned?: Pinned; hoyView?: 'ahora' | 'dia' | 'agenda' | 'enfoque' | 'linea'
  habitView?: 'grilla' | 'lista'
  /** URL del script de Google (Apps Script) que expone los correos de pagos, y su clave */
  correoUrl?: string; correoToken?: string; correoAuto?: boolean
  /** permite que el coach lea el texto del diario */
  coachLeeDiario?: boolean
  /** sincronizar los datos entre dispositivos usando el mismo script de Google */
  syncOn?: boolean
  /** reparable: un castigo se anula volviendo (día ≥ 70 % o semana del área ≥ 75 %); duro: no se repara */
  castigos?: 'reparable' | 'duro'
  /** áreas apagadas: no aparecen en Áreas ni en el menú lateral */
  areasOff?: string[]
  /** cómo guía Cuerpo sin mirar la pantalla */
  guia?: { sonido: boolean; vibracion: boolean; voz: boolean }
}

// ---------- Cuerpo: recuperación y movimiento suave ----------
export type TipoCuerpo = 'respiracion' | 'estiramiento' | 'cardio' | 'caminata'
/** Datos que llegan solos desde la app Salud (Atajos de iOS → script de Google). */
export interface Salud { pasos?: number; sueno?: number; fcReposo?: number; kcalActivas?: number; distanciaKm?: number; actualizado?: string }
export interface SesionCuerpo { id: string; fecha: string; tipo: TipoCuerpo; nombre: string; minutos: number; nota?: string; fc?: number }

// ---------- Plan por día (lo que el Coach o vos cambian para una fecha puntual) ----------
/** hora vacía ('') = obligatoria sin horario fijo (se hace cuando se pueda, pero hoy sí o sí) */
export interface AgendaItem { hora: string; que: string; intensidad?: Intensity }
/** Algo que pasó en el día: una nota rápida, un imprevisto, un cambio de plan o algo bueno. */
export type TipoSuceso = 'nota' | 'imprevisto' | 'cambio' | 'bien'
export interface Suceso { id: string; fecha: string; hora: string; texto: string; tipo: TipoSuceso }
export type CategoriaExcusa = 'causa externa' | 'compromiso real' | 'salud' | 'fuerza mayor'
export interface Excusa { motivo: string; categoria: CategoriaExcusa; alternativa?: string }
export interface PlanDia {
  agenda?: AgendaItem[]
  /** estado de cada obligatoria del día (clave = texto del bloque) */
  hechos?: Record<string, 'hecho' | 'no'>
  /** hora (HH:MM) en que se marcó cada hábito u obligatoria: alimenta "Lo que va pasando" */
  horas?: Record<string, string>
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
