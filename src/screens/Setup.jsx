import { useState, useEffect } from 'react'
import { useGameStore } from '../store/gameStore.js'
import ActionPanel from '../components/ActionPanel.jsx'

export default function Setup() {
  const roles = useGameStore((s) => s.roles)
  const cursor = useGameStore((s) => s.setupCursor)
  const players = useGameStore((s) => s.players)
  const assignments = useGameStore((s) => s.assignments)
  const assignRole = useGameStore((s) => s.assignRole)
  const setupNext = useGameStore((s) => s.setupNext)

  const role = roles[cursor]
  const [selected, setSelected] = useState(() => new Set())

  // When the role step changes, preload players already on this role, and reset.
  useEffect(() => {
    const onRole = players.filter((p) => assignments[p.id] === role.id).map((p) => p.id)
    setSelected(new Set(onRole))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor])

  // Selectable = unassigned OR already on this role.
  const selectable = players.filter(
    (p) => !assignments[p.id] || assignments[p.id] === role.id,
  )

  const toggle = (id) => {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }

  const next = () => {
    assignRole(role.id, [...selected])
    setupNext()
  }

  return (
    <div className="app">
      <h1>Know the Roles</h1>
      <p className="setup-progress">Role {cursor + 1} of {roles.length}</p>
      <div className="setup-layout">
        <div>
          <h2 className="role-heading" style={{ color: role.color }}>{role.name}</h2>
          <p>Select the player(s) with this role:</p>
          <ul className="player-select-list">
            {selectable.map((p) => (
              <li key={p.id}>
                <label className="toggle">
                  <input
                    type="checkbox"
                    aria-label={p.name}
                    checked={selected.has(p.id)}
                    onChange={() => toggle(p.id)}
                  />
                  {p.name}
                </label>
              </li>
            ))}
          </ul>
          <button onClick={next}>Next →</button>
        </div>
        <aside>
          <h3>First-night action (optional)</h3>
          <ActionPanel role={role} round={0} />
        </aside>
      </div>
    </div>
  )
}
