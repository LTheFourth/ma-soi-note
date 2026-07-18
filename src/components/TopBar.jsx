export default function TopBar({ phaseLabel, onNight, onEndGame }) {
  return (
    <div className="topbar">
      <strong>{phaseLabel}</strong>
      <span className="spacer" />
      {onNight && <button onClick={onNight}>Go to Night 🌙</button>}
      <button onClick={onEndGame}>End Game</button>
    </div>
  )
}
