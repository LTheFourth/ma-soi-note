import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import Night from './Night.jsx'
import { useGameStore } from '../store/gameStore.js'

const players = [{ id: 'p1', name: 'Al' }, { id: 'p2', name: 'Bo' }, { id: 'p3', name: 'Cy' }]
const roles = [
  { id: 'wolf', name: 'Wolf', color: '#c00', callTiming: 'every', actions: ['bad', 'good', 'info'], canEliminate: true, order: 0 },
  { id: 'cupid', name: 'Cupid', color: '#e0a', callTiming: 'never', actions: [], canEliminate: false, order: 1 },
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

  it('shows earlier roles\' actions this night in "tonight so far"', () => {
    // Two game-night roles so there is an "earlier" role.
    useGameStore.getState().endGame()
    useGameStore.getState().startGame(
      [{ id: 'p1', name: 'Al' }, { id: 'p2', name: 'Bo' }],
      [
        { id: 'wolf', name: 'Wolf', color: '#c00', gameNightEnabled: true, order: 0 },
        { id: 'seer', name: 'Seer', color: '#06c', gameNightEnabled: true, order: 1 },
      ],
    )
    useGameStore.setState({ assignments: { p1: 'wolf', p2: 'seer' } })
    useGameStore.getState().startNight()   // round 1, cursor 0 (Wolf)
    useGameStore.getState().logAction({ actor: 'wolf', target: 'p2', type: 'bad', note: '', round: 1 })
    useGameStore.getState().nightNext()    // cursor 1 (Seer)

    render(<Night />)
    expect(screen.getByText('Seer')).toBeInTheDocument()          // current role
    const tonightList = screen.getByRole('list', { name: /tonight so far/i })
    expect(within(tonightList).getByText('Wolf')).toBeInTheDocument()  // earlier role
    expect(within(tonightList).getByText('Bo')).toBeInTheDocument()    // its target
  })

  it('can go back to the previous role during the night', async () => {
    const user = userEvent.setup()
    useGameStore.getState().endGame()
    useGameStore.getState().startGame(
      [{ id: 'p1', name: 'Al' }, { id: 'p2', name: 'Bo' }],
      [
        { id: 'wolf', name: 'Wolf', color: '#c00', gameNightEnabled: true, order: 0 },
        { id: 'seer', name: 'Seer', color: '#06c', gameNightEnabled: true, order: 1 },
      ],
    )
    useGameStore.setState({ assignments: { p1: 'wolf', p2: 'seer' } })
    useGameStore.getState().startNight()
    useGameStore.getState().nightNext()   // -> Seer
    render(<Night />)
    expect(screen.getByText('Seer')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /back/i }))
    expect(useGameStore.getState().nightCursor).toBe(0)
    expect(screen.getByText('Wolf')).toBeInTheDocument()
  })

  it('can delete a logged action', async () => {
    const user = userEvent.setup()
    useGameStore.getState().endGame()
    useGameStore.getState().startGame(
      [{ id: 'p1', name: 'Al' }, { id: 'p2', name: 'Bo' }],
      [{ id: 'wolf', name: 'Wolf', color: '#c00', gameNightEnabled: true, order: 0 }],
    )
    useGameStore.setState({ assignments: { p1: 'wolf', p2: 'villager' } })
    useGameStore.getState().startNight()
    useGameStore.getState().logAction({ actor: 'wolf', target: 'p2', type: 'bad', note: '', round: 1 })
    render(<Night />)
    expect(useGameStore.getState().actionLog).toHaveLength(1)
    await user.click(screen.getByRole('button', { name: /delete action/i }))
    expect(useGameStore.getState().actionLog).toHaveLength(0)
  })

  it('"last night" panel includes the previous day\'s eliminations', () => {
    useGameStore.getState().endGame()
    useGameStore.getState().startGame(
      [{ id: 'p1', name: 'Al' }, { id: 'p2', name: 'Bo' }],
      [{ id: 'wolf', name: 'Wolf', color: '#c00', gameNightEnabled: true, canKill: true, order: 0 }],
    )
    // It is now night of round 2; last round a day-vote eliminated Bo.
    useGameStore.setState({
      phase: 'night', round: 2, nightCursor: 0,
      assignments: { p1: 'wolf', p2: 'villager' },
      eliminated: ['p2'],
      actionLog: [{ id: 'e1', kind: 'elim', actor: null, type: 'elim', target: 'p2', reason: 'voted', round: 1 }],
    })
    render(<Night />)
    const lastNight = screen.getByRole('list', { name: /last night/i })
    expect(within(lastNight).getByText('Bo')).toBeInTheDocument()
    expect(within(lastNight).getByText(/voted/)).toBeInTheDocument()
  })

  it('shows [DEAD] + skip (no action panel) when the role has no living holder', () => {
    useGameStore.getState().endGame()
    useGameStore.getState().startGame(
      [{ id: 'p1', name: 'Al' }, { id: 'p2', name: 'Bo' }],
      [{ id: 'wolf', name: 'Wolf', color: '#c00', callTiming: 'every', actions: ['bad'], order: 0 }],
    )
    useGameStore.setState({ assignments: { p1: 'wolf', p2: 'villager' } })
    useGameStore.getState().startNight()
    useGameStore.getState().eliminate('p1', 'voted') // wolf's only holder is dead
    render(<Night />)
    expect(screen.getByText(/\[DEAD\]/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /skip/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /done/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /Kill/i })).toBeNull() // no ActionPanel
  })

  it('summary can eliminate a player then finish night to day', async () => {
    const user = userEvent.setup()
    render(<Night />)
    await user.click(screen.getByRole('button', { name: /skip/i }))  // -> summary
    await user.click(screen.getByRole('button', { name: /eliminate Bo/i }))
    // dialog: only roles flagged canEliminate appear (Wolf yes, Cupid no)
    expect(screen.queryByRole('button', { name: /killed by Cupid/i })).toBeNull()
    await user.click(screen.getByRole('button', { name: /killed by Wolf/i }))
    expect(useGameStore.getState().eliminated).toContain('p2')
    const elim = useGameStore.getState().actionLog.find((a) => a.kind === 'elim')
    expect(elim).toMatchObject({ target: 'p2', reason: 'Wolf' })
    await user.click(screen.getByRole('button', { name: /finish night/i }))
    expect(useGameStore.getState().phase).toBe('day')
  })
})
