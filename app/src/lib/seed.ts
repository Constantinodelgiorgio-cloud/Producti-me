import type { Area, Habit, Profile, Subject, Food } from './types'

export const AREAS: Area[] = [
  { id: 'fisico', nombre: 'Físico', nameEn: 'Body', icon: 'dumbbell', peso: 3 },
  { id: 'social', nombre: 'Amigos', nameEn: 'Friends', icon: 'users', peso: 3 },
  { id: 'finanzas', nombre: 'Finanzas', nameEn: 'Money', icon: 'wallet', peso: 3 },
  { id: 'salud', nombre: 'Salud y sueño', nameEn: 'Health & sleep', icon: 'heart-pulse', peso: 2 },
  { id: 'mente', nombre: 'Mente', nameEn: 'Mind', icon: 'brain', peso: 2 },
  { id: 'estudio', nombre: 'Estudio', nameEn: 'Study', icon: 'book-open', peso: 2 },
  { id: 'estetica', nombre: 'Estética', nameEn: 'Looks', icon: 'scan-face', peso: 2 },
  { id: 'trabajo', nombre: 'Trabajo', nameEn: 'Work', icon: 'hammer', peso: 1 },
  { id: 'disfrute', nombre: 'Disfrute', nameEn: 'Fun', icon: 'compass', peso: 1 },
]

const ALL: number[] = []
const LV = [0, 1, 2, 3, 4]
const LS = [0, 1, 2, 3, 4, 5]

let n = 0
const h = (area: Habit['area'], nombre: string, xp: number, dias: number[] = ALL, minimo?: string): Habit => ({
  id: `h${++n}`, area, nombre, xp, dias, minimo, activo: true,
})

export const HABITS: Habit[] = [
  h('fisico', 'Entrenamiento del día (gimnasio / rugby)', 30, LS, '20 min de movilidad'),
  h('fisico', 'Movilidad / elongación 10 min', 10, ALL, '3 min'),
  h('salud', 'Registrar todas las comidas', 15, ALL, 'Registrar al menos 2 comidas'),
  h('salud', 'Llegar a la proteína del día', 15),
  h('salud', '3 litros de agua', 10, ALL, '2 litros'),
  h('salud', 'Clindamicina (hasta terminar el tratamiento)', 5),
  h('salud', 'Dormir 6,5 h o más', 20),
  h('mente', 'Celular fuera de la cama 30 min antes de dormir', 15, ALL, '10 min'),
  h('mente', 'Journaling 5 min', 10, ALL, 'Una frase'),
  h('mente', 'Hacer algo fuera de la rutina (anti-bucle)', 20, [4, 6]),
  h('estudio', 'Estudio facultad 60 min', 25, [0, 1, 2, 3, 4, 6], '25 min'),
  h('estudio', 'Inglés 20 min', 10, ALL, '5 min de audio'),
  h('estudio', 'IA 60 min (aprender o construir)', 20, ALL, '15 min'),
  h('estudio', 'Lectura 20 min', 10, ALL, '5 páginas'),
  h('estetica', 'Skincare mañana', 5),
  h('estetica', 'Skincare noche', 5),
  h('estetica', 'Manos y uñas', 10, [6]),
  h('estetica', 'Outfit pensado (formal con buenas vibes)', 5, LS),
  h('finanzas', 'Registrar ingresos y gastos del día', 10),
  h('finanzas', 'Revisar portafolio y anotar valor', 10, [4]),
  h('social', 'Escribirle a alguien del grupo', 15, ALL, 'Reaccionar a algo del grupo'),
  h('social', 'Proponer o sumarme a un plan con amigos', 30, [2, 5]),
  h('trabajo', 'Bloque marmolería / redes', 15, LV),
]

