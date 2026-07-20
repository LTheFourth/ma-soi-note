import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import {
  useGameStore, selectNightRoles, selectRoleById, selectSurvivors,
} from '../store/gameStore.js'
import ActionPanel from '../components/ActionPanel.jsx'
import { actionIcon } from '../lib/actions.js'

const navBtn = 'rounded-lg px-3 py-2 text-sm active:scale-95 disabled:opacity-30'

// One log line. Either a role action (RoleName <icon> Target) or an
// elimination (🪦 Player — reason). Elim lines are not deletable here.
function LogLine({ action, onDelete }) {
  const state = useGameStore.getState()
  const target = state.players.find((p) => p.id === action.target)?.name ?? '?'

  if (action.kind === 'elim') {
    return (
      <li className="flex items-center gap-1.5 py-0.5 text-gray-300">
        <span className="text-base">🪦</span>
        <span>{target}</span>
        <span className="text-gray-500">— {action.reason || 'eliminated'}</span>
      </li>
    )
  }

  const role = selectRoleById(state, action.actor)
  return (
    <li className="flex items-center gap-1.5 py-0.5">
      <span style={{ color: role.color }}>{role.name}</span>
      <span className="text-base">{actionIcon(action.type)}</span>
      <span>{target}</span>
      {action.note ? <span className="text-gray-500">({action.note})</span> : null}
      {onDelete && (
        <button
          aria-label={`delete action by ${role.name}`}
          onClick={() => onDelete(action.id)}
          className="ml-auto px-1 text-red-400 hover:text-red-300"
        >
          ✕
        </button>
      )}
    </li>
  )
}

function NightSummary() {
  const round = useGameStore((s) => s.round)
  const endNight = useGameStore((s) => s.endNight)
  const nightPrev = useGameStore((s) => s.nightPrev)
  const removeAction = useGameStore((s) => s.removeAction)
  const eliminate = useGameStore((s) => s.eliminate)
  const survivors = useGameStore(useShallow(selectSurvivors))
  const actions = useGameStore(
    useShallow((s) => s.actionLog.filter((a) => a.round === round)),
  )
  const state = useGameStore.getState()
  const [elimFor, setElimFor] = useState(null) // playerId awaiting a kill-reason

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
        <h2 className="mb-2 text-lg font-semibold">Night Summary — Round {round}</h2>
        <ul aria-label="night summary actions" className="text-sm">
          {actions.map((a) => <LogLine key={a.id} action={a} onDelete={removeAction} />)}
          {actions.length === 0 && <li className="text-gray-500">No actions logged.</li>}
        </ul>
        <button onClick={nightPrev} className={`mt-2 bg-white/10 hover:bg-white/15 ${navBtn}`}>
          ← Back to roles
        </button>
      </div>

      <div>
        <h3 className="mb-2 font-semibold text-gray-300">Eliminate (admin decision)</h3>
        <ul className="space-y-1.5">
          {survivors.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-2 rounded-lg bg-black/25 px-3 py-2"
            >
              <span>{p.name} <span className="text-xs text-gray-400">({selectRoleById(state, state.assignments[p.id]).name})</span></span>
              <button
                onClick={() => setElimFor(p.id)}
                className="rounded-md bg-red-600/80 px-2 py-1 text-sm hover:bg-red-600"
              >
                Eliminate {p.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={endNight}
        className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold hover:bg-indigo-500 active:scale-[0.98]"
      >
        Finish Night → Day ☀️
      </button>

      {elimFor && (
        <div
          className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xs rounded-xl border border-white/10 bg-[#141a24] p-5">
            <p className="mb-3">
              Eliminate <strong>{state.players.find((p) => p.id === elimFor)?.name}</strong> — killed by which role?
            </p>
            <div className="flex flex-col gap-2">
              {state.roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { eliminate(elimFor, r.name); setElimFor(null) }}
                  className="rounded-lg px-3 py-2 text-left font-medium hover:bg-white/10"
                  style={{ color: r.color }}
                >
                  Killed by {r.name}
                </button>
              ))}
              <button
                onClick={() => { eliminate(elimFor, 'other'); setElimFor(null) }}
                className="rounded-lg px-3 py-2 text-left text-gray-300 hover:bg-white/10"
              >
                Other / unknown
              </button>
              <button
                onClick={() => setElimFor(null)}
                className="mt-1 rounded-lg bg-white/10 px-3 py-2 hover:bg-white/15"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function RoleCall({ role, round }) {
  const nightNext = useGameStore((s) => s.nightNext)
  const nightPrev = useGameStore((s) => s.nightPrev)
  const removeAction = useGameStore((s) => s.removeAction)
  const cursor = useGameStore((s) => s.nightCursor)
  const survivors = useGameStore(useShallow(selectSurvivors))
  // Everything that happened last night (all roles).
  const lastNight = useGameStore(
    useShallow((s) => s.actionLog.filter((a) => a.round === round - 1)),
  )
  // Actions already logged THIS night by earlier roles (night runs in order,
  // so any action by another role this round happened before this role's turn).
  const tonight = useGameStore(
    useShallow((s) =>
      s.actionLog.filter((a) => a.round === round && a.kind !== 'elim' && a.actor !== role.id),
    ),
  )
  const state = useGameStore.getState()

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_260px]">
      <div>
        <h2 className="mb-2 text-2xl font-bold" style={{ color: role.color }}>{role.name}</h2>
        <ActionPanel role={role} round={round} />
        <div className="mt-3 flex gap-2">
          <button onClick={nightPrev} disabled={cursor === 0} className={`bg-white/10 hover:bg-white/15 ${navBtn}`}>← Back</button>
          <button onClick={nightNext} className={`bg-indigo-600 hover:bg-indigo-500 ${navBtn}`}>Done →</button>
          <button onClick={nightNext} className={`bg-white/10 hover:bg-white/15 ${navBtn}`}>Skip →</button>
        </div>
      </div>

      <aside className="space-y-4 text-sm">
        {round > 1 && (
          <div>
            <h3 className="mb-1 font-semibold text-gray-300">Last night</h3>
            <ul aria-label="last night" className="rounded-lg bg-black/20 p-2">
              {lastNight.length === 0 && <li className="text-gray-500">Nothing.</li>}
              {lastNight.map((a) => <LogLine key={a.id} action={a} />)}
            </ul>
          </div>
        )}
        <div>
          <h3 className="mb-1 font-semibold text-gray-300">Tonight so far</h3>
          <ul aria-label="tonight so far" className="rounded-lg bg-black/20 p-2">
            {tonight.length === 0 && <li className="text-gray-500">Nothing yet.</li>}
            {tonight.map((a) => <LogLine key={a.id} action={a} onDelete={removeAction} />)}
          </ul>
        </div>
        <div>
          <h3 className="mb-1 font-semibold text-gray-300">Surviving players</h3>
          <ul className="space-y-0.5">
            {survivors.map((p) => (
              <li key={p.id}>{p.name} <span className="text-xs text-gray-400">({selectRoleById(state, state.assignments[p.id]).name})</span></li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  )
}

export default function Night() {
  const cursor = useGameStore((s) => s.nightCursor)
  const round = useGameStore((s) => s.round)
  const nightRoles = useGameStore(useShallow(selectNightRoles))
  const atSummary = cursor >= nightRoles.length

  return (
    <div className="mx-auto max-w-4xl p-4">
      <h1 className="mb-4 text-xl font-bold">🌙 Night — Round {round}</h1>
      {atSummary ? <NightSummary /> : <RoleCall role={nightRoles[cursor]} round={round} />}
    </div>
  )
}
