import { render, screen, act, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import DayTimer from './DayTimer.jsx'

describe('DayTimer', () => {
  afterEach(() => vi.useRealTimers())

  it('starts at 00:00, counts up when running, and resets', () => {
    vi.useFakeTimers()
    render(<DayTimer />)
    expect(screen.getByLabelText('day timer')).toHaveTextContent('00:00')

    fireEvent.click(screen.getByLabelText('start timer'))
    act(() => { vi.advanceTimersByTime(65000) }) // 65s
    expect(screen.getByLabelText('day timer')).toHaveTextContent('01:05')

    fireEvent.click(screen.getByLabelText('reset timer'))
    expect(screen.getByLabelText('day timer')).toHaveTextContent('00:00')
  })
})
