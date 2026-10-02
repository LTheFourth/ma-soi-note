// The built-in role list. These always exist and cannot be deleted; the library
// store holds only the fields the moderator has changed about them.
//
// `name` is what the table says out loud; `nameEn` is kept so searching and the
// artwork matcher work in either language. `art` is the portrait id, and every
// role owns a distinct one — 'unknown' is the fallback for roles typed by hand,
// never a role of its own.
//
// Colours stay inside a team's hue family so the board reads at a glance, while
// staying distinct from each other so night log lines remain tellable apart.
//
// callTiming: 'every' = woken every night, 'first' = first night only,
// 'never' = assigned during setup and never called.

export const TEAMS = [
  { key: 'wolf', label: 'Phe Sói', labelEn: 'Werewolves', icon: '🐺' },
  { key: 'village', label: 'Phe Dân', labelEn: 'Village', icon: '✨' },
  { key: 'neutral', label: 'Trung Lập', labelEn: 'Neutral', icon: '🎭' },
  { key: 'custom', label: 'Tự Tạo', labelEn: 'Custom', icon: '✚' },
]

// id, vi name, en name, team, colour, timing, actions, canEliminate
const RAW = [
  // --- Phe Sói -----------------------------------------------------------
  ['werewolf', 'Ma Sói', 'Werewolf', 'wolf', '#ef4444', 'every', ['bad'], true],
  ['dire-wolf', 'Sói Trùm', 'Dire Wolf', 'wolf', '#991b1b', 'every', ['bad', 'info'], true],
  ['wolf-cub', 'Sói Con', 'Wolf Cub', 'wolf', '#fb923c', 'every', ['bad'], true],
  ['big-bad-wolf', 'Sói Hung Ác', 'Big Bad Wolf', 'wolf', '#7f1d1d', 'every', ['bad'], true],
  ['lone-wolf', 'Sói Đơn Độc', 'Lone Wolf', 'wolf', '#b45309', 'every', ['bad'], true],
  ['sorceress', 'Pháp Sư Sói', 'Sorceress', 'wolf', '#be123c', 'every', ['info'], false],
  ['minion', 'Tay Sai', 'Minion', 'wolf', '#a16207', 'first', ['info'], false],
  ['cult-leader', 'Giáo Chủ', 'Cult Leader', 'wolf', '#c2410c', 'every', ['info'], false],

  // --- Phe Dân -----------------------------------------------------------
  ['villager', 'Dân Làng', 'Villager', 'village', '#64748b', 'never', [], false],
  ['seer', 'Tiên Tri', 'Seer', 'village', '#3b82f6', 'every', ['info'], false],
  ['apprentice-seer', 'Tiên Tri Tập Sự', 'Apprentice Seer', 'village', '#60a5fa', 'every', ['info'], false],
  ['aura-seer', 'Tiên Tri Hào Quang', 'Aura Seer', 'village', '#06b6d4', 'every', ['info'], false],
  ['mason', 'Hội Kín', 'Mason', 'village', '#0891b2', 'first', ['link'], false],
  ['bodyguard', 'Bảo Vệ', 'Bodyguard', 'village', '#2563eb', 'every', ['good'], false],
  ['hunter', 'Thợ Săn', 'Hunter', 'village', '#15803d', 'never', ['bad'], true],
  ['witch', 'Phù Thủy', 'Witch', 'village', '#4338ca', 'every', ['good', 'bad'], true],
  ['spellcaster', 'Pháp Sư Câm', 'Spellcaster', 'village', '#4f46e5', 'every', ['info'], false],
  ['village-idiot', 'Thằng Khờ', 'Village Idiot', 'village', '#ca8a04', 'never', [], false],
  ['mayor', 'Trưởng Làng', 'Mayor', 'village', '#0d9488', 'never', [], false],
  ['prince', 'Hoàng Tử', 'Prince', 'village', '#1d4ed8', 'never', [], false],
  ['priest', 'Linh Mục', 'Priest', 'village', '#0ea5e9', 'every', ['good'], false],
  ['pacifist', 'Kẻ Chủ Hòa', 'Pacifist', 'village', '#22c55e', 'never', [], false],
  ['martyr', 'Người Hy Sinh', 'Martyr', 'village', '#84cc16', 'never', ['good'], false],
  ['beholder', 'Người Quan Sát', 'Beholder', 'village', '#0369a1', 'first', ['info'], false],
  ['old-man', 'Già Làng', 'Old Man', 'village', '#78716c', 'never', [], false],
  ['old-hag', 'Mụ Già', 'Old Hag', 'village', '#57534e', 'every', ['info'], false],
  ['cursed', 'Kẻ Bị Nguyền', 'Cursed', 'village', '#d97706', 'never', [], false],
  ['diseased', 'Kẻ Mang Bệnh', 'Diseased', 'village', '#65a30d', 'never', [], false],
  ['drunk', 'Kẻ Say', 'Drunk', 'village', '#854d0e', 'never', [], false],
  ['ghost', 'Hồn Ma', 'Ghost', 'village', '#94a3b8', 'every', ['info'], false],
  ['lycan', 'Sói Giả', 'Lycan', 'village', '#ea580c', 'never', [], false],
  ['private-investigator', 'Thám Tử', 'Private Investigator', 'village', '#1e40af', 'every', ['info'], false],
  ['troublemaker', 'Kẻ Phá Rối', 'Troublemaker', 'village', '#16a34a', 'every', ['info'], false],
  ['cupid', 'Thần Tình Yêu', 'Cupid', 'village', '#ec4899', 'first', ['link'], false],
  ['doppelganger', 'Kẻ Sao Chép', 'Doppelganger', 'village', '#475569', 'first', ['info'], false],

  // --- Trung Lập ---------------------------------------------------------
  ['tanner', 'Thợ Thuộc Da', 'Tanner', 'neutral', '#a855f7', 'never', [], false],
  ['hoodlum', 'Côn Đồ', 'Hoodlum', 'neutral', '#7e22ce', 'first', ['info'], true],
  ['vampire', 'Ma Cà Rồng', 'Vampire', 'neutral', '#9333ea', 'every', ['bad'], true],
  ['bogeyman', 'Ông Ba Bị', 'Bogeyman', 'neutral', '#6b21a8', 'every', ['bad'], true],
  ['magician', 'Ảo Thuật Gia', 'Magician', 'neutral', '#c026d3', 'every', ['link'], false],
  ['thing', 'The Thing', 'Thing', 'neutral', '#d946ef', 'every', ['info'], false],
]

export const DEFAULT_ROLES = RAW.map(
  ([id, name, nameEn, team, color, callTiming, actions, canEliminate], order) => ({
    id,
    name,
    nameEn,
    team,
    color,
    art: id,
    callTiming,
    actions,
    canEliminate,
    order,
    builtin: true,
  }),
)

export const DEFAULT_ROLE_IDS = new Set(DEFAULT_ROLES.map((r) => r.id))

export const isBuiltin = (id) => DEFAULT_ROLE_IDS.has(id)

// Split a role list into the four display groups, keeping every group even when
// it is empty so the UI does not jump around. Anything without a known team —
// a role typed by hand, or one saved before teams existed — lands in 'custom'.
export function rolesByTeam(roles) {
  const keys = new Set(TEAMS.map((t) => t.key))
  return TEAMS.map((team) => ({
    ...team,
    roles: roles.filter((r) =>
      team.key === 'custom' ? !r.team || !keys.has(r.team) || r.team === 'custom' : r.team === team.key,
    ),
  }))
}
