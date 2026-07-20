import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useGameStore, selectSurvivors, selectRoleById } from '../store/gameStore.js'
import { ACTION_TYPES, actionIcon, nextActionType, roleActions } from '../lib/actions.js'
import LinkDot from './LinkDot.jsx'
import LinkTag from './LinkTag.jsx'

// Quick action logger: tap an icon on a player to log an action for `role`.
// Logged actions can be re-typed (tap icon), retargeted (tap name), or deleted.
// If the role can Link, a multi-select builder groups 2+ players together.
export default function ActionPanel({ role, round }) {
  const survivors = useGameStore(useShallow(selectSurvivors))
  const logAction = useGameStore((s) => s.logAction)
  const logLink = useGameStore((s) => s.logLink)
  const removeAction = useGameStore((s) => s.removeAction)
  const updateAction = useGameStore((s) => s.updateAction)
  const actions = useGameStore(
    useShallow((s) => s.actionLog.filter((a) => a.actor === role.id && a.round === round)),
  )
  const state = useGameStore.getState()
  const nameOf = (pid) => state.players.find((p) => p.id === pid)?.name ?? '?'
  const roleNameOf = (pid) => selectRoleById(state, state.assignments[pid]).name

  const [editTargetFor, setEditTargetFor] = useState(null)
  const [linkSel, setLinkSel] = useState(() => new Set())

  const roleActs = roleActions(role)
  const allowed = ACTION_TYPES.filter((t) => t.key !== 'link' && roleActs.includes(t.key))
  const canLink = roleActs.includes('link')

  const toggleLink = (id) => {
    const next = new Set(linkSel)
    next.has(id) ? next.delete(id) : next.add(id)
    setLinkSel(next)
  }
  const doLink = () => {
    if (linkSel.size < 2) return
    logLink({ actor: role.id, targets: [...linkSel], round })
    setLinkSel(new Set())
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <p className="mb-2 text-sm text-gray-400">Tap an icon to log an action</p>
      <ul className="space-y-1.5">
        {survivors.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between gap-2 rounded-lg bg-black/25 px-3 py-2"
          >
            <span className="flex min-w-0 flex-col">
              <span className="flex items-center gap-1 truncate">
                {p.name} <LinkDot pid={p.id} />
                <span className="text-xs text-gray-400">({roleNameOf(p.id)})</span>
              </span>
              <LinkTag pid={p.id} />
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

      {canLink && (
        <div className="mt-3 rounded-lg border border-white/10 bg-black/20 p-2">
          <p className="mb-1 text-sm text-gray-400">🔗 Link players — pick 2 or more</p>
          <ul className="mb-2 grid grid-cols-2 gap-1">
            {survivors.map((p) => (
              <li key={p.id}>
                <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-white/5">
                  <input
                    type="checkbox"
                    aria-label={`link ${p.name}`}
                    checked={linkSel.has(p.id)}
                    onChange={() => toggleLink(p.id)}
                    className="h-4 w-4 accent-pink-500"
                  />
                  <span className="truncate">{p.name}</span>
                </label>
              </li>
            ))}
          </ul>
          <button
            onClick={doLink}
            disabled={linkSel.size < 2}
            className="rounded-lg bg-pink-600 px-3 py-1.5 text-sm font-medium hover:bg-pink-500 disabled:opacity-40"
          >
            Link selected ({linkSel.size})
          </button>
        </div>
      )}

      {actions.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-white/10 pt-2">
          {actions.map((a) =>
            a.type === 'link' ? (
              <li key={a.id} className="flex items-center gap-2 text-sm">
                <span className="text-lg leading-none" style={{ color: a.color }}>🔗</span>
                <span>{a.targets.map(nameOf).join(' + ')}</span>
                <button
                  aria-label={`delete link ${a.targets.map(nameOf).join(' ')}`}
                  title="Delete"
                  onClick={() => removeAction(a.id)}
                  className="ml-auto px-1 text-red-400 hover:text-red-300"
                >
                  ✕
                </button>
              </li>
            ) : (
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
            ),
          )}
        </ul>
      )}
    </div>
  )
}
