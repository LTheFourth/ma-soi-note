// Role artwork: a folder of images keyed by art id, plus a best-effort
// guess from a role's name so a freshly typed role already looks like
// something. The folder is the source of truth — dropping a new file in
// src/art/ is all it takes to add art for an id.
//
// Art lives in src/ (not public/) so Vite rewrites each URL with the
// GitHub Pages base path and a content hash. Never build these paths by hand.
const FILES = import.meta.glob('../art/*.{webp,png,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
})

// Generated raster art wins over the built-in SVG for the same id, so dropping
// werewolf.webp into src/art/ replaces the drawn silhouette with no code change.
const RANK = { webp: 3, png: 2, svg: 1 }

// { '../art/dire-wolf.webp': url } -> { 'dire-wolf': url }, best file per id.
export function pickBest(files) {
  const best = {}
  for (const [path, url] of Object.entries(files)) {
    const file = path.replace(/^.*\//, '')
    const id = file.replace(/\.[^.]+$/, '')
    const rank = RANK[file.split('.').pop().toLowerCase()] ?? 0
    if (!best[id] || rank > best[id].rank) best[id] = { url, rank }
  }
  return Object.fromEntries(Object.entries(best).map(([id, v]) => [id, v.url]))
}

export const ART = pickBest(FILES)

export const ART_IDS = Object.keys(ART).sort()

// Every art id the project plans to ship, whether or not its file exists yet.
// Used to build the default alias list; the picker only offers ART_IDS.
export const ROLE_IDS = [
  // werewolf team
  'werewolf', 'dire-wolf', 'wolf-cub', 'big-bad-wolf', 'lone-wolf',
  'sorceress', 'minion', 'cult-leader',
  // village team
  'villager', 'seer', 'apprentice-seer', 'aura-seer', 'mason', 'bodyguard',
  'hunter', 'witch', 'spellcaster', 'village-idiot', 'mayor', 'prince',
  'priest', 'pacifist', 'martyr', 'beholder', 'old-man', 'old-hag', 'cursed',
  'diseased', 'drunk', 'ghost', 'lycan', 'private-investigator',
  'troublemaker', 'cupid', 'doppelganger',
  // independent / utility
  'tanner', 'hoodlum', 'vampire', 'bogeyman', 'magician', 'thing', 'unknown',
]

// Extra names that should resolve to an id, on top of the id itself spelled
// with spaces. Vietnamese entries are written WITHOUT diacritics because
// normalizeName strips them before matching.
const EXTRA_ALIASES = {
  werewolf: ['wolf', 'ma soi', 'soi'],
  'dire-wolf': ['alpha wolf', 'soi trum', 'soi dau dan'],
  'wolf-cub': ['half wolf', 'halfwolf', 'soi con', 'ban soi'],
  'big-bad-wolf': ['soi hung ac', 'soi khong lo'],
  'lone-wolf': ['soi don doc'],
  sorceress: ['sorcerer', 'phap su soi', 'phu thuy soi'],
  minion: ['tay sai'],
  'cult-leader': ['giao chu'],
  villager: ['dan lang', 'dan thuong'],
  seer: ['fortune teller', 'tien tri'],
  'apprentice-seer': ['tien tri tap su', 'tien tri hoc viec'],
  'aura-seer': ['tien tri hao quang'],
  mason: ['masons', 'hoi kin', 'tho xay'],
  bodyguard: ['guard', 'protector', 'bao ve', 've si'],
  hunter: ['tho san'],
  witch: ['phu thuy'],
  spellcaster: ['spell caster', 'phap su cam', 'nguoi niem chu'],
  'village-idiot': ['idiot', 'fool', 'thang kho', 'thang ngo'],
  mayor: ['truong lang', 'thi truong'],
  prince: ['hoang tu'],
  priest: ['linh muc', 'thay tu'],
  pacifist: ['ke chu hoa', 'nguoi hoa binh'],
  martyr: ['nguoi hy sinh', 'nguoi tuan dao'],
  beholder: ['nguoi quan sat'],
  'old-man': ['elder', 'gia lang'],
  'old-hag': ['mu gia', 'ba gia'],
  cursed: ['bi nguyen', 'nguyen rua'],
  diseased: ['ke mang benh', 'nguoi benh'],
  drunk: ['ke say', 'say xin'],
  ghost: ['hon ma', 'linh hon'],
  lycan: ['soi gia', 'nguoi hoa soi'],
  'private-investigator': ['investigator', 'detective', 'tham tu'],
  troublemaker: ['ke pha roi'],
  cupid: ['than tinh yeu', 'than ai tinh'],
  doppelganger: ['ke sao chep', 'nguoi sao chep'],
  tanner: ['tho thuoc da'],
  hoodlum: ['con do'],
  vampire: ['ma ca rong'],
  bogeyman: ['ong ba bi'],
  magician: ['ao thuat gia', 'nha ao thuat'],
  thing: ['the thing', 'thuc the'],
}

export const ALIASES = (() => {
  const out = {}
  for (const id of ROLE_IDS) {
    out[id.replace(/-/g, ' ')] = id
    for (const alias of EXTRA_ALIASES[id] ?? []) out[alias] = id
  }
  return out
})()

// Longest alias first, so 'soi trum' wins over 'soi' and
// 'apprentice seer' wins over 'seer'.
const ALIAS_ENTRIES = Object.entries(ALIASES).sort((a, b) => b[0].length - a[0].length)

export function normalizeName(name) {
  return String(name ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // drop combining accents
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

// Best-effort art id for a free-text role name, or undefined if nothing fits.
// Only called when a role is created — a rename never overwrites a manual pick.
export function guessArt(name) {
  const n = normalizeName(name)
  if (!n) return undefined
  return ALIAS_ENTRIES.find(([alias]) => n.includes(alias))?.[1]
}

export function artUrl(id) {
  return (id && ART[id]) || null
}
