import { useShallow } from 'zustand/react/shallow'
import { useGameStore, linkColorOf, linkPartnersOf } from '../store/gameStore.js'

// A small colored dot shown next to a linked player's name. The color
// identifies the link group; the tooltip names the partner(s).
export default function LinkDot({ pid }) {
  const color = useGameStore((s) => linkColorOf(s, pid))
  const partners = useGameStore(useShallow((s) => linkPartnersOf(s, pid)))
  if (!color) return null
  const label = partners.length ? `linked with ${partners.join(', ')}` : 'linked'
  return (
    <span aria-label={label} title={label} style={{ color }} className="text-xs">●</span>
  )
}
