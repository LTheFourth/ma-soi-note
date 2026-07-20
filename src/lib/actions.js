// Action types. Keys stay 'good'/'bad'/'info' for data compatibility; labels
// use Werewolf wording. 'link' is a multi-target action (added stage 2).
export const ACTION_TYPES = [
  { key: 'bad', icon: '💀', label: 'Kill' },
  { key: 'good', icon: '💚', label: 'Save' },
  { key: 'info', icon: '👁', label: 'Info' },
  { key: 'link', icon: '🔗', label: 'Link' },
]

// Single-target types (used for tap-to-cycle editing of a logged action).
const CYCLE = ['good', 'bad', 'info']

export const actionIcon = (type) => ACTION_TYPES.find((t) => t.key === type)?.icon ?? '?'
export const actionLabel = (type) => ACTION_TYPES.find((t) => t.key === type)?.label ?? type

export const nextActionType = (type) => {
  const i = CYCLE.indexOf(type)
  return CYCLE[(i + 1) % CYCLE.length]
}

// --- Role config normalizers (tolerate legacy roles saved before this model) ---

// 'every' | 'first' (first game night only) | 'never' (assign at setup only)
export function roleTiming(role) {
  if (role.callTiming) return role.callTiming
  return role.gameNightEnabled === false ? 'never' : 'every' // legacy gameNightEnabled
}

// Which action types this role may log. Legacy roles: the original three.
export function roleActions(role) {
  if (Array.isArray(role.actions)) return role.actions
  return ['bad', 'good', 'info']
}
