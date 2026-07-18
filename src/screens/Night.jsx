import { useShallow } from 'zustand/react/shallow'
import {
  useGameStore, selectNightRoles, selectRoleById, selectSurvivors,
} from '../store/gameStore.js'
import ActionPanel from '../components/ActionPanel.jsx'

function NightSummary() {
  const round = useGameStore((s) => s.round)
  const endNight = useGameStore((s) => s.endNight)
  const eliminate = useGameStore((s) => s.eliminate)
  const survivors = useGameStore(useShallow(selectSurvivors))
  const actions = useGameStore(
    useShallow((s) => s.actionLog.filter((a) => a.round === round)),
  )
  const state = useGameStore.getState()
  const nameOf = (pid) => state.players.find((p) => p.id === pid)?.name ?? '?'

  return (
    <div>
      <h2>Night Summary — Round {round}</h2>
      <ol className="summary-list">
        {actions.map((a) => (
          <li key={a.id} className={`type-${a.type}`}>
            {selectRoleById(state, a.actor).name} — {a.type} → {nameOf(a.target)}
            {a.note ? ` (${a.note})` : ''}
          </li>
        ))}
        {actions.length === 0 && <li>No actions logged.</li>}
      </ol>
      <h3>Eliminate (admin decision):</h3>
      <ul className="survivor-list">
        {survivors.map((p) => (
          <li key={p.id}>
            {p.name} ({selectRoleById(state, state.assignments[p.id]).name})
            <button onClick={() => eliminate(p.id)}>Eliminate {p.name}</button>
          </li>
        ))}
      </ul>
      <button onClick={endNight}>Finish Night → Day ☀️</button>
    </div>
  )
}

function RoleCall({ role, round }) {
  const nightNext = useGameStore((s) => s.nightNext)
  const survivors = useGameStore(useShallow(selectSurvivors))
  const prev = useGameStore(
    useShallow((s) =>
      s.actionLog.filter((a) => a.actor === role.id && a.round === round - 1),
    ),
  )
  // Actions already logged THIS night by earlier roles (night runs in order,
  // so any action by another role this round happened before this role's turn).
  const tonight = useGameStore(
    useShallow((s) =>
      s.actionLog.filter((a) => a.round === round && a.actor !== role.id),
    ),
  )
  const state = useGameStore.getState()
  const nameOf = (pid) => state.players.find((p) => p.id === pid)?.name ?? '?'

  return (
    <div className="night-layout">
      <div>
        <h2 className="night-role" style={{ color: role.color }}>{role.name}</h2>
        {prev.length > 0 && (
          <p className="prev-actions">
            Last night: {prev.map((a) => `${a.type}→${nameOf(a.target)}`).join(', ')}
          </p>
        )}
        <ActionPanel role={role} round={round} />
        <div className="night-nav">
          <button onClick={nightNext}>Done →</button>
          <button onClick={nightNext}>Skip →</button>
        </div>
      </div>
      <aside>
        <h3>Tonight so far</h3>
        <ul className="tonight-list">
          {tonight.length === 0 && <li className="prev-actions">Nothing yet.</li>}
          {tonight.map((a) => (
            <li key={a.id} className={`type-${a.type}`}>
              {selectRoleById(state, a.actor).name} — {a.type} → {nameOf(a.target)}
              {a.note ? ` (${a.note})` : ''}
            </li>
          ))}
        </ul>
        <h3>Surviving players</h3>
        <ul className="survivor-list">
          {survivors.map((p) => (
            <li key={p.id}>{p.name} ({selectRoleById(state, state.assignments[p.id]).name})</li>
          ))}
        </ul>
      </aside>
    </div>
  )
}

export default function Night() {
  const cursor = useGameStore((s) => s.nightCursor)
  const round = useGameStore((s) => s.round)
  const nightRoles = useGameStore(useShallow(selectNightRoles))
  const atSummary = cursor >= nightRoles.length

  return (
    <div className="app">
      <h1>🌙 Night — Round {round}</h1>
      {atSummary ? <NightSummary /> : <RoleCall role={nightRoles[cursor]} round={round} />}
    </div>
  )
}
