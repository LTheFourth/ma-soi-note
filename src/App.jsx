import { useGameStore } from './store/gameStore.js'
import NewGame from './screens/NewGame.jsx'

export default function App() {
  const active = useGameStore((s) => s.active)
  if (!active) return <NewGame />
  return (
    <div className="app">
      <h1>Werewolf Admin</h1>
      <p>Game in progress (phase: {useGameStore.getState().phase})</p>
    </div>
  )
}
