import { useGameStore } from './store/gameStore.js'
import NewGame from './screens/NewGame.jsx'
import Setup from './screens/Setup.jsx'

export default function App() {
  const active = useGameStore((s) => s.active)
  const phase = useGameStore((s) => s.phase)
  if (!active) return <NewGame />
  if (phase === 'setup') return <Setup />
  return (
    <div className="app">
      <h1>Werewolf Admin</h1>
      <p>phase: {phase}</p>
    </div>
  )
}
