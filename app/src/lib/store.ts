import { create } from 'zustand'
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware'
import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval'
import type {
  Alimento, Aporte, BodyEntry, CareLog, Cambio, Chat, CheckIn, ComidaGuardada, Exam, Habit, HabitState, Idea, JournalEntry, Meal, MoneyMove,
  Pendiente, Penalty, Photo, PlanDia, Posicion, Profile, Review, Reward, Ruta, Salud, Sancion, SesionCuerpo, Settings, Snapshot, SocialLog, StudySession, Subject, Workout,
} from './types'
import { HABITS, PROFILE, RUTAS, SUBJECTS } from './seed'
import { today } from './date'

// IndexedDB en vez de localStorage: sin límite de 5 MB (fotos de progreso).
const idbStorage: StateStorage = {
  getItem: async (k) => (await idbGet<string>(k)) ?? null,
  setItem: (k, v) => idbSet(k, v),
  removeItem: (k) => idbDel(k),
}

export interface Data {
  inicio: string // primer día de uso: lo anterior no cuenta para medallas
  profile: Profile
  settings: Settings
  habits: Habit[]
  habitLog: Record<string, Record<string, HabitState>> // fecha → habitId → estado
  checkins: Record<string, CheckIn>
  workouts: Workout[]
  body: BodyEntry[]
  meals: Meal[]
  subjects: Subject[]
  exams: Exam[]
  study: StudySession[]
  savings: Snapshot[]
  portfolio: Snapshot[]
  money: MoneyMove[]
  social: SocialLog[]
  journal: JournalEntry[]
  ideas: Idea[]
  penalties: Penalty[]
  rewards: Reward[]
  care: CareLog[]
  photos: Photo[]
  reviews: Review[]
  xpAdjust: { fecha: string; xp: number; motivo: string }[]
  coachLog: { fecha: string; texto: string }[]
  processed: string[] // claves de eventos ya procesados (castigos/premios)
  // ---- v2 ----
  planDia: Record<string, PlanDia> // fecha → cambios puntuales de agenda y hábitos
  cambios: Cambio[]
  chats: Chat[]
  sanciones: Sancion[]
  favoritos: string[] // ids de alimentos
  comidasGuardadas: ComidaGuardada[]
  alimentosPropios: Alimento[]
  presupuestos: Record<string, number> // categoría → ARS por mes
  pendientes: Pendiente[]
  posiciones: Posicion[]
  aportes: Aporte[]
  correo: { ultima?: string; vistos: string[]; error?: string }
  rutas: Ruta[]
  // ---- v3 ----
  cuerpo: SesionCuerpo[]
  pasos: Record<string, number> // fecha → pasos
  salud: Record<string, Salud> // fecha → datos automáticos de la app Salud
}

export const initialData = (): Data => ({
  inicio: today(),
  profile: PROFILE,
  settings: { lang: 'es', apiKey: '', coachModel: 'claude-opus-5-5' },
  habits: HABITS,
  habitLog: {},
  checkins: {},
  workouts: [],
  body: [{ fecha: '2026-10-11', peso: 102, grasa: 24 }],
  meals: [],
  subjects: SUBJECTS,
  exams: [],
  study: [],
  savings: [{ fecha: '2026-10-11', valor: 1200 }],
  portfolio: [],
  money: [],
  social: [],
  journal: [],
  ideas: [
    { id: 'i1', fecha: '2026-10-11', titulo: 'Aditivos de biochar para hormigón', estado: 'cruda' },
    { id: 'i2', fecha: '2026-10-11', titulo: 'Portfolio inteligente que invierta en todos los mercados', estado: 'investigando' },
  ],
  penalties: [],
  rewards: [],
  care: [],
  photos: [],
  reviews: [],
  xpAdjust: [],
  coachLog: [],
  processed: [],
  planDia: {},
  cambios: [],
  chats: [],
  sanciones: [],
  favoritos: [],
  comidasGuardadas: [],
  alimentosPropios: [],
  presupuestos: {},
  pendientes: [],
  posiciones: [],
  aportes: [],
  correo: { vistos: [] },
  rutas: RUTAS,
  cuerpo: [],
  pasos: {},
  salud: {},
})

export const BACKUP_KEY = 'producti-me-respaldo-v1'
const H48 = 48 * 3600 * 1000

/**
 * v1 → v2: solo agrega campos; nunca borra ni renombra datos.
 * Antes de migrar se guarda una copia completa en IndexedDB (se descarga desde Ajustes).
 */
