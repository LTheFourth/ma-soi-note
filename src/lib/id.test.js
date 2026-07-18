import { describe, it, expect } from 'vitest'
import { uid } from './id.js'

describe('uid', () => {
  it('returns a non-empty string', () => {
    expect(typeof uid()).toBe('string')
    expect(uid().length).toBeGreaterThan(0)
  })
  it('returns unique values across calls', () => {
    const ids = new Set(Array.from({ length: 1000 }, () => uid()))
    expect(ids.size).toBe(1000)
  })
})
