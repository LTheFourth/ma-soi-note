# Changelog

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
