// Generates src/art/<id>.svg for every planned role id.
//
// The whole set is built from one shared parts library on one 64x64 grid with
// one four-tone palette, so every portrait sits at the same scale and reads the
// same way. That shared construction — not hand-matching 42 drawings — is what
// keeps the deck looking like a deck.
//
// Art is deliberately light-on-transparent: RoleAvatar paints the role's own
// colour behind it, so a silhouette has to read on red, blue, green alike.
//
// Run: node scripts/gen-art.mjs
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../src/art')

const LIGHT = '#e2e8f0'
const MID = '#9fb0c4'
const DARK = '#6b7f96'
const DEEP = '#3b4a5e'
const ACC = '#f0a93b'
const RED = '#e05a5a'
const GRN = '#6fc07a'
const WHITE = '#ffffff'

/* ---------------------------------------------------------------- bodies */

const bust = (f = LIGHT) => `<path d="M11 62c0-11 9.6-17.5 21-17.5S53 51 53 62v3H11z" fill="${f}"/>`

const bustCloak = (f = MID) =>
  `<path d="M7 62c0-12 11-19 25-19s25 7 25 19v3H7z" fill="${f}"/>` +
  `<path d="M24 45l8 13 8-13" fill="none" stroke="${DEEP}" stroke-width="2"/>`

const bustArmor = () =>
  bust(MID) +
  `<circle cx="14" cy="53" r="7.5" fill="${DARK}"/><circle cx="50" cy="53" r="7.5" fill="${DARK}"/>` +
  `<path d="M32 45v18" stroke="${DEEP}" stroke-width="2"/>`

const bustRobe = (f = MID) =>
  bust(f) + `<path d="M32 45v20" stroke="${DEEP}" stroke-width="1.8"/>`

const apron = () =>
  bust(LIGHT) + `<path d="M24 47h16v18H24z" fill="${DARK}"/><path d="M24 47l8-4 8 4" fill="none" stroke="${DARK}" stroke-width="2"/>`

/* ----------------------------------------------------------------- heads */

const head = (f = LIGHT, cy = 23, r = 12.5) => `<circle cx="32" cy="${cy}" r="${r}" fill="${f}"/>`

const eyes = (f = DEEP, cy = 21, dx = 5.6, r = 1.9) =>
  `<circle cx="${32 - dx}" cy="${cy}" r="${r}" fill="${f}"/><circle cx="${32 + dx}" cy="${cy}" r="${r}" fill="${f}"/>`

const glowEyes = (f = ACC, cy = 21) =>
  `<circle cx="26.4" cy="${cy}" r="3.4" fill="${f}" opacity=".35"/><circle cx="37.6" cy="${cy}" r="3.4" fill="${f}" opacity=".35"/>` +
  eyes(f, cy, 5.6, 2.1)

const smile = (y = 29) => `<path d="M26 ${y}q6 5 12 0" fill="none" stroke="${DEEP}" stroke-width="1.8" stroke-linecap="round"/>`
const frown = (y = 31) => `<path d="M26 ${y}q6-4 12 0" fill="none" stroke="${DEEP}" stroke-width="1.8" stroke-linecap="round"/>`
const flatMouth = (y = 30) => `<path d="M27 ${y}h10" stroke="${DEEP}" stroke-width="1.8" stroke-linecap="round"/>`

/* ------------------------------------------------------------ wolf parts */

const wolfEars = (f = LIGHT) =>
  `<path d="M22 13 18.5 2 30 8.5Z" fill="${f}"/><path d="M42 13 45.5 2 34 8.5Z" fill="${f}"/>` +
  `<path d="M22.8 11.4 21 5.4l5.8 3.3Z" fill="${DARK}"/><path d="M41.2 11.4 43 5.4l-5.8 3.3Z" fill="${DARK}"/>`

const muzzle = (f = MID) =>
  `<ellipse cx="32" cy="30.5" rx="8.6" ry="6.4" fill="${f}"/><ellipse cx="32" cy="26.8" rx="2.7" ry="2.1" fill="${DEEP}"/>`

const fangs = () => `<path d="M28.4 34.6 30 38.4l1.6-3.8ZM32.8 34.6l1.6 3.8 1.6-3.8Z" fill="${WHITE}"/>`