export const PROFILE: Profile = {
  nombre: 'Constantino',
  pesoObjetivo: 102,
  grasaObjetivo: 17,
  ahorroObjetivo: 5000,
  ahorroFecha: '2027-01-11',
  rendimientoObjetivo: 12,
  rendimientoDesde: '2026-07-01',
  rendimientoHasta: '2026-12-31',
  // Estimación inicial: masa magra ≈ 77,5 kg → BMR (Katch-McArdle) ≈ 2045 kcal × 1,7 actividad − ~450 de déficit.
  // Validar con la nutricionista.
  kcalObjetivo: 3000,
  protObjetivo: 200,
  suenoMin: 6.5,
  horasAprendizaje: 24,
  marcasPrevias: [
    { nombre: 'Press de banca', kg: 140, reps: 8 },
    { nombre: 'Sentadilla', kg: 200, reps: 1 },
    { nombre: 'Peso muerto', kg: 200, reps: 1 },
  ],
  despertar: ['06:00', '07:50', '06:00', '07:50', '06:00', '07:00', '13:00'],
  agenda: [
    [ { hora: '07:00', que: 'Facultad presencial (hasta 9:00)' }, { hora: '12:30', que: 'Almuerzo' }, { hora: '14:30', que: 'Gimnasio enfocado en rugby (1:30–2 h)' }, { hora: '18:00', que: 'Marmolería / novia' } ],
    [ { hora: '08:00', que: 'Facultad virtual (hasta 11:40)' }, { hora: '12:30', que: 'Almuerzo' }, { hora: '14:30', que: 'Gimnasio' }, { hora: '20:30', que: 'Rugby: video + activación + entrenamiento', intensidad: 'roja' } ],
    [ { hora: '07:00', que: 'Facultad presencial (hasta 12:20)' }, { hora: '13:00', que: 'Almuerzo + siesta corta' }, { hora: '16:00', que: 'Gimnasio' }, { hora: '19:00', que: 'Facultad / novia' } ],
    [ { hora: '08:00', que: 'Facultad virtual (hasta 11:40)' }, { hora: '12:30', que: 'Almuerzo' }, { hora: '14:30', que: 'Gimnasio' }, { hora: '21:00', que: 'Entrenamiento de rugby', intensidad: 'amarilla' } ],
    [ { hora: '07:00', que: 'Facultad presencial (hasta 9:00)' }, { hora: '14:30', que: 'Gimnasio (intensidad baja)', intensidad: 'baja' }, { hora: '21:00', que: 'Cena rica' } ],
    [ { hora: '08:00', que: 'Facultad presencial (hasta 12:40)' }, { hora: '13:00', que: 'Partido de rugby + tercer tiempo', intensidad: 'partido' } ],
    [ { hora: '18:00', que: 'Revisión semanal + planificación (15–20 min)' } ],
  ],
}

export const SUBJECTS: Subject[] = [
  { id: 's1', nombre: 'Investigación Operativa', estado: 'cursando' },
  { id: 's2', nombre: 'Emprendedurismo', estado: 'cursando' },
  { id: 's3', nombre: 'TICs para la Gestión Organizacional', estado: 'cursando' },
  { id: 's4', nombre: 'Taller de Aproximación a las Orientaciones', estado: 'cursando' },
  { id: 's5', nombre: 'Administración de PyMEs', estado: 'cursando' },
  { id: 's6', nombre: 'Matemática Financiera', estado: 'final pendiente' },
  { id: 's7', nombre: 'Costos', estado: 'final pendiente' },
]

/** Alimentos frecuentes para cargar rápido (valores aproximados por porción). */
export const FOODS: Food[] = [
  { nombre: 'Pechuga de pollo 200 g', kcal: 330, prot: 62, carb: 0, grasa: 7 },
  { nombre: 'Carne vacuna magra 200 g', kcal: 400, prot: 54, carb: 0, grasa: 20 },
  { nombre: 'Milanesa al horno (1 grande)', kcal: 450, prot: 40, carb: 30, grasa: 18 },
  { nombre: 'Huevos x3', kcal: 215, prot: 19, carb: 1, grasa: 15 },
  { nombre: 'Arroz cocido 200 g', kcal: 260, prot: 5, carb: 57, grasa: 1 },
  { nombre: 'Fideos cocidos 250 g', kcal: 395, prot: 14, carb: 77, grasa: 2 },
  { nombre: 'Papa / batata 300 g', kcal: 260, prot: 6, carb: 60, grasa: 0 },
  { nombre: 'Avena 80 g', kcal: 300, prot: 11, carb: 54, grasa: 6 },
  { nombre: 'Yogur + granola', kcal: 300, prot: 12, carb: 45, grasa: 8 },
  { nombre: 'Whey 1 scoop', kcal: 120, prot: 24, carb: 3, grasa: 2 },
  { nombre: 'Banana', kcal: 105, prot: 1, carb: 27, grasa: 0 },
  { nombre: 'Pan 2 rodajas', kcal: 160, prot: 6, carb: 30, grasa: 2 },
  { nombre: 'Ensalada grande', kcal: 120, prot: 4, carb: 15, grasa: 5 },
  { nombre: 'Atún 1 lata', kcal: 130, prot: 28, carb: 0, grasa: 2 },
  { nombre: 'Hamburguesa completa (permitido)', kcal: 900, prot: 45, carb: 70, grasa: 48 },
  { nombre: 'Pizza 3 porciones', kcal: 850, prot: 35, carb: 100, grasa: 33 },
]

export const PENALTIES = {
  fisico: ['50 burpees', '20 min de cardio extra', '100 sentadillas con peso corporal'],
  estudio: ['30 min extra de estudio de la materia más floja', 'Leer 20 páginas extra'],
  general: ['30 min extra de estudio o lectura', '50 burpees', '15 min de cardio extra'],
}

export const EMOCIONES = ['Felicidad', 'Calma', 'Motivación', 'Cansancio', 'Estrés', 'Enojo', 'Tristeza', 'Soledad', 'Ansiedad', 'Orgullo']
