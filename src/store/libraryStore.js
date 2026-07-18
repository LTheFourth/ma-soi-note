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
            { id: uid(), name: name.trim(), color, gameNightEnabled: true, order: s.roles.length },
          ],
        })),
      updateRole: (id, patch) =>
        set((s) => ({ roles: s.roles.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
      removeRole: (id) =>
        set((s) => ({ roles: s.roles.filter((r) => r.id !== id) })),

      reorderRoles: (orderedIds) =>
        set((s) => ({
          roles: orderedIds.map((id, i) => ({ ...s.roles.find((r) => r.id === id), order: i })),
        })),
    }),
    { name: 'masoi-library' },
  ),
)
