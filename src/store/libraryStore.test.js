import { describe, it, expect, beforeEach } from 'vitest'
import { useLibraryStore } from './libraryStore.js'
import { DEFAULT_ROLES } from '../lib/defaultRoles.js'

const reset = () => {
  useLibraryStore.setState({
    players: [], roleSets: [], lastGame: { playerIds: [], roleIds: [] },
  })
  useLibraryStore.getState().resetAllRoles()
}

// The library always holds the built-ins; these tests are about roles the
// moderator types, which sort after them.
const custom = () => useLibraryStore.getState().roles.filter((r) => !r.builtin)

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
    const [wolf, seer] = custom()
    expect(wolf).toMatchObject({ name: 'Wolf', color: '#c00', callTiming: 'every', team: 'custom' })
    expect(wolf.actions).toEqual(['bad', 'good', 'info'])
    // Custom roles sort after every built-in.
    expect(wolf.order).toBe(DEFAULT_ROLES.length)
    expect(seer.order).toBe(DEFAULT_ROLES.length + 1)
  })

  it('updateRole patches fields', () => {
    useLibraryStore.getState().addRole('Vai La', '#e0a')
    const id = custom()[0].id
    useLibraryStore.getState().updateRole(id, { callTiming: 'first' })
    expect(custom()[0].callTiming).toBe('first')
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
    const [a, b, c] = custom()
    useLibraryStore.getState().reorderRoles([c.id, a.id])
    expect(custom()).toHaveLength(3)
    const byId = Object.fromEntries(custom().map((r) => [r.id, r]))
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
    const [a, b] = custom()
    useLibraryStore.getState().removeRole(a.id)
    expect(custom().map((r) => r.id)).not.toContain(a.id)
    expect(custom().map((r) => r.id)).toContain(b.id)
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

  it('upsertRole inserts a new role and merges into an existing one', () => {
    useLibraryStore.getState().upsertRole({
      id: 'x1', name: 'Ghost', color: '#fff', order: 0, callTiming: 'every', actions: ['info'], canEliminate: false,
    })
    expect(useLibraryStore.getState().roles.map((r) => r.id)).toContain('x1')
    useLibraryStore.getState().upsertRole({ id: 'x1', name: 'Ghost2' })
    const r = useLibraryStore.getState().roles.find((x) => x.id === 'x1')
    expect(r.name).toBe('Ghost2')
    expect(r.color).toBe('#fff') // untouched fields preserved
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

  it('saveRoleSet overrides a set with the same name (no duplicate)', () => {
    useLibraryStore.getState().saveRoleSet('S', [{ roleId: 'r1' }])
    useLibraryStore.getState().saveRoleSet('S', [{ roleId: 'r1' }, { roleId: 'r2' }])
    const sets = useLibraryStore.getState().roleSets
    expect(sets).toHaveLength(1)
    expect(sets[0].items).toHaveLength(2)
  })

  it('updateRoleSet replaces items by id', () => {
    useLibraryStore.getState().saveRoleSet('S', [{ roleId: 'r1' }])
    const id = useLibraryStore.getState().roleSets[0].id
    useLibraryStore.getState().updateRoleSet(id, [{ roleId: 'r2' }])
    expect(useLibraryStore.getState().roleSets[0].items).toEqual([{ roleId: 'r2' }])
  })
})

describe('libraryStore role art', () => {
  beforeEach(reset)
  const custom = () => useLibraryStore.getState().roles.filter((r) => !r.builtin)

  it('guesses art from the role name when the role is created', () => {
    useLibraryStore.getState().addRole('Ma Sói Hai', '#c00')
    expect(custom()[0].art).toBe('werewolf')
  })

  it('leaves art unset for a name it cannot place', () => {
    useLibraryStore.getState().addRole('Zzzz', '#c00')
    expect(custom()[0].art).toBeUndefined()
  })

  it('keeps a manually picked art when the role is renamed', () => {
    useLibraryStore.getState().addRole('Ma Sói Hai', '#c00')
    const id = custom()[0].id
    useLibraryStore.getState().updateRole(id, { art: 'ghost' })
    useLibraryStore.getState().updateRole(id, { name: 'Tiên Tri Hai' })
    expect(custom()[0].art).toBe('ghost')
  })

  it('restores a deleted custom role through upsertRole', () => {
    useLibraryStore.getState().upsertRole({ id: 'x1', name: 'Vai Cu', color: '#06c', art: 'seer' })
    expect(custom()[0]).toMatchObject({ id: 'x1', art: 'seer', team: 'custom' })
  })
})

describe('libraryStore built-in roles', () => {
  beforeEach(() => useLibraryStore.setState({
    players: [], roleOverrides: {}, customRoles: [], roleSets: [],
    lastGame: { playerIds: [], roleIds: [] },
    roles: useLibraryStore.getState().roles,
  }, false))

  const roles = () => useLibraryStore.getState().roles
  const byId = (id) => roles().find((r) => r.id === id)

  it('starts with every built-in role present', () => {
    useLibraryStore.getState().resetAllRoles()
    expect(roles()).toHaveLength(DEFAULT_ROLES.length)
    expect(byId('werewolf').name).toBe('Ma Sói')
  })

  it('refuses to delete a built-in role', () => {
    useLibraryStore.getState().resetAllRoles()
    useLibraryStore.getState().removeRole('werewolf')
    expect(byId('werewolf')).toBeDefined()
  })

  it('adds a hand-typed role to the custom group and deletes it again', () => {
    useLibraryStore.getState().resetAllRoles()
    useLibraryStore.getState().addRole('Vai Của Tôi', '#123456')
    const mine = roles().find((r) => r.name === 'Vai Của Tôi')
    expect(mine.team).toBe('custom')
    expect(mine.builtin).toBeFalsy()
    useLibraryStore.getState().removeRole(mine.id)
    expect(roles().find((r) => r.name === 'Vai Của Tôi')).toBeUndefined()
  })

  it('edits a built-in as an override instead of a copy', () => {
    useLibraryStore.getState().resetAllRoles()
    useLibraryStore.getState().updateRole('werewolf', { color: '#000000' })
    expect(byId('werewolf').color).toBe('#000000')
    expect(roles().filter((r) => r.id === 'werewolf')).toHaveLength(1)
    expect(useLibraryStore.getState().roleOverrides.werewolf).toEqual({ color: '#000000' })
  })

  it('resets an edited built-in back to its shipped values', () => {
    useLibraryStore.getState().resetAllRoles()
    useLibraryStore.getState().updateRole('werewolf', { color: '#000000', name: 'Sói' })
    useLibraryStore.getState().resetRole('werewolf')
    expect(byId('werewolf').color).toBe('#ef4444')
    expect(byId('werewolf').name).toBe('Ma Sói')
  })

  it('reports whether a built-in has been edited', () => {
    useLibraryStore.getState().resetAllRoles()
    expect(useLibraryStore.getState().roleOverrides.seer).toBeUndefined()
    useLibraryStore.getState().updateRole('seer', { color: '#000000' })
    expect(useLibraryStore.getState().roleOverrides.seer).toBeDefined()
  })

  it('keeps built-ins before custom roles', () => {
    useLibraryStore.getState().resetAllRoles()
    useLibraryStore.getState().addRole('Zzz', '#123456')
    const names = roles().map((r) => r.id)
    expect(names.indexOf('werewolf')).toBeLessThan(names.length - 1)
    expect(roles()[roles().length - 1].name).toBe('Zzz')
  })

  it('stores a reordering of a built-in as an override', () => {
    useLibraryStore.getState().resetAllRoles()
    useLibraryStore.getState().reorderRoles(['seer', 'werewolf'])
    expect(byId('seer').order).toBe(0)
    expect(byId('werewolf').order).toBe(1)
  })

  it('applies a saved set to a built-in without duplicating it', () => {
    useLibraryStore.getState().resetAllRoles()
    useLibraryStore.getState().upsertRole({ id: 'werewolf', name: 'Ma Sói', color: '#0f0f0f', order: 3 })
    expect(roles().filter((r) => r.id === 'werewolf')).toHaveLength(1)
    expect(byId('werewolf').color).toBe('#0f0f0f')
  })

  it('records no override when a saved set matches the shipped values', () => {
    useLibraryStore.getState().resetAllRoles()
    const wolf = DEFAULT_ROLES.find((r) => r.id === 'werewolf')
    useLibraryStore.getState().upsertRole({
      id: 'werewolf', name: wolf.name, color: wolf.color, order: wolf.order,
      callTiming: wolf.callTiming, actions: [...wolf.actions], canEliminate: wolf.canEliminate,
      art: wolf.art,
    })
    expect(useLibraryStore.getState().roleOverrides.werewolf).toBeUndefined()
  })

  it('records only the fields a saved set actually changes', () => {
    useLibraryStore.getState().resetAllRoles()
    const wolf = DEFAULT_ROLES.find((r) => r.id === 'werewolf')
    useLibraryStore.getState().upsertRole({ id: 'werewolf', name: wolf.name, color: '#010203' })
    expect(useLibraryStore.getState().roleOverrides.werewolf).toEqual({ color: '#010203' })
  })

})
