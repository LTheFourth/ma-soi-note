import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { uid } from '../lib/id.js'

export const useLibraryStore = create(
  persist(
    (set) => ({
      players: [],
      roles: [],
      lastGame: { playerIds: [], roleIds: [] },
      roleSets: [],

      addPlayer: (name) =>
        set((s) => ({ players: [...s.players, { id: uid(), name: name.trim() }] })),
      removePlayer: (id) =>
        set((s) => ({ players: s.players.filter((p) => p.id !== id) })),

      addRole: (name, color) =>
        set((s) => ({
          roles: [
            ...s.roles,
            {
              id: uid(),
              name: name.trim(),
              color,
              callTiming: 'every',
              actions: ['bad', 'good', 'info'],
              canEliminate: false,
              order: s.roles.reduce((m, r) => Math.max(m, r.order), -1) + 1,
            },
          ],
        })),
      updateRole: (id, patch) =>
        set((s) => ({ roles: s.roles.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
      // Insert the role if its id is new, else merge the patch. Used to restore
      // roles from a saved set even if they were deleted from the library.
      upsertRole: (role) =>
        set((s) => ({
          roles: s.roles.some((r) => r.id === role.id)
            ? s.roles.map((r) => (r.id === role.id ? { ...r, ...role } : r))
            : [...s.roles, role],
        })),
      removeRole: (id) =>
        set((s) => ({ roles: s.roles.filter((r) => r.id !== id) })),

      // `order` is only meaningful WITHIN a set of roles reordered together
      // (the selected roles for a game). Callers pass the full selected set,
      // so those roles always get unique contiguous orders 0..n-1. Roles not
      // in `orderedIds` keep their old `order` and are never compared against
      // the listed ones (startGame sorts only the selected set).
      reorderRoles: (orderedIds) =>
        set((s) => ({
          roles: s.roles.map((r) => {
            const i = orderedIds.indexOf(r.id)
            return i === -1 ? r : { ...r, order: i }
          }),
        })),

      // Remember the last game's selected players + roles (to pre-fill New Game).
      saveLastGame: (playerIds, roleIds) => set({ lastGame: { playerIds, roleIds } }),

      // A named role-set preset. items snapshot each role's config at save time:
      // { roleId, order, callTiming, actions, canEliminate }.
      saveRoleSet: (name, items) =>
        set((s) => ({ roleSets: [...s.roleSets, { id: uid(), name: name.trim(), items }] })),
      deleteRoleSet: (id) =>
        set((s) => ({ roleSets: s.roleSets.filter((rs) => rs.id !== id) })),
    }),
    { name: 'masoi-library' },
  ),
)
