import { describe, it, expect } from 'vitest'
import { guessArt, artUrl, normalizeName, ART_IDS } from './art.js'

describe('normalizeName', () => {
  it('lowercases and strips Vietnamese diacritics', () => {
    expect(normalizeName('Ma Sói')).toBe('ma soi')
    expect(normalizeName('Phù Thủy')).toBe('phu thuy')
    expect(normalizeName('Thợ Săn')).toBe('tho san')
  })

  it('maps đ to d', () => {
    expect(normalizeName('Đứa Trẻ')).toBe('dua tre')
  })

  it('collapses surrounding and repeated whitespace', () => {
    expect(normalizeName('  Ma   Sói  ')).toBe('ma soi')
  })
})

describe('guessArt', () => {
  it('matches an English role name', () => {
    expect(guessArt('Werewolf')).toBe('werewolf')
    expect(guessArt('Seer')).toBe('seer')
  })

  it('matches a Vietnamese role name written with diacritics', () => {
    expect(guessArt('Ma Sói')).toBe('werewolf')
    expect(guessArt('Tiên Tri')).toBe('seer')
    expect(guessArt('Phù Thủy')).toBe('witch')
  })

  it('matches a Vietnamese role name written without diacritics', () => {
    expect(guessArt('ma soi')).toBe('werewolf')
    expect(guessArt('tien tri')).toBe('seer')
  })

  it('prefers the longest matching alias', () => {
    expect(guessArt('Sói Trùm')).toBe('dire-wolf')
    expect(guessArt('Apprentice Seer')).toBe('apprentice-seer')
    expect(guessArt('Sói Con')).toBe('wolf-cub')
  })

  it('matches an alias embedded in a longer custom name', () => {
    expect(guessArt('Ma Sói Thường')).toBe('werewolf')
  })

  it('returns undefined for a name it does not recognise', () => {
    expect(guessArt('Bla bla')).toBeUndefined()
    expect(guessArt('')).toBeUndefined()
  })

  it('tolerates a missing name', () => {
    expect(guessArt(undefined)).toBeUndefined()
  })
})

describe('artUrl', () => {
  it('returns null for an unknown art id', () => {
    expect(artUrl('definitely-not-a-role')).toBeNull()
  })

  it('returns null when no id is given', () => {
    expect(artUrl(undefined)).toBeNull()
  })

  it('returns a url for every id it advertises in ART_IDS', () => {
    for (const id of ART_IDS) expect(artUrl(id)).toBeTruthy()
  })
})
