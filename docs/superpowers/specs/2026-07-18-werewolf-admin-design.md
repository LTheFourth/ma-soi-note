# Werewolf Admin — Design Spec

**Date:** 2026-07-18
**Status:** Approved (design phase)

## Purpose

A web app to help the **moderator** ("admin") run in-person games of Werewolf
(Ma Sói). It tracks players, roles, night/day phases, night actions, and
eliminations. It is a **dumb tracker**: the admin makes every decision (who
dies, when phases switch, when the game ends). The app enforces no game rules
and detects no win condition.

Deployed on GitHub Pages, installable as a PWA, works fully offline. All data
lives in the browser via `localStorage`. No backend, no accounts, no network.

## Tech stack

| Concern | Choice |
|---|---|
| Build / framework | Vite + React |
| State + persistence | zustand with `persist` middleware → `localStorage` |
| Drag reorder | dnd-kit |
| PWA (offline + installable) | vite-plugin-pwa |
| Deploy | GitHub Action → `gh-pages` branch → GitHub Pages |
| Base path | `base: '/masoi/'` in `vite.config` |

## Data model

Two persisted stores.

### Library store (reused across games)

- `players[]`: `{ id, name }`
- `roles[]`: `{ id, name, order, gameNightEnabled, color }`
  - `order` (int): night call sequence, set by drag reorder.
  - `gameNightEnabled` (bool, default `true`): if `false`, the role is called
    only during Setup (first night) and never on game nights. Used for
    first-night-only roles (e.g. Cupid).
  - `color`: UI accent for the role.

**Villager** is a special implicit default role — NOT in the callable `roles[]`
order list. Any player not assigned an explicit role during Setup automatically
becomes a Villager.

### Active game store (auto-saved on every change)

- `assignments`: map `playerId → roleId` (multiple players may share a role,
  e.g. Werewolves).
- `phase`: `'setup' | 'day' | 'night'`.
- `round`: integer, increments per night.
- `setupCursor`: index of role currently being assigned (Setup phase).
- `nightCursor`: index of role currently being called (Night phase).
- `actionLog[]`: ordered list of actions.
- `eliminated`: set of `playerId`.

### Action

`{ id, round, actor: roleId, target: playerId, type, note? }`

- `type`: `'good' | 'bad' | 'info'` — display labels only, no enforcement.
  `info` covers no-effect inspections (e.g. Seer check).

## Screens & flow

```
New Game ──▶ Setup (assign roles) ──▶ Day ⇄ Night ──▶ End Game (admin)
```

### A. New Game

1. Pick players from library (or add new). Selected players join this game.
2. Pick roles from library (or add new).
3. Role ordering screen:
   - Drag to reorder the night call sequence.
   - Per-role toggle: "call on game nights" (`gameNightEnabled`).

### B. Setup — "Know the roles"

- Walk each role in `order` (excluding Villager).
- Show the current role + a side list of game players.
- Multi-select which players hold this role (Werewolves = several). **Next.**
- After the last role, all leftover players auto-assigned Villager.
- Game begins → Day.

### C. Day

- Grid of player cards: name + role.
- Top bar: **Night/Day toggle**, **End Game** button (ends current game).
- Sidebar: action history log, in exact order.
  Format: `Player1 (Witch) — Good → Player2 (Villager)`.
- Click a player card → popup menu → **Eliminate** (with confirmation).
- Eliminated card → grayscale + slash overlay ("killed").

### D. Night

- Calls each role where `gameNightEnabled === true`, in `order`.
- Shows the current role + that role's actions from the previous night
  (history).
- Side: list of surviving players (with their roles, including self).
- Select a player → action panel: **Good / Bad / Info** + optional note →
  appended to `actionLog`.
- **Log multiple actions** in one call (covers Witch: heal + poison), then
  **Done** to advance. **Skip** advances without logging.
- After the last role → **Night Summary**: all of this night's actions in
  exact order → admin manually marks who is eliminated → back to Day.

## Component structure

```
src/
  store/           zustand + persist (libraryStore, gameStore)
  screens/
    NewGame/       PlayerPicker, RolePicker, RoleOrder (dnd-kit)
    Setup/         RoleAssign (know-the-roles walker)
    Day/           PlayerGrid, PlayerCard, HistorySidebar, CardMenu
    Night/         NightRoleCall, ActionPanel, NightSummary
  components/      shared: Card, Toggle, ConfirmDialog, TopBar
  lib/             types, id generator
```

Each screen has one job and reads/writes the stores. All game state lives in
the store, so any screen resumes correctly from a saved game after refresh.

## Out of scope (YAGNI)

- No win detection, no rule enforcement, no auto night-resolution.
- No multi-device sync, no cloud, no accounts.
- No undo history beyond the current game state.

## Success criteria

1. Fresh install: add players + roles → they persist after refresh.
2. New game → Setup assigns all roles → leftovers become Villager.
3. Day: eliminate a player → card grayscales, logged.
4. Night: walk roles in order, log multi-actions, skip works, summary shows
   correct order, admin eliminations apply.
5. Refresh mid-game → resumes exact state.
6. Builds, deploys to GitHub Pages, installs as PWA, works offline.
