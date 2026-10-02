import { useGameStore } from '../store/gameStore.js'
import RoleAvatar from './RoleAvatar.jsx'
import { selectRoleById } from '../store/gameStore.js'

// A deadly link kills silently otherwise: the moderator eliminates one player
// and quietly loses two. This stops the game until it has been acknowledged,
// and offers to take the whole chain back if it was a misclick.
export default function DeathNotice() {
  const notice = useGameStore((s) => s.deathNotice)
  const clear = useGameStore((s) => s.clearDeathNotice)
  const undoDeaths = useGameStore((s) => s.undoDeaths)
  if (!notice) return null

  const state = useGameStore.getState()
  const nameOf = (pid) => state.players.find((p) => p.id === pid)?.name ?? '?'
  const roleOf = (pid) => selectRoleById(state, state.assignments[pid])
  const all = [notice.primary, ...notice.followers]

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="linked deaths"
    >
      <div className="w-full max-w-sm rounded-2xl border border-pink-500/40 bg-[#141a24] p-5">
        <h2 className="mb-1 text-lg font-semibold">💔 Died together</h2>
        <p className="mb-3 text-sm text-gray-400">
          {nameOf(notice.primary)} was linked, so {notice.followers.length === 1 ? 'another player' : 'other players'} died too.
        </p>
        <ul className="mb-4 space-y-1.5">
          {all.map((pid) => (
            <li key={pid} className="flex items-center gap-2 rounded-lg bg-black/30 px-3 py-2">
              <RoleAvatar role={roleOf(pid)} size="sm" dead />
              <span className="font-medium">{nameOf(pid)}</span>
              <span className="text-xs text-gray-400">({roleOf(pid).name})</span>
              {pid !== notice.primary && <span className="ml-auto text-xs text-pink-400">died with</span>}
            </li>
          ))}
        </ul>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => undoDeaths(all)}
            className="rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/15"
          >
            Undo
          </button>
          <button
            onClick={clear}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}
