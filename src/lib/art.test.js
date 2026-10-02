import { describe, it, expect } from 'vitest'
import { guessArt, artUrl, normalizeName, pickBest, ART_IDS, ROLE_IDS } from './art.js'

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

describe('the shipped art set', () => {
  it('has a file for every planned role id', () => {
    const missing = ROLE_IDS.filter((id) => !artUrl(id))
    expect(missing).toEqual([])
  })

  it('ships no file that is not a planned role id', () => {
    expect(ART_IDS.filter((id) => !ROLE_IDS.includes(id))).toEqual([])
  })
})

describe('pickBest', () => {
  it('prefers a generated raster over the built-in svg for the same id', () => {
    const map = pickBest({ '../art/werewolf.svg': 'S', '../art/werewolf.webp': 'W' })
    expect(map.werewolf).toBe('W')
  })

  it('does not care which order the glob lists them in', () => {
    const map = pickBest({ '../art/werewolf.webp': 'W', '../art/werewolf.svg': 'S' })
    expect(map.werewolf).toBe('W')
  })

  it('prefers webp over png', () => {
    expect(pickBest({ '../art/seer.png': 'P', '../art/seer.webp': 'W' }).seer).toBe('W')
  })

  it('keeps the svg when it is the only file', () => {
    expect(pickBest({ '../art/ghost.svg': 'S' }).ghost).toBe('S')
  })
})
