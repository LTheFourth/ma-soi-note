import { describe, it, expect } from 'vitest'
import { formatMMSS } from './time.js'

describe('formatMMSS', () => {
  it('zero-pads minutes and seconds', () => {
    expect(formatMMSS(0)).toBe('00:00')
    expect(formatMMSS(5)).toBe('00:05')
    expect(formatMMSS(65)).toBe('01:05')
    expect(formatMMSS(600)).toBe('10:00')
  })

  it('floors fractional and clamps negatives', () => {
    expect(formatMMSS(9.9)).toBe('00:09')
    expect(formatMMSS(-3)).toBe('00:00')
  })
})
