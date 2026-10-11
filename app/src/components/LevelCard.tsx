import { useStore } from '../lib/store'
import { levelInfo, MEDAL_ICON, totalXp, weekMedals } from '../lib/logic'
import { today, weekStart } from '../lib/date'
import { Bar } from './ui'
import { useT } from '../lib/i18n'

export const LevelCard = () => {
  const d = useStore()
  const t = useT()
  const xp = totalXp(d)
  const L = levelInfo(xp)
  const wm = weekMedals(d, weekStart(today()))
  return (
    <section className="card level" style={{ ['--league' as string]: L.league.color }}>
      <div className="row">
        <div className="grow">
          <div className="small muted">{t('nivel')} {L.lvl} · Liga <b style={{ color: L.league.color }}>{L.league.name}</b></div>
          <div className="big">{xp.toLocaleString('es-AR')} XP</div>
        </div>
        {wm.globalMedal && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 34 }}>{MEDAL_ICON[wm.globalMedal]}</div>
            <div className="small muted">{Math.round((wm.global ?? 0) * 100)} % semana</div>
          </div>
        )}
      </div>
      <div style={{ marginTop: 10 }}><Bar value={L.progress} color={L.league.color} /></div>
      <div className="small muted" style={{ marginTop: 6 }}>
        {L.toNext} XP para el nivel {L.lvl + 1}{L.nextLeague ? ` · Liga ${L.nextLeague.name} en el nivel ${L.nextLeague.min}` : ''}
      </div>
    </section>
  )
}
