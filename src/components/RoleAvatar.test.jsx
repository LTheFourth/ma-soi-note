import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import RoleAvatar from './RoleAvatar.jsx'

const roleWithArt = { id: 'r1', name: 'Ma Sói', color: '#ef4444', art: 'unknown' }
const roleWithoutArt = { id: 'r2', name: 'Thằng Ngố', color: '#22c55e' }

describe('RoleAvatar', () => {
  it('renders the artwork when the role has art', () => {
    const { container } = render(<RoleAvatar role={roleWithArt} />)
    const img = container.querySelector('img')
    expect(img).toBeInTheDocument()
    expect(img.getAttribute('src')).toBeTruthy()
  })

  it('renders a monogram of the role name when there is no art', () => {
    render(<RoleAvatar role={roleWithoutArt} />)
    expect(screen.getByText('T')).toBeInTheDocument()
  })

  it('renders a monogram when the art id has no file', () => {
    render(<RoleAvatar role={{ ...roleWithoutArt, art: 'no-such-art' }} />)
    expect(screen.getByText('T')).toBeInTheDocument()
  })

  it('hides decorative art from screen readers so the role is announced once', () => {
    const { container } = render(<RoleAvatar role={roleWithArt} />)
    expect(container.querySelector('img').getAttribute('aria-hidden')).toBe('true')
    expect(screen.queryByAltText('Ma Sói')).not.toBeInTheDocument()
  })

  it('exposes a label when asked to stand alone', () => {
    render(<RoleAvatar role={roleWithArt} labelled />)
    expect(screen.getByRole('img', { name: 'Ma Sói' })).toBeInTheDocument()
  })

  it('marks the avatar as dead when the player is eliminated', () => {
    const { container } = render(<RoleAvatar role={roleWithArt} dead />)
    expect(container.firstChild).toHaveAttribute('data-dead', 'true')
  })

  it('is not marked dead by default', () => {
    const { container } = render(<RoleAvatar role={roleWithArt} />)
    expect(container.firstChild).not.toHaveAttribute('data-dead')
  })

  it('tints itself with the role colour', () => {
    const { container } = render(<RoleAvatar role={roleWithoutArt} />)
    expect(container.firstChild.getAttribute('style')).toContain('34, 197, 94')
  })

  it('survives a missing role', () => {
    const { container } = render(<RoleAvatar role={undefined} />)
    expect(container.firstChild).toBeInTheDocument()
  })
})
