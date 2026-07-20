import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import NewGame from './NewGame.jsx'
import { useLibraryStore } from '../store/libraryStore.js'
import { useGameStore } from '../store/gameStore.js'

describe('NewGame', () => {
  beforeEach(() => {
    useLibraryStore.setState({
      players: [], roles: [], roleSets: [], lastGame: { playerIds: [], roleIds: [] },
    })
    useGameStore.getState().endGame()
    useLibraryStore.setState({ lastGame: { playerIds: [], roleIds: [] } }) // endGame may have written
    useLibraryStore.getState().addPlayer('Al')
    useLibraryStore.getState().addPlayer('Bo')
    useLibraryStore.getState().addRole('Wolf', '#c00')
  })

  it('start is disabled until a player and role are selected', async () => {
    const user = userEvent.setup()
    render(<NewGame />)
    const start = screen.getByRole('button', { name: /start game/i })
    expect(start).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Al' }))
    await user.click(screen.getByRole('button', { name: 'Wolf' }))
    expect(start).toBeEnabled()
  })

  it('deletes a player from the library and the list', async () => {
    const user = userEvent.setup()
    render(<NewGame />)
    expect(screen.getByRole('button', { name: 'Al' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /delete Al/i }))
    expect(useLibraryStore.getState().players.map((p) => p.name)).toEqual(['Bo'])
    expect(screen.queryByRole('button', { name: 'Al' })).toBeNull()
  })

  it('deletes a role and prunes it from the selection', async () => {
    const user = userEvent.setup()
    render(<NewGame />)
    await user.click(screen.getByRole('button', { name: 'Wolf' }))   // select it
    await user.click(screen.getByRole('button', { name: /delete Wolf/i }))
    expect(useLibraryStore.getState().roles).toHaveLength(0)
    expect(screen.queryByRole('button', { name: 'Wolf' })).toBeNull()
    // no roles selected -> night call order section gone, start disabled
    expect(screen.getByRole('button', { name: /start game/i })).toBeDisabled()
  })

  it('saves a set and restores roles even after they are deleted', async () => {
    const user = userEvent.setup()
    render(<NewGame />)
    await user.click(screen.getByRole('button', { name: 'Wolf' })) // select
    await user.type(screen.getByPlaceholderText(/save selected roles/i), 'MySet')
    await user.click(screen.getByRole('button', { name: /save set/i }))
    expect(useLibraryStore.getState().roleSets).toHaveLength(1)

    // delete Wolf from the library entirely
    await user.click(screen.getByRole('button', { name: /delete Wolf/i }))
    expect(useLibraryStore.getState().roles.some((r) => r.name === 'Wolf')).toBe(false)

    // loading the set recreates Wolf and selects it
    await user.click(screen.getByRole('button', { name: /^MySet/ }))
    expect(useLibraryStore.getState().roles.some((r) => r.name === 'Wolf')).toBe(true)
    expect(screen.getByRole('button', { name: 'Wolf' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('pre-selects the last game players and roles', () => {
    const al = useLibraryStore.getState().players.find((p) => p.name === 'Al')
    const wolf = useLibraryStore.getState().roles[0]
    useLibraryStore.getState().saveLastGame([al.id], [wolf.id])
    render(<NewGame />)
    expect(screen.getByRole('button', { name: 'Al' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Wolf' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('a preset color swatch sets the new role color', async () => {
    const user = userEvent.setup()
    render(<NewGame />)
    await user.type(screen.getByPlaceholderText('new role'), 'Guard')
    await user.click(screen.getByRole('button', { name: /color blue/i }))
    await user.click(screen.getAllByRole('button', { name: 'Add' })[1]) // roles Add
    const guard = useLibraryStore.getState().roles.find((r) => r.name === 'Guard')
    expect(guard.color).toBe('#3b82f6')
  })

  it('Select-all selects every player', async () => {
    const user = userEvent.setup()
    render(<NewGame />)
    await user.click(screen.getAllByRole('button', { name: 'All' })[0]) // players section
    expect(screen.getByRole('button', { name: 'Al' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Bo' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('starting a game activates the game store in setup phase', async () => {
    const user = userEvent.setup()
    render(<NewGame />)
    await user.click(screen.getByRole('button', { name: 'Al' }))
    await user.click(screen.getByRole('button', { name: 'Wolf' }))
    await user.click(screen.getByRole('button', { name: /start game/i }))
    expect(useGameStore.getState().active).toBe(true)
    expect(useGameStore.getState().phase).toBe('setup')
    expect(useGameStore.getState().players).toHaveLength(1)
  })
})
