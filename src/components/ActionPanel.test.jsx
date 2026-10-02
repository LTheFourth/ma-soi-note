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

  it('logs an action when tapping a type icon on a player', async () => {
    const user = userEvent.setup()
    render(<ActionPanel role={roles[0]} round={1} />)
    await user.click(screen.getByRole('button', { name: /Kill Bo/i }))
    const log = useGameStore.getState().actionLog
    expect(log).toHaveLength(1)
    expect(log[0]).toMatchObject({ actor: 'wolf', target: 'p2', type: 'bad', round: 1 })
  })

  it('cycles the type of a logged action', async () => {
    const user = userEvent.setup()
    render(<ActionPanel role={roles[0]} round={1} />)
    await user.click(screen.getByRole('button', { name: /Save Al/i })) // logs type good
    expect(useGameStore.getState().actionLog[0].type).toBe('good')
    await user.click(screen.getByRole('button', { name: /change action type/i }))
    expect(useGameStore.getState().actionLog[0].type).toBe('bad') // good -> bad
  })

  it('shows only the role\'s allowed action icons', () => {
    const seer = { id: 'seer', name: 'Seer', color: '#06c', actions: ['info'] }
    render(<ActionPanel role={seer} round={1} />)
    expect(screen.getByRole('button', { name: /Info Al/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Kill Al/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /Save Al/i })).toBeNull()
  })

  it('links 2+ selected players into a group', async () => {
    const user = userEvent.setup()
    const cupid = { id: 'cupid', name: 'Cupid', color: '#e0a', actions: ['link'] }
    render(<ActionPanel role={cupid} round={1} />)
    await user.click(screen.getByRole('checkbox', { name: /link Al/i }))
    await user.click(screen.getByRole('checkbox', { name: /link Bo/i }))
    await user.click(screen.getByRole('button', { name: /link selected/i }))
    const e = useGameStore.getState().actionLog.find((a) => a.type === 'link')
    expect(e.targets).toEqual(['p1', 'p2'])
    expect(e.color).toBeTruthy()
  })

  it('deletes a logged action', async () => {
    const user = userEvent.setup()
    render(<ActionPanel role={roles[0]} round={1} />)
    await user.click(screen.getByRole('button', { name: /Kill Bo/i }))
    expect(useGameStore.getState().actionLog).toHaveLength(1)
    await user.click(screen.getByRole('button', { name: /delete action/i }))
    expect(useGameStore.getState().actionLog).toHaveLength(0)
  })
})

describe('ActionPanel deadly links', () => {
  beforeEach(() => {
    useGameStore.getState().endGame()
    useGameStore.getState().startGame(players, roles)
    useGameStore.setState({ phase: 'night', round: 1 })
  })

  const linkRole = { id: 'cupid', name: 'Thần Tình Yêu', color: '#e0a', actions: ['link'] }

  it('links without killing by default', async () => {
    const user = userEvent.setup()
    render(<ActionPanel role={linkRole} round={1} />)
    await user.click(screen.getByRole('checkbox', { name: /link Al/i }))
    await user.click(screen.getByRole('checkbox', { name: /link Bo/i }))
    await user.click(screen.getByRole('button', { name: /link selected/i }))
    expect(useGameStore.getState().actionLog.at(-1).deadly).toBe(false)
  })

  it('marks the link deadly when asked', async () => {
    const user = userEvent.setup()
    render(<ActionPanel role={linkRole} round={1} />)
    await user.click(screen.getByRole('checkbox', { name: /link Al/i }))
    await user.click(screen.getByRole('checkbox', { name: /link Bo/i }))
    await user.click(screen.getByRole('checkbox', { name: /die together/i }))
    await user.click(screen.getByRole('button', { name: /link selected/i }))
    expect(useGameStore.getState().actionLog.at(-1).deadly).toBe(true)
  })

  it('forgets the deadly choice after a link is made', async () => {
    const user = userEvent.setup()
    render(<ActionPanel role={linkRole} round={1} />)
    await user.click(screen.getByRole('checkbox', { name: /link Al/i }))
    await user.click(screen.getByRole('checkbox', { name: /link Bo/i }))
    await user.click(screen.getByRole('checkbox', { name: /die together/i }))
    await user.click(screen.getByRole('button', { name: /link selected/i }))
    expect(screen.getByRole('checkbox', { name: /die together/i })).not.toBeChecked()
  })
})
