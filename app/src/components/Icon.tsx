import {
  AlertCircle, ArrowRight, Bed, Beef, Bell, BookOpen, Bot, Brain, Calendar, CalendarCheck, Camera, Check, ChevronLeft, ChevronRight,
  Clock, Command, Compass, Download, Droplets, Dumbbell, Ellipsis, Flame, Gift, Glasses, Globe, Hammer, HeartPulse, House, KeyRound,
  Languages, LayoutGrid, Lightbulb, ListChecks, MessageCircle, Mic, Minus, Moon, NotebookPen, Pause, Pencil, PiggyBank, Pin, Play, Plus,
  Receipt, RotateCcw, Ruler, ScanFace, Search, Settings2, Shirt, Smartphone, Sparkles, Square, Sun, Target, Timer, Trash2, TrendingDown,
  TrendingUp, Trophy, Undo2, Upload, Users, Utensils, Wallet, X, type LucideIcon,
} from 'lucide-react'
import type { Habit } from '../lib/types'
import { AREAS } from '../lib/seed'

const MAP: Record<string, LucideIcon> = {
  alert: AlertCircle, 'arrow-right': ArrowRight, bed: Bed, beef: Beef, bell: Bell, 'book-open': BookOpen, bot: Bot, brain: Brain,
  calendar: Calendar, 'calendar-check': CalendarCheck, camera: Camera, check: Check, 'chevron-left': ChevronLeft, 'chevron-right': ChevronRight,
  clock: Clock, command: Command, compass: Compass, download: Download, droplets: Droplets, dumbbell: Dumbbell, ellipsis: Ellipsis, flame: Flame,
  gift: Gift, glasses: Glasses, globe: Globe, hammer: Hammer, 'heart-pulse': HeartPulse, house: House, key: KeyRound, languages: Languages,
  'layout-grid': LayoutGrid, lightbulb: Lightbulb, 'list-checks': ListChecks, 'message-circle': MessageCircle, mic: Mic, minus: Minus, moon: Moon,
  'notebook-pen': NotebookPen, pause: Pause, pencil: Pencil, 'piggy-bank': PiggyBank, pin: Pin, play: Play, plus: Plus, receipt: Receipt,
  'rotate-ccw': RotateCcw, ruler: Ruler, 'scan-face': ScanFace, search: Search, settings: Settings2, shirt: Shirt, smartphone: Smartphone,
  sparkles: Sparkles, square: Square, sun: Sun, target: Target, timer: Timer, trash: Trash2, 'trending-down': TrendingDown,
  'trending-up': TrendingUp, trophy: Trophy, undo: Undo2, upload: Upload, users: Users, utensils: Utensils, wallet: Wallet, x: X,
}

export const Icon = ({ name, size = 18, stroke = 1.75, className }: { name: string; size?: number; stroke?: number; className?: string }) => {
  const C = MAP[name] ?? Square
  return <C size={size} strokeWidth={stroke} className={`ic ${className ?? ''}`} aria-hidden="true" />
}

const KEYS: [RegExp, string][] = [
  [/agua|skincare/, 'droplets'], [/clindamicina/, 'heart-pulse'], [/comidas/, 'utensils'], [/proteína/, 'beef'], [/dormir/, 'bed'],
  [/celular/, 'smartphone'], [/journal/, 'notebook-pen'], [/rutina/, 'compass'], [/facultad/, 'book-open'], [/inglés/, 'languages'],
  [/\bia\b/, 'bot'], [/lectura/, 'glasses'], [/manos/, 'scan-face'], [/outfit/, 'shirt'], [/ingresos|gastos/, 'receipt'],
  [/portafolio/, 'trending-up'], [/escribirle/, 'message-circle'], [/plan/, 'users'], [/marmoler/, 'hammer'], [/entren|movilidad/, 'dumbbell'],
]
export const habitIcon = (h: Habit) => {
  const n = h.nombre.toLowerCase()
  return KEYS.find(([r]) => r.test(n))?.[1] ?? AREAS.find((a) => a.id === h.area)?.icon ?? 'square'
}
export const areaIcon = (id: string) => AREAS.find((a) => a.id === id)?.icon ?? 'square'
