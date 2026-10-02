import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ArtPicker from './ArtPicker.jsx'

const role = { id: 'r1', name: 'Ma Sói', color: '#ef4444', art: 'werewolf' }

describe('ArtPicker', () => {
  it('offers every planned art id, not just the ones with a file yet', () => {
    render(<ArtPicker role={role} onPick={() => {}} onClose={() => {}} />)
    expect(screen.getByRole('button', { name: 'dire wolf' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'old hag' })).toBeInTheDocument()
  })

  it('filters the grid as you search', async () => {
    const user = userEvent.setup()
    render(<ArtPicker role={role} onPick={() => {}} onClose={() => {}} />)
    await user.type(screen.getByPlaceholderText(/search/i), 'wolf')
    expect(screen.getByRole('button', { name: 'dire wolf' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'old hag' })).toBeNull()
  })

  it('finds art by a Vietnamese alias', async () => {
    const user = userEvent.setup()
    render(<ArtPicker role={role} onPick={() => {}} onClose={() => {}} />)
    await user.type(screen.getByPlaceholderText(/search/i), 'phu thuy')
    expect(screen.getByRole('button', { name: 'witch' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'hunter' })).toBeNull()
  })

  it('reports the picked art id', async () => {
    const user = userEvent.setup()
    const onPick = vi.fn()
    render(<ArtPicker role={role} onPick={onPick} onClose={() => {}} />)
    await user.click(screen.getByRole('button', { name: 'dire wolf' }))
    expect(onPick).toHaveBeenCalledWith('dire-wolf')
  })

  it('clears the art back to the monogram', async () => {
    const user = userEvent.setup()
    const onPick = vi.fn()
    render(<ArtPicker role={role} onPick={onPick} onClose={() => {}} />)
    await user.click(screen.getByRole('button', { name: /no art/i }))
    expect(onPick).toHaveBeenCalledWith(undefined)
  })

  it('marks the role current art as selected', () => {
    render(<ArtPicker role={role} onPick={() => {}} onClose={() => {}} />)
    expect(screen.getByRole('button', { name: 'werewolf' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'hunter' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('closes on cancel', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<ArtPicker role={role} onPick={() => {}} onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onClose).toHaveBeenCalled()
  })
})
