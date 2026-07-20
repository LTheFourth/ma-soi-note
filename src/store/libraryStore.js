import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { uid } from '../lib/id.js'

export const useLibraryStore = create(
  persist(
    (set) => ({
      players: [],
      roles: [],

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
              order: s.roles.reduce((m, r) => Math.max(m, r.order), -1) + 1,
            },
          ],
        })),
      updateRole: (id, patch) =>
        set((s) => ({ roles: s.roles.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
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
    }),
    { name: 'masoi-library' },
  ),
)
