import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { uid } from '../lib/id.js'
import { VILLAGER } from '../lib/roles.js'
import { roleTiming } from '../lib/actions.js'

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

      updateAction: (id, patch) =>
        set((s) => ({
          actionLog: s.actionLog.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),

      startNight: () =>
        set((s) => ({ phase: 'night', round: s.round + 1, nightCursor: 0 })),

      nightNext: () =>
        set((s) => ({
          nightCursor: Math.min(s.nightCursor + 1, selectNightRoles(s).length),
        })),

      nightPrev: () =>
        set((s) => ({ nightCursor: Math.max(0, s.nightCursor - 1) })),

      endNight: () => set({ phase: 'day' }),

      // reason: free text (day: e.g. "voted") or a role name (night: killer role).
      eliminate: (playerId, reason = '') =>
        set((s) =>
          s.eliminated.includes(playerId)
            ? s
            : {
                eliminated: [...s.eliminated, playerId],
                actionLog: [
                  ...s.actionLog,
                  { id: uid(), kind: 'elim', actor: null, type: 'elim', target: playerId, reason, round: s.round },
                ],
              },
        ),

      endGame: () => set({ ...initial }),
    }),
    { name: 'masoi-game' },
  ),
)

// Roles called on the current night: 'every' always; 'first' only on round 1
// (first game night); 'never' excluded.
export const selectNightRoles = (s) =>
  s.roles.filter((r) => {
    const t = roleTiming(r)
    return t === 'every' || (t === 'first' && s.round === 1)
  })
export const selectRoleById = (s, id) =>
  id === 'villager' ? VILLAGER : s.roles.find((r) => r.id === id) || VILLAGER
export const selectPlayersByRole = (s, roleId) =>
  s.players.filter((p) => s.assignments[p.id] === roleId)
export const selectSurvivors = (s) => s.players.filter((p) => !s.eliminated.includes(p.id))
export const selectAssignedPlayerIds = (s) => Object.keys(s.assignments)
