import { describe, it, expect, beforeEach } from 'vitest'
import {
  useGameStore, selectNightRoles, selectRoleById,
  selectPlayersByRole, selectSurvivors, selectAssignedPlayerIds, linkColorOf, linkPartnersOf,
} from './gameStore.js'
import { useLibraryStore } from './libraryStore.js'

const players = [
  { id: 'p1', name: 'Al' }, { id: 'p2', name: 'Bo' },
  { id: 'p3', name: 'Cy' }, { id: 'p4', name: 'Di' },
]
const roles = [
  { id: 'wolf', name: 'Wolf', color: '#c00', gameNightEnabled: true, order: 1 },
  { id: 'seer', name: 'Seer', color: '#06c', gameNightEnabled: true, order: 0 },
  { id: 'cupid', name: 'Cupid', color: '#e0a', gameNightEnabled: false, order: 2 },
]
const g = () => useGameStore.getState()

describe('gameStore', () => {
  beforeEach(() => g().endGame())

  it('startGame snapshots and sorts roles by order', () => {
    g().startGame(players, roles)
    expect(g().active).toBe(true)
    expect(g().phase).toBe('setup')
    expect(g().roles.map(r => r.id)).toEqual(['seer', 'wolf', 'cupid'])
    expect(g().setupCursor).toBe(0)
  })

  it('assignRole maps players and is replaceable', () => {
    g().startGame(players, roles)
    g().assignRole('wolf', ['p1', 'p2'])
    expect(selectPlayersByRole(g(), 'wolf').map(p => p.id)).toEqual(['p1', 'p2'])
    g().assignRole('wolf', ['p1'])
    expect(selectPlayersByRole(g(), 'wolf').map(p => p.id)).toEqual(['p1'])
    expect(selectAssignedPlayerIds(g())).toEqual(['p1'])
  })

  it('setupNext advances then finalizes leftovers to villager', () => {
    g().startGame(players, roles)          // roles: seer, wolf, cupid
    g().assignRole('seer', ['p3'])
    g().setupNext()                        // -> wolf
    expect(g().setupCursor).toBe(1)
    g().assignRole('wolf', ['p1'])
    g().setupNext()                        // -> cupid
    g().assignRole('cupid', ['p2'])
    g().setupNext()                        // past end -> finalize
    expect(g().phase).toBe('day')
    // p4 unassigned -> villager
    expect(selectRoleById(g(), g().assignments['p4']).id).toBe('villager')
  })

  it('night flow: only gameNightEnabled roles, cursor caps at length', () => {
    g().startGame(players, roles)
    expect(selectNightRoles(g()).map(r => r.id)).toEqual(['seer', 'wolf']) // cupid excluded
    g().startNight()
    expect(g().phase).toBe('night')
    expect(g().round).toBe(1)
    g().nightNext()  // seer -> wolf
    g().nightNext()  // wolf -> summary (index 2 == length)
    g().nightNext()  // capped
    expect(g().nightCursor).toBe(2)
    g().endNight()
    expect(g().phase).toBe('day')
  })

  it('first-night roles are called only on round 1', () => {
    const rs = [
      { id: 'wolf', name: 'Wolf', color: '#c00', callTiming: 'every', order: 0 },
      { id: 'cupid', name: 'Cupid', color: '#e0a', callTiming: 'first', order: 1 },
    ]
    g().startGame(players, rs)
    g().startNight() // round 1
    expect(selectNightRoles(g()).map((r) => r.id)).toEqual(['wolf', 'cupid'])
    g().startNight() // round 2
    expect(selectNightRoles(g()).map((r) => r.id)).toEqual(['wolf'])
  })

  it('logAction appends with id and round', () => {
    g().startGame(players, roles)
    g().logAction({ actor: 'wolf', target: 'p3', type: 'bad', note: '', round: 1 })
    expect(g().actionLog).toHaveLength(1)
    expect(g().actionLog[0]).toMatchObject({ actor: 'wolf', target: 'p3', type: 'bad', round: 1 })
    expect(g().actionLog[0].id).toBeTruthy()
  })

  it('removeAction deletes an action by id', () => {
    g().startGame(players, roles)
    g().logAction({ actor: 'wolf', target: 'p3', type: 'bad', note: '', round: 1 })
    g().logAction({ actor: 'seer', target: 'p2', type: 'info', note: '', round: 1 })
    const firstId = g().actionLog[0].id
    g().removeAction(firstId)
    expect(g().actionLog).toHaveLength(1)
    expect(g().actionLog[0].actor).toBe('seer')
  })

  it('logLink groups players with a per-group color', () => {
    g().startGame(players, roles)
    g().logLink({ actor: 'wolf', targets: ['p1', 'p2'], round: 1 })
    const e = g().actionLog.find((a) => a.type === 'link')
    expect(e).toMatchObject({ type: 'link', targets: ['p1', 'p2'] })
    expect(e.color).toBeTruthy()
    expect(linkColorOf(g(), 'p1')).toBe(e.color)
    expect(linkColorOf(g(), 'p2')).toBe(e.color)
    expect(linkColorOf(g(), 'p3')).toBeNull()
    // second group gets a different color
    g().logLink({ actor: 'wolf', targets: ['p3', 'p4'], round: 1 })
    const colors = g().actionLog.filter((a) => a.type === 'link').map((a) => a.color)
    expect(colors[0]).not.toBe(colors[1])
  })

  it('linkPartnersOf returns the other members of a link group', () => {
    g().startGame(players, roles)
    g().logLink({ actor: 'wolf', targets: ['p1', 'p2'], round: 1 })
    expect(linkPartnersOf(g(), 'p1')).toEqual(['Bo'])
    expect(linkPartnersOf(g(), 'p2')).toEqual(['Al'])
    expect(linkPartnersOf(g(), 'p3')).toEqual([])
  })

  it('updateAction patches an action in place', () => {
    g().startGame(players, roles)
    g().logAction({ actor: 'wolf', target: 'p3', type: 'bad', note: '', round: 1 })
    const id = g().actionLog[0].id
    g().updateAction(id, { type: 'good', target: 'p1' })
    expect(g().actionLog[0]).toMatchObject({ id, type: 'good', target: 'p1', actor: 'wolf' })
  })

  it('nightPrev steps the cursor back, clamped at 0', () => {
    g().startGame(players, roles)
    g().startNight()
    g().nightNext()          // 0 -> 1
    expect(g().nightCursor).toBe(1)
    g().nightPrev()          // 1 -> 0
    expect(g().nightCursor).toBe(0)
    g().nightPrev()          // clamped
    expect(g().nightCursor).toBe(0)
  })

  it('eliminate is idempotent; survivors excludes eliminated', () => {
    g().startGame(players, roles)
    g().eliminate('p1')
    g().eliminate('p1')
    expect(g().eliminated).toEqual(['p1'])
    expect(selectSurvivors(g()).map(p => p.id)).toEqual(['p2', 'p3', 'p4'])
  })

  it('eliminate logs an elim entry with reason and round', () => {
    g().startGame(players, roles)
    g().startNight()                       // round 1
    g().eliminate('p2', 'Wolf')
    const elim = g().actionLog.find((a) => a.kind === 'elim')
    expect(elim).toMatchObject({ kind: 'elim', target: 'p2', reason: 'Wolf', round: 1 })
    // idempotent: no duplicate elim entry
    g().eliminate('p2', 'Wolf')
    expect(g().actionLog.filter((a) => a.kind === 'elim')).toHaveLength(1)
  })

  it('selectRoleById returns VILLAGER for villager id', () => {
    g().startGame(players, roles)
    expect(selectRoleById(g(), 'villager').name).toBe('Villager')
  })

  it('endGame remembers the last game in the library', () => {
    useLibraryStore.getState().saveLastGame([], [])
    g().startGame(players, roles)
    g().endGame()
    expect(useLibraryStore.getState().lastGame.playerIds).toEqual(['p1', 'p2', 'p3', 'p4'])
    expect(useLibraryStore.getState().lastGame.roleIds).toContain('wolf')
  })
})
