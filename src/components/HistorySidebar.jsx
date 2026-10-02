import GameLog from './GameLog.jsx'

// The wide-screen companion to the floating log button: same entries, always
// visible beside the day grid.
export default function HistorySidebar() {
  return (
    <aside className="hidden md:block">
      <h3 className="mb-2 font-semibold text-gray-300">History</h3>
      <GameLog className="max-h-[70vh] overflow-auto" />
    </aside>
  )
}
