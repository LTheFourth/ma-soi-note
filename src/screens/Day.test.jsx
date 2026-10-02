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
    // tapping the card opens the player dialog, with the reason prefilled
    expect(screen.getByLabelText(/reason/i)).toHaveValue('voted')
    await user.click(screen.getByRole('button', { name: /^eliminate$/i }))
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

  it('shows a role avatar on every player card', () => {
    const { container } = render(<Day />)
    expect(container.querySelectorAll('.player-card .role-avatar')).toHaveLength(2)
  })

  it('marks the avatar of an eliminated player as dead', () => {
    useGameStore.getState().eliminate('p2', 'voted')
    const { container } = render(<Day />)
    // scoped to the grid: the log entry for the death also shows a dead avatar
    expect(container.querySelectorAll('.player-card .role-avatar[data-dead="true"]')).toHaveLength(1)
  })


  it('badges an eliminated player card with a grave marker', () => {
    useGameStore.getState().eliminate('p2', 'voted')
    render(<Day />)
    expect(screen.getByLabelText('eliminated')).toBeInTheDocument()
  })

})

describe('Day player dialog', () => {
  beforeEach(() => {
    useGameStore.getState().endGame()
    useGameStore.getState().startGame(players, roles)
    useGameStore.setState({ phase: 'day', round: 1, assignments: { p1: 'wolf', p2: 'villager' } })
  })

  it('opens a dialog rather than a menu over the grid', async () => {
    const user = userEvent.setup()
    const { container } = render(<Day />)
    await user.click(screen.getByText('Bo'))
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveTextContent('Bo')
    // nothing is positioned on top of the card grid any more
    expect(container.querySelectorAll('.player-card .absolute.top-full')).toHaveLength(0)
  })

  it('names the role in the dialog', async () => {
    const user = userEvent.setup()
    render(<Day />)
    await user.click(screen.getByText('Al'))
    expect(screen.getByRole('dialog')).toHaveTextContent('Wolf')
  })

  it('records a note with the elimination', async () => {
    const user = userEvent.setup()
    render(<Day />)
    await user.click(screen.getByText('Bo'))
    await user.type(screen.getByLabelText(/note/i), 'nhận là tiên tri')
    await user.click(screen.getByRole('button', { name: /^eliminate$/i }))
    const elim = useGameStore.getState().actionLog.find((a) => a.kind === 'elim')
    expect(elim.note).toBe('nhận là tiên tri')
  })

  it('closes without eliminating when cancelled', async () => {
    const user = userEvent.setup()
    render(<Day />)
    await user.click(screen.getByText('Bo'))
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(useGameStore.getState().eliminated).toEqual([])
  })

  it('does not open for a player already eliminated', async () => {
    const user = userEvent.setup()
    useGameStore.getState().eliminate('p2', 'voted')
    render(<Day />)
    const card = screen.getAllByText('Bo').map((el) => el.closest('.player-card')).find(Boolean)
    await user.click(card)
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
