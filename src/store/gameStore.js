import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { uid } from '../lib/id.js'
import { VILLAGER } from '../lib/roles.js'

const initial = {
  active: false,
  players: [],
  roles: [],
  assignments: {},
  phase: 'setup',
  round: 0,
  setupCursor: 0,
  nightCursor: 0,
  actionLog: [],
  eliminated: [],
}

export const useGameStore = create(
  persist(
    (set) => ({
      ...initial,

      startGame: (players, roles) =>
        set({
          ...initial,
          active: true,
          players: players.map((p) => ({ id: p.id, name: p.name })),
          roles: [...roles].sort((a, b) => a.order - b.order),
        }),

      assignRole: (roleId, playerIds) =>
        set((s) => {
          const a = { ...s.assignments }
          for (const pid of Object.keys(a)) if (a[pid] === roleId) delete a[pid]
          for (const pid of playerIds) a[pid] = roleId
          return { assignments: a }
        }),

      setupNext: () =>
        set((s) => {
          if (s.setupCursor < s.roles.length - 1) return { setupCursor: s.setupCursor + 1 }
          const a = { ...s.assignments }
          for (const p of s.players) if (!a[p.id]) a[p.id] = 'villager'
          return { assignments: a, phase: 'day' }
        }),

      logAction: ({ actor, target, type, note = '', round }) =>
        set((s) => ({
          actionLog: [...s.actionLog, { id: uid(), actor, target, type, note, round }],
        })),

      removeAction: (id) =>
        set((s) => ({ actionLog: s.actionLog.filter((a) => a.id !== id) })),

      startNight: () =>
        set((s) => ({ phase: 'night', round: s.round + 1, nightCursor: 0 })),

      nightNext: () =>
        set((s) => ({
          nightCursor: Math.min(s.nightCursor + 1, selectNightRoles(s).length),
        })),

      nightPrev: () =>
        set((s) => ({ nightCursor: Math.max(0, s.nightCursor - 1) })),

      endNight: () => set({ phase: 'day' }),

      eliminate: (playerId) =>
        set((s) =>
          s.eliminated.includes(playerId)
            ? s
            : { eliminated: [...s.eliminated, playerId] },
        ),

      endGame: () => set({ ...initial }),
    }),
    { name: 'masoi-game' },
  ),
)

export const selectNightRoles = (s) => s.roles.filter((r) => r.gameNightEnabled)
export const selectRoleById = (s, id) =>
  id === 'villager' ? VILLAGER : s.roles.find((r) => r.id === id) || VILLAGER
export const selectPlayersByRole = (s, roleId) =>
  s.players.filter((p) => s.assignments[p.id] === roleId)
export const selectSurvivors = (s) => s.players.filter((p) => !s.eliminated.includes(p.id))
export const selectAssignedPlayerIds = (s) => Object.keys(s.assignments)
