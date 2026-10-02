import { useShallow } from 'zustand/react/shallow'
import { useGameStore, selectRoleById } from '../store/gameStore.js'
import { actionIcon } from '../lib/actions.js'
import LinkDot from './LinkDot.jsx'
import RoleAvatar from './RoleAvatar.jsx'

// "Night 2" reads better than "R2" when you are trying to remember whether a
// death was a vote or a kill. Entries logged before phases were recorded fall
// back to the bare round.
function When({ entry }) {
  const label = entry.phase === 'day' ? 'Day' : entry.phase === 'night' ? 'Night' : null
  return (
    <span className="shrink-0 text-xs text-gray-500">
      {label ? `${label} ${entry.round}` : `R${entry.round}`}
    </span>
  )
}

function Entry({ entry }) {
  const state = useGameStore.getState()
  const nameOf = (pid) => state.players.find((p) => p.id === pid)?.name ?? '?'

  if (entry.type === 'link') {
    const actor = selectRoleById(state, entry.actor)
    return (
      <li className="flex flex-wrap items-center gap-1.5 rounded-lg bg-black/25 px-2 py-1.5">
        <When entry={entry} />
        <RoleAvatar role={actor} size="xs" />
        <span style={{ color: actor.color }}>{actor.name}</span>
        <span className="text-base" style={{ color: entry.color }}>🔗</span>
        <span>{entry.targets.map(nameOf).join(' + ')}</span>
        {entry.deadly && <span className="text-xs text-pink-400">💔 die together</span>}
      </li>
    )
  }

  if (entry.kind === 'elim') {
    const role = selectRoleById(state, state.assignments[entry.target])
    return (
      <li className="flex flex-wrap items-center gap-1.5 rounded-lg bg-black/25 px-2 py-1.5 text-gray-300">
        <When entry={entry} />
        <RoleAvatar role={role} size="xs" dead />
        <span className="text-base">🪦</span>
        <span>{nameOf(entry.target)}</span>
        <LinkDot pid={entry.target} />
        <span className="text-xs text-gray-400">({role.name})</span>
        <span className="text-gray-500">— {entry.reason || 'eliminated'}</span>
        {entry.note && <span className="w-full text-xs text-gray-400">📝 {entry.note}</span>}
      </li>
    )
  }

  const actor = selectRoleById(state, entry.actor)
  const targetRole = selectRoleById(state, state.assignments[entry.target])
  return (
    <li className="flex flex-wrap items-center gap-1.5 rounded-lg bg-black/25 px-2 py-1.5">
      <When entry={entry} />
      <RoleAvatar role={actor} size="xs" />
      <span style={{ color: actor.color }}>{actor.name}</span>
      <span className="text-base">{actionIcon(entry.type)}</span>
      <span>{nameOf(entry.target)}</span>
      <LinkDot pid={entry.target} />
      <span className="text-xs text-gray-400">({targetRole.name})</span>
      {entry.note && <span className="w-full text-xs text-gray-400">📝 {entry.note}</span>}
    </li>
  )
}

// Everything that has happened this game, newest last. Shared by the sidebar on
// a wide screen and the log sheet behind the floating button.
export default function GameLog({ className = '' }) {
  const log = useGameStore(useShallow((s) => s.actionLog))
  if (log.length === 0) {
    return <p className={`text-sm text-gray-500 ${className}`}>Nothing has happened yet.</p>
  }
  return (
    <ul aria-label="game log" className={`space-y-1 text-sm ${className}`}>
      {log.map((a) => <Entry key={a.id} entry={a} />)}
    </ul>
  )
}
