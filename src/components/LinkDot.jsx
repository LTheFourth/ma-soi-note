import { useGameStore, linkColorOf } from '../store/gameStore.js'

// A small colored dot shown next to a linked player's name. The color
// identifies the link group. Renders nothing if the player is not linked.
export default function LinkDot({ pid }) {
  const color = useGameStore((s) => linkColorOf(s, pid))
  if (!color) return null
  return (
    <span aria-label="linked" title="linked" style={{ color }} className="text-xs">●</span>
  )
}
