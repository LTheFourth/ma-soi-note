import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import Day from './Day.jsx'
import { useGameStore } from '../store/gameStore.js'

const players = [{ id: 'p1', name: 'Al' }, { id: 'p2', name: 'Bo' }]
const roles = [{ id: 'wolf', name: 'Wolf', color: '#c00', gameNightEnabled: true, order: 0 }]

describe('Day', () => {
  beforeEach(() => {
    useGameStore.getState().endGame()
    useGameStore.getState().startGame(players, roles)
    useGameStore.getState().assignRole('wolf', ['p1'])
    useGameStore.setState({ phase: 'day', assignments: { p1: 'wolf', p2: 'villager' } })
  })

  it('eliminates a player after confirmation', async () => {
    const user = userEvent.setup()
    render(<Day />)
    await user.click(screen.getByText('Bo'))
    await user.click(screen.getByRole('button', { name: /eliminate/i }))
    await user.click(screen.getByRole('button', { name: /confirm/i }))
    expect(useGameStore.getState().eliminated).toContain('p2')
    expect(screen.getByText('Bo').closest('.player-card')).toHaveClass('eliminated')
  })

  it('Go to Night switches phase and increments round', async () => {
    const user = userEvent.setup()
    render(<Day />)
    await user.click(screen.getByRole('button', { name: /go to night/i }))
    expect(useGameStore.getState().phase).toBe('night')
    expect(useGameStore.getState().round).toBe(1)
  })
})
