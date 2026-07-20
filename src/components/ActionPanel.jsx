import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useGameStore, selectSurvivors, selectRoleById } from '../store/gameStore.js'
import { ACTION_TYPES, actionIcon, nextActionType, roleActions } from '../lib/actions.js'

// Quick action logger: tap an icon on a player to log an action for `role`.
// Logged actions can be re-typed (tap icon), retargeted (tap name), or deleted.
export default function ActionPanel({ role, round }) {
  const survivors = useGameStore(useShallow(selectSurvivors))
  const logAction = useGameStore((s) => s.logAction)
  const removeAction = useGameStore((s) => s.removeAction)
  const updateAction = useGameStore((s) => s.updateAction)
  const actions = useGameStore(
    useShallow((s) => s.actionLog.filter((a) => a.actor === role.id && a.round === round)),
  )
  const state = useGameStore.getState()
  const nameOf = (pid) => state.players.find((p) => p.id === pid)?.name ?? '?'
  const roleNameOf = (pid) => selectRoleById(state, state.assignments[pid]).name

  const [editTargetFor, setEditTargetFor] = useState(null)

  // Only this role's allowed single-tap actions (link is handled separately, stage 2).
  const allowed = ACTION_TYPES.filter((t) => t.key !== 'link' && roleActions(role).includes(t.key))

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <p className="mb-2 text-sm text-gray-400">Tap an icon to log an action</p>
      <ul className="space-y-1.5">
        {survivors.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between gap-2 rounded-lg bg-black/25 px-3 py-2"
          >
            <span className="min-w-0 truncate">
              {p.name} <span className="text-xs text-gray-400">({roleNameOf(p.id)})</span>
            </span>
            <span className="flex shrink-0 gap-1">
              {allowed.map((t) => (
                <button
                  key={t.key}
                  aria-label={`${t.label} ${p.name}`}
                  title={t.label}
                  onClick={() =>
                    logAction({ actor: role.id, target: p.id, type: t.key, note: '', round })
                  }
                  className="rounded-md px-2 py-1 text-xl leading-none transition hover:bg-white/10 active:scale-90"
                >
                  {t.icon}
                </button>
              ))}
            </span>
          </li>
        ))}
      </ul>

      {actions.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-white/10 pt-2">
          {actions.map((a) => (
            <li key={a.id} className="flex items-center gap-2 text-sm">
              <button
                aria-label="change action type"
                title="Change type"
                onClick={() => updateAction(a.id, { type: nextActionType(a.type) })}
                className="text-xl leading-none"
              >
                {actionIcon(a.type)}
              </button>
              {editTargetFor === a.id ? (
                <select
                  aria-label="retarget action"
                  autoFocus
                  className="rounded bg-black/50 px-1 py-0.5 text-sm"
                  value={a.target}
                  onChange={(e) => {
                    updateAction(a.id, { target: e.target.value })
                    setEditTargetFor(null)
                  }}
                  onBlur={() => setEditTargetFor(null)}
                >
                  {survivors.map((p) => (
                    <option key={p.id} value={p.id} label={p.name} />
                  ))}
                </select>
              ) : (
                <button
                  className="underline decoration-dotted underline-offset-2"
                  onClick={() => setEditTargetFor(a.id)}
                >
                  {nameOf(a.target)}
                </button>
              )}
              <button
                aria-label={`delete action ${a.type} on ${nameOf(a.target)}`}
                title="Delete"
                onClick={() => removeAction(a.id)}
                className="ml-auto px-1 text-red-400 hover:text-red-300"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
