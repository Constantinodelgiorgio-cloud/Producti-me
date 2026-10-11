import { create } from 'zustand'
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware'
import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval'
import type {
  BodyEntry, CareLog, CheckIn, Exam, Habit, HabitState, Idea, JournalEntry, Meal, MoneyMove,
  Penalty, Photo, Profile, Review, Reward, Settings, Snapshot, SocialLog, StudySession, Subject, Workout,
} from './types'
import { HABITS, PROFILE, SUBJECTS } from './seed'
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
      replaceAll: (d) => set(() => ({ ...initialData(), ...d })),
    }),
    {
      name: 'producti-me',
      version: 1,
      storage: createJSONStorage(() => idbStorage),
      partialize: (s) => {
        const { set: _s, replaceAll: _r, ...data } = s
        return data
      },
      merge: (persisted, current) => ({ ...current, ...(persisted as Partial<Data>) }),
    },
  ),
)

export const exportData = (): Data => {
  const { set: _s, replaceAll: _r, ...data } = useStore.getState()
  return data
}
