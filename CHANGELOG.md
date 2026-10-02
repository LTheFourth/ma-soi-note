# Changelog

## v1.5.0-beta — 2026-10-02

### Features
- **Role avatars:** every player card and player row now shows the artwork of that player's role, ringed and tinted in the role's own colour. Appears on the day grid, the night role call, the surviving-players list, the night summary and every log line.
- **Automatic artwork:** typing a role name guesses its artwork from a 42-role table that understands English and Vietnamese, with or without diacritics ("Ma Sói", "ma soi", "Sói Trùm" all land correctly). Longest match wins, so "Sói Trùm" is not mistaken for "Sói".
- **Artwork picker:** tap a role's avatar on the New Game screen to choose any of the 42 artworks, search by English or Vietnamese name, or clear it back to the role's initial.
- **Livelier game screens:** player cards gained depth, a role-coloured glow, a hover lift and a staggered entrance; eliminated players now carry a 🪦 badge. All motion is disabled under `prefers-reduced-motion`.

### Notes
- Artwork files are not bundled yet. Until they are added to `src/art/`, every avatar shows the role's initial on a coloured disc — nothing breaks. See `docs/art-prompts.md` for the generation kit.
- All artwork is original to this project; no third-party card art is used.

## v1.4.0-beta — 2026-07-20

### Features
- **Override saved sets:** saving with an existing set's name overwrites it (no duplicate), and each saved set has a ⟳ button to overwrite it with the current selection.

## v1.3.0-beta — 2026-07-20

### Features
- **Preset role colors:** quick Red / Green / Blue / Orange swatches when adding a role (custom picker still available).
- **Better link recognition:** linked players show "🔗 linked with <partner(s)>" text in the day grid, night lists, and the role action screen; the link dot's tooltip names partners too.

## v1.2.0-beta — 2026-07-20

### Features
- **Dead roles skip:** during the night, a role with no living holder shows just its name marked **[DEAD]** and a Skip button (no action panel).
- **Self-recovering role sets:** a saved set stores each role's full snapshot (name, color, order, timing, actions, elim-cause); loading a set re-creates roles that were deleted from the library.
- **Redesigned player/role lists:** New Game now uses a selectable card grid — tap to toggle (✓ + highlight, role color bar), per-section selected count, and Select all / Clear.

## v1.1.0-beta — 2026-07-20

Roles, linking, and reusable setups.

### Features
- **Per-role call timing:** Every night / First night only / Setup only.
- **Per-role action set:** choose which of Kill 💀 / Save 💚 / Info 👁 / Link 🔗 a role can log; its night turn shows only those.
- **Linking:** roles with the Link action group 2+ players; each linked group gets its own color, shown as a colored dot beside linked players everywhere (grid, lists, action screen, history, logs).
- **Elimination cause:** per-role "🪦 elim cause" flag — only flagged roles appear in the night "killed by which role?" list.
- **Remember last game:** New Game pre-selects the players and roles from the last game played.
- **Role-set presets:** save the current roles + order + options as a named set; load it later.

## v1.0.0-beta — 2026-07-20

First public beta of the Werewolf (Ma Sói) moderator app.

### Features
- **New game setup:** reusable library of players and roles (saved locally); pick who plays each game.
- **Role call order:** drag to reorder; per-role toggles — "call on game nights" and "can eliminate".
- **Setup phase:** assign roles to players; optional first-night actions; leftovers auto-become Villager.
- **Day phase:** player grid with role, eliminate with a reason (default "voted"), history log, discussion **timer** (MM:SS).
- **Night phase:** call roles in order; tap an icon (💚 heal / 💀 kill / 👁 inspect) on a player to log an action instantly; edit (retype/retarget) or delete actions; go back to a previous role.
- **Logs:** "Last night / previous day" and full History show role actions and eliminations (🪦 with player role + reason).
- **Eliminations:** night deaths pick which role caused them (only roles flagged "can eliminate").
- **Dumb tracker:** the moderator decides everything; no rule enforcement.
- **PWA:** installable, works offline; all data local (localStorage), nothing leaves the device.

### Notes
- The day timer is ephemeral (resets on refresh).
- New roles default to "can eliminate" OFF — enable it per role to have it appear in the night kill-reason dialog.
