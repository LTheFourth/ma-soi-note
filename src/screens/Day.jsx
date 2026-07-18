import { useState } from 'react'
import { useGameStore, selectRoleById } from '../store/gameStore.js'
import TopBar from '../components/TopBar.jsx'
import HistorySidebar from '../components/HistorySidebar.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'

export default function Day() {
  const players = useGameStore((s) => s.players)
  const assignments = useGameStore((s) => s.assignments)
  const eliminated = useGameStore((s) => s.eliminated)
  const eliminate = useGameStore((s) => s.eliminate)
  const startNight = useGameStore((s) => s.startNight)
  const endGame = useGameStore((s) => s.endGame)
  const state = useGameStore.getState()

  const [menuFor, setMenuFor] = useState(null)   // playerId with open menu
  const [confirmFor, setConfirmFor] = useState(null)

  return (
    <div className="app">
      <TopBar phaseLabel="☀️ Day" onNight={startNight} onEndGame={endGame} />
      <div className="day-layout">
        <div className="player-grid">
          {players.map((p) => {
            const role = selectRoleById(state, assignments[p.id])
            const dead = eliminated.includes(p.id)
            return (
              <div
                key={p.id}
                className={`player-card${dead ? ' eliminated' : ''}`}
                style={{ borderColor: role.color }}
                onClick={() => !dead && setMenuFor(menuFor === p.id ? null : p.id)}
              >
                <div>{p.name}</div>
                <div className="role-tag">{role.name}</div>
                {menuFor === p.id && !dead && (
                  <div className="card-menu" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => { setConfirmFor(p.id); setMenuFor(null) }}>Eliminate</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <HistorySidebar />
      </div>

      <ConfirmDialog
        open={confirmFor !== null}
        message={`Eliminate ${players.find((p) => p.id === confirmFor)?.name}?`}
        onCancel={() => setConfirmFor(null)}
        onConfirm={() => { eliminate(confirmFor); setConfirmFor(null) }}
      />
    </div>
  )
}
