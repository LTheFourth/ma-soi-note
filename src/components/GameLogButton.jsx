import { useState } from 'react'
import { useGameStore } from '../store/gameStore.js'
import GameLog from './GameLog.jsx'

// Floating access to the full game log. The night screens have no room for a
// sidebar, and on a phone the day sidebar is far below the grid — this keeps
// the log one tap away from anywhere.
export default function GameLogButton() {
  const count = useGameStore((s) => s.actionLog.length)
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        aria-label="game log"
        onClick={() => setOpen(true)}
        className="fixed left-3 z-20 flex items-center gap-1.5 rounded-full border border-white/15 bg-[#141a24]/95 px-3 py-2 text-sm shadow-lg backdrop-blur transition hover:bg-[#1b2330] active:scale-95"
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' }}
      >
        <span aria-hidden="true">📜</span>
        <span className="font-medium">Log</span>
        {count > 0 && (
          <span className="rounded-full bg-indigo-600/70 px-1.5 text-xs font-semibold">{count}</span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-30 flex items-end justify-center bg-black/70 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="game log"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-2xl border border-white/10 bg-[#141a24] p-4 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
          >
            <div className="mb-3 flex items-center gap-2">
              <h2 className="text-lg font-semibold">📜 Game log</h2>
              <span className="flex-1" />
              <button
                aria-label="close"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15"
              >
                Close
              </button>
            </div>
            <GameLog className="flex-1 overflow-y-auto" />
          </div>
        </div>
      )}
    </>
  )
}
