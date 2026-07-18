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
              gameNightEnabled: true,
              order: s.roles.reduce((m, r) => Math.max(m, r.order), -1) + 1,
            },
          ],
        })),
      updateRole: (id, patch) =>
        set((s) => ({ roles: s.roles.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
      removeRole: (id) =>
        set((s) => ({ roles: s.roles.filter((r) => r.id !== id) })),

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
