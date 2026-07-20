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

  it('eliminates a player with default reason "voted" after confirmation', async () => {
    const user = userEvent.setup()
    render(<Day />)
    await user.click(screen.getByText('Bo'))
    await user.click(screen.getByRole('button', { name: /eliminate/i }))
    // dialog defaults reason to "voted"
    expect(screen.getByLabelText(/reason/i)).toHaveValue('voted')
    await user.click(screen.getByRole('button', { name: /confirm/i }))
    expect(useGameStore.getState().eliminated).toContain('p2')
    const elim = useGameStore.getState().actionLog.find((a) => a.kind === 'elim')
    expect(elim).toMatchObject({ target: 'p2', reason: 'voted' })
    // "Bo" now also appears in the history log; pick the one inside a player card.
    const card = screen.getAllByText('Bo').map((el) => el.closest('.player-card')).find(Boolean)
    expect(card).toHaveClass('eliminated')
  })

  it('Go to Night switches phase and increments round', async () => {
    const user = userEvent.setup()
    render(<Day />)
    await user.click(screen.getByRole('button', { name: /go to night/i }))
    expect(useGameStore.getState().phase).toBe('night')
    expect(useGameStore.getState().round).toBe(1)
  })
})
