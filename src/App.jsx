import { useGameStore } from './store/gameStore.js'
import NewGame from './screens/NewGame.jsx'
import Setup from './screens/Setup.jsx'
import Day from './screens/Day.jsx'
import Night from './screens/Night.jsx'

export default function App() {
  const active = useGameStore((s) => s.active)
  const phase = useGameStore((s) => s.phase)
  if (!active) return <NewGame />
  if (phase === 'setup') return <Setup />
  if (phase === 'night') return <Night />
  return <Day />
}
