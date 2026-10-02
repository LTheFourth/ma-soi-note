import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { uid } from '../lib/id.js'
import { guessArt } from '../lib/art.js'
import { DEFAULT_ROLES, isBuiltin } from '../lib/defaultRoles.js'

const DEFAULT_BY_ID = Object.fromEntries(DEFAULT_ROLES.map((r) => [r.id, r]))

const same = (a, b) =>
  Array.isArray(a) && Array.isArray(b)
    ? a.length === b.length && a.every((v, i) => v === b[i])
    : a === b

// Keep only the fields that actually differ from the shipped role, so loading a
// saved set that matches the defaults leaves no override — and so the card does
// not offer a reset that would change nothing.
const trimOverride = (id, patch) => {
  const base = DEFAULT_BY_ID[id]
  const out = {}
  for (const [k, v] of Object.entries(patch)) if (!same(v, base[k])) out[k] = v
  return out
}

// Roles come from two places. The 41 built-ins live in code and cannot be
// deleted; the store keeps only `roleOverrides`, the fields the moderator has
// actually changed about them. Roles typed by hand live in `customRoles` and
// behave as they always did.
//
// Keeping overrides rather than copies means a later fix to a built-in's name,
// colour or artwork reaches everyone, instead of losing to a stale copy saved
// in their browser.
//
// `roles` is the merged list the screens read. It is kept in state (rather than
// computed in a selector) so its identity is stable between renders — a
// selector that rebuilt the array every call would re-render forever.
const buildRoles = (overrides, customRoles) => [
  ...DEFAULT_ROLES.map((r) => (overrides[r.id] ? { ...r, ...overrides[r.id] } : r)),
  ...customRoles,
]

const rebuild = (s) => ({ roles: buildRoles(s.roleOverrides, s.customRoles) })

