import { describe, it, expect } from 'vitest'
import { VILLAGER } from './roles.js'
import { ALIASES } from './art.js'

describe('VILLAGER', () => {
  it('carries art so unassigned players are not blank', () => {
    expect(VILLAGER.art).toBe('villager')
  })

  it('uses an art id the alias table knows about', () => {
    expect(Object.values(ALIASES)).toContain(VILLAGER.art)
  })
})
