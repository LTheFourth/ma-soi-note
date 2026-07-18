import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import App from './App.jsx'
import { useGameStore } from './store/gameStore.js'

describe('App', () => {
  beforeEach(() => useGameStore.getState().endGame())
  it('shows New Game screen when no active game', () => {
    render(<App />)
    expect(screen.getByText(/new game/i)).toBeInTheDocument()
  })
})
