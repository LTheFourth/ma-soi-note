import { useState } from 'react'
import { useLibraryStore } from '../store/libraryStore.js'
import { useGameStore } from '../store/gameStore.js'
import RoleOrder from './RoleOrder.jsx'
import { roleActions, roleTiming } from '../lib/actions.js'
import { APP_VERSION } from '../version.js'

const PRESET_COLORS = [
  { name: 'red', value: '#ef4444' },
  { name: 'green', value: '#22c55e' },
  { name: 'blue', value: '#3b82f6' },
  { name: 'orange', value: '#f97316' },
]

const inputCls =
  'rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none'
const addBtnCls = 'rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/15 active:scale-95'

export default function NewGame() {
  const {
    players, roles, lastGame, roleSets,
    addPlayer, removePlayer, addRole, removeRole, updateRole, upsertRole, reorderRoles,
    saveRoleSet, updateRoleSet, deleteRoleSet,
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
    saveRoleSet(setName, currentItems())
    setSetName('')
  }

  // Snapshot the full role (name/color/options) so a set can rebuild deleted roles later.
  const currentItems = () =>
    roles
      .filter((r) => selRoles.has(r.id))
      .map((r) => ({
        roleId: r.id,
        name: r.name,
        color: r.color,
        order: r.order,
        callTiming: roleTiming(r),
        actions: roleActions(r),
        canEliminate: !!r.canEliminate,
      }))

  const loadSet = (rs) => {
    const ids = rs.items.map((it) => {
      // Recreate the role if it was deleted; otherwise apply the saved config.
      upsertRole({
        id: it.roleId,
        name: it.name ?? '?',
        color: it.color ?? '#4488cc',
        order: it.order,
        callTiming: it.callTiming,
        actions: it.actions,
        canEliminate: it.canEliminate,
      })
      return it.roleId
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

  const Card = ({ name, color, selected, onToggle, onDelete }) => (
    <div className="relative">
      <button
        aria-pressed={selected}
        onClick={onToggle}
        className={`flex w-full items-center gap-2 overflow-hidden rounded-xl border px-3 py-3 text-left transition active:scale-[0.98] ${
          selected ? 'border-indigo-500 bg-indigo-600/20' : 'border-white/10 bg-white/5 hover:bg-white/10'
        }`}
      >
        {color && <span className="h-6 w-1.5 shrink-0 rounded-full" style={{ background: color }} />}
        <span className="min-w-0 flex-1 truncate">{name}</span>
        <span aria-hidden="true" className={`shrink-0 ${selected ? 'text-indigo-300' : 'text-transparent'}`}>✓</span>
      </button>
      <button
        aria-label={`delete ${name}`}
        onClick={onDelete}
        className="absolute -right-1.5 -top-1.5 rounded-full border border-white/10 bg-[#141a24] px-1.5 text-xs text-red-400 opacity-80 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  )

  const SectionHead = ({ title, count, total, onAll, onClear }) => (
    <div className="mb-2 flex items-center gap-2">
      <h2 className="font-semibold text-gray-300">{title}</h2>
      <span className="text-xs text-gray-500">{count}/{total} selected</span>
      <span className="flex-1" />
      <button onClick={onAll} className="rounded px-2 py-0.5 text-xs text-gray-300 hover:bg-white/10">All</button>
      <button onClick={onClear} className="rounded px-2 py-0.5 text-xs text-gray-300 hover:bg-white/10">Clear</button>
    </div>
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
        <SectionHead
          title="Players"
          count={selPlayers.size}
          total={players.length}
          onAll={() => setSelPlayers(new Set(players.map((p) => p.id)))}
          onClear={() => setSelPlayers(new Set())}
        />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {players.map((p) => (
            <Card
              key={p.id}
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
        <SectionHead
          title="Roles"
          count={selRoles.size}
          total={roles.length}
          onAll={() => setSelRoles(new Set(roles.map((r) => r.id)))}
          onClear={() => setSelRoles(new Set())}
        />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {roles.map((r) => (
            <Card
              key={r.id}
              name={r.name}
              color={r.color}
              selected={selRoles.has(r.id)}
              onToggle={() => toggle(selRoles, setSelRoles)(r.id)}
              onDelete={() => deleteRole(r.id)}
            />
          ))}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            className={inputCls}
            placeholder="new role"
            value={rName}
            onChange={(e) => setRName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && rName.trim()) { addRole(rName, rColor); setRName('') } }}
          />
          <div className="flex gap-1">
            {PRESET_COLORS.map((c) => (
              <button
                key={c.value}
                aria-label={`color ${c.name}`}
                onClick={() => setRColor(c.value)}
                className={`h-8 w-8 rounded-md border-2 ${rColor === c.value ? 'border-white' : 'border-white/20'}`}
                style={{ background: c.value }}
              />
            ))}
          </div>
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
                  aria-label={`update set ${rs.name}`}
                  title="Overwrite with current selection"
                  disabled={selRoles.size === 0}
                  onClick={() => updateRoleSet(rs.id, currentItems())}
                  className="border-l border-white/15 px-2 text-indigo-300 hover:bg-white/10 disabled:opacity-30"
                >
                  ⟳
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