export const useLibraryStore = create(
  persist(
    (set) => ({
      players: [],
      roleOverrides: {},
      customRoles: [],
      roles: buildRoles({}, []),
      lastGame: { playerIds: [], roleIds: [] },
      roleSets: [],

      addPlayer: (name) =>
        set((s) => ({ players: [...s.players, { id: uid(), name: name.trim() }] })),
      removePlayer: (id) =>
        set((s) => ({ players: s.players.filter((p) => p.id !== id) })),

      // Hand-typed roles are always custom; they sort after the built-ins.
      addRole: (name, color) =>
        set((s) => {
          const customRoles = [
            ...s.customRoles,
            {
              id: uid(),
              name: name.trim(),
              color,
              team: 'custom',
              art: guessArt(name),
              callTiming: 'every',
              actions: ['bad', 'good', 'info'],
              canEliminate: false,
              order: DEFAULT_ROLES.length + s.customRoles.length,
            },
          ]
          return { customRoles, ...rebuild({ ...s, customRoles }) }
        }),

      // A built-in records a patch; a custom role is edited in place.
      updateRole: (id, patch) =>
        set((s) => {
          if (isBuiltin(id)) {
            const roleOverrides = { ...s.roleOverrides, [id]: { ...s.roleOverrides[id], ...patch } }
            return { roleOverrides, ...rebuild({ ...s, roleOverrides }) }
          }
          const customRoles = s.customRoles.map((r) => (r.id === id ? { ...r, ...patch } : r))
          return { customRoles, ...rebuild({ ...s, customRoles }) }
        }),

      // Drop every edit to a built-in, returning it to its shipped values.
      resetRole: (id) =>
        set((s) => {
          if (!isBuiltin(id)) return {}
          const roleOverrides = { ...s.roleOverrides }
          delete roleOverrides[id]
          return { roleOverrides, ...rebuild({ ...s, roleOverrides }) }
        }),

      resetAllRoles: () =>
        set(() => ({ roleOverrides: {}, customRoles: [], roles: buildRoles({}, []) })),

      // Apply a role that came from a saved set. A built-in takes it as an
      // override; anything else is re-created as a custom role if it is gone.
      upsertRole: (role) =>
        set((s) => {
          if (isBuiltin(role.id)) {
            const { id, builtin, team, ...patch } = role
            const merged = trimOverride(id, { ...s.roleOverrides[id], ...patch })
            const roleOverrides = { ...s.roleOverrides }
            if (Object.keys(merged).length) roleOverrides[id] = merged
            else delete roleOverrides[id]
            return { roleOverrides, ...rebuild({ ...s, roleOverrides }) }
          }
          const customRoles = s.customRoles.some((r) => r.id === role.id)
            ? s.customRoles.map((r) => (r.id === role.id ? { ...r, ...role } : r))
            : [...s.customRoles, { team: 'custom', ...role }]
          return { customRoles, ...rebuild({ ...s, customRoles }) }
        }),

      // Built-in roles cannot be deleted; only hand-typed ones can.
      removeRole: (id) =>
        set((s) => {
          if (isBuiltin(id)) return {}
          const customRoles = s.customRoles.filter((r) => r.id !== id)
          return { customRoles, ...rebuild({ ...s, customRoles }) }
        }),

      // `order` is only meaningful WITHIN a set of roles reordered together
      // (the selected roles for a game). Callers pass the full selected set,
      // so those roles always get unique contiguous orders 0..n-1. Roles not
      // in `orderedIds` keep their old `order` and are never compared against
      // the listed ones (startGame sorts only the selected set).
      reorderRoles: (orderedIds) =>
        set((s) => {
          const roleOverrides = { ...s.roleOverrides }
          let customRoles = s.customRoles
          orderedIds.forEach((id, order) => {
            if (isBuiltin(id)) roleOverrides[id] = { ...roleOverrides[id], order }
            else customRoles = customRoles.map((r) => (r.id === id ? { ...r, order } : r))
          })
          return { roleOverrides, customRoles, ...rebuild({ ...s, roleOverrides, customRoles }) }
        }),

      // Remember the last game's selected players + roles (to pre-fill New Game).
      saveLastGame: (playerIds, roleIds) => set({ lastGame: { playerIds, roleIds } }),

      // A named role-set preset. items snapshot each role's config at save time:
      // { roleId, name, color, order, callTiming, actions, canEliminate, art }.
      // Saving with an existing name overrides that set instead of duplicating.
      saveRoleSet: (name, items) =>
        set((s) => {
          const trimmed = name.trim()
          const exists = s.roleSets.some((rs) => rs.name === trimmed)
          return {
            roleSets: exists
              ? s.roleSets.map((rs) => (rs.name === trimmed ? { ...rs, items } : rs))
              : [...s.roleSets, { id: uid(), name: trimmed, items }],
          }
        }),
      updateRoleSet: (id, items) =>
        set((s) => ({ roleSets: s.roleSets.map((rs) => (rs.id === id ? { ...rs, items } : rs)) })),
      deleteRoleSet: (id) =>
        set((s) => ({ roleSets: s.roleSets.filter((rs) => rs.id !== id) })),
    }),
    {
      name: 'masoi-library',
      version: 1,
      // Only the moderator's own data is stored; `roles` is rebuilt from it.
      partialize: (s) => ({
        players: s.players,
        roleOverrides: s.roleOverrides,
        customRoles: s.customRoles,
        lastGame: s.lastGame,
        roleSets: s.roleSets,
      }),
      // v0 kept one flat `roles` array of hand-typed roles. They stay the
      // moderator's own roles, so they move to `customRoles` untouched and the
      // built-ins appear alongside them.
      migrate: (state, version) => {
        if (version >= 1) return state
        const { roles = [], ...rest } = state ?? {}
        return {
          ...rest,
          roleOverrides: {},
          customRoles: roles.map((r) => ({ ...r, team: 'custom' })),
        }
      },
      merge: (persisted, current) => {
        const next = { ...current, ...persisted }
        return { ...next, roles: buildRoles(next.roleOverrides ?? {}, next.customRoles ?? []) }
      },
    },
  ),
)