const openJaw = () =>
  `<path d="M22 30q10 14 20 0q-4 8-10 8t-10-8Z" fill="${DEEP}"/>` +
  `<path d="M24.5 32.5l1.8 4 1.8-4ZM35.9 32.5l1.8 4 1.8-4Z" fill="${WHITE}"/>`

/* --------------------------------------------------------------- headwear */

const hood = (f = MID) =>
  `<path d="M32 3C19 3 11.5 13 11.5 26v11l7.5-2.8C17.5 27 18 16 32 16s14.5 11 13 18.2l7.5 2.8V26C52.5 13 45 3 32 3Z" fill="${f}"/>`

const pointyHat = () =>
  `<path d="M32 0 46 21H18Z" fill="${DEEP}"/><ellipse cx="32" cy="21" rx="19" ry="3.6" fill="${DARK}"/>`

const topHat = () =>
  `<rect x="21" y="1" width="22" height="16" rx="1.5" fill="${DEEP}"/>` +
  `<rect x="21" y="12" width="22" height="3" fill="${RED}"/>` +
  `<ellipse cx="32" cy="17.5" rx="19" ry="3.2" fill="${DARK}"/>`

const fedora = () =>
  `<path d="M21 13c0-7.5 3.6-10.5 11-10.5S43 5.5 43 13Z" fill="${DEEP}"/>` +
  `<ellipse cx="32" cy="13.5" rx="18.5" ry="3.4" fill="${DARK}"/>`

const circlet = (f = ACC) =>
  `<path d="M20.5 12.5h23v3h-23z" fill="${f}"/><circle cx="32" cy="10.5" r="2.4" fill="${f}"/>`

const crown = () =>
  `<path d="M19 15 19 6l5 4 4-6 4 6 4-4 5 4 0 9Z" fill="${ACC}"/>`

const antlers = () =>
  `<path d="M22 10 15 1M22 10 11 6M42 10 49 1M42 10 53 6" fill="none" stroke="${MID}" stroke-width="2.4" stroke-linecap="round"/>`

const jester = () =>
  hood(DARK) +
  `<circle cx="10" cy="9" r="4" fill="${ACC}"/><circle cx="54" cy="9" r="4" fill="${RED}"/>` +
  `<path d="M13 11 20 17M51 11 44 17" stroke="${DARK}" stroke-width="2.6" stroke-linecap="round"/>`

const shawl = () =>
  `<path d="M13.5 32C13.5 16 21.5 7.5 32 7.5S50.5 16 50.5 32l-5.5 2C45 20 40 15 32 15s-13 5-13 19Z" fill="${MID}"/>` +
  `<path d="M22 11l1.2 2.6 2.6 1.2-2.6 1.2L22 18.6 20.8 16l-2.6-1.2 2.6-1.2ZM43 15l1 2 2 1-2 1-1 2-1-2-2-1 2-1Z" fill="${ACC}"/>`

const wildHair = () =>
  `<path d="M13 26C10.5 12 19 3.5 32 3.5S53.5 12 51 26c-2.4-7.6-6.4-10.4-6.4-10.4S40.2 20 32 20s-12.6-4.4-12.6-4.4S15.4 18.4 13 26Z" fill="${MID}"/>`

const beard = () =>
  `<path d="M20.5 27c0 13 5.2 19.5 11.5 19.5S43.5 40 43.5 27c-3.2 5.4-19.2 5.4-23 0Z" fill="${LIGHT}"/>`

const halo = (f = ACC) => `<ellipse cx="32" cy="6" rx="12.5" ry="3.4" fill="none" stroke="${f}" stroke-width="2.2"/>`

const collarHigh = () =>
  `<path d="M22 45 32 57 42 45l9 5c0 .5 2 4 2 12v3H11v-3c0-8 2-11.5 2-12Z" fill="${DEEP}"/>` +
  `<path d="M22 45 18 62M42 45l4 17" stroke="${RED}" stroke-width="2"/>`

/* ----------------------------------------------------------------- props */

const pitchfork = () =>
  `<path d="M50 64V40M43 44v-7M50 44v-7M57 44v-7M43 42h14" fill="none" stroke="${MID}" stroke-width="2.4" stroke-linecap="round"/>`

const crystalBall = (r = 8) =>
  `<circle cx="48" cy="52" r="${r}" fill="${ACC}" opacity=".8"/>` +
  `<circle cx="45.4" cy="49.4" r="${r / 3.2}" fill="${WHITE}" opacity=".85"/>`

