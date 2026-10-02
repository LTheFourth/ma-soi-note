import { describe, it, expect } from 'vitest'
import { DEFAULT_ROLES, TEAMS, rolesByTeam } from './defaultRoles.js'
import { ROLE_IDS } from './art.js'

describe('DEFAULT_ROLES', () => {
  it('covers every artwork except the unknown fallback', () => {
    const ids = DEFAULT_ROLES.map((r) => r.id).sort()
    expect(ids).toEqual(ROLE_IDS.filter((id) => id !== 'unknown').sort())
  })

  it('never uses the unknown fallback as a role artwork', () => {
    expect(DEFAULT_ROLES.some((r) => r.art === 'unknown')).toBe(false)
  })

  it('gives every role its own artwork', () => {
    const art = DEFAULT_ROLES.map((r) => r.art)
    expect(new Set(art).size).toBe(art.length)
  })

  it('names every role in Vietnamese and in English', () => {
    for (const r of DEFAULT_ROLES) {
      expect(r.name, r.id).toBeTruthy()
      expect(r.nameEn, r.id).toBeTruthy()
    }
  })

  it('puts every role on a known team', () => {
    const keys = TEAMS.map((t) => t.key)
    for (const r of DEFAULT_ROLES) expect(keys, r.id).toContain(r.team)
  })

  it('gives every role a distinct six-digit hex colour', () => {
    const colors = DEFAULT_ROLES.map((r) => r.color)
    for (const c of colors) expect(c).toMatch(/^#[0-9a-f]{6}$/)
    expect(new Set(colors).size).toBe(colors.length)
  })

  it('gives every role a valid call timing and action list', () => {
    for (const r of DEFAULT_ROLES) {
      expect(['every', 'first', 'never'], r.id).toContain(r.callTiming)
      for (const a of r.actions) expect(['bad', 'good', 'info', 'link'], r.id).toContain(a)
    }
  })

  it('never calls a role at night with no action to log', () => {
    for (const r of DEFAULT_ROLES) {
      if (r.callTiming !== 'never') expect(r.actions.length, r.id).toBeGreaterThan(0)
    }
  })

  it('orders roles contiguously from zero', () => {
    const orders = DEFAULT_ROLES.map((r) => r.order).sort((a, b) => a - b)
    expect(orders).toEqual(DEFAULT_ROLES.map((_, i) => i))
  })

  it('marks the wolves as able to eliminate', () => {
    const wolf = DEFAULT_ROLES.find((r) => r.id === 'werewolf')
    expect(wolf.canEliminate).toBe(true)
    expect(wolf.team).toBe('wolf')
  })
})

describe('TEAMS', () => {
  it('lists the four groups in play order', () => {
    expect(TEAMS.map((t) => t.key)).toEqual(['wolf', 'village', 'neutral', 'custom'])
  })

  it('labels each group in Vietnamese', () => {
    for (const t of TEAMS) expect(t.label).toBeTruthy()
  })
})

describe('rolesByTeam', () => {
  it('groups roles under their team, keeping the team order', () => {
    const groups = rolesByTeam(DEFAULT_ROLES)
    expect(groups.map((g) => g.key)).toEqual(['wolf', 'village', 'neutral', 'custom'])
    expect(groups.find((g) => g.key === 'wolf').roles.length).toBe(8)
    expect(groups.find((g) => g.key === 'neutral').roles.length).toBe(6)
    expect(groups.find((g) => g.key === 'custom').roles).toEqual([])
  })

  it('puts a role with no team in the custom group', () => {
    const groups = rolesByTeam([{ id: 'x', name: 'Mine' }])
    expect(groups.find((g) => g.key === 'custom').roles.map((r) => r.id)).toEqual(['x'])
  })

  it('keeps every group even when empty', () => {
    expect(rolesByTeam([]).length).toBe(4)
  })
})
