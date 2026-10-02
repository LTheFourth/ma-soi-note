import { useMemo, useState } from 'react'
import { ROLE_IDS, ALIASES, normalizeName } from '../lib/art.js'
import RoleAvatar from './RoleAvatar.jsx'

// artId -> every name that resolves to it, so searching "phu thuy" finds the witch.
const SEARCH_TEXT = (() => {
  const out = {}
  for (const id of ROLE_IDS) out[id] = id.replace(/-/g, ' ')
  for (const [alias, id] of Object.entries(ALIASES)) out[id] += ` ${alias}`
  return out
})()

const label = (id) => id.replace(/-/g, ' ')

// Offers every planned art id, not only the ones whose file exists yet: an id
// picked today starts showing art the moment its file is dropped into src/art/.
export default function ArtPicker({ role, onPick, onClose }) {
  const [q, setQ] = useState('')

  const ids = useMemo(() => {
    const n = normalizeName(q)
    return n ? ROLE_IDS.filter((id) => SEARCH_TEXT[id].includes(n)) : ROLE_IDS
  }, [q])

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`artwork for ${role.name}`}
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-2xl border border-white/10 bg-[#141a24] p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-2 font-semibold">Artwork — {role.name}</h2>
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="search art…"
          className="mb-3 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
        />

        <div className="grid flex-1 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
          {ids.map((id) => (
            <button
              key={id}
              aria-label={label(id)}
              aria-pressed={role.art === id}
              onClick={() => { onPick(id); onClose() }}
              className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-center text-[11px] capitalize transition active:scale-95 ${
                role.art === id
                  ? 'border-indigo-500 bg-indigo-600/20'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <RoleAvatar role={{ ...role, art: id }} size="md" />
              <span className="w-full truncate text-gray-300">{label(id)}</span>
            </button>
          ))}
          {ids.length === 0 && (
            <p className="col-span-full py-6 text-center text-sm text-gray-500">Nothing matches.</p>
          )}
        </div>

        <div className="mt-3 flex justify-between gap-2">
          <button
            onClick={() => { onPick(undefined); onClose() }}
            className="rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/15"
          >
            No art (use initial)
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/15"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