const vials = () =>
  `<rect x="40" y="45" width="7" height="14" rx="3" fill="${GRN}"/><rect x="50" y="45" width="7" height="14" rx="3" fill="${RED}"/>` +
  `<rect x="40" y="43" width="7" height="3" fill="${DARK}"/><rect x="50" y="43" width="7" height="3" fill="${DARK}"/>`

const shield = () =>
  `<path d="M48 39l9.5 3.2v7.3c0 6.4-4.8 10-9.5 11.5-4.7-1.5-9.5-5.1-9.5-11.5v-7.3Z" fill="${DARK}"/>` +
  `<path d="M48 44v13" stroke="${LIGHT}" stroke-width="2"/>`

const bow = () =>
  `<path d="M44 37c8.5 5.5 8.5 18 0 23.5" fill="none" stroke="${MID}" stroke-width="2.8" stroke-linecap="round"/>` +
  `<path d="M44 37 44 60.5" stroke="${LIGHT}" stroke-width="1.4"/>`

const staff = () =>
  `<path d="M50 64V36" stroke="${MID}" stroke-width="2.8" stroke-linecap="round"/><circle cx="50" cy="33" r="3.4" fill="${ACC}"/>`

const cross = () =>
  `<path d="M49 38v19M41 45h16" stroke="${LIGHT}" stroke-width="3" stroke-linecap="round"/>`

const magnifier = () =>
  `<circle cx="47" cy="46" r="7.2" fill="none" stroke="${MID}" stroke-width="2.6"/>` +
  `<path d="M52.3 51.3 58.5 57.5" stroke="${MID}" stroke-width="3.2" stroke-linecap="round"/>`

const jug = () =>
  `<path d="M41 46h11v13a4 4 0 0 1-4 4h-3a4 4 0 0 1-4-4Z" fill="${DARK}"/>` +
  `<path d="M52 49a4.5 4.5 0 0 1 0 8" fill="none" stroke="${DARK}" stroke-width="2.2"/>`

const square = () =>
  `<path d="M40 60h17M57 60V43" fill="none" stroke="${MID}" stroke-width="3" stroke-linecap="round"/>`

const branch = () =>
  `<path d="M40 63c6.5-4.5 10.5-11 12.5-19.5" fill="none" stroke="${MID}" stroke-width="1.8"/>` +
  `<ellipse cx="45" cy="56" rx="3.2" ry="1.9" fill="${GRN}" transform="rotate(-35 45 56)"/>` +
  `<ellipse cx="49" cy="50" rx="3.2" ry="1.9" fill="${GRN}" transform="rotate(-35 49 50)"/>` +
  `<ellipse cx="52" cy="44" rx="3.2" ry="1.9" fill="${GRN}" transform="rotate(-35 52 44)"/>`

const cards = () =>
  `<rect x="40" y="44" width="10" height="14" rx="1.5" fill="${LIGHT}" transform="rotate(-14 45 51)"/>` +
  `<rect x="47" y="44" width="10" height="14" rx="1.5" fill="${MID}" transform="rotate(12 52 51)"/>`

const stone = () => `<path d="M43 53l5-5.5 7.5 2 1 6.5-6.5 4.5-6.5-3.5Z" fill="${DARK}"/>`

const amulet = () =>
  `<path d="M32 45v5" stroke="${DARK}" stroke-width="1.6"/><path d="M32 50l3.2 5-3.2 4.6-3.2-4.6Z" fill="${ACC}"/>`

const chain = () =>
  `<path d="M23 45c2.5 9.5 15.5 9.5 18 0" fill="none" stroke="${ACC}" stroke-width="2.2"/><circle cx="32" cy="52.5" r="3.4" fill="${ACC}"/>`

const sash = () => `<path d="M19 46 44 65H34L14 52Z" fill="${RED}"/>`

const scroll = () =>
  `<rect x="38" y="48" width="18" height="7" rx="3.5" fill="${LIGHT}"/><path d="M38 48v7M56 48v7" stroke="${DARK}" stroke-width="2"/>`

const wings = () =>
  `<path d="M14 36C5 28 7 17 13.5 15c2.5 7.5 7 12.5 12 15Z" fill="${LIGHT}" opacity=".9"/>` +
  `<path d="M50 36C59 28 57 17 50.5 15c-2.5 7.5-7 12.5-12 15Z" fill="${LIGHT}" opacity=".9"/>`

