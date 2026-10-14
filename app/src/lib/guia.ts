// Guía sin mirar la pantalla: sonidos, vibración y voz para respirar y estirar.
//
// Respiración (lo que pidió el usuario):
//   inhalar  → 1 vibración corta · cling agudo
//   sostener → 2 vibraciones     · dos clings suaves, tono medio
//   exhalar  → 1 vibración larga · cling grave
//
// El sonido de la respiración se genera completo antes de empezar (un solo archivo de audio),
// así sigue sonando aunque se bloquee la pantalla o se cambie de app.

import type { Fase } from './cuerpo'

export interface Guia { sonido: boolean; vibracion: boolean; voz: boolean }
export const GUIA_DEF: Guia = { sonido: true, vibracion: true, voz: true }

// ---------- Sonido ----------
export const NOTAS: Record<Fase | 'fin' | 'aviso' | 'cambio', number[]> = {
  inhala: [1046.5], // do6, agudo
  inhala2: [1318.5], // mi6: "un poco más" en el suspiro
  sostiene: [784, 784], // sol5, dos veces
  exhala: [523.25], // do5, grave
  aviso: [660],
  cambio: [880, 1174.7],
  fin: [784, 1046.5, 1318.5],
}

/** Un "cling" de campana: parciales inarmónicos que se apagan solos, sin clic al empezar. */
const cling = (ctx: BaseAudioContext, t: number, f: number, vol = 0.22, largo = 1.3) => {
  const parciales: [number, number][] = [[1, 1], [2.76, 0.32], [5.4, 0.12], [8.93, 0.05]]
  for (const [mult, amp] of parciales) {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.value = f * mult
    const dur = largo / Math.sqrt(mult)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(vol * amp, t + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    o.connect(g).connect(ctx.destination)
    o.start(t)
    o.stop(t + dur + 0.05)
  }
}
const sonarEn = (ctx: BaseAudioContext, t: number, notas: number[], vol?: number) =>
  notas.forEach((f, i) => cling(ctx, t + i * 0.22, f, vol, notas.length > 1 ? 0.9 : 1.4))

let live: AudioContext | null = null
/** Sonido inmediato (estiramientos y pruebas). Debe llamarse la primera vez desde un toque. */
export const sonar = (k: keyof typeof NOTAS, vol?: number) => {
  try {
    live ??= new AudioContext()
    if (live.state === 'suspended') void live.resume()
    sonarEn(live, live.currentTime + 0.02, NOTAS[k], vol)
  } catch { /* sin audio */ }
}

/** Arma el audio completo de una sesión de respiración y lo devuelve como archivo WAV. */
export const renderRespiracion = async (fases: { f: Fase; s: number }[], totalSeg: number): Promise<{ url: string; eventos: { t: number; f: Fase }[] }> => {
  const sr = 22050
  const ciclo = fases.reduce((a, x) => a + x.s, 0)
  const ciclos = Math.max(1, Math.round(totalSeg / ciclo))
  const dur = ciclos * ciclo + 2.5
  const ctx = new OfflineAudioContext(1, Math.ceil(sr * dur), sr)
  const eventos: { t: number; f: Fase }[] = []
  let t = 0.3
  for (let c = 0; c < ciclos; c++) for (const x of fases) { eventos.push({ t, f: x.f }); sonarEn(ctx, t, NOTAS[x.f]); t += x.s }
  sonarEn(ctx, t + 0.2, NOTAS.fin, 0.18)
  const buf = await ctx.startRendering()
  return { url: URL.createObjectURL(wav(buf)), eventos }
}

/** AudioBuffer mono → WAV de 16 bits. */
const wav = (b: AudioBuffer) => {
  const data = b.getChannelData(0)
  const out = new DataView(new ArrayBuffer(44 + data.length * 2))
  const str = (o: number, s: string) => { for (let i = 0; i < s.length; i++) out.setUint8(o + i, s.charCodeAt(i)) }
  str(0, 'RIFF'); out.setUint32(4, 36 + data.length * 2, true); str(8, 'WAVE'); str(12, 'fmt ')
  out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, 1, true)
  out.setUint32(24, b.sampleRate, true); out.setUint32(28, b.sampleRate * 2, true); out.setUint16(32, 2, true); out.setUint16(34, 16, true)
  str(36, 'data'); out.setUint32(40, data.length * 2, true)
  for (let i = 0; i < data.length; i++) out.setInt16(44 + i * 2, Math.max(-1, Math.min(1, data[i])) * 0x7fff, true)
  return new Blob([out], { type: 'audio/wav' })
}

// ---------- Vibración ----------
export const PATRON: Record<Fase | 'fin' | 'aviso' | 'cambio', number[]> = {
  inhala: [70],
  inhala2: [40],
  sostiene: [60, 140, 60],
  exhala: [260],
  aviso: [30],
  cambio: [60, 120, 60, 120, 60],
  fin: [120, 100, 120, 100, 300],
}
const esIOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.userAgent.includes('Macintosh') && navigator.maxTouchPoints > 1)
/** Android vibra de verdad. En iPhone se usa el "toque" del sistema de iOS 18 (más suave y no siempre disponible). */
export const vibracionDisponible = (): 'si' | 'ios' | 'no' => ('vibrate' in navigator ? 'si' : esIOS() ? 'ios' : 'no')

let interruptor: HTMLLabelElement | null = null
const toqueIOS = () => {
  if (!interruptor) {
    interruptor = document.createElement('label')
    const i = document.createElement('input')
    i.type = 'checkbox'
    i.setAttribute('switch', '')
    interruptor.appendChild(i)
    interruptor.style.cssText = 'position:fixed;opacity:0;pointer-events:none;width:1px;height:1px;overflow:hidden'
    document.body.appendChild(interruptor)
  }
  interruptor.click()
}
export const vibrar = (k: keyof typeof PATRON) => {
  const p = PATRON[k]
  try {
    if ('vibrate' in navigator) { navigator.vibrate(p); return }
    if (!esIOS()) return
    // iOS: un toque por cada pulso del patrón (los pulsos largos se sienten como uno).
    let t = 0
    for (let i = 0; i < p.length; i += 2) { window.setTimeout(toqueIOS, t); t += p[i] + (p[i + 1] ?? 0) + 60 }
  } catch { /* sin vibración */ }
}

// ---------- Voz ----------
export const decir = (texto: string) => {
  try {
    const s = window.speechSynthesis
    if (!s) return
    s.cancel()
    const u = new SpeechSynthesisUtterance(texto)
    u.lang = 'es-AR'
    const v = s.getVoices().find((x) => x.lang === 'es-AR') ?? s.getVoices().find((x) => x.lang.startsWith('es'))
    if (v) u.voice = v
    u.rate = 0.95
    s.speak(u)
  } catch { /* sin voz */ }
}

// ---------- Pantalla encendida ----------
type Lock = { release: () => Promise<void> }
let lock: Lock | null = null
export const mantenerPantalla = async (on: boolean) => {
  try {
    const wl = (navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<Lock> } }).wakeLock
    if (on && wl && !lock) lock = await wl.request('screen')
    if (!on && lock) { await lock.release(); lock = null }
  } catch { /* sin soporte */ }
}