export const migrateV1 = (old: Record<string, unknown>): Partial<Data> => {
  const d = old as unknown as Data
  const now = Date.now()
  const settings = { ...d.settings }
  if (settings.hoyView === 'enfoque') settings.hoyView = 'ahora'
  if (settings.hoyView === 'linea') settings.hoyView = 'agenda'
  return {
    ...d,
    settings,
    // Nueva ruta de estudio: programación (solo si no existe un hábito parecido).
    habits: (d.habits ?? []).some((h) => /programaci/i.test(h.nombre)) ? d.habits : [...(d.habits ?? []), { id: 'h-prog', area: 'estudio', nombre: 'Programación 30 min', xp: 15, dias: [0, 1, 2, 3, 4], minimo: '10 min', activo: true }],
    // Los movimientos cargados eran gastos e ingresos diarios en pesos (el formulario decía USD por error).
    money: (d.money ?? []).map((m) => ({ ...m, moneda: m.moneda ?? 'ARS', origen: m.origen ?? 'manual' })),
    // La nota única de cada materia pasa a ser la nota del Final.
    subjects: (d.subjects ?? []).map((s) => (s.ae || s.nota === undefined ? s : { ...s, ae: { final: s.nota } })),
    // Los castigos pendientes reciben 48 h desde hoy para no vencer de golpe.
    penalties: (d.penalties ?? []).map((p) => (p.vence || p.hecho ? p : { ...p, creado: new Date(now).toISOString(), vence: new Date(now + H48).toISOString() })),
  }
}

const backups = new Set<string>()
const backupOnce = async (raw: unknown, key = BACKUP_KEY) => {
  if (backups.has(key)) return
  backups.add(key)
  try { if (!(await idbGet(key))) await idbSet(key, JSON.stringify(raw)) } catch { /* sin almacenamiento */ }
}
export const BACKUP_KEY_V2 = 'producti-me-respaldo-v2'

/**
 * Empezar de cero desde hoy: hoy pasa a ser el día 1. No borra registros (comidas, gastos,
 * estudio, diario, entrenamientos): XP, medallas y castigos solo cuentan desde `inicio`.
 * Se descartan los castigos, sanciones y permitidos generados antes, que venían de días sin uso real.
 */
export const reiniciarDias = (d: Partial<Data>, desde = today()): Partial<Data> => ({
  ...d,
  inicio: desde,
  penalties: (d.penalties ?? []).filter((p) => p.fecha >= desde && p.hecho),
  sanciones: [],
  rewards: (d.rewards ?? []).filter((r) => r.fecha >= desde),
  xpAdjust: (d.xpAdjust ?? []).filter((x) => x.fecha >= desde),
  // Se conservan los hitos de grasa ya otorgados para no volver a generarlos.
  processed: (d.processed ?? []).filter((k) => k.startsWith('fat:')),
})

type Updater = (d: Data) => Partial<Data>
interface Store extends Data {
  set: (fn: Updater) => void
  replaceAll: (d: Data) => void
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      ...initialData(),
      set: (fn) => set((s) => fn(s)),
      replaceAll: (d) => set(() => ({ ...initialData(), ...(!('planDia' in d) ? migrateV1(d as unknown as Record<string, unknown>) : d) })),
    }),
    {
      name: 'producti-me',
      version: 3,
      storage: createJSONStorage(() => idbStorage),
      migrate: async (persisted, version) => {
        let p = persisted as Record<string, unknown>
        if (version < 2) { await backupOnce(p); p = migrateV1(p) as Record<string, unknown> }
        // v3: el usuario pidió empezar de cero los días a partir de la versión 3 (con copia previa).
        if (version < 3) { await backupOnce(p, BACKUP_KEY_V2); p = reiniciarDias(p as Partial<Data>) as Record<string, unknown> }
        return p as unknown as Store
      },
      partialize: (s) => {
        const { set: _s, replaceAll: _r, ...data } = s
        return data
      },
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<Data>
        // Campos nuevos que falten (ej. al importar una copia vieja) toman el valor inicial.
        return { ...current, ...p, correo: { ...current.correo, ...p.correo }, rutas: p.rutas?.length ? p.rutas : current.rutas }
      },
    },
  ),
)

export const exportData = (): Data => {
  const { set: _s, replaceAll: _r, ...data } = useStore.getState()
  return data
}
