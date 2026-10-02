# Role Avatars & Game-Screen Polish — Design

Date: 2026-10-02
Status: approved, ready for implementation plan

## Goal

Make the moderator app feel like a game instead of a form. Every player card
and player row shows the art of the role that player holds, tinted and framed
by that role's existing colour. The game screens (Day, Night, Setup) get a
matching polish pass: card depth, role-coloured glow, entrance motion, and a
clearer dead state.

Non-goal for this round: redesigning NewGame, TopBar, HistorySidebar, modals,
typography, or the colour system. NewGame changes only enough to host the art
picker.

## Decisions

| Question | Decision |
|---|---|
| What does the avatar depict? | The player's assigned **role**, not the person |
| How does a role get its art? | Auto-guess from the role name at creation, manual override via a picker |
| Art source | **AI-generated original art**, owned by the project |
| Roster | Ultimate Werewolf Deluxe parity, ~42 roles |
| Visual scope | Avatars everywhere players/roles are listed, plus polish on Day/Night/Setup |

### Licensing

Agrou's and Bezier Games' card art are copyrighted and must not be copied,
traced, or redistributed. Role *names* are short factual labels and are free to
use. All art in this project is generated for this project and owned by it.
`docs/art-prompts.md` records how it was produced.

## Architecture

### Art pipeline

| Item | Choice | Reason |
|---|---|---|
| Location | `src/art/*.webp` | Vite rewrites URLs with the `/ma-soi-note/` base and a content hash. `public/` would require hand-built paths and would break on GitHub Pages. |
| Loading | `import.meta.glob('../art/*.webp', { eager: true, query: '?url', import: 'default' })` | Single build-time map, base-path safe. |
| Format | WebP, 256x256, square | ~15 KB each, ~630 KB for 42. Acceptable for the PWA precache. |
| Naming | kebab-case art id == filename stem (`dire-wolf.webp`) | The folder is the source of truth; no registry to keep in sync. |
| Missing file | Falls back to a monogram | Code ships and tests pass before any art exists. |

### Generation kit — `docs/art-prompts.md`

Committed alongside the art. Contains:

1. A **locked style preamble**, reused verbatim as the first paragraph of all
   42 prompts. This is the main defence against style drift across the set.
2. One subject line per role (only the subject varies).
3. A generation checklist: same model, same seed family, 1:1 aspect, bust /
   shoulders-up framing, centred, plain dark circular background, no text, no
   frame, no border.
4. A contact-sheet review step: lay all generated images out together and
   re-roll the outliers before committing.

Draft preamble (tune once, then freeze):

> Flat painted character bust portrait, dark-fantasy village folk-horror, muted
> desaturated palette, single warm rim light from upper left, centred square
> composition, shoulders-up, plain dark circular background, thick confident
> brush shapes, no text, no border, no frame.

### Roster — 42 art ids

Werewolf team: `werewolf`, `dire-wolf`, `wolf-cub`, `big-bad-wolf`,
`lone-wolf`, `sorceress`, `minion`, `cult-leader`

Village team: `villager`, `seer`, `apprentice-seer`, `aura-seer`, `mason`,
`bodyguard`, `hunter`, `witch`, `spellcaster`, `village-idiot`, `mayor`,
`prince`, `priest`, `pacifist`, `martyr`, `beholder`, `old-man`, `old-hag`,
`cursed`, `diseased`, `drunk`, `ghost`, `lycan`, `private-investigator`,
`troublemaker`, `cupid`, `doppelganger`

Independent and utility: `tanner`, `hoodlum`, `vampire`, `bogeyman`,
`magician`, `thing`, `unknown` (neutral silhouette, used when a role has art
explicitly set to `unknown`)

Counts: 8 werewolf-team + 27 village-team + 7 independent/utility = 42.

## Data model

One new optional field on a role. Nothing migrates: a role saved before this
change simply has no `art` and renders the monogram fallback.

