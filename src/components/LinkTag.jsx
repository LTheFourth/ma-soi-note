import { useShallow } from 'zustand/react/shallow'
import { useGameStore, linkColorOf, linkPartnersOf } from '../store/gameStore.js'

// Text tag naming a linked player's partner(s), in the group's color.
// Renders nothing if the player is not linked.
export default function LinkTag({ pid }) {
  const color = useGameStore((s) => linkColorOf(s, pid))
  const partners = useGameStore(useShallow((s) => linkPartnersOf(s, pid)))
  if (!color || partners.length === 0) return null
  return (
    <span className="text-xs" style={{ color }}>
      🔗 linked with {partners.join(', ')}
    </span>
  )
}
