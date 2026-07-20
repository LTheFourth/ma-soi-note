import { useState } from 'react'
import { useLibraryStore } from '../store/libraryStore.js'
import { useGameStore } from '../store/gameStore.js'
import RoleOrder from './RoleOrder.jsx'
import { roleActions, roleTiming } from '../lib/actions.js'
import { APP_VERSION } from '../version.js'

const inputCls =
  'rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none'
const addBtnCls = 'rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/15 active:scale-95'

export default function NewGame() {
  const {
    players, roles, lastGame, roleSets,
    addPlayer, removePlayer, addRole, removeRole, updateRole, reorderRoles,
    saveRoleSet, deleteRoleSet,
  } = useLibraryStore()
  const startGame = useGameStore((s) => s.startGame)

  // Pre-fill from the last game played (ids that no longer exist are ignored later).
  const [selPlayers, setSelPlayers] = useState(() => new Set(lastGame?.playerIds ?? []))
  const [selRoles, setSelRoles] = useState(() => new Set(lastGame?.roleIds ?? []))
  const [pName, setPName] = useState('')
  const [rName, setRName] = useState('')
  const [rColor, setRColor] = useState('#4488cc')
  const [setName, setSetName] = useState('')

  const toggle = (set, setter) => (id) => {
    const next = new Set(set)
    next.has(id) ? next.delete(id) : next.add(id)
    setter(next)
  }

  const deletePlayer = (id) => {
    removePlayer(id)
    setSelPlayers((s) => { const n = new Set(s); n.delete(id); return n })
  }
  const deleteRole = (id) => {
    removeRole(id)
    setSelRoles((s) => { const n = new Set(s); n.delete(id); return n })
  }

  const orderedSelectedRoles = roles
    .filter((r) => selRoles.has(r.id))
    .sort((a, b) => a.order - b.order)

  const saveCurrentSet = () => {
    if (!setName.trim() || selRoles.size === 0) return
    const items = roles
      .filter((r) => selRoles.has(r.id))
      .map((r) => ({
        roleId: r.id,
        order: r.order,
        callTiming: roleTiming(r),
        actions: roleActions(r),
        canEliminate: !!r.canEliminate,
      }))
    saveRoleSet(setName, items)
    setSetName('')
  }

  const loadSet = (rs) => {
    const ids = []
    rs.items.forEach((it) => {
      if (roles.some((r) => r.id === it.roleId)) {
        updateRole(it.roleId, {
          order: it.order,
          callTiming: it.callTiming,
          actions: it.actions,
          canEliminate: it.canEliminate,
        })
        ids.push(it.roleId)
      }
    })
    setSelRoles(new Set(ids))
  }

  const canStart = selPlayers.size > 0 && selRoles.size > 0

  const start = () => {
    startGame(
      players.filter((p) => selPlayers.has(p.id)),
      orderedSelectedRoles,
    )
  }

  const Chip = ({ id, name, selected, onToggle, onDelete, color }) => (
    <span className="inline-flex overflow-hidden rounded-full border border-white/15">
      <button
        aria-pressed={selected}
        onClick={onToggle}
        className={`px-3 py-1.5 text-sm ${selected ? 'bg-indigo-600 text-white' : 'bg-transparent hover:bg-white/10'}`}
        style={color && selected ? { backgroundColor: color } : undefined}
      >
        {name}
      </button>
      <button
        aria-label={`delete ${name}`}
        onClick={onDelete}
        className="border-l border-white/15 px-2 text-red-400 hover:bg-red-500/20"
      >
        ✕
      </button>
    </span>
  )

  return (
    <div className="mx-auto max-w-3xl p-4">
      <div className="mb-4 flex items-center gap-2">
        <h1 className="text-2xl font-bold">🐺 Werewolf Admin</h1>
        <span className="rounded-full bg-indigo-600/30 px-2 py-0.5 text-xs font-medium text-indigo-200">
          v{APP_VERSION}
        </span>
      </div>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold text-gray-300">Players</h2>
        <div className="flex flex-wrap gap-2">
          {players.map((p) => (
            <Chip
              key={p.id}
              id={p.id}
              name={p.name}
              selected={selPlayers.has(p.id)}
              onToggle={() => toggle(selPlayers, setSelPlayers)(p.id)}
              onDelete={() => deletePlayer(p.id)}
            />
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            className={inputCls}
            placeholder="new player"
            value={pName}
            onChange={(e) => setPName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && pName.trim()) { addPlayer(pName); setPName('') } }}
          />
          <button className={addBtnCls} onClick={() => { if (pName.trim()) { addPlayer(pName); setPName('') } }}>Add</button>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold text-gray-300">Roles</h2>
        <div className="flex flex-wrap gap-2">
          {roles.map((r) => (
            <Chip
              key={r.id}
              id={r.id}
              name={r.name}
              color={r.color}
              selected={selRoles.has(r.id)}
              onToggle={() => toggle(selRoles, setSelRoles)(r.id)}
              onDelete={() => deleteRole(r.id)}
            />
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            className={inputCls}
            placeholder="new role"
            value={rName}
            onChange={(e) => setRName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && rName.trim()) { addRole(rName, rColor); setRName('') } }}
          />
          <input
            type="color"
            value={rColor}
            onChange={(e) => setRColor(e.target.value)}
            aria-label="role color"
            className="h-10 w-10 rounded-lg border border-white/10 bg-transparent"
          />
          <button className={addBtnCls} onClick={() => { if (rName.trim()) { addRole(rName, rColor); setRName('') } }}>Add</button>
        </div>
      </section>

      {orderedSelectedRoles.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-1 font-semibold text-gray-300">Night call order</h2>
          <p className="mb-2 text-sm text-gray-400">
            Drag to reorder. Toggle off roles only called during setup (first night).
          </p>
          <RoleOrder
            roles={orderedSelectedRoles}
            onReorder={reorderRoles}
            onSetTiming={(id, t) => updateRole(id, { callTiming: t })}
            onToggleAction={(id, key, on) => {
              const role = roles.find((r) => r.id === id)
              const cur = roleActions(role)
              const next = on ? [...new Set([...cur, key])] : cur.filter((k) => k !== key)
              updateRole(id, { actions: next })
            }}
            onToggleElim={(id, on) => updateRole(id, { canEliminate: on })}
          />
        </section>
      )}

      <section className="mb-6">
        <h2 className="mb-2 font-semibold text-gray-300">Role sets</h2>
        {roleSets.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {roleSets.map((rs) => (
              <span key={rs.id} className="inline-flex overflow-hidden rounded-full border border-white/15">
                <button
                  onClick={() => loadSet(rs)}
                  className="px-3 py-1.5 text-sm hover:bg-white/10"
                >
                  {rs.name} ({rs.items.length})
                </button>
                <button
                  aria-label={`delete set ${rs.name}`}
                  onClick={() => deleteRoleSet(rs.id)}
                  className="border-l border-white/15 px-2 text-red-400 hover:bg-red-500/20"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            className={inputCls}
            placeholder="save selected roles as set…"
            value={setName}
            onChange={(e) => setSetName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') saveCurrentSet() }}
          />
          <button className={addBtnCls} disabled={selRoles.size === 0} onClick={saveCurrentSet}>
            Save set
          </button>
        </div>
      </section>

      <button
        className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-lg font-semibold hover:bg-indigo-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        disabled={!canStart}
        onClick={start}
      >
        Start Game
      </button>
    </div>
  )
}
