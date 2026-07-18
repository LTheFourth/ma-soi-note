import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import Setup from './Setup.jsx'
import { useGameStore } from '../store/gameStore.js'

const players = [{ id: 'p1', name: 'Al' }, { id: 'p2', name: 'Bo' }, { id: 'p3', name: 'Cy' }]
const roles = [
  { id: 'wolf', name: 'Wolf', color: '#c00', gameNightEnabled: true, order: 0 },
  { id: 'seer', name: 'Seer', color: '#06c', gameNightEnabled: true, order: 1 },
]

describe('Setup', () => {
  beforeEach(() => {
    useGameStore.getState().endGame()
    useGameStore.getState().startGame(players, roles)
  })

  it('assigns selected players to current role and advances', async () => {
    const user = userEvent.setup()
    render(<Setup />)
    expect(screen.getByText('Wolf')).toBeInTheDocument()
    await user.click(screen.getByRole('checkbox', { name: 'Al' }))
    await user.click(screen.getByRole('checkbox', { name: 'Bo' }))
    await user.click(screen.getByRole('button', { name: /next/i }))
    // now Seer step
    expect(screen.getByText('Seer')).toBeInTheDocument()
    // Al and Bo already assigned to Wolf -> not selectable now
    expect(screen.queryByRole('checkbox', { name: 'Al' })).toBeNull()
    expect(screen.getByRole('checkbox', { name: 'Cy' })).toBeInTheDocument()
  })

  it('finishing last role finalizes leftovers to villager and goes to day', async () => {
    const user = userEvent.setup()
    render(<Setup />)
    await user.click(screen.getByRole('checkbox', { name: 'Al' }))      // wolf
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('checkbox', { name: 'Bo' }))      // seer
    await user.click(screen.getByRole('button', { name: /next/i }))     // finalize
    const s = useGameStore.getState()
    expect(s.phase).toBe('day')
    expect(s.assignments['p3']).toBe('villager')
  })
})
