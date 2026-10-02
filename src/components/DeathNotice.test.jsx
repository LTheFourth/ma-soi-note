import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DeathNotice from './DeathNotice.jsx'
import { useGameStore } from '../store/gameStore.js'

const players = [{ id: 'p1', name: 'Al' }, { id: 'p2', name: 'Bo' }, { id: 'p3', name: 'Cy' }]
const roles = [{ id: 'cupid', name: 'Thần Tình Yêu', color: '#e0a', callTiming: 'first', actions: ['link'] }]

const g = () => useGameStore.getState()

describe('DeathNotice', () => {
  beforeEach(() => {
    g().endGame()
    g().startGame(players, roles)
    useGameStore.setState({ phase: 'night', round: 1, assignments: { p1: 'cupid', p2: 'villager', p3: 'villager' } })
  })

  it('shows nothing when no one died along', () => {
    const { container } = render(<DeathNotice />)
    expect(container).toBeEmptyDOMElement()
  })

  it('names everyone who died along', () => {
    g().logLink({ actor: 'cupid', targets: ['p1', 'p2'], round: 1, deadly: true })
    g().eliminate('p1', 'bị sói cắn')
    render(<DeathNotice />)
    expect(screen.getByRole('dialog')).toHaveTextContent('Bo')
    expect(screen.getByRole('dialog')).toHaveTextContent('Al')
  })

  it('goes away once acknowledged', async () => {
    const user = userEvent.setup()
    g().logLink({ actor: 'cupid', targets: ['p1', 'p2'], round: 1, deadly: true })
    g().eliminate('p1', 'bị sói cắn')
    render(<DeathNotice />)
    await user.click(screen.getByRole('button', { name: /^ok$/i }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(g().eliminated).toEqual(expect.arrayContaining(['p1', 'p2']))
  })

  it('undoes the whole chain', async () => {
    const user = userEvent.setup()
    g().logLink({ actor: 'cupid', targets: ['p1', 'p2'], round: 1, deadly: true })
    g().eliminate('p1', 'bị sói cắn')
    render(<DeathNotice />)
    await user.click(screen.getByRole('button', { name: /undo/i }))
    expect(g().eliminated).toEqual([])
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
