import { useGameStore, selectRoleById } from '../store/gameStore.js'
import { actionIcon } from '../lib/actions.js'
import LinkDot from './LinkDot.jsx'

export default function HistorySidebar() {
  const log = useGameStore((s) => s.actionLog)
  const state = useGameStore.getState()
  const nameOf = (pid) => state.players.find((p) => p.id === pid)?.name ?? '?'

  return (
    <aside>
      <h3 className="mb-2 font-semibold text-gray-300">History</h3>
      <ul className="max-h-[70vh] space-y-1 overflow-auto text-sm">
        {log.length === 0 && <li className="text-gray-500">No actions yet.</li>}
        {log.map((a) => {
          if (a.type === 'link') {
            const actor = selectRoleById(state, a.actor)
            return (
              <li key={a.id} className="rounded bg-black/20 px-2 py-1">
                <span className="text-gray-500">R{a.round}</span>{' '}
                <span style={{ color: actor.color }}>{actor.name}</span>{' '}
                <span className="text-base" style={{ color: a.color }}>🔗</span>{' '}
                {a.targets.map(nameOf).join(' + ')}
              </li>
            )
          }
          if (a.kind === 'elim') {
            const targetRole = selectRoleById(state, state.assignments[a.target])
            return (
              <li key={a.id} className="rounded bg-black/20 px-2 py-1 text-gray-300">
                <span className="text-gray-500">R{a.round}</span>{' '}
                <span className="text-base">🪦</span> {nameOf(a.target)} <LinkDot pid={a.target} />{' '}
                <span className="text-xs text-gray-500">({targetRole.name})</span>{' '}
                <span className="text-gray-500">— {a.reason || 'eliminated'}</span>
              </li>
            )
          }
          const actor = selectRoleById(state, a.actor)
          const targetRole = selectRoleById(state, state.assignments[a.target])
          return (
            <li key={a.id} className="rounded bg-black/20 px-2 py-1">
              <span className="text-gray-500">R{a.round}</span>{' '}
              <span style={{ color: actor.color }}>{actor.name}</span>{' '}
              <span className="text-base">{actionIcon(a.type)}</span>{' '}
              {nameOf(a.target)} <LinkDot pid={a.target} />{' '}
              <span className="text-xs text-gray-500">({targetRole.name})</span>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
