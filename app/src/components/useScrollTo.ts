import { useEffect } from 'react'
import { useUI } from '../lib/ui'

/** Si la ruta trae una sección (ej. #finanzas/movimientos), la lleva a la vista y enfoca su primer campo. */
export const useScrollToSub = () => {
  const sub = useUI((s) => s.sub)
  useEffect(() => {
    if (!sub) return
    const t = setTimeout(() => {
      const el = document.getElementById(`sec-${sub}`)
      if (!el) return
      el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
      el.querySelector<HTMLElement>('input, select, textarea')?.focus({ preventScroll: true })
    }, 120)
    return () => clearTimeout(t)
  }, [sub])
}
