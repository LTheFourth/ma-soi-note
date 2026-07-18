import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import NewGame from './NewGame.jsx'
import { useLibraryStore } from '../store/libraryStore.js'
import { useGameStore } from '../store/gameStore.js'

describe('NewGame', () => {
  beforeEach(() => {
    useLibraryStore.setState({ players: [], roles: [] })
    useGameStore.getState().endGame()
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
