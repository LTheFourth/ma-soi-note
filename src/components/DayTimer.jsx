import { useState, useEffect } from 'react'
import { formatMMSS } from '../lib/time.js'

// Ephemeral day-discussion stopwatch (MM:SS). Not persisted.
export default function DayTimer() {
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [running])

  return (
    <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5">
      <span className="font-mono text-lg tabular-nums" aria-label="day timer">
        {formatMMSS(seconds)}
      </span>
      <button
        onClick={() => setRunning((r) => !r)}
        aria-label={running ? 'pause timer' : 'start timer'}
        className="rounded-md px-2 py-1 hover:bg-white/10 active:scale-95"
      >
        {running ? '⏸' : '▶'}
      </button>
      <button
        onClick={() => { setSeconds(0); setRunning(false) }}
        aria-label="reset timer"
        className="rounded-md px-2 py-1 text-gray-400 hover:bg-white/10 active:scale-95"
      >
        ↺
      </button>
    </div>
  )
}
