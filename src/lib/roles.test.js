import { describe, it, expect } from 'vitest'
import { VILLAGER } from './roles.js'
import { ALIASES } from './art.js'
import { DEFAULT_ROLES } from './defaultRoles.js'

describe('VILLAGER', () => {
  it('carries art so unassigned players are not blank', () => {
    expect(VILLAGER.art).toBe('villager')
  })

  it('uses an art id the alias table knows about', () => {
    expect(Object.values(ALIASES)).toContain(VILLAGER.art)
  })
})

describe('VILLAGER matches the built-in it stands in for', () => {
  it('uses the same name and colour as the Dân Làng role', () => {
    const builtin = DEFAULT_ROLES.find((r) => r.id === 'villager')
    expect(VILLAGER.name).toBe(builtin.name)
    expect(VILLAGER.color).toBe(builtin.color)
    expect(VILLAGER.art).toBe(builtin.art)
  })
})
