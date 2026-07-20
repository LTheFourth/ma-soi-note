import { describe, it, expect, beforeEach } from 'vitest'
import { useLibraryStore } from './libraryStore.js'

const reset = () =>
  useLibraryStore.setState({
    players: [], roles: [], roleSets: [], lastGame: { playerIds: [], roleIds: [] },
  })

describe('libraryStore', () => {
  beforeEach(reset)

  it('adds and removes players', () => {
    useLibraryStore.getState().addPlayer('Alice')
    useLibraryStore.getState().addPlayer('Bob')
    let players = useLibraryStore.getState().players
    expect(players.map(p => p.name)).toEqual(['Alice', 'Bob'])
    useLibraryStore.getState().removePlayer(players[0].id)
    expect(useLibraryStore.getState().players.map(p => p.name)).toEqual(['Bob'])
  })

  it('adds a role with defaults (order by index, every night, default actions)', () => {
    useLibraryStore.getState().addRole('Wolf', '#c00')
    useLibraryStore.getState().addRole('Seer', '#06c')
    const roles = useLibraryStore.getState().roles
    expect(roles[0]).toMatchObject({ name: 'Wolf', color: '#c00', order: 0, callTiming: 'every' })
    expect(roles[0].actions).toEqual(['bad', 'good', 'info'])
    expect(roles[1].order).toBe(1)
  })

  it('updateRole patches fields', () => {
    useLibraryStore.getState().addRole('Cupid', '#e0a')
    const id = useLibraryStore.getState().roles[0].id
    useLibraryStore.getState().updateRole(id, { callTiming: 'first' })
    expect(useLibraryStore.getState().roles[0].callTiming).toBe('first')
  })

  it('reorderRoles rewrites order to match given id sequence', () => {
    useLibraryStore.getState().addRole('A', '#111')
    useLibraryStore.getState().addRole('B', '#222')
    useLibraryStore.getState().addRole('C', '#333')
    const [a, b, c] = useLibraryStore.getState().roles
    useLibraryStore.getState().reorderRoles([c.id, a.id, b.id])
    const byId = Object.fromEntries(useLibraryStore.getState().roles.map(r => [r.id, r.order]))
    expect(byId[c.id]).toBe(0)
    expect(byId[a.id]).toBe(1)
    expect(byId[b.id]).toBe(2)
  })

  it('reorderRoles with a partial id list preserves roles not in the list', () => {
    useLibraryStore.getState().addRole('A', '#111')
    useLibraryStore.getState().addRole('B', '#222')
    useLibraryStore.getState().addRole('C', '#333')
    const [a, b, c] = useLibraryStore.getState().roles
    useLibraryStore.getState().reorderRoles([c.id, a.id])
    const roles = useLibraryStore.getState().roles
    expect(roles).toHaveLength(3)
    const byId = Object.fromEntries(roles.map((r) => [r.id, r]))
    expect(byId[c.id].order).toBe(0)
    expect(byId[a.id].order).toBe(1)
    expect(byId[b.id]).toMatchObject({ name: 'B', order: b.order })
  })

  it('addRole after removeRole yields a unique order (no collision)', () => {
    useLibraryStore.getState().addRole('A', '#111')
    useLibraryStore.getState().addRole('B', '#222')
    useLibraryStore.getState().addRole('C', '#333')
    const [a, b, c] = useLibraryStore.getState().roles
    useLibraryStore.getState().removeRole(b.id)
    useLibraryStore.getState().addRole('D', '#444')
    const roles = useLibraryStore.getState().roles
    const d = roles.find((r) => r.name === 'D')
    const otherOrders = roles.filter((r) => r.id !== d.id).map((r) => r.order)
    expect(otherOrders).not.toContain(d.order)
  })

  it('removeRole removes the role by id', () => {
    useLibraryStore.getState().addRole('A', '#111')
    useLibraryStore.getState().addRole('B', '#222')
    const [a, b] = useLibraryStore.getState().roles
    useLibraryStore.getState().removeRole(a.id)
    const roles = useLibraryStore.getState().roles
    expect(roles.map((r) => r.id)).not.toContain(a.id)
    expect(roles.map((r) => r.id)).toContain(b.id)
  })

  it('reorderRoles gives the listed ids unique contiguous orders 0..n-1', () => {
    useLibraryStore.getState().addRole('A', '#111')
    useLibraryStore.getState().addRole('B', '#222')
    useLibraryStore.getState().addRole('C', '#333')
    const [a, b, c] = useLibraryStore.getState().roles
    useLibraryStore.getState().reorderRoles([b.id, c.id, a.id])
    const orders = [b.id, c.id, a.id].map(
      (id) => useLibraryStore.getState().roles.find((r) => r.id === id).order,
    )
    expect(orders).toEqual([0, 1, 2])           // contiguous, in listed order
    expect(new Set(orders).size).toBe(3)         // all unique
  })

  it('saveLastGame stores selected ids', () => {
    useLibraryStore.getState().saveLastGame(['p1', 'p2'], ['r1'])
    expect(useLibraryStore.getState().lastGame).toEqual({ playerIds: ['p1', 'p2'], roleIds: ['r1'] })
  })

  it('saveRoleSet and deleteRoleSet manage presets', () => {
    const items = [{ roleId: 'r1', order: 0, callTiming: 'every', actions: ['bad'], canEliminate: true }]
    useLibraryStore.getState().saveRoleSet('Classic', items)
    const sets = useLibraryStore.getState().roleSets
    expect(sets).toHaveLength(1)
    expect(sets[0]).toMatchObject({ name: 'Classic', items })
    useLibraryStore.getState().deleteRoleSet(sets[0].id)
    expect(useLibraryStore.getState().roleSets).toHaveLength(0)
  })
})
