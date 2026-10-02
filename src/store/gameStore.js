import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { uid } from '../lib/id.js'
import { VILLAGER } from '../lib/roles.js'
import { roleTiming } from '../lib/actions.js'
import { useLibraryStore } from './libraryStore.js'

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
  // Set when a death dragged others down with it, so the moderator is told
  // rather than silently losing players. Cleared once acknowledged.
  deathNotice: null,
}

export const useGameStore = create(
  persist(
    (set, get) => ({
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
          actionLog: [...s.actionLog, { id: uid(), actor, target, type, note, round, phase: s.phase }],
        })),

      removeAction: (id) =>
        set((s) => ({ actionLog: s.actionLog.filter((a) => a.id !== id) })),

      // Link 2+ players into a group; each group gets its own color.
      logLink: ({ actor, targets, round, deadly = false }) =>
        set((s) => {
          const n = s.actionLog.filter((a) => a.type === 'link').length
          const color = LINK_COLORS[n % LINK_COLORS.length]
          return {
            actionLog: [
              ...s.actionLog,
              { id: uid(), type: 'link', actor, targets, color, round, phase: s.phase, deadly },
            ],
          }
        }),

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

      // reason: free text (day: e.g. "bị treo cổ") or a role name (night: killer
      // role). note: anything the moderator wants to remember about the death.
      //
      // A player in a link marked deadly takes their partners with them, and
      // the chain is followed (A-B, B-C kills all three). Knock-on deaths are
      // reported through deathNotice so the moderator is never surprised.
      eliminate: (playerId, reason = '', note = '') =>
        set((s) => {
          if (s.eliminated.includes(playerId)) return s
          const nameOf = (pid) => s.players.find((p) => p.id === pid)?.name ?? '?'

          const dead = new Set(s.eliminated)
          const log = [...s.actionLog]
          const kill = (pid, why, n, cause) => {
            dead.add(pid)
            log.push({
              id: uid(), kind: 'elim', actor: null, type: 'elim', target: pid,
              reason: why, note: n, cause, round: s.round, phase: s.phase,
            })
          }

          kill(playerId, reason, note, 'direct')

          const followers = []
          const queue = [playerId]
          while (queue.length) {
            const cur = queue.shift()
            for (const a of s.actionLog) {
              if (a.type !== 'link' || !a.deadly || !a.targets?.includes(cur)) continue
              for (const pid of a.targets) {
                if (dead.has(pid)) continue
                kill(pid, `died with ${nameOf(cur)}`, '', 'linked')
                followers.push(pid)
                queue.push(pid)
              }
            }
          }

          return {
            eliminated: [...dead],
            actionLog: log,
            deathNotice: followers.length ? { primary: playerId, followers } : null,
          }
        }),

      clearDeathNotice: () => set({ deathNotice: null }),

      // Bring players back and drop the elimination entries that killed them.
      // Links and role actions are left alone — only the deaths are undone.
      undoDeaths: (playerIds) =>
        set((s) => ({
          eliminated: s.eliminated.filter((id) => !playerIds.includes(id)),
          actionLog: s.actionLog.filter(
            (a) => !(a.kind === 'elim' && playerIds.includes(a.target)),
          ),
          deathNotice: null,
        })),

      endGame: () => {
        const s = get()
        if (s.active && s.players.length) {
          useLibraryStore.getState().saveLastGame(
            s.players.map((p) => p.id),
            s.roles.map((r) => r.id),
          )
        }
        set({ ...initial })
      },
    }),
    { name: 'masoi-game' },
  ),
)

// Roles called on the current night: 'every' always; 'first' only on round 1
// (first game night); 'never' excluded.
// Distinct colors for linked groups (cycled).
const LINK_COLORS = ['#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#22c55e', '#ef4444', '#3b82f6']

// Color of the link group a player belongs to, or null.
export const linkColorOf = (s, pid) => {
  const e = s.actionLog.find((a) => a.type === 'link' && a.targets?.includes(pid))
  return e ? e.color : null
}

// Names of the other players in this player's link group.
export const linkPartnersOf = (s, pid) => {
  const e = s.actionLog.find((a) => a.type === 'link' && a.targets?.includes(pid))
  if (!e) return []
  return e.targets
    .filter((id) => id !== pid)
    .map((id) => s.players.find((p) => p.id === id)?.name ?? '?')
}

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
