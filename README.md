# Werewolf Admin (Ma Sói)

Local-only PWA to moderate in-person games of Werewolf. Tracks players, roles,
night/day phases, night actions, and eliminations. The moderator decides
everything — the app enforces no rules.

## Dev

```bash
npm install
npm run dev       # local dev server
npm test          # watch tests
npm test -- --run # single test run
npm run build     # production build (dist/)
```

## Deploy

Push to `main` → GitHub Action builds and deploys to GitHub Pages.
Enable Pages → Source: "GitHub Actions" in the repo settings once.
The app is served at `/masoi/` (see `base` in `vite.config.js`); rename the
repo or update `base` if you host it elsewhere.

## Data

All data lives in your browser (`localStorage`): `masoi-library` (reusable
players + roles) and `masoi-game` (current game, auto-saved). Nothing leaves
the device.
