// Action types shared across the app: quick-log icons + labels.
export const ACTION_TYPES = [
  { key: 'good', icon: '💚', label: 'Heal' },
  { key: 'bad', icon: '💀', label: 'Kill' },
  { key: 'info', icon: '👁', label: 'Inspect' },
]

export const actionIcon = (type) => ACTION_TYPES.find((t) => t.key === type)?.icon ?? '?'
export const actionLabel = (type) => ACTION_TYPES.find((t) => t.key === type)?.label ?? type

// Cycle good -> bad -> info -> good, for tap-to-change-type editing.
export const nextActionType = (type) => {
  const i = ACTION_TYPES.findIndex((t) => t.key === type)
  return ACTION_TYPES[(i + 1) % ACTION_TYPES.length].key
}