```
role = {
  id, name, color, callTiming, actions, canEliminate, order,
  art,   // NEW: art id string, or undefined
}
```

| Location | Change |
|---|---|
| `libraryStore.addRole` | sets `art: guessArt(name)` when creating a role |
| `libraryStore.updateRole` | already generic; the picker writes `{ art: id }` |
| `libraryStore.upsertRole` | already generic; restores `art` from a saved set |
| `NewGame.currentItems()` | include `art` in the role-set snapshot |
| `NewGame.loadSet()` | pass `art` through to `upsertRole` |
| `gameStore.startGame` | **no change** — it already copies whole role objects |
| `lib/roles.js` `VILLAGER` | add `art: 'villager'` |

### `src/lib/art.js`

```
ART               // { artId: url }, built from import.meta.glob
ART_IDS           // sorted array of ids that have a file, for the picker
ALIASES           // { normalizedFragment: artId }, English + Vietnamese
guessArt(name)    // normalize, longest-alias-first match, else undefined
artUrl(id)        // ART[id] ?? null
```

Normalisation lowercases, strips Vietnamese diacritics (NFD + combining-mark
removal, plus `đ` -> `d`), and collapses whitespace. So `"Ma Sói"` and
`"ma soi"` both resolve.

Matching is **longest alias first**, so `"sói trùm"` beats `"sói"` and
`"apprentice seer"` beats `"seer"`.

Alias table starting point (English id on the left of each group, Vietnamese
variants after):

| Art id | Aliases |
|---|---|
| `werewolf` | werewolf, wolf, ma soi, soi |
| `dire-wolf` | dire wolf, alpha wolf, soi trum, soi dau dan |
| `wolf-cub` | wolf cub, half wolf, halfwolf, soi con, ban soi |
| `villager` | villager, dan lang |
| `seer` | seer, fortune teller, tien tri |
| `apprentice-seer` | apprentice seer, tien tri tap su, tien tri hoc viec |
| `witch` | witch, phu thuy |
| `bodyguard` | bodyguard, guard, protector, bao ve, ve si |
| `hunter` | hunter, tho san |
| `cupid` | cupid, than tinh yeu, than ai tinh |
| `mason` | mason, masons, hoi kin, tho xay |
| `village-idiot` | village idiot, idiot, fool, thang ngo, ngo |
| `old-man` | old man, elder, gia lang, truong lang |
| `mayor` | mayor, thi truong |
| `prince` | prince, hoang tu |
| `priest` | priest, linh muc, thay tu |
| `vampire` | vampire, ma ca rong |
| `lycan` | lycan, nguoi hoa soi |
| `cursed` | cursed, bi nguyen, nguyen rua |
| `drunk` | drunk, ke say, say xin |
| `ghost` | ghost, hon ma |
| ...remaining ids | their English name, hyphens replaced by spaces |

Short ambiguous fragments (bare `ma`, bare `soi` when it could mean something
else) are deliberately excluded or kept long enough to be unambiguous under
longest-match.

**Known limitation, accepted:** `guessArt` runs at role *creation* only, never
on rename. Renaming a role keeps its current art. This protects a manual pick
from being silently overwritten; the picker is always available to change it.

## Components

### `src/components/RoleAvatar.jsx`

```
<RoleAvatar role={role} size="xs|sm|md|lg" dead={false} />
```

| Size | Diameter |
|---|---|
| `xs` | 20 px |
| `sm` | 32 px |
| `md` | 44 px |
| `lg` | 64 px |

| Case | Render |
|---|---|
| `artUrl(role.art)` resolves | `<img>` inside a circle, ring and soft glow in `role.color` |
| no art, or unknown role | monogram: first letter of `role.name`, uppercase, on a `role.color` disc |
| `dead` | greyscale and dimmed, reusing the existing `.eliminated` treatment |

