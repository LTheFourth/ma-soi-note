import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import NewGame from './NewGame.jsx'
import { useLibraryStore } from '../store/libraryStore.js'
import { useGameStore } from '../store/gameStore.js'

// The team header button, as opposed to its All / Clear buttons.
// Roles the moderator typed, as opposed to the built-ins that always exist.
const customRoles = () => useLibraryStore.getState().roles.filter((r) => !r.builtin)

const teamHeader = (label) =>
  screen.getByRole('button', { name: new RegExp('^' + label + ' [0-9]+/[0-9]+$') })

describe('NewGame', () => {
  beforeEach(() => {
    useLibraryStore.setState({
      players: [], roleSets: [], lastGame: { playerIds: [], roleIds: [] },
    })
    useLibraryStore.getState().resetAllRoles()
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
    expect(customRoles()).toHaveLength(0)
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

  it('the update button overwrites a saved set with the current selection', async () => {
    const user = userEvent.setup()
    render(<NewGame />)
    await user.click(screen.getByRole('button', { name: 'Wolf' }))
    await user.type(screen.getByPlaceholderText(/save selected roles/i), 'S')
    await user.click(screen.getByRole('button', { name: /save set/i }))
    expect(useLibraryStore.getState().roleSets[0].items).toHaveLength(1)

    // add + select a second role, then update the set
    await user.type(screen.getByPlaceholderText('new role'), 'Seer')
    await user.click(screen.getAllByRole('button', { name: 'Add' })[1])
    await user.click(screen.getByRole('button', { name: 'Seer' }))
    await user.click(screen.getByRole('button', { name: /update set S/i }))
    expect(useLibraryStore.getState().roleSets).toHaveLength(1)
    expect(useLibraryStore.getState().roleSets[0].items).toHaveLength(2)
  })

  it('pre-selects the last game players and roles', () => {
    const al = useLibraryStore.getState().players.find((p) => p.name === 'Al')
    const wolf = customRoles()[0]
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

  it('a saved set round-trips the role art', async () => {
    const user = userEvent.setup()
    useLibraryStore.getState().addRole('Tiên Tri', '#06c')
    render(<NewGame />)
    await user.click(screen.getByRole('button', { name: 'Tiên Tri' }))
    await user.type(screen.getByPlaceholderText(/save selected roles/i), 'ArtSet')
    await user.click(screen.getByRole('button', { name: /save set/i }))
    expect(useLibraryStore.getState().roleSets[0].items[0].art).toBe('seer')

    await user.click(screen.getByRole('button', { name: /delete Tiên Tri/i }))
    await user.click(screen.getByRole('button', { name: /^ArtSet/ }))
    const restored = useLibraryStore.getState().roles.find((r) => r.name === 'Tiên Tri')
    expect(restored.art).toBe('seer')
  })


  it('picks role artwork from the role card', async () => {
    const user = userEvent.setup()
    render(<NewGame />)
    await user.click(screen.getByRole('button', { name: /artwork for Wolf/i }))
    await user.click(screen.getByRole('button', { name: 'dire wolf' }))
    expect(customRoles()[0].art).toBe('dire-wolf')
    expect(screen.queryByRole('dialog')).toBeNull()
  })

})

describe('NewGame role groups', () => {
  beforeEach(() => {
    useLibraryStore.setState({ players: [], roleSets: [], lastGame: { playerIds: [], roleIds: [] } })
    useLibraryStore.getState().resetAllRoles()
    useGameStore.getState().endGame()
    useLibraryStore.setState({ lastGame: { playerIds: [], roleIds: [] } })
    useLibraryStore.getState().addPlayer('Al')
  })

  it('shows one header per team with its selected count', () => {
    render(<NewGame />)
    expect(teamHeader('Phe Sói')).toHaveAccessibleName('Phe Sói 0/8')
    expect(teamHeader('Phe Dân')).toHaveAccessibleName('Phe Dân 0/27')
    expect(teamHeader('Trung Lập')).toHaveAccessibleName('Trung Lập 0/6')
    expect(teamHeader('Tự Tạo')).toHaveAccessibleName('Tự Tạo 0/0')
  })

  it('starts every team folded when nothing is selected', () => {
    render(<NewGame />)
    expect(screen.queryByRole('button', { name: 'Ma Sói' })).toBeNull()
  })

  it('opens a team when its header is pressed', async () => {
    const user = userEvent.setup()
    render(<NewGame />)
    await user.click(teamHeader('Phe Sói'))
    expect(screen.getByRole('button', { name: 'Ma Sói' })).toBeInTheDocument()
  })

  it('opens a team that already holds a selected role', () => {
    useLibraryStore.setState({ lastGame: { playerIds: [], roleIds: ['werewolf'] } })
    render(<NewGame />)
    expect(screen.getByRole('button', { name: 'Ma Sói' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('selects and clears a whole team at once', async () => {
    const user = userEvent.setup()
    render(<NewGame />)
    await user.click(screen.getByRole('button', { name: 'select all Phe Sói' }))
    expect(teamHeader('Phe Sói')).toHaveAccessibleName('Phe Sói 8/8')
    await user.click(screen.getByRole('button', { name: 'clear Phe Sói' }))
    expect(teamHeader('Phe Sói')).toHaveAccessibleName('Phe Sói 0/8')
  })

  it('offers no delete button on a built-in role', async () => {
    const user = userEvent.setup()
    render(<NewGame />)
    await user.click(teamHeader('Phe Sói'))
    expect(screen.queryByRole('button', { name: /delete Ma Sói/i })).toBeNull()
  })

  it('offers a delete button on a hand-typed role', () => {
    useLibraryStore.getState().addRole('Vai Cua Toi', '#123456')
    render(<NewGame />)
    expect(screen.getByRole('button', { name: /delete Vai Cua Toi/i })).toBeInTheDocument()
  })

  it('offers reset only once a built-in has been edited', async () => {
    const user = userEvent.setup()
    render(<NewGame />)
    await user.click(teamHeader('Phe Sói'))
    expect(screen.queryByRole('button', { name: /reset Ma Sói/i })).toBeNull()
    useLibraryStore.getState().updateRole('werewolf', { color: '#000000' })
    expect(await screen.findByRole('button', { name: /reset Ma Sói/i })).toBeInTheDocument()
  })

  it('restores a built-in to its shipped values from the card', async () => {
    const user = userEvent.setup()
    useLibraryStore.getState().updateRole('werewolf', { name: 'Doi Ten' })
    render(<NewGame />)
    await user.click(teamHeader('Phe Sói'))
    await user.click(screen.getByRole('button', { name: /reset Doi Ten/i }))
    expect(screen.getByRole('button', { name: 'Ma Sói' })).toBeInTheDocument()
  })
})
