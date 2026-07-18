import { useState } from 'react'
import { useLibraryStore } from '../store/libraryStore.js'
import { useGameStore } from '../store/gameStore.js'
import RoleOrder from './RoleOrder.jsx'

export default function NewGame() {
  const { players, roles, addPlayer, addRole, updateRole, reorderRoles } = useLibraryStore()
  const startGame = useGameStore((s) => s.startGame)

  const [selPlayers, setSelPlayers] = useState(() => new Set())
  const [selRoles, setSelRoles] = useState(() => new Set())
  const [pName, setPName] = useState('')
  const [rName, setRName] = useState('')
  const [rColor, setRColor] = useState('#4488cc')

  const toggle = (set, setter) => (id) => {
    const next = new Set(set)
    next.has(id) ? next.delete(id) : next.add(id)
    setter(next)
  }

  const orderedSelectedRoles = roles
    .filter((r) => selRoles.has(r.id))
    .sort((a, b) => a.order - b.order)

  const canStart = selPlayers.size > 0 && selRoles.size > 0

  const start = () => {
    startGame(
      players.filter((p) => selPlayers.has(p.id)),
      orderedSelectedRoles,
    )
  }

  return (
    <div className="app">
      <h1>Werewolf Admin — New Game</h1>

      <section className="ng-section">
        <h2>Players</h2>
        <div className="chip-row">
          {players.map((p) => (
            <button
              key={p.id}
              className="chip"
              aria-pressed={selPlayers.has(p.id)}
              onClick={() => toggle(selPlayers, setSelPlayers)(p.id)}
            >
              {p.name}
            </button>
          ))}
        </div>
        <div className="inline-add">
          <input placeholder="new player" value={pName} onChange={(e) => setPName(e.target.value)} />
          <button onClick={() => { if (pName.trim()) { addPlayer(pName); setPName('') } }}>Add</button>
        </div>
      </section>

      <section className="ng-section">
        <h2>Roles</h2>
        <div className="chip-row">
          {roles.map((r) => (
            <button
              key={r.id}
              className="chip"
              aria-pressed={selRoles.has(r.id)}
              style={{ borderColor: selRoles.has(r.id) ? r.color : undefined }}
              onClick={() => toggle(selRoles, setSelRoles)(r.id)}
            >
              {r.name}
            </button>
          ))}
        </div>
        <div className="inline-add">
          <input placeholder="new role" value={rName} onChange={(e) => setRName(e.target.value)} />
          <input type="color" value={rColor} onChange={(e) => setRColor(e.target.value)} aria-label="role color" />
          <button onClick={() => { if (rName.trim()) { addRole(rName, rColor); setRName('') } }}>Add</button>
        </div>
      </section>

      {orderedSelectedRoles.length > 0 && (
        <section className="ng-section">
          <h2>Night call order</h2>
          <p>Drag to reorder. Toggle off roles that are only called during setup (first night).</p>
          <RoleOrder
            roles={orderedSelectedRoles}
            onReorder={reorderRoles}
            onToggle={(id, v) => updateRole(id, { gameNightEnabled: v })}
          />
        </section>
      )}

      <button className="start-btn" disabled={!canStart} onClick={start}>Start Game</button>
    </div>
  )
}
