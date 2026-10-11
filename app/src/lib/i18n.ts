import { useStore } from './store'

const dict = {
  hoy: ['Hoy', 'Today'],
  habitos: ['Hábitos', 'Habits'],
  fisico: ['Físico', 'Body'],
  estudio: ['Estudio', 'Study'],
  finanzas: ['Finanzas', 'Money'],
  vida: ['Vida', 'Life'],
  revision: ['Revisión', 'Review'],
  ajustes: ['Ajustes', 'Settings'],
  avisos: ['Avisos', 'Alerts'],
  recomendaciones: ['Recomendaciones', 'Recommendations'],
  recuerdos: ['Recuerdos', 'Memories'],
  agenda: ['Agenda de hoy', "Today's plan"],
  pendientes: ['Pendientes de hoy', 'To do today'],
  checkinManana: ['Check-in de la mañana', 'Morning check-in'],
  checkinNoche: ['Check-in de la noche', 'Evening check-in'],
  guardar: ['Guardar', 'Save'],
  agregar: ['Agregar', 'Add'],
  borrar: ['Borrar', 'Delete'],
  semana: ['Semana', 'Week'],
  nivel: ['Nivel', 'Level'],
  coach: ['Coach', 'Coach'],
  hecho: ['Hecho', 'Done'],
  minimo: ['Mínimo', 'Minimum'],
  castigos: ['Castigos', 'Penalties'],
  premios: ['Permitidos', 'Rewards'],
  entrenamientos: ['Entrenamientos', 'Workouts'],
  comidas: ['Comidas', 'Meals'],
  cuerpo: ['Cuerpo', 'Body stats'],
  fotos: ['Fotos de progreso', 'Progress photos'],
  amigos: ['Amigos', 'Friends'],
  diario: ['Diario', 'Journal'],
  ideas: ['Banco de ideas', 'Idea bank'],
  estetica: ['Estética', 'Looks'],
  podio: ['Podio de la semana', 'Weekly podium'],
} as const

export type Key = keyof typeof dict
export const useT = () => {
  const lang = useStore((s) => s.settings.lang)
  return (k: Key) => dict[k][lang === 'es' ? 0 : 1]
}
