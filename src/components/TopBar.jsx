export default function TopBar({ phaseLabel, onNight, onEndGame }) {
  return (
    <div className="sticky top-0 z-10 mb-4 flex items-center gap-2 border-b border-white/10 bg-[#0b0f17]/90 py-3 backdrop-blur">
      <strong className="text-lg">{phaseLabel}</strong>
      <span className="flex-1" />
      {onNight && (
        <button
          onClick={onNight}
          className="rounded-lg bg-indigo-600 px-3 py-2 font-medium hover:bg-indigo-500 active:scale-95"
        >
          Go to Night 🌙
        </button>
      )}
      <button
        onClick={onEndGame}
        className="rounded-lg bg-white/10 px-3 py-2 hover:bg-white/15 active:scale-95"
      >
        End Game
      </button>
    </div>
  )
}
