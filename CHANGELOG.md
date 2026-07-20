# Changelog

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