const arrow = () =>
  `<path d="M38 62 58 42" stroke="${MID}" stroke-width="2.2" stroke-linecap="round"/>` +
  `<path d="M58 42l-7 1 6 6Z" fill="${RED}"/>`

const runes = () =>
  `<circle cx="50" cy="26" r="2.6" fill="${ACC}"/><circle cx="55" cy="35" r="2" fill="${ACC}" opacity=".8"/>` +
  `<circle cx="52" cy="45" r="2.3" fill="${ACC}" opacity=".6"/>`

const auraArcs = () =>
  `<path d="M32 4a19 19 0 0 1 19 19" fill="none" stroke="${ACC}" stroke-width="2" opacity=".85"/>` +
  `<path d="M32 .5a22.5 22.5 0 0 0-22.5 22.5" fill="none" stroke="${GRN}" stroke-width="2" opacity=".7"/>` +
  `<path d="M55 29A23 23 0 0 1 32 52" fill="none" stroke="${RED}" stroke-width="2" opacity=".55"/>`

const veins = () =>
  `<path d="M38 15c2 3 1.5 6 3.5 8M42 28c2 3 2 6 1 9" fill="none" stroke="${DEEP}" stroke-width="1.4" stroke-linecap="round" opacity=".75"/>`

const plagueCloth = () =>
  `<path d="M19.5 26c6.5 3.2 18.5 3.2 25 0v5.5c-4.5 5.5-20.5 5.5-25 0Z" fill="${LIGHT}"/>` +
  `<path d="M19.5 26 13 22M44.5 26 51 22" stroke="${LIGHT}" stroke-width="1.8"/>`

const boneNecklace = () =>
  `<path d="M22 46c3 7 17 7 20 0" fill="none" stroke="${LIGHT}" stroke-width="1.6"/>` +
  [26, 32, 38].map((x, i) => `<rect x="${x - 1.4}" y="${50 + (i === 1 ? 2 : 0)}" width="2.8" height="6" rx="1.4" fill="${LIGHT}"/>`).join('')

const wolfSkull = () =>
  `<path d="M32 1c-6 0-9.5 3.5-9.5 8 0 2.5 1 4 2.5 5l-3 4h20l-3-4c1.5-1 2.5-2.5 2.5-5 0-4.5-3.5-8-9.5-8Z" fill="${LIGHT}"/>` +
  `<circle cx="28" cy="8" r="1.8" fill="${DEEP}"/><circle cx="36" cy="8" r="1.8" fill="${DEEP}"/>`

/* ---------------------------------------------------------------- figures */

const shroud = () =>
  `<path d="M32 4c11.5 0 18.5 8.5 18.5 20v40l-6-5-6 5-6-5-6 5-6-5-6 5V24C13.5 12.5 20.5 4 32 4Z" fill="${LIGHT}" opacity=".8"/>`

const shadowFigure = () =>
  `<path d="M32 2c10 0 15 8 15 19 0 6-2 9-2 13 0 6 6 10 6 21v9H13v-9c0-11 6-15 6-21 0-4-2-7-2-13C17 10 22 2 32 2Z" fill="${DEEP}"/>` +
  `<path d="M14 42c-3 8-4 14-4 22M50 42c3 8 4 14 4 22" fill="none" stroke="${DEEP}" stroke-width="2.4" stroke-linecap="round"/>`

const blob = () =>
  `<path d="M32 5c13 0 21 9 21 21 0 7-3 10-3 15 0 7 5 11 5 19v4H9v-4c0-8 5-12 5-19 0-5-3-8-3-15C11 14 19 5 32 5Z" fill="${MID}"/>` +
  `<path d="M16 48c-4 5-6 10-6 16M48 48c4 5 6 10 6 16M24 52c-2 4-3 8-3 12M40 52c2 4 3 8 3 12" fill="none" stroke="${DARK}" stroke-width="2.2" stroke-linecap="round"/>`

/* ------------------------------------------------------------- the roster */

