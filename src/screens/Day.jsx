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

  const [menuFor, setMenuFor] = useState(null) // playerId with open menu
  const [confirmFor, setConfirmFor] = useState(null)

  return (
    <div className="mx-auto max-w-4xl p-4">
      <TopBar phaseLabel="☀️ Day" onNight={startNight} onEndGame={endGame} />
      <div className="grid gap-4 md:grid-cols-[1fr_280px]">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {players.map((p) => {
            const role = selectRoleById(state, assignments[p.id])
            const dead = eliminated.includes(p.id)
            return (
              <div
                key={p.id}
                className={`player-card relative rounded-xl border-2 bg-white/5 p-3 text-center ${
                  dead ? 'eliminated' : 'cursor-pointer hover:bg-white/10'
                }`}
                style={{ borderColor: role.color }}
                onClick={() => !dead && setMenuFor(menuFor === p.id ? null : p.id)}
              >
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-gray-400">{role.name}</div>
                {menuFor === p.id && !dead && (
                  <div
                    className="absolute inset-x-2 top-full z-10 mt-1 rounded-lg border border-white/10 bg-[#141a24] p-1 shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        setConfirmFor(p.id)
                        setMenuFor(null)
                      }}
                      className="w-full rounded-md bg-red-600/80 px-2 py-1.5 text-sm hover:bg-red-600"
                    >
                      Eliminate
                    </button>
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
        onConfirm={() => {
          eliminate(confirmFor)
          setConfirmFor(null)
        }}
      />
    </div>
  )
}
