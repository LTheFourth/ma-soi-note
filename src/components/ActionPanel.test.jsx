import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import ActionPanel from './ActionPanel.jsx'
import { useGameStore } from '../store/gameStore.js'

const players = [{ id: 'p1', name: 'Al' }, { id: 'p2', name: 'Bo' }]
const roles = [{ id: 'wolf', name: 'Wolf', color: '#c00', gameNightEnabled: true, order: 0 }]

describe('ActionPanel', () => {
  beforeEach(() => {
    useGameStore.getState().endGame()
    useGameStore.getState().startGame(players, roles)
  })

  it('logs an action with selected target and type', async () => {
    const user = userEvent.setup()
    render(<ActionPanel role={roles[0]} round={1} />)
    await user.selectOptions(screen.getByLabelText(/target/i), 'p2')
    await user.click(screen.getByRole('button', { name: /bad/i }))
    await user.click(screen.getByRole('button', { name: /add action/i }))
    const log = useGameStore.getState().actionLog
    expect(log).toHaveLength(1)
    expect(log[0]).toMatchObject({ actor: 'wolf', target: 'p2', type: 'bad', round: 1 })
    // shows in logged list
    expect(screen.getByText(/Bo/)).toBeInTheDocument()
  })
})
