import { describe, it, expect, beforeEach } from 'vitest'
import { useLibraryStore } from './libraryStore.js'

const reset = () => useLibraryStore.setState({ players: [], roles: [] })

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

  it('adds a role with defaults (order by index, gameNightEnabled true)', () => {
    useLibraryStore.getState().addRole('Wolf', '#c00')
    useLibraryStore.getState().addRole('Seer', '#06c')
    const roles = useLibraryStore.getState().roles
    expect(roles[0]).toMatchObject({ name: 'Wolf', color: '#c00', order: 0, gameNightEnabled: true })
    expect(roles[1].order).toBe(1)
  })

  it('updateRole patches fields', () => {
    useLibraryStore.getState().addRole('Cupid', '#e0a')
    const id = useLibraryStore.getState().roles[0].id
    useLibraryStore.getState().updateRole(id, { gameNightEnabled: false })
    expect(useLibraryStore.getState().roles[0].gameNightEnabled).toBe(false)
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
})
