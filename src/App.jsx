import { useGameStore } from './store/gameStore.js'
import NewGame from './screens/NewGame.jsx'
import Setup from './screens/Setup.jsx'
import Day from './screens/Day.jsx'
import Night from './screens/Night.jsx'
import GameLogButton from './components/GameLogButton.jsx'
import DeathNotice from './components/DeathNotice.jsx'

export default function App() {
  const active = useGameStore((s) => s.active)
  const phase = useGameStore((s) => s.phase)
  if (!active) return <NewGame />

  // The log button and the linked-death notice belong to every in-game screen,
  // so they are mounted once here rather than repeated on each.
  return (
    <>
      {phase === 'setup' ? <Setup /> : phase === 'night' ? <Night /> : <Day />}
      <GameLogButton />
      <DeathNotice />
    </>
  )
}
