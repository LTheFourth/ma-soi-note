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
    <div className="mx-auto max-w-3xl p-4">
      <h1 className="text-2xl font-bold">Know the Roles</h1>
      <p className="mb-4 text-sm text-gray-400">Role {cursor + 1} of {roles.length}</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold" style={{ color: role.color }}>{role.name}</h2>
          <p className="mb-2 text-sm text-gray-400">Select the player(s) with this role:</p>
          <ul className="space-y-1.5">
            {selectable.map((p) => (
              <li key={p.id}>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-black/25 px-3 py-2">
                  <input
                    type="checkbox"
                    aria-label={p.name}
                    checked={selected.has(p.id)}
                    onChange={() => toggle(p.id)}
                    className="h-4 w-4 accent-indigo-500"
                  />
                  {p.name}
                </label>
              </li>
            ))}
          </ul>
          <button
            onClick={next}
            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 font-medium hover:bg-indigo-500 active:scale-95"
          >
            Next →
          </button>
        </div>
        <aside>
          <h3 className="mb-2 font-semibold text-gray-300">First-night action (optional)</h3>
          <ActionPanel role={role} round={0} />
        </aside>
      </div>
    </div>
  )
}
