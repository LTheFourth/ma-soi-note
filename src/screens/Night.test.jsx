import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import Night from './Night.jsx'
import { useGameStore } from '../store/gameStore.js'

const players = [{ id: 'p1', name: 'Al' }, { id: 'p2', name: 'Bo' }, { id: 'p3', name: 'Cy' }]
const roles = [
  { id: 'wolf', name: 'Wolf', color: '#c00', gameNightEnabled: true, order: 0 },
  { id: 'cupid', name: 'Cupid', color: '#e0a', gameNightEnabled: false, order: 1 },
]

describe('Night', () => {
  beforeEach(() => {
    useGameStore.getState().endGame()
    useGameStore.getState().startGame(players, roles)
    useGameStore.setState({ assignments: { p1: 'wolf', p2: 'villager', p3: 'villager' } })
    useGameStore.getState().startNight()  // phase night, round 1, cursor 0
  })

  it('shows only game-night roles and advances to summary', async () => {
    const user = userEvent.setup()
    render(<Night />)
    expect(screen.getByText('Wolf')).toBeInTheDocument()   // cupid excluded
    await user.click(screen.getAllByRole('button', { name: /done|skip/i })[0])
    // only 1 night role -> now summary
    expect(screen.getByText(/night summary/i)).toBeInTheDocument()
  })

  it('summary can eliminate a player then finish night to day', async () => {
    const user = userEvent.setup()
    render(<Night />)
    await user.click(screen.getByRole('button', { name: /skip/i }))  // -> summary
    await user.click(screen.getByRole('button', { name: /eliminate Bo/i }))
    expect(useGameStore.getState().eliminated).toContain('p2')
    await user.click(screen.getByRole('button', { name: /finish night/i }))
    expect(useGameStore.getState().phase).toBe('day')
  })
})
