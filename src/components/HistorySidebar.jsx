import { useGameStore, selectRoleById } from '../store/gameStore.js'

export default function HistorySidebar() {
  const log = useGameStore((s) => s.actionLog)
  const state = useGameStore.getState()
  const nameOf = (pid) => state.players.find((p) => p.id === pid)?.name ?? '?'

  return (
    <aside>
      <h3>History</h3>
      <ul className="history">
        {log.map((a) => {
          const actor = selectRoleById(state, a.actor)
          const targetRole = selectRoleById(state, state.assignments[a.target])
          return (
            <li key={a.id} className={`type-${a.type}`}>
              R{a.round} · {actor.name} — {a.type} → {nameOf(a.target)} ({targetRole.name})
              {a.note ? ` — ${a.note}` : ''}
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