const ART = {
  // --- werewolf team
  werewolf: [bust(MID), wolfEars(MID), head(MID), muzzle(DARK), glowEyes(ACC, 20), fangs()],
  'dire-wolf': [bustCloak(DEEP), boneNecklace(), antlers(), wolfEars(DARK), head(DARK), muzzle(DEEP), glowEyes(RED, 20), fangs()],
  'wolf-cub': [
    bust(LIGHT),
    `<path d="M24 15 21 5 31 10Z" fill="${LIGHT}"/>`,
    head(LIGHT, 25, 11),
    `<ellipse cx="32" cy="31" rx="6.6" ry="5" fill="${MID}"/><ellipse cx="32" cy="28.2" rx="2.1" ry="1.7" fill="${DEEP}"/>`,
    glowEyes(ACC, 23),
  ],
  'big-bad-wolf': [bust(DARK), wolfEars(DARK), head(DARK, 21, 14), `<ellipse cx="32" cy="29" rx="11" ry="7.5" fill="${DEEP}"/>`, openJaw(), glowEyes(RED, 18)],
  'lone-wolf': [bustCloak(DARK), hood(DEEP), wolfEars(DARK), head(DARK, 24, 11.5), muzzle(DEEP), glowEyes(ACC, 22)],
  sorceress: [bustRobe(DEEP), hood(DARK), head(LIGHT, 24, 11), glowEyes('#b58cf0', 22), `<path d="M44 20c6 4 8 11 6 18" fill="none" stroke="#b58cf0" stroke-width="2" opacity=".7"/>`],
  minion: [bustCloak(DARK), hood(DEEP), head(MID, 25, 10.5), eyes(DEEP, 24, 4.6, 1.7), amulet()],
  'cult-leader': [bustRobe(DARK), wolfSkull(), head(LIGHT, 26, 11), eyes(DEEP, 24), flatMouth(31)],

  // --- village team
  villager: [bust(LIGHT), head(LIGHT), eyes(), smile(), pitchfork()],
  seer: [bust(MID), shawl(), head(LIGHT), eyes(WHITE, 21, 5.6, 2.2), crystalBall()],
  'apprentice-seer': [bust(MID), shawl(), head(LIGHT, 25, 11), eyes(WHITE, 23, 5, 1.9), crystalBall(5.5)],
  'aura-seer': [bust(MID), auraArcs(), head(LIGHT), `<path d="M26 21q5 3 10 0" fill="none" stroke="${DEEP}" stroke-width="1.8" stroke-linecap="round"/>`, flatMouth()],
  mason: [apron(), head(LIGHT), eyes(), square()],
  bodyguard: [bustArmor(), head(LIGHT), eyes(), shield()],
  hunter: [bust(DARK), head(LIGHT), eyes(), bow()],
  witch: [bustRobe(DEEP), pointyHat(), head(LIGHT, 26, 11), eyes(DEEP, 24), vials()],
  spellcaster: [bustRobe(DARK), hood(MID), head(LIGHT, 25, 11), eyes(ACC, 23), runes(), `<path d="M27 31h10" stroke="${DEEP}" stroke-width="2.4" stroke-linecap="round"/>`],
  'village-idiot': [bust(LIGHT), jester(), head(LIGHT, 25, 11), eyes(DEEP, 23), smile(31)],
  mayor: [bust(MID), sash(), chain(), head(LIGHT), eyes(), scroll()],
  prince: [bust(MID), circlet('#cbd5e1'), head(LIGHT), eyes(), smile()],
  priest: [bustRobe(DEEP), head(LIGHT), eyes(), cross()],
  pacifist: [bust(LIGHT), head(LIGHT), eyes(), smile(), branch()],
  martyr: [bustRobe(LIGHT), halo(), head(LIGHT, 25, 11.5), eyes(DEEP, 23), flatMouth(31)],
  beholder: [
    bust(MID), head(LIGHT), eyes(),
    `<rect x="0" y="0" width="21" height="64" fill="${DEEP}"/><path d="M21 0v64" stroke="${DARK}" stroke-width="2"/>`,
    `<path d="M4 8h13M4 18h13M4 28h13M4 38h13M4 48h13" stroke="${DARK}" stroke-width="2"/>`,
  ],
  'old-man': [bust(MID), beard(), head(LIGHT, 21, 11.5), eyes(DEEP, 20, 5, 1.7), staff()],
  'old-hag': [bust(DARK), wildHair(), head(LIGHT, 25, 11), eyes(DEEP, 23, 5, 1.7), `<path d="M26 31q7 4 11-2" fill="none" stroke="${DEEP}" stroke-width="1.8" stroke-linecap="round"/>`],
  cursed: [bust(LIGHT), head(LIGHT), veins(), `<circle cx="26.4" cy="21" r="1.9" fill="${DEEP}"/><circle cx="37.6" cy="21" r="2.4" fill="${ACC}"/>`, frown()],
  diseased: [bust(MID), head(LIGHT), eyes(DEEP, 19), plagueCloth()],
  drunk: [bust(MID), `<g transform="rotate(-9 32 26)">${head(LIGHT)}${eyes(DEEP, 21, 5, 1.6)}<ellipse cx="32" cy="28" rx="3" ry="2.2" fill="${RED}" opacity=".8"/></g>`, jug()],
  ghost: [shroud(), `<circle cx="26.4" cy="22" r="2.8" fill="${DEEP}"/><circle cx="37.6" cy="22" r="2.8" fill="${DEEP}"/>`, `<ellipse cx="32" cy="31" rx="3.4" ry="4.4" fill="${DEEP}"/>`],
  lycan: [
    bust(LIGHT),
    `<path d="M42 13 45.5 2 34 8.5Z" fill="${MID}"/>`,
    head(LIGHT),
    `<path d="M32 10.5a12.5 12.5 0 0 1 0 25Z" fill="${MID}"/>`,
    `<circle cx="26.4" cy="21" r="1.9" fill="${DEEP}"/><circle cx="37.6" cy="21" r="2.2" fill="${ACC}"/>`,
    `<path d="M36 44l2 5 2-5ZM41 44l2 5 2-5Z" fill="${LIGHT}"/>`,
  ],
  'private-investigator': [bustCloak(DARK), fedora(), head(LIGHT, 23, 11), eyes(DEEP, 22), magnifier()],
  troublemaker: [bust(LIGHT), head(LIGHT), eyes(), `<path d="M26 30q6 4 11-1" fill="none" stroke="${DEEP}" stroke-width="1.8" stroke-linecap="round"/>`, stone()],
  cupid: [wings(), bust(LIGHT), head(LIGHT, 24, 11.5), eyes(DEEP, 22, 5, 1.7), smile(30), arrow()],
  doppelganger: [
    `<g opacity=".4">${bust(MID)}${head(MID, 23, 12.5)}</g>`,
    `<g transform="translate(5 0)">${bust(LIGHT)}${head(LIGHT, 23, 12)}</g>`,
    `<circle cx="32.5" cy="21" r="1.9" fill="${DEEP}"/><circle cx="43" cy="21" r="1.9" fill="${DEEP}"/>`,
  ],

  // --- independent and utility
  tanner: [apron(), head(MID), `<circle cx="26.4" cy="21" r="2.6" fill="${DEEP}"/><circle cx="37.6" cy="21" r="2.6" fill="${DEEP}"/>`, frown()],
  hoodlum: [bustCloak(DEEP), hood(DARK), head(MID, 25, 11), eyes(DEEP, 23), `<path d="M36 17l4 9" stroke="${DEEP}" stroke-width="1.6" stroke-linecap="round"/>`, frown(32)],
  vampire: [collarHigh(), head(LIGHT, 23, 11.5), `<circle cx="26.4" cy="21" r="2.1" fill="${RED}"/><circle cx="37.6" cy="21" r="2.1" fill="${RED}"/>`, `<path d="M29 29l1.6 4 1.6-4ZM33 29l1.6 4 1.6-4Z" fill="${WHITE}"/>`],
  bogeyman: [shadowFigure(), `<circle cx="27" cy="20" r="2.2" fill="${LIGHT}"/><circle cx="37" cy="20" r="2.2" fill="${LIGHT}"/>`],
  magician: [bustCloak(DEEP), topHat(), head(LIGHT, 25, 11), eyes(DEEP, 24), smile(30), cards()],
  thing: [blob(), `<circle cx="25" cy="22" r="2.4" fill="${DEEP}"/><circle cx="34" cy="19" r="1.8" fill="${DEEP}"/><circle cx="40" cy="26" r="2" fill="${DEEP}"/>`],
  unknown: [bust(MID), head(MID)],
}

mkdirSync(OUT, { recursive: true })
let n = 0
for (const [id, parts] of Object.entries(ART)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${parts.join('')}</svg>\n`
  writeFileSync(resolve(OUT, `${id}.svg`), svg, 'utf8')
  n++
}
console.log(`wrote ${n} svg files to src/art/`)
