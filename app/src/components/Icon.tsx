import {
  AlertCircle, ArrowRight, Bed, Beef, Bell, BookOpen, Bot, Brain, Calendar, CalendarCheck, Camera, Check, ChevronLeft, ChevronRight,
  Clock, Command, Compass, Download, Droplets, Dumbbell, Ellipsis, Flame, Gift, Glasses, Globe, Hammer, HeartPulse, House, KeyRound,
  Languages, LayoutGrid, Lightbulb, ListChecks, MessageCircle, Mic, Minus, Moon, NotebookPen, Pause, Pencil, PiggyBank, Pin, Play, Plus,
  Receipt, RotateCcw, Ruler, ScanFace, Search, Settings2, Shirt, Smartphone, Sparkles, Square, Sun, Target, Timer, Trash2, TrendingDown,
  TrendingUp, Trophy, Undo2, Upload, Users, Utensils, Wallet, X, Code, Banknote, Landmark, CreditCard, Drumstick, Fish, Egg, Milk, Wheat,
  Croissant, Bean, Carrot, Apple, CookingPot, Sandwich, CupSoda, Popcorn, Cake, Hourglass, Send, Link2, Image, FileText, Star, RefreshCw,
  Mail, Feather, LayoutDashboard, ShieldAlert, Zap, ArrowUp, ArrowLeft, Lock, CircleCheck, Inbox, Heart, Music, Film, Headphones, PenLine,
  GraduationCap, Quote, BookMarked, Grid2x2, List, History, Eye, ChevronDown, Sparkle, Orbit, Wind, Footprints, PersonStanding, Activity, Waves, Bike, Leaf, Phone, Coffee, Gauge, Weight, ListTodo, CalendarClock, Sunset, HandHeart, Repeat, TimerReset, CircleDot, Layers, type LucideIcon,
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
  code: Code, banknote: Banknote, landmark: Landmark, 'credit-card': CreditCard, drumstick: Drumstick, fish: Fish, egg: Egg, milk: Milk,
  wheat: Wheat, croissant: Croissant, bean: Bean, carrot: Carrot, apple: Apple, 'cooking-pot': CookingPot, sandwich: Sandwich,
  'cup-soda': CupSoda, popcorn: Popcorn, cake: Cake, hourglass: Hourglass, send: Send, link: Link2, image: Image, 'file-text': FileText,
  star: Star, refresh: RefreshCw, mail: Mail, feather: Feather, areas: LayoutDashboard, 'shield-alert': ShieldAlert, zap: Zap,
  'arrow-up': ArrowUp, 'arrow-left': ArrowLeft, lock: Lock, 'circle-check': CircleCheck, inbox: Inbox, heart: Heart, music: Music,
  film: Film, headphones: Headphones, 'pen-line': PenLine, 'graduation-cap': GraduationCap, quote: Quote, 'book-marked': BookMarked,
  grid: Grid2x2, list: List, history: History, eye: Eye, 'chevron-down': ChevronDown, sparkle: Sparkle, orbit: Orbit,
  wind: Wind, footprints: Footprints, stretch: PersonStanding, activity: Activity, waves: Waves, bike: Bike, leaf: Leaf,
  phone: Phone, coffee: Coffee, gauge: Gauge, weight: Weight, 'list-todo': ListTodo, 'calendar-clock': CalendarClock, sunset: Sunset, 'hand-heart': HandHeart, repeat: Repeat, 'timer-reset': TimerReset, 'circle-dot': CircleDot, layers: Layers,
}

export const Icon = ({ name, size = 18, stroke = 1.75, className }: { name: string; size?: number; stroke?: number; className?: string }) => {
  const C = MAP[name] ?? Square
  return <C size={size} strokeWidth={stroke} className={`ic ${className ?? ''}`} aria-hidden="true" />
}

const KEYS: [RegExp, string][] = [
  [/agua|skincare/, 'droplets'], [/clindamicina/, 'heart-pulse'], [/comidas/, 'utensils'], [/proteína/, 'beef'], [/dormir/, 'bed'],
  [/celular/, 'smartphone'], [/journal/, 'notebook-pen'], [/rutina/, 'compass'], [/facultad/, 'book-open'], [/inglés/, 'languages'],
  [/\bia\b/, 'bot'], [/lectura/, 'glasses'], [/programaci/, 'code'], [/manos/, 'scan-face'], [/outfit/, 'shirt'], [/ingresos|gastos/, 'receipt'],
  [/portafolio/, 'trending-up'], [/escribirle/, 'message-circle'], [/plan/, 'users'], [/marmoler/, 'hammer'], [/entren|movilidad/, 'dumbbell'],
]
export const habitIcon = (h: Habit) => {
  if (h.icono && MAP[h.icono]) return h.icono
  const n = h.nombre.toLowerCase()
  return KEYS.find(([r]) => r.test(n))?.[1] ?? AREAS.find((a) => a.id === h.area)?.icon ?? 'square'
}
export const areaIcon = (id: string) => AREAS.find((a) => a.id === id)?.icon ?? 'square'

/** Íconos que se pueden elegir para un hábito. */
export const HABIT_ICONS = ['dumbbell', 'droplets', 'utensils', 'beef', 'bed', 'smartphone', 'notebook-pen', 'compass', 'book-open', 'languages', 'bot', 'glasses', 'code', 'scan-face', 'shirt', 'receipt', 'trending-up', 'message-circle', 'users', 'hammer', 'heart-pulse', 'sun', 'moon', 'music', 'film', 'headphones', 'target', 'zap', 'heart', 'star']
