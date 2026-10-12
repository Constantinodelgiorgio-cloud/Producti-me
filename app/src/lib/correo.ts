import { useStore } from './store'
import { iso, uid } from './date'
import { CATS_GASTO, CATS_INGRESO } from './seed'
import type { CuentaId, MoneyMove, Pendiente } from './types'

// Correos de pagos (Mercado Pago, Santander, Visa) que expone el script de Google del usuario
// (ver integraciones/gmail-finanzas.gs). La app los lee al abrirse y cada 10 minutos.

export interface Correo { id: string; fecha: string; de: string; asunto: string; texto: string }

const monto = (s: string) => {
  const m = s.match(/(?:\$|ARS|AR\$)\s?(\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?|\d+(?:,\d{1,2})?)/i)
  if (!m) return null
  return Number(m[1].replace(/\./g, '').replace(',', '.'))
}
const usd = (s: string) => /U\$S|USD|US\$/i.test(s)

const CAT_KEYS: [RegExp, string][] = [
  [/carrefour|coto|d[ií]a%?|vea|changomas|jumbo|disco|supermerc|autoservicio|almac[eé]n|libertad/i, 'Supermercado'],
  [/pedidosya|rappi|delivery/i, 'Delivery'],
  [/mcdonald|burger|mostaza|caf[eé]|bar |resto|parrilla|pizzer|heladeri|grido|starbucks|havanna/i, 'Comida afuera'],
  [/uber|cabify|didi|sube|colectivo|remis|taxi|peaje/i, 'Transporte'],
  [/ypf|shell|axion|puma|combustible|nafta/i, 'Combustible'],
  [/farmac|farmacity|cl[ií]nica|m[eé]dic|osde|swiss/i, 'Salud y farmacia'],
  [/gym|gimnasio|suplement|nutri/i, 'Gimnasio y suplementos'],
  [/netflix|spotify|disney|hbo|max|youtube|apple|google|icloud|personal|movistar|claro|edenor|edesur|dpec|aguas|telecentro|internet/i, 'Servicios y suscripciones'],
  [/anthropic|openai|claude|chatgpt|github|steam/i, 'Tecnología e IA'],
  [/zara|nike|adidas|ropa|indumentaria|perfum|barber/i, 'Ropa y estética'],
  [/universidad|unne|facultad|librer[ií]a|fotocop/i, 'Facultad'],
]
const categoria = (texto: string, tipo: 'gasto' | 'ingreso') => {
  if (tipo === 'ingreso') return /transfer/i.test(texto) ? 'Transferencia recibida' : 'Otros'
  if (/transferencia|transferiste|enviaste dinero/i.test(texto)) return 'Transferencias'
  return CAT_KEYS.find(([r]) => r.test(texto))?.[1] ?? 'Otros'
}
const cuenta = (c: Correo): CuentaId => {
  const t = `${c.de} ${c.asunto} ${c.texto}`
  if (/mercadopago|mercado pago/i.test(t)) return 'mp'
  if (/cr[eé]dito/i.test(t)) return 'credito'
  if (/d[eé]bito/i.test(t)) return 'debito'
  return 'santander'
}

/** Lectura local por patrones. Devuelve null si no hay confianza suficiente (entonces decide la IA o vos). */
export const parseCorreo = (c: Correo): (Omit<MoneyMove, 'id'> & { confianza: 'alta' | 'baja' }) | null => {
  const t = `${c.asunto}\n${c.texto}`
  if (/resumen de (tu )?cuenta|promoci|beneficio|descuento exclusivo|inici(o|aste) sesi[oó]n|c[oó]digo de (seguridad|verificaci)/i.test(c.asunto)) return null
  const ing = /recibiste|te (enviaron|transfirieron|pagaron)|acreditamos|ingres[oó] dinero|cobraste/i.test(t)
  const gas = /pagaste|compraste|consumo|compra (aprobada|con)|enviaste|transferiste|debitamos|d[eé]bito autom|pago (aprobado|realizado)|realizaste un pago/i.test(t)
  if (ing === gas) return null
  const m = monto(t)
  if (!m || m <= 0) return null
  const tipo = ing ? 'ingreso' : 'gasto'
  const com = t.match(/(?:en|a)\s+([A-ZÁÉÍÓÚÑ0-9][\wÁÉÍÓÚÑáéíóúñ&.\- ]{2,40}?)(?:\s+(?:por|con|el|\.|,|\n)|$)/)
  return {
    fecha: iso(new Date(c.fecha)), tipo, monto: m, moneda: usd(t) ? 'USD' : 'ARS', cuenta: cuenta(c), categoria: categoria(t, tipo),
    comercio: com?.[1]?.trim(), nota: c.asunto.slice(0, 80), origen: 'correo', ref: c.id, confianza: com ? 'alta' : 'baja',
  }
}