Accessibility: wherever the role name is already printed beside the avatar, the
image is `alt=""` and `aria-hidden="true"` so a screen reader does not announce
the role twice. Images are `loading="lazy"`.

### `src/components/ArtPicker.jsx`

A modal with a search box and a grid of every id in `ART_IDS`. Selecting one
calls `updateRole(roleId, { art: id })` and closes. Opened by tapping a role's
avatar on the NewGame role card. Includes a "clear" option that sets
`art: undefined`, returning the role to the monogram.

## Screen changes

| Screen | Change |
|---|---|
| `Day` player grid | `lg` avatar above the player name. Card gains a gradient surface, role-colour border and glow, hover lift, consistent press scale. Stronger dead state. |
| `Night` role-call heading | `lg` avatar left of the role name |
| `Night` survivors aside | `sm` avatar per row |
| `Night` summary eliminate list | `sm` avatar per row |
| `Night` `LogLine` | `xs` avatar before the role name |
| `Setup` | `lg` avatar beside the role heading |
| `NewGame` role card | `xs` avatar **replaces the colour bar**; tapping it opens `ArtPicker` |

## Polish

| Element | Before | After |
|---|---|---|
| Card surface | flat `bg-white/5` | subtle top-to-bottom gradient plus a role-colour tinted shadow |
| Card entrance | none | staggered fade-up, 30 ms per card |
| Press feedback | `active:scale-[0.98]` on some controls | consistent across game-screen cards |
| Dead player | greyscale plus red slash | same, plus a corner grave badge and a settle animation |

All new motion is wrapped in `@media (prefers-reduced-motion: reduce)` and
disabled there. The palette, dark theme, and existing colour tokens are
unchanged.

## Testing

| Test | Covers |
|---|---|
| `src/lib/art.test.js` (new) | `guessArt`: `"Ma Sói"` -> `werewolf`; `"ma soi"` -> `werewolf` (diacritics); `"Sói Trùm"` -> `dire-wolf` not `werewolf` (longest match); `"Apprentice Seer"` -> `apprentice-seer` not `seer`; `"Bla bla"` -> `undefined`. `artUrl` returns `null` for an unknown id. |
| `src/components/RoleAvatar.test.jsx` (new) | renders `<img>` when art resolves; renders the monogram when it does not; applies the dead treatment; image is `aria-hidden` so the role name is announced once |
| `src/components/ArtPicker.test.jsx` (new) | search filters the grid; selecting calls `updateRole` with the id; clear sets `art` to `undefined` |
| `src/store/libraryStore.test.js` | `addRole` sets `art` from the name; role-set save and load round-trips `art` |
| existing screen tests | updated where the DOM shifts |

The feature ships green with zero image files present: a missing file resolves
to the monogram, so the code can land and the whole suite can pass before any
art is generated. Art then arrives as a pure file-drop with no code change.

## Risks

| # | Risk | Mitigation |
|---|---|---|
| 1 | 42 generated images drift apart in style | Locked prompt preamble, a reference image, and a contact-sheet review pass before committing |
| 2 | ~630 KB added to the PWA precache | WebP at 256 px; measure the bundle after art lands and drop to 192 px if it is heavy |
| 3 | Day screen art reveals roles | Already the case today — the role name is printed on every Day card. No new exposure. |
| 4 | Renaming a role does not re-guess its art | Deliberate, to protect manual picks. Documented, picker always available. |
| 5 | A role name matches the wrong alias | Longest-match ordering plus a deliberately conservative alias table; the picker is the escape hatch. |

## Delivery order

1. `src/lib/art.js` plus its tests (no UI yet)
2. `RoleAvatar` plus its tests
3. Wire `art` through `libraryStore`, `roles.js`, and the NewGame role-set snapshot
4. `ArtPicker` plus wiring into the NewGame role card
5. Avatars into Day, Night, Setup
6. Polish pass and reduced-motion guard
7. `docs/art-prompts.md`, then generate and drop in the art
