import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GameLogButton from './GameLogButton.jsx'
import { useGameStore } from '../store/gameStore.js'

const players = [{ id: 'p1', name: 'Al' }, { id: 'p2', name: 'Bo' }]
const roles = [{ id: 'wolf', name: 'Ma Sói', color: '#c00', callTiming: 'every', actions: ['bad'] }]

describe('GameLogButton', () => {
  beforeEach(() => {
    useGameStore.getState().endGame()
    useGameStore.getState().startGame(players, roles)
    useGameStore.setState({ phase: 'night', round: 1, assignments: { p1: 'wolf', p2: 'villager' } })
  })

  it('stays out of the way until opened', () => {
    render(<GameLogButton />)
    expect(screen.getByRole('button', { name: /game log/i })).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('opens the log and shows what happened', async () => {
    const user = userEvent.setup()
    useGameStore.getState().logAction({ actor: 'wolf', target: 'p2', type: 'bad', note: '', round: 1 })
    render(<GameLogButton />)
    await user.click(screen.getByRole('button', { name: /game log/i }))
    const log = screen.getByRole('dialog')
    expect(log).toHaveTextContent('Ma Sói')
    expect(log).toHaveTextContent('Bo')
  })

  it('counts the entries so far on the button', () => {
    useGameStore.getState().logAction({ actor: 'wolf', target: 'p2', type: 'bad', note: '', round: 1 })
    useGameStore.getState().eliminate('p2', 'bị sói cắn')
    render(<GameLogButton />)
    expect(screen.getByRole('button', { name: /game log/i })).toHaveTextContent('2')
  })

  it('closes again', async () => {
    const user = userEvent.setup()
    render(<GameLogButton />)
    await user.click(screen.getByRole('button', { name: /game log/i }))
    await user.click(screen.getByRole('button', { name: /close/i }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('labels a night entry by its phase and round', async () => {
    const user = userEvent.setup()
    useGameStore.getState().logAction({ actor: 'wolf', target: 'p2', type: 'bad', note: '', round: 1 })
    render(<GameLogButton />)
    await user.click(screen.getByRole('button', { name: /game log/i }))
    expect(screen.getByRole('dialog')).toHaveTextContent('Night 1')
  })
})