let corriendo = false
/** Descarga correos nuevos, los registra (o los deja para confirmar) y marca como vistos. */
export const syncCorreo = async (): Promise<{ nuevos: number; pendientes: number }> => {
  if (corriendo) return { nuevos: 0, pendientes: 0 }
  corriendo = true
  const st = useStore.getState()
  const { correoUrl, correoToken, correoAuto = true, apiKey } = st.settings
  try {
    if (!correoUrl) return { nuevos: 0, pendientes: 0 }
    const url = new URL(correoUrl)
    url.searchParams.set('token', correoToken ?? '')
    if (st.correo.ultima) url.searchParams.set('desde', String(new Date(st.correo.ultima).getTime() - 3 * 86400e3))
    const r = await fetch(url.toString(), { redirect: 'follow' })
    const j = await r.json() as { mensajes?: Correo[]; error?: string }
    if (j.error || !j.mensajes) throw new Error(j.error === 'unauthorized' ? 'La clave del script no coincide.' : j.error ?? 'Respuesta inválida del script.')
    const vistos = new Set(st.correo.vistos)
    const ya = new Set([...st.money.map((m) => m.ref), ...st.pendientes.map((p) => p.ref)].filter(Boolean))
    const nuevos = j.mensajes.filter((m) => !vistos.has(m.id) && !ya.has(m.id))
    const moves: MoneyMove[] = []
    const pend: Pendiente[] = []
    const dudosos: Correo[] = []
    for (const c of nuevos) {
      const p = parseCorreo(c)
      if (!p) { dudosos.push(c); continue }
      const { confianza, ...mv } = p
      if (correoAuto && confianza === 'alta') moves.push({ id: uid(), ...mv })
      else pend.push({ id: uid(), ...mv, fuente: `Correo: ${c.asunto}`, confianza })
    }
    // Lo que los patrones no entienden lo lee la IA (si hay clave); queda siempre para confirmar.
    if (dudosos.length && apiKey) {
      try {
        const { leerCorreos } = await import('./coach')
        const leidos = await leerCorreos(useStore.getState(), dudosos.slice(0, 15), [...CATS_GASTO, ...CATS_INGRESO])
        for (const m of leidos) if (m.monto > 0) pend.push({ id: uid(), fecha: m.fecha, tipo: m.tipo, monto: m.monto, moneda: m.moneda, cuenta: m.cuenta, categoria: m.categoria, comercio: m.comercio || undefined, origen: 'correo', ref: m.ref || undefined, fuente: `Correo leído por IA${m.comercio ? `: ${m.comercio}` : ''}`, confianza: 'baja' })
      } catch { /* sin IA: los correos dudosos se ignoran */ }
    }
    useStore.getState().set((s) => ({
      money: [...s.money, ...moves],
      pendientes: [...s.pendientes, ...pend],
      correo: { ultima: new Date().toISOString(), vistos: [...new Set([...s.correo.vistos, ...nuevos.map((m) => m.id)])].slice(-800), error: undefined },
    }))
    return { nuevos: moves.length, pendientes: pend.length }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    useStore.getState().set((s) => ({ correo: { ...s.correo, error: msg } }))
    throw e
  } finally {
    corriendo = false
  }
}
