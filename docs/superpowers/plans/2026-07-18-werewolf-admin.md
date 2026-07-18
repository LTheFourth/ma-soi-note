# Werewolf Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A PWA moderator tool for the game Werewolf (Ma Sói) that tracks players, roles, night/day phases, night actions, and eliminations — all local, offline, deployable to GitHub Pages.

**Architecture:** React + Vite single-page app. Two zustand stores persisted to `localStorage`: a reusable **library** (players + roles) and the **active game** (assignments, phase, action log, eliminations). The app is a *dumb tracker* — the admin decides every outcome; the app enforces no rules. Screens (NewGame → Setup → Day ⇄ Night) render off the game store's `phase`, so any refresh resumes exact state.

**Tech Stack:** React 19, Vite 8, zustand 5 (+persist), dnd-kit (drag reorder), vite-plugin-pwa 1.3, Vitest 4 + React Testing Library (tests). JavaScript/JSX (no TypeScript).

## Global Constraints

- Node >= 20.19 (Vite 8 requirement).
- Language: JavaScript + JSX only. No TypeScript.
- All persistence via `localStorage` through zustand `persist`. No backend, no network calls at runtime.
- localStorage keys: `masoi-library`, `masoi-game`. Do not rename (breaks resume).
- Vite `base: '/masoi/'` (GitHub Pages repo path).
- Villager is a virtual role with fixed id `'villager'` — never stored in `roles[]`, never in the call order.
- Action `type` is one of exactly `'good' | 'bad' | 'info'` (display labels only).
- Every task ends green: `npm test -- --run` passes and `npm run build` succeeds before commit.

---

### Task 1: Project scaffold + tooling

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`, `src/index.css`, `src/test/setup.js`, `.gitignore`, `public/manifest-icon-192.png`(placeholder note), `README.md`
- Test: `src/App.test.jsx`

**Interfaces:**
- Consumes: nothing.
- Produces: `App` default export (React component); working `npm run dev|build|test`; Vitest configured with jsdom + jest-dom.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "masoi",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest"
  },
  "dependencies": {
    "react": "19.2.7",
    "react-dom": "19.2.7",
    "zustand": "5.0.14",
    "@dnd-kit/core": "6.3.1",
    "@dnd-kit/sortable": "10.0.0",
    "@dnd-kit/utilities": "3.2.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "6.0.3",
    "vite": "8.1.5",
    "vite-plugin-pwa": "1.3.0",
    "vitest": "4.1.10",
    "jsdom": "29.1.1",
    "@testing-library/react": "16.3.2",
    "@testing-library/jest-dom": "6.9.1",
    "@testing-library/user-event": "14.6.1"
  }
}
```

- [ ] **Step 2: Install**

Run: `npm install`
Expected: completes, `node_modules/` created, no peer-dep errors that abort install.

- [ ] **Step 3: Create `vite.config.js`** (PWA added in Task 9; keep minimal now)

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/masoi/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
})
```

- [ ] **Step 4: Create `src/test/setup.js`**

```js
import '@testing-library/jest-dom/vitest'

// jsdom lacks matchMedia; dnd-kit / some libs probe it.
window.matchMedia ||= () => ({
  matches: false, addEventListener() {}, removeEventListener() {},
  addListener() {}, removeListener() {}, dispatchEvent() { return false },
})
```

- [ ] **Step 5: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Werewolf Admin</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Create `src/main.jsx`**

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 7: Create `src/index.css`** (minimal base; screens add their own rules later)

```css
:root { color-scheme: light dark; font-family: system-ui, sans-serif; }
* { box-sizing: border-box; }
body { margin: 0; }
button { font: inherit; cursor: pointer; }
.app { max-width: 1100px; margin: 0 auto; padding: 16px; }
.eliminated { filter: grayscale(1) opacity(0.5); position: relative; }
.eliminated::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(to bottom right, transparent 47%, red 48%, red 52%, transparent 53%);
}
```

- [ ] **Step 8: Write the failing test `src/App.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App.jsx'

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    expect(screen.getByText(/werewolf admin/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 9: Run test to verify it fails**

Run: `npm test -- --run`
Expected: FAIL — `App.jsx` does not exist / no matching text.

- [ ] **Step 10: Create minimal `src/App.jsx`**

```jsx
export default function App() {
  return (
    <div className="app">
      <h1>Werewolf Admin</h1>
    </div>
  )
}
```

- [ ] **Step 11: Run test to verify it passes**

Run: `npm test -- --run`
Expected: PASS (1 test).

- [ ] **Step 12: Verify build**

Run: `npm run build`
Expected: succeeds, `dist/` produced.

- [ ] **Step 13: Create `.gitignore`**

```
node_modules
dist
dev-dist
*.local
```

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite+React app with Vitest"
```

---

### Task 2: `lib` — ids + constants

**Files:**
- Create: `src/lib/id.js`, `src/lib/roles.js`
- Test: `src/lib/id.test.js`

**Interfaces:**
- Produces:
  - `uid(): string` — unique id.
  - `VILLAGER = { id: 'villager', name: 'Villager', color: '#888888', gameNightEnabled: false, order: Infinity }`.

- [ ] **Step 1: Write failing test `src/lib/id.test.js`**

```js
import { describe, it, expect } from 'vitest'
import { uid } from './id.js'

describe('uid', () => {
  it('returns a non-empty string', () => {
    expect(typeof uid()).toBe('string')
    expect(uid().length).toBeGreaterThan(0)
  })
  it('returns unique values across calls', () => {
    const ids = new Set(Array.from({ length: 1000 }, () => uid()))
    expect(ids.size).toBe(1000)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- --run src/lib/id.test.js`
Expected: FAIL — `id.js` not found.

- [ ] **Step 3: Create `src/lib/id.js`**

```js
let counter = 0

export function uid() {
  counter += 1
  return `${Date.now().toString(36)}-${counter.toString(36)}`
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test -- --run src/lib/id.test.js`
Expected: PASS.

- [ ] **Step 5: Create `src/lib/roles.js`**

```js
export const VILLAGER = {
  id: 'villager',
  name: 'Villager',
  color: '#888888',
  gameNightEnabled: false,
  order: Infinity,
}
```

- [ ] **Step 6: Commit**

```bash
git add src/lib
git commit -m "feat: add uid generator and VILLAGER constant"
```

---

### Task 3: Library store (players + roles, persisted)

**Files:**
- Create: `src/store/libraryStore.js`
- Test: `src/store/libraryStore.test.js`

**Interfaces:**
- Consumes: `uid` (Task 2).
- Produces: `useLibraryStore` (zustand hook). State + actions:
  - State: `players: {id,name}[]`, `roles: {id,name,color,gameNightEnabled,order}[]`
  - `addPlayer(name)`, `removePlayer(id)`
  - `addRole(name, color)`, `updateRole(id, patch)`, `removeRole(id)`
  - `reorderRoles(orderedIds: string[])` — sets each role's `order` to its index in `orderedIds`.
  - localStorage key `masoi-library`.

- [ ] **Step 1: Write failing test `src/store/libraryStore.test.js`**

```js
import { describe, it, expect, beforeEach } from 'vitest'
import { useLibraryStore } from './libraryStore.js'

const reset = () => useLibraryStore.setState({ players: [], roles: [] })

describe('libraryStore', () => {
  beforeEach(reset)

  it('adds and removes players', () => {
    useLibraryStore.getState().addPlayer('Alice')
    useLibraryStore.getState().addPlayer('Bob')
    let players = useLibraryStore.getState().players
    expect(players.map(p => p.name)).toEqual(['Alice', 'Bob'])
    useLibraryStore.getState().removePlayer(players[0].id)
    expect(useLibraryStore.getState().players.map(p => p.name)).toEqual(['Bob'])
  })

  it('adds a role with defaults (order by index, gameNightEnabled true)', () => {
    useLibraryStore.getState().addRole('Wolf', '#c00')
    useLibraryStore.getState().addRole('Seer', '#06c')
    const roles = useLibraryStore.getState().roles
    expect(roles[0]).toMatchObject({ name: 'Wolf', color: '#c00', order: 0, gameNightEnabled: true })
    expect(roles[1].order).toBe(1)
  })

  it('updateRole patches fields', () => {
    useLibraryStore.getState().addRole('Cupid', '#e0a')
    const id = useLibraryStore.getState().roles[0].id
    useLibraryStore.getState().updateRole(id, { gameNightEnabled: false })
    expect(useLibraryStore.getState().roles[0].gameNightEnabled).toBe(false)
  })

  it('reorderRoles rewrites order to match given id sequence', () => {
    useLibraryStore.getState().addRole('A', '#111')
    useLibraryStore.getState().addRole('B', '#222')
    useLibraryStore.getState().addRole('C', '#333')
    const [a, b, c] = useLibraryStore.getState().roles
    useLibraryStore.getState().reorderRoles([c.id, a.id, b.id])
    const byId = Object.fromEntries(useLibraryStore.getState().roles.map(r => [r.id, r.order]))
    expect(byId[c.id]).toBe(0)
    expect(byId[a.id]).toBe(1)
    expect(byId[b.id]).toBe(2)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- --run src/store/libraryStore.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Create `src/store/libraryStore.js`**

```js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { uid } from '../lib/id.js'

export const useLibraryStore = create(
  persist(
    (set) => ({
      players: [],
      roles: [],

      addPlayer: (name) =>
        set((s) => ({ players: [...s.players, { id: uid(), name: name.trim() }] })),
      removePlayer: (id) =>
        set((s) => ({ players: s.players.filter((p) => p.id !== id) })),

      addRole: (name, color) =>
        set((s) => ({
          roles: [
            ...s.roles,
            { id: uid(), name: name.trim(), color, gameNightEnabled: true, order: s.roles.length },
          ],
        })),
      updateRole: (id, patch) =>
        set((s) => ({ roles: s.roles.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
      removeRole: (id) =>
        set((s) => ({ roles: s.roles.filter((r) => r.id !== id) })),

      reorderRoles: (orderedIds) =>
        set((s) => ({
          roles: orderedIds.map((id, i) => ({ ...s.roles.find((r) => r.id === id), order: i })),
        })),
    }),
    { name: 'masoi-library' },
  ),
)
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test -- --run src/store/libraryStore.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/store/libraryStore.js src/store/libraryStore.test.js
git commit -m "feat: library store for reusable players and roles"
```

---

### Task 4: Game store (the core state machine, persisted)

**Files:**
- Create: `src/store/gameStore.js`
- Test: `src/store/gameStore.test.js`

**Interfaces:**
- Consumes: `uid` (Task 2), `VILLAGER` (Task 2).
- Produces: `useGameStore` + exported selectors. localStorage key `masoi-game`.
  - State: `active:boolean`, `players:{id,name}[]`, `roles:{...}[]` (ordered snapshot), `assignments:Record<playerId,roleId>`, `phase:'setup'|'day'|'night'`, `round:number`, `setupCursor:number`, `nightCursor:number`, `actionLog:Action[]`, `eliminated:string[]`.
  - `Action = { id, round, actor:roleId, target:playerId, type:'good'|'bad'|'info', note:string }`
  - Actions:
    - `startGame(players, roles)` — snapshot; roles sorted ascending by `order`; phase `'setup'`; round 0; cursors 0; clears assignments/log/eliminated; `active=true`.
    - `assignRole(roleId, playerIds)` — set assignments for that role (removes players previously mapped to it, adds the given ones).
    - `setupNext()` — if more roles remain, `setupCursor++`; else finalize: unassigned players → `'villager'`, `phase='day'`.
    - `logAction({ actor, target, type, note, round })` — append with generated id.
    - `startNight()` — `phase='night'`, `round++`, `nightCursor=0`.
    - `nightNext()` — `nightCursor = min(nightCursor+1, nightRoles.length)`.
    - `endNight()` — `phase='day'`.
    - `eliminate(playerId)` — add to `eliminated` (idempotent).
    - `endGame()` — reset to initial (`active=false`, everything cleared).
  - Selectors (pure, take state): `selectNightRoles(s)`, `selectRoleById(s, id)`, `selectPlayersByRole(s, roleId)`, `selectSurvivors(s)`, `selectAssignedPlayerIds(s)`.

- [ ] **Step 1: Write failing test `src/store/gameStore.test.js`**

```js
import { describe, it, expect, beforeEach } from 'vitest'
import {
  useGameStore, selectNightRoles, selectRoleById,
  selectPlayersByRole, selectSurvivors, selectAssignedPlayerIds,
} from './gameStore.js'

const players = [
  { id: 'p1', name: 'Al' }, { id: 'p2', name: 'Bo' },
  { id: 'p3', name: 'Cy' }, { id: 'p4', name: 'Di' },
]
const roles = [
  { id: 'wolf', name: 'Wolf', color: '#c00', gameNightEnabled: true, order: 1 },
  { id: 'seer', name: 'Seer', color: '#06c', gameNightEnabled: true, order: 0 },
  { id: 'cupid', name: 'Cupid', color: '#e0a', gameNightEnabled: false, order: 2 },
]
const g = () => useGameStore.getState()

describe('gameStore', () => {
  beforeEach(() => g().endGame())

  it('startGame snapshots and sorts roles by order', () => {
    g().startGame(players, roles)
    expect(g().active).toBe(true)
    expect(g().phase).toBe('setup')
    expect(g().roles.map(r => r.id)).toEqual(['seer', 'wolf', 'cupid'])
    expect(g().setupCursor).toBe(0)
  })

  it('assignRole maps players and is replaceable', () => {
    g().startGame(players, roles)
    g().assignRole('wolf', ['p1', 'p2'])
    expect(selectPlayersByRole(g(), 'wolf').map(p => p.id)).toEqual(['p1', 'p2'])
    g().assignRole('wolf', ['p1'])
    expect(selectPlayersByRole(g(), 'wolf').map(p => p.id)).toEqual(['p1'])
    expect(selectAssignedPlayerIds(g())).toEqual(['p1'])
  })

  it('setupNext advances then finalizes leftovers to villager', () => {
    g().startGame(players, roles)          // roles: seer, wolf, cupid
    g().assignRole('seer', ['p3'])
    g().setupNext()                        // -> wolf
    expect(g().setupCursor).toBe(1)
    g().assignRole('wolf', ['p1'])
    g().setupNext()                        // -> cupid
    g().assignRole('cupid', ['p2'])
    g().setupNext()                        // past end -> finalize
    expect(g().phase).toBe('day')
    // p4 unassigned -> villager
    expect(selectRoleById(g(), g().assignments['p4']).id).toBe('villager')
  })

  it('night flow: only gameNightEnabled roles, cursor caps at length', () => {
    g().startGame(players, roles)
    expect(selectNightRoles(g()).map(r => r.id)).toEqual(['seer', 'wolf']) // cupid excluded
    g().startNight()
    expect(g().phase).toBe('night')
    expect(g().round).toBe(1)
    g().nightNext()  // seer -> wolf
    g().nightNext()  // wolf -> summary (index 2 == length)
    g().nightNext()  // capped
    expect(g().nightCursor).toBe(2)
    g().endNight()
    expect(g().phase).toBe('day')
  })

  it('logAction appends with id and round', () => {
    g().startGame(players, roles)
    g().logAction({ actor: 'wolf', target: 'p3', type: 'bad', note: '', round: 1 })
    expect(g().actionLog).toHaveLength(1)
    expect(g().actionLog[0]).toMatchObject({ actor: 'wolf', target: 'p3', type: 'bad', round: 1 })
    expect(g().actionLog[0].id).toBeTruthy()
  })

  it('eliminate is idempotent; survivors excludes eliminated', () => {
    g().startGame(players, roles)
    g().eliminate('p1')
    g().eliminate('p1')
    expect(g().eliminated).toEqual(['p1'])
    expect(selectSurvivors(g()).map(p => p.id)).toEqual(['p2', 'p3', 'p4'])
  })

  it('selectRoleById returns VILLAGER for villager id', () => {
    g().startGame(players, roles)
    expect(selectRoleById(g(), 'villager').name).toBe('Villager')
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- --run src/store/gameStore.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Create `src/store/gameStore.js`**

```js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { uid } from '../lib/id.js'
import { VILLAGER } from '../lib/roles.js'

const initial = {
  active: false,
  players: [],
  roles: [],
  assignments: {},
  phase: 'setup',
  round: 0,
  setupCursor: 0,
  nightCursor: 0,
  actionLog: [],
  eliminated: [],
}

export const useGameStore = create(
  persist(
    (set, get) => ({
      ...initial,

      startGame: (players, roles) =>
        set({
          ...initial,
          active: true,
          players: players.map((p) => ({ id: p.id, name: p.name })),
          roles: [...roles].sort((a, b) => a.order - b.order),
        }),

      assignRole: (roleId, playerIds) =>
        set((s) => {
          const a = { ...s.assignments }
          for (const pid of Object.keys(a)) if (a[pid] === roleId) delete a[pid]
          for (const pid of playerIds) a[pid] = roleId
          return { assignments: a }
        }),

      setupNext: () =>
        set((s) => {
          if (s.setupCursor < s.roles.length - 1) return { setupCursor: s.setupCursor + 1 }
          const a = { ...s.assignments }
          for (const p of s.players) if (!a[p.id]) a[p.id] = 'villager'
          return { assignments: a, phase: 'day' }
        }),

      logAction: ({ actor, target, type, note = '', round }) =>
        set((s) => ({
          actionLog: [...s.actionLog, { id: uid(), actor, target, type, note, round }],
        })),

      startNight: () =>
        set((s) => ({ phase: 'night', round: s.round + 1, nightCursor: 0 })),

      nightNext: () =>
        set((s) => ({
          nightCursor: Math.min(s.nightCursor + 1, selectNightRoles(s).length),
        })),

      endNight: () => set({ phase: 'day' }),

      eliminate: (playerId) =>
        set((s) =>
          s.eliminated.includes(playerId)
            ? s
            : { eliminated: [...s.eliminated, playerId] },
        ),

      endGame: () => set({ ...initial }),
    }),
    { name: 'masoi-game' },
  ),
)

export const selectNightRoles = (s) => s.roles.filter((r) => r.gameNightEnabled)
export const selectRoleById = (s, id) =>
  id === 'villager' ? VILLAGER : s.roles.find((r) => r.id === id) || VILLAGER
export const selectPlayersByRole = (s, roleId) =>
  s.players.filter((p) => s.assignments[p.id] === roleId)
export const selectSurvivors = (s) => s.players.filter((p) => !s.eliminated.includes(p.id))
export const selectAssignedPlayerIds = (s) => Object.keys(s.assignments)
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test -- --run src/store/gameStore.test.js`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/store/gameStore.js src/store/gameStore.test.js
git commit -m "feat: game store state machine (setup/day/night, actions, eliminations)"
```

---

### Task 5: Shared components (ConfirmDialog, Toggle, ActionPanel)

**Files:**
- Create: `src/components/ConfirmDialog.jsx`, `src/components/Toggle.jsx`, `src/components/ActionPanel.jsx`, `src/components/components.css`
- Modify: `src/main.jsx` (import `components.css`) — actually import in each screen; instead import in `index.css` via `@import`. Use `@import './components/components.css';` — NO: put a plain import in `main.jsx`.
- Test: `src/components/ActionPanel.test.jsx`

**Interfaces:**
- Consumes: `useGameStore`, `selectSurvivors`, `selectRoleById` (Task 4).
- Produces:
  - `<ConfirmDialog message open onConfirm onCancel />`
  - `<Toggle checked onChange label />`
  - `<ActionPanel role round />` — lets admin pick a surviving target, a type (Good/Bad/Info), an optional note, and add it to the game log for `role.id` at `round`. Lists actions already logged for this `(actor=role.id, round)`.

- [ ] **Step 1: Add CSS import to `src/main.jsx`**

Modify `src/main.jsx` — add after `import './index.css'`:

```jsx
import './components/components.css'
```

- [ ] **Step 2: Create `src/components/components.css`**

```css
.dialog-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,.5);
  display: flex; align-items: center; justify-content: center; z-index: 10;
}
.dialog { background: Canvas; color: CanvasText; padding: 20px; border-radius: 8px; min-width: 260px; }
.dialog-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
.toggle { display: inline-flex; align-items: center; gap: 6px; }
.action-panel { border: 1px solid #8884; border-radius: 8px; padding: 12px; }
.type-btns { display: flex; gap: 8px; margin: 8px 0; }
.type-btns button[aria-pressed="true"] { outline: 2px solid currentColor; }
.type-good { color: #2a8; } .type-bad { color: #d33; } .type-info { color: #48c; }
.logged-list { list-style: none; padding: 0; margin: 8px 0 0; font-size: .9em; }
```

- [ ] **Step 3: Create `src/components/ConfirmDialog.jsx`**

```jsx
export default function ConfirmDialog({ message, open, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true">
      <div className="dialog">
        <p>{message}</p>
        <div className="dialog-actions">
          <button onClick={onCancel}>Cancel</button>
          <button onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create `src/components/Toggle.jsx`**

```jsx
export default function Toggle({ checked, onChange, label }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  )
}
```

- [ ] **Step 5: Write failing test `src/components/ActionPanel.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import ActionPanel from './ActionPanel.jsx'
import { useGameStore } from '../store/gameStore.js'

const players = [{ id: 'p1', name: 'Al' }, { id: 'p2', name: 'Bo' }]
const roles = [{ id: 'wolf', name: 'Wolf', color: '#c00', gameNightEnabled: true, order: 0 }]

describe('ActionPanel', () => {
  beforeEach(() => {
    useGameStore.getState().endGame()
    useGameStore.getState().startGame(players, roles)
  })

  it('logs an action with selected target and type', async () => {
    const user = userEvent.setup()
    render(<ActionPanel role={roles[0]} round={1} />)
    await user.selectOptions(screen.getByLabelText(/target/i), 'p2')
    await user.click(screen.getByRole('button', { name: /bad/i }))
    await user.click(screen.getByRole('button', { name: /add action/i }))
    const log = useGameStore.getState().actionLog
    expect(log).toHaveLength(1)
    expect(log[0]).toMatchObject({ actor: 'wolf', target: 'p2', type: 'bad', round: 1 })
    // shows in logged list
    expect(screen.getByText(/Bo/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 6: Run to verify it fails**

Run: `npm test -- --run src/components/ActionPanel.test.jsx`
Expected: FAIL — module not found.

- [ ] **Step 7: Create `src/components/ActionPanel.jsx`**

```jsx
import { useState } from 'react'
import { useGameStore, selectSurvivors, selectRoleById } from '../store/gameStore.js'

const TYPES = [
  { key: 'good', label: 'Good' },
  { key: 'bad', label: 'Bad' },
  { key: 'info', label: 'Info' },
]

export default function ActionPanel({ role, round }) {
  const survivors = useGameStore(selectSurvivors)
  const logAction = useGameStore((s) => s.logAction)
  const actions = useGameStore((s) =>
    s.actionLog.filter((a) => a.actor === role.id && a.round === round),
  )
  const state = useGameStore.getState()

  const [target, setTarget] = useState('')
  const [type, setType] = useState('bad')
  const [note, setNote] = useState('')

  const add = () => {
    if (!target) return
    logAction({ actor: role.id, target, type, note, round })
    setTarget(''); setNote(''); setType('bad')
  }

  return (
    <div className="action-panel">
      <label>
        Target:{' '}
        <select aria-label="target" value={target} onChange={(e) => setTarget(e.target.value)}>
          <option value="">— select —</option>
          {survivors.map((p) => {
            const r = selectRoleById(state, state.assignments[p.id])
            return <option key={p.id} value={p.id}>{p.name} ({r.name})</option>
          })}
        </select>
      </label>

      <div className="type-btns">
        {TYPES.map((t) => (
          <button
            key={t.key}
            className={`type-${t.key}`}
            aria-pressed={type === t.key}
            onClick={() => setType(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <input
        placeholder="note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <button onClick={add}>Add action</button>

      <ul className="logged-list">
        {actions.map((a) => {
          const p = state.players.find((x) => x.id === a.target)
          return (
            <li key={a.id} className={`type-${a.type}`}>
              {role.name} — {a.type} → {p?.name}{a.note ? ` (${a.note})` : ''}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
```

- [ ] **Step 8: Run to verify it passes**

Run: `npm test -- --run src/components/ActionPanel.test.jsx`
Expected: PASS.

- [ ] **Step 9: Full test run + build**

Run: `npm test -- --run && npm run build`
Expected: all pass, build succeeds.

- [ ] **Step 10: Commit**

```bash
git add src/components src/main.jsx
git commit -m "feat: shared ConfirmDialog, Toggle, ActionPanel components"
```

---

### Task 6: NewGame screen (pick players/roles, drag order, toggles, start)

**Files:**
- Create: `src/screens/NewGame.jsx`, `src/screens/RoleOrder.jsx`, `src/screens/newgame.css`
- Modify: `src/App.jsx` (route to NewGame when no active game), `src/main.jsx` (import `newgame.css`)
- Test: `src/screens/NewGame.test.jsx`

**Interfaces:**
- Consumes: `useLibraryStore` (Task 3), `useGameStore.startGame` (Task 4), `Toggle` (Task 5), dnd-kit.
- Produces: `<NewGame />`. Selecting players + roles and clicking Start calls `startGame(selectedPlayers, selectedRolesWithCurrentOrder)`. `<RoleOrder roles onReorder onToggle />` — sortable list with per-row game-night toggle.

- [ ] **Step 1: Add CSS import to `src/main.jsx`**

Add: `import './screens/newgame.css'`

- [ ] **Step 2: Create `src/screens/newgame.css`**

```css
.ng-section { margin: 16px 0; }
.chip-row { display: flex; flex-wrap: wrap; gap: 8px; }
.chip { border: 1px solid #8886; border-radius: 999px; padding: 4px 12px; background: transparent; }
.chip[aria-pressed="true"] { background: #48c3; border-color: #48c; }
.role-order-item {
  display: flex; align-items: center; gap: 12px;
  padding: 8px; border: 1px solid #8884; border-radius: 6px; margin-bottom: 6px; background: Canvas;
}
.drag-handle { cursor: grab; padding: 0 6px; }
.inline-add { display: flex; gap: 6px; margin-top: 8px; }
.start-btn { margin-top: 16px; padding: 10px 20px; font-weight: 600; }
```

- [ ] **Step 3: Create `src/screens/RoleOrder.jsx`**

```jsx
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Toggle from '../components/Toggle.jsx'

function Row({ role, onToggle }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: role.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  return (
    <div ref={setNodeRef} style={style} className="role-order-item">
      <span className="drag-handle" {...attributes} {...listeners} aria-label={`drag ${role.name}`}>⠿</span>
      <span style={{ color: role.color, fontWeight: 600, flex: 1 }}>{role.name}</span>
      <Toggle
        checked={role.gameNightEnabled}
        onChange={(v) => onToggle(role.id, v)}
        label="call on game nights"
      />
    </div>
  )
}

export default function RoleOrder({ roles, onReorder, onToggle }) {
  const sensors = useSensors(useSensor(PointerSensor))
  const ids = roles.map((r) => r.id)

  const handleEnd = (e) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const next = arrayMove(ids, ids.indexOf(active.id), ids.indexOf(over.id))
    onReorder(next)
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {roles.map((r) => <Row key={r.id} role={r} onToggle={onToggle} />)}
      </SortableContext>
    </DndContext>
  )
}
```

- [ ] **Step 4: Create `src/screens/NewGame.jsx`**

```jsx
import { useState } from 'react'
import { useLibraryStore } from '../store/libraryStore.js'
import { useGameStore } from '../store/gameStore.js'
import RoleOrder from './RoleOrder.jsx'

export default function NewGame() {
  const { players, roles, addPlayer, addRole, updateRole, reorderRoles } = useLibraryStore()
  const startGame = useGameStore((s) => s.startGame)

  const [selPlayers, setSelPlayers] = useState(() => new Set())
  const [selRoles, setSelRoles] = useState(() => new Set())
  const [pName, setPName] = useState('')
  const [rName, setRName] = useState('')
  const [rColor, setRColor] = useState('#4488cc')

  const toggle = (set, setter) => (id) => {
    const next = new Set(set)
    next.has(id) ? next.delete(id) : next.add(id)
    setter(next)
  }

  const orderedSelectedRoles = roles
    .filter((r) => selRoles.has(r.id))
    .sort((a, b) => a.order - b.order)

  const canStart = selPlayers.size > 0 && selRoles.size > 0

  const start = () => {
    startGame(
      players.filter((p) => selPlayers.has(p.id)),
      orderedSelectedRoles,
    )
  }

  return (
    <div className="app">
      <h1>Werewolf Admin — New Game</h1>

      <section className="ng-section">
        <h2>Players</h2>
        <div className="chip-row">
          {players.map((p) => (
            <button
              key={p.id}
              className="chip"
              aria-pressed={selPlayers.has(p.id)}
              onClick={() => toggle(selPlayers, setSelPlayers)(p.id)}
            >
              {p.name}
            </button>
          ))}
        </div>
        <div className="inline-add">
          <input placeholder="new player" value={pName} onChange={(e) => setPName(e.target.value)} />
          <button onClick={() => { if (pName.trim()) { addPlayer(pName); setPName('') } }}>Add</button>
        </div>
      </section>

      <section className="ng-section">
        <h2>Roles</h2>
        <div className="chip-row">
          {roles.map((r) => (
            <button
              key={r.id}
              className="chip"
              aria-pressed={selRoles.has(r.id)}
              style={{ borderColor: selRoles.has(r.id) ? r.color : undefined }}
              onClick={() => toggle(selRoles, setSelRoles)(r.id)}
            >
              {r.name}
            </button>
          ))}
        </div>
        <div className="inline-add">
          <input placeholder="new role" value={rName} onChange={(e) => setRName(e.target.value)} />
          <input type="color" value={rColor} onChange={(e) => setRColor(e.target.value)} aria-label="role color" />
          <button onClick={() => { if (rName.trim()) { addRole(rName, rColor); setRName('') } }}>Add</button>
        </div>
      </section>

      {orderedSelectedRoles.length > 0 && (
        <section className="ng-section">
          <h2>Night call order</h2>
          <p>Drag to reorder. Toggle off roles that are only called during setup (first night).</p>
          <RoleOrder
            roles={orderedSelectedRoles}
            onReorder={reorderRoles}
            onToggle={(id, v) => updateRole(id, { gameNightEnabled: v })}
          />
        </section>
      )}

      <button className="start-btn" disabled={!canStart} onClick={start}>Start Game</button>
    </div>
  )
}
```

- [ ] **Step 5: Modify `src/App.jsx` to route on game state**

```jsx
import { useGameStore } from './store/gameStore.js'
import NewGame from './screens/NewGame.jsx'

export default function App() {
  const active = useGameStore((s) => s.active)
  if (!active) return <NewGame />
  return (
    <div className="app">
      <h1>Werewolf Admin</h1>
      <p>Game in progress (phase: {useGameStore.getState().phase})</p>
    </div>
  )
}
```

- [ ] **Step 6: Update `src/App.test.jsx`** (heading now lives in NewGame; ensure a clean store)

```jsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import App from './App.jsx'
import { useGameStore } from './store/gameStore.js'

describe('App', () => {
  beforeEach(() => useGameStore.getState().endGame())
  it('shows New Game screen when no active game', () => {
    render(<App />)
    expect(screen.getByText(/new game/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 7: Write failing test `src/screens/NewGame.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import NewGame from './NewGame.jsx'
import { useLibraryStore } from '../store/libraryStore.js'
import { useGameStore } from '../store/gameStore.js'

describe('NewGame', () => {
  beforeEach(() => {
    useLibraryStore.setState({ players: [], roles: [] })
    useGameStore.getState().endGame()
    useLibraryStore.getState().addPlayer('Al')
    useLibraryStore.getState().addPlayer('Bo')
    useLibraryStore.getState().addRole('Wolf', '#c00')
  })

  it('start is disabled until a player and role are selected', async () => {
    const user = userEvent.setup()
    render(<NewGame />)
    const start = screen.getByRole('button', { name: /start game/i })
    expect(start).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Al' }))
    await user.click(screen.getByRole('button', { name: 'Wolf' }))
    expect(start).toBeEnabled()
  })

  it('starting a game activates the game store in setup phase', async () => {
    const user = userEvent.setup()
    render(<NewGame />)
    await user.click(screen.getByRole('button', { name: 'Al' }))
    await user.click(screen.getByRole('button', { name: 'Wolf' }))
    await user.click(screen.getByRole('button', { name: /start game/i }))
    expect(useGameStore.getState().active).toBe(true)
    expect(useGameStore.getState().phase).toBe('setup')
    expect(useGameStore.getState().players).toHaveLength(1)
  })
})
```

- [ ] **Step 8: Run tests to verify NewGame passes, fix imports if needed**

Run: `npm test -- --run`
Expected: PASS (App + NewGame + prior tests).

- [ ] **Step 9: Build check**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 10: Commit**

```bash
git add src/screens/NewGame.jsx src/screens/RoleOrder.jsx src/screens/newgame.css src/App.jsx src/App.test.jsx src/screens/NewGame.test.jsx src/main.jsx
git commit -m "feat: NewGame screen with player/role selection and drag ordering"
```

---

### Task 7: Setup screen (assign roles + first-night actions)

**Files:**
- Create: `src/screens/Setup.jsx`, `src/screens/setup.css`
- Modify: `src/App.jsx` (route `phase==='setup'` → Setup), `src/main.jsx` (import `setup.css`)
- Test: `src/screens/Setup.test.jsx`

**Interfaces:**
- Consumes: `useGameStore` (`assignRole`, `setupNext`, state), selectors `selectPlayersByRole`, `selectAssignedPlayerIds` (Task 4), `ActionPanel` (Task 5).
- Produces: `<Setup />`. Walks `roles[setupCursor]`; multi-select unassigned players (plus any already on this role); ActionPanel logs round-0 actions; Next assigns + advances.

- [ ] **Step 1: Add CSS import to `src/main.jsx`**

Add: `import './screens/setup.css'`

- [ ] **Step 2: Create `src/screens/setup.css`**

```css
.setup-layout { display: grid; grid-template-columns: 1fr 260px; gap: 16px; }
.player-select-list { list-style: none; padding: 0; }
.player-select-list li { margin: 4px 0; }
.role-heading { font-size: 1.4em; }
.setup-progress { color: #888; }
```

- [ ] **Step 3: Write failing test `src/screens/Setup.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import Setup from './Setup.jsx'
import { useGameStore } from '../store/gameStore.js'

const players = [{ id: 'p1', name: 'Al' }, { id: 'p2', name: 'Bo' }, { id: 'p3', name: 'Cy' }]
const roles = [
  { id: 'wolf', name: 'Wolf', color: '#c00', gameNightEnabled: true, order: 0 },
  { id: 'seer', name: 'Seer', color: '#06c', gameNightEnabled: true, order: 1 },
]

describe('Setup', () => {
  beforeEach(() => {
    useGameStore.getState().endGame()
    useGameStore.getState().startGame(players, roles)
  })

  it('assigns selected players to current role and advances', async () => {
    const user = userEvent.setup()
    render(<Setup />)
    expect(screen.getByText('Wolf')).toBeInTheDocument()
    await user.click(screen.getByRole('checkbox', { name: 'Al' }))
    await user.click(screen.getByRole('checkbox', { name: 'Bo' }))
    await user.click(screen.getByRole('button', { name: /next/i }))
    // now Seer step
    expect(screen.getByText('Seer')).toBeInTheDocument()
    // Al and Bo already assigned to Wolf -> not selectable now
    expect(screen.queryByRole('checkbox', { name: 'Al' })).toBeNull()
    expect(screen.getByRole('checkbox', { name: 'Cy' })).toBeInTheDocument()
  })

  it('finishing last role finalizes leftovers to villager and goes to day', async () => {
    const user = userEvent.setup()
    render(<Setup />)
    await user.click(screen.getByRole('checkbox', { name: 'Al' }))      // wolf
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('checkbox', { name: 'Bo' }))      // seer
    await user.click(screen.getByRole('button', { name: /next/i }))     // finalize
    const s = useGameStore.getState()
    expect(s.phase).toBe('day')
    expect(s.assignments['p3']).toBe('villager')
  })
})
```

- [ ] **Step 4: Run to verify it fails**

Run: `npm test -- --run src/screens/Setup.test.jsx`
Expected: FAIL — module not found.

- [ ] **Step 5: Create `src/screens/Setup.jsx`**

```jsx
import { useState, useEffect } from 'react'
import { useGameStore, selectPlayersByRole } from '../store/gameStore.js'
import ActionPanel from '../components/ActionPanel.jsx'

export default function Setup() {
  const roles = useGameStore((s) => s.roles)
  const cursor = useGameStore((s) => s.setupCursor)
  const players = useGameStore((s) => s.players)
  const assignments = useGameStore((s) => s.assignments)
  const assignRole = useGameStore((s) => s.assignRole)
  const setupNext = useGameStore((s) => s.setupNext)

  const role = roles[cursor]
  const [selected, setSelected] = useState(() => new Set())

  // When the role step changes, preload players already on this role, and reset.
  useEffect(() => {
    const onRole = players.filter((p) => assignments[p.id] === role.id).map((p) => p.id)
    setSelected(new Set(onRole))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor])

  // Selectable = unassigned OR already on this role.
  const selectable = players.filter(
    (p) => !assignments[p.id] || assignments[p.id] === role.id,
  )

  const toggle = (id) => {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }

  const next = () => {
    assignRole(role.id, [...selected])
    setupNext()
  }

  return (
    <div className="app">
      <h1>Know the Roles</h1>
      <p className="setup-progress">Role {cursor + 1} of {roles.length}</p>
      <div className="setup-layout">
        <div>
          <h2 className="role-heading" style={{ color: role.color }}>{role.name}</h2>
          <p>Select the player(s) with this role:</p>
          <ul className="player-select-list">
            {selectable.map((p) => (
              <li key={p.id}>
                <label className="toggle">
                  <input
                    type="checkbox"
                    aria-label={p.name}
                    checked={selected.has(p.id)}
                    onChange={() => toggle(p.id)}
                  />
                  {p.name}
                </label>
              </li>
            ))}
          </ul>
          <button onClick={next}>Next →</button>
        </div>
        <aside>
          <h3>First-night action (optional)</h3>
          <ActionPanel role={role} round={0} />
        </aside>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Modify `src/App.jsx` to route setup**

```jsx
import { useGameStore } from './store/gameStore.js'
import NewGame from './screens/NewGame.jsx'
import Setup from './screens/Setup.jsx'

export default function App() {
  const active = useGameStore((s) => s.active)
  const phase = useGameStore((s) => s.phase)
  if (!active) return <NewGame />
  if (phase === 'setup') return <Setup />
  return (
    <div className="app">
      <h1>Werewolf Admin</h1>
      <p>phase: {phase}</p>
    </div>
  )
}
```

- [ ] **Step 7: Run tests to verify Setup passes**

Run: `npm test -- --run src/screens/Setup.test.jsx`
Expected: PASS (2 tests).

- [ ] **Step 8: Full test + build**

Run: `npm test -- --run && npm run build`
Expected: all pass, build ok.

- [ ] **Step 9: Commit**

```bash
git add src/screens/Setup.jsx src/screens/setup.css src/screens/Setup.test.jsx src/App.jsx src/main.jsx
git commit -m "feat: Setup screen (role assignment + first-night actions)"
```

---

### Task 8: Day screen (grid, eliminate, history sidebar, go-to-night, end game)

**Files:**
- Create: `src/screens/Day.jsx`, `src/components/TopBar.jsx`, `src/components/HistorySidebar.jsx`, `src/screens/day.css`
- Modify: `src/App.jsx` (route `phase==='day'`), `src/main.jsx` (import `day.css`)
- Test: `src/screens/Day.test.jsx`

**Interfaces:**
- Consumes: `useGameStore` (`eliminate`, `startNight`, `endGame`, state), selectors `selectRoleById` (Task 4), `ConfirmDialog` (Task 5).
- Produces:
  - `<TopBar onNight onEndGame />`
  - `<HistorySidebar />` — renders `actionLog` in order as `Actor(Role) — type → Target(Role)`.
  - `<Day />` — grid of player cards; click card → menu with Eliminate (confirm); eliminated cards get `.eliminated` class.

- [ ] **Step 1: Add CSS import to `src/main.jsx`**

Add: `import './screens/day.css'`

- [ ] **Step 2: Create `src/screens/day.css`**

```css
.day-layout { display: grid; grid-template-columns: 1fr 280px; gap: 16px; }
.topbar { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; }
.topbar .spacer { flex: 1; }
.player-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px; }
.player-card {
  border: 2px solid; border-radius: 8px; padding: 12px; text-align: center; position: relative;
}
.player-card .role-tag { font-size: .85em; opacity: .8; }
.card-menu { position: absolute; inset: auto 0 -8px 0; transform: translateY(100%);
  background: Canvas; border: 1px solid #8888; border-radius: 6px; padding: 6px; z-index: 5; }
.history { list-style: none; padding: 0; font-size: .9em; max-height: 70vh; overflow: auto; }
.history li { padding: 4px 0; border-bottom: 1px solid #8883; }
```

- [ ] **Step 3: Create `src/components/TopBar.jsx`**

```jsx
export default function TopBar({ phaseLabel, onNight, onEndGame }) {
  return (
    <div className="topbar">
      <strong>{phaseLabel}</strong>
      <span className="spacer" />
      {onNight && <button onClick={onNight}>Go to Night 🌙</button>}
      <button onClick={onEndGame}>End Game</button>
    </div>
  )
}
```

- [ ] **Step 4: Create `src/components/HistorySidebar.jsx`**

```jsx
import { useGameStore, selectRoleById } from '../store/gameStore.js'

export default function HistorySidebar() {
  const log = useGameStore((s) => s.actionLog)
  const state = useGameStore.getState()
  const nameOf = (pid) => state.players.find((p) => p.id === pid)?.name ?? '?'

  return (
    <aside>
      <h3>History</h3>
      <ul className="history">
        {log.map((a) => {
          const actor = selectRoleById(state, a.actor)
          const targetRole = selectRoleById(state, state.assignments[a.target])
          return (
            <li key={a.id} className={`type-${a.type}`}>
              R{a.round} · {actor.name} — {a.type} → {nameOf(a.target)} ({targetRole.name})
              {a.note ? ` — ${a.note}` : ''}
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
```

- [ ] **Step 5: Write failing test `src/screens/Day.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import Day from './Day.jsx'
import { useGameStore } from '../store/gameStore.js'

const players = [{ id: 'p1', name: 'Al' }, { id: 'p2', name: 'Bo' }]
const roles = [{ id: 'wolf', name: 'Wolf', color: '#c00', gameNightEnabled: true, order: 0 }]

describe('Day', () => {
  beforeEach(() => {
    useGameStore.getState().endGame()
    useGameStore.getState().startGame(players, roles)
    useGameStore.getState().assignRole('wolf', ['p1'])
    useGameStore.setState({ phase: 'day', assignments: { p1: 'wolf', p2: 'villager' } })
  })

  it('eliminates a player after confirmation', async () => {
    const user = userEvent.setup()
    render(<Day />)
    await user.click(screen.getByText('Bo'))
    await user.click(screen.getByRole('button', { name: /eliminate/i }))
    await user.click(screen.getByRole('button', { name: /confirm/i }))
    expect(useGameStore.getState().eliminated).toContain('p2')
    expect(screen.getByText('Bo').closest('.player-card')).toHaveClass('eliminated')
  })

  it('Go to Night switches phase and increments round', async () => {
    const user = userEvent.setup()
    render(<Day />)
    await user.click(screen.getByRole('button', { name: /go to night/i }))
    expect(useGameStore.getState().phase).toBe('night')
    expect(useGameStore.getState().round).toBe(1)
  })
})
```

- [ ] **Step 6: Run to verify it fails**

Run: `npm test -- --run src/screens/Day.test.jsx`
Expected: FAIL — module not found.

- [ ] **Step 7: Create `src/screens/Day.jsx`**

```jsx
import { useState } from 'react'
import { useGameStore, selectRoleById } from '../store/gameStore.js'
import TopBar from '../components/TopBar.jsx'
import HistorySidebar from '../components/HistorySidebar.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'

export default function Day() {
  const players = useGameStore((s) => s.players)
  const assignments = useGameStore((s) => s.assignments)
  const eliminated = useGameStore((s) => s.eliminated)
  const eliminate = useGameStore((s) => s.eliminate)
  const startNight = useGameStore((s) => s.startNight)
  const endGame = useGameStore((s) => s.endGame)
  const state = useGameStore.getState()

  const [menuFor, setMenuFor] = useState(null)   // playerId with open menu
  const [confirmFor, setConfirmFor] = useState(null)

  return (
    <div className="app">
      <TopBar phaseLabel="☀️ Day" onNight={startNight} onEndGame={endGame} />
      <div className="day-layout">
        <div className="player-grid">
          {players.map((p) => {
            const role = selectRoleById(state, assignments[p.id])
            const dead = eliminated.includes(p.id)
            return (
              <div
                key={p.id}
                className={`player-card${dead ? ' eliminated' : ''}`}
                style={{ borderColor: role.color }}
                onClick={() => !dead && setMenuFor(menuFor === p.id ? null : p.id)}
              >
                <div>{p.name}</div>
                <div className="role-tag">{role.name}</div>
                {menuFor === p.id && !dead && (
                  <div className="card-menu" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => { setConfirmFor(p.id); setMenuFor(null) }}>Eliminate</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <HistorySidebar />
      </div>

      <ConfirmDialog
        open={confirmFor !== null}
        message={`Eliminate ${players.find((p) => p.id === confirmFor)?.name}?`}
        onCancel={() => setConfirmFor(null)}
        onConfirm={() => { eliminate(confirmFor); setConfirmFor(null) }}
      />
    </div>
  )
}
```

- [ ] **Step 8: Modify `src/App.jsx` to route day**

```jsx
import { useGameStore } from './store/gameStore.js'
import NewGame from './screens/NewGame.jsx'
import Setup from './screens/Setup.jsx'
import Day from './screens/Day.jsx'

export default function App() {
  const active = useGameStore((s) => s.active)
  const phase = useGameStore((s) => s.phase)
  if (!active) return <NewGame />
  if (phase === 'setup') return <Setup />
  if (phase === 'day') return <Day />
  return (
    <div className="app">
      <h1>Werewolf Admin</h1>
      <p>phase: {phase}</p>
    </div>
  )
}
```

- [ ] **Step 9: Run tests to verify Day passes**

Run: `npm test -- --run src/screens/Day.test.jsx`
Expected: PASS (2 tests).

- [ ] **Step 10: Full test + build**

Run: `npm test -- --run && npm run build`
Expected: all pass, build ok.

- [ ] **Step 11: Commit**

```bash
git add src/screens/Day.jsx src/screens/day.css src/screens/Day.test.jsx src/components/TopBar.jsx src/components/HistorySidebar.jsx src/App.jsx src/main.jsx
git commit -m "feat: Day screen with player grid, eliminations, history"
```

---

### Task 9: Night screen (role calls, action logging, night summary) + PWA config

**Files:**
- Create: `src/screens/Night.jsx`, `src/screens/night.css`
- Modify: `src/App.jsx` (route `phase==='night'`), `src/main.jsx` (import `night.css`), `vite.config.js` (add PWA plugin), `index.html` (theme-color meta), create `public/pwa-192.png` + `public/pwa-512.png` (placeholder icons — see step note)
- Test: `src/screens/Night.test.jsx`

**Interfaces:**
- Consumes: `useGameStore` (`nightNext`, `endNight`, `eliminate`, state), selectors `selectNightRoles`, `selectRoleById`, `selectSurvivors` (Task 4), `ActionPanel` (Task 5), `ConfirmDialog` (Task 5).
- Produces: `<Night />`. While `nightCursor < nightRoles.length`: show current role, its previous-round actions, ActionPanel (current round), Done (`nightNext`) / Skip (`nightNext`). When `nightCursor === length`: NightSummary — this round's actions in order + survivor list to eliminate + "Finish Night" (`endNight`).

- [ ] **Step 1: Add CSS import to `src/main.jsx`**

Add: `import './screens/night.css'`

- [ ] **Step 2: Create `src/screens/night.css`**

```css
.night-layout { display: grid; grid-template-columns: 1fr 260px; gap: 16px; }
.night-role { font-size: 1.5em; }
.prev-actions { font-size: .9em; color: #999; }
.survivor-list { list-style: none; padding: 0; }
.survivor-list li { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; }
.summary-list { padding-left: 18px; }
.night-nav { display: flex; gap: 8px; margin-top: 12px; }
```

- [ ] **Step 3: Write failing test `src/screens/Night.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import Night from './Night.jsx'
import { useGameStore } from '../store/gameStore.js'

const players = [{ id: 'p1', name: 'Al' }, { id: 'p2', name: 'Bo' }, { id: 'p3', name: 'Cy' }]
const roles = [
  { id: 'wolf', name: 'Wolf', color: '#c00', gameNightEnabled: true, order: 0 },
  { id: 'cupid', name: 'Cupid', color: '#e0a', gameNightEnabled: false, order: 1 },
]

describe('Night', () => {
  beforeEach(() => {
    useGameStore.getState().endGame()
    useGameStore.getState().startGame(players, roles)
    useGameStore.setState({ assignments: { p1: 'wolf', p2: 'villager', p3: 'villager' } })
    useGameStore.getState().startNight()  // phase night, round 1, cursor 0
  })

  it('shows only game-night roles and advances to summary', async () => {
    const user = userEvent.setup()
    render(<Night />)
    expect(screen.getByText('Wolf')).toBeInTheDocument()   // cupid excluded
    await user.click(screen.getByRole('button', { name: /done|skip/i }))
    // only 1 night role -> now summary
    expect(screen.getByText(/night summary/i)).toBeInTheDocument()
  })

  it('summary can eliminate a player then finish night to day', async () => {
    const user = userEvent.setup()
    render(<Night />)
    await user.click(screen.getByRole('button', { name: /skip/i }))  // -> summary
    await user.click(screen.getByRole('button', { name: /eliminate Bo/i }))
    expect(useGameStore.getState().eliminated).toContain('p2')
    await user.click(screen.getByRole('button', { name: /finish night/i }))
    expect(useGameStore.getState().phase).toBe('day')
  })
})
```

- [ ] **Step 4: Run to verify it fails**

Run: `npm test -- --run src/screens/Night.test.jsx`
Expected: FAIL — module not found.

- [ ] **Step 5: Create `src/screens/Night.jsx`**

```jsx
import {
  useGameStore, selectNightRoles, selectRoleById, selectSurvivors,
} from '../store/gameStore.js'
import ActionPanel from '../components/ActionPanel.jsx'

function NightSummary() {
  const round = useGameStore((s) => s.round)
  const endNight = useGameStore((s) => s.endNight)
  const eliminate = useGameStore((s) => s.eliminate)
  const survivors = useGameStore(selectSurvivors)
  const actions = useGameStore((s) => s.actionLog.filter((a) => a.round === round))
  const state = useGameStore.getState()
  const nameOf = (pid) => state.players.find((p) => p.id === pid)?.name ?? '?'

  return (
    <div>
      <h2>Night Summary — Round {round}</h2>
      <ol className="summary-list">
        {actions.map((a) => (
          <li key={a.id} className={`type-${a.type}`}>
            {selectRoleById(state, a.actor).name} — {a.type} → {nameOf(a.target)}
            {a.note ? ` (${a.note})` : ''}
          </li>
        ))}
        {actions.length === 0 && <li>No actions logged.</li>}
      </ol>
      <h3>Eliminate (admin decision):</h3>
      <ul className="survivor-list">
        {survivors.map((p) => (
          <li key={p.id}>
            {p.name} ({selectRoleById(state, state.assignments[p.id]).name})
            <button onClick={() => eliminate(p.id)}>Eliminate {p.name}</button>
          </li>
        ))}
      </ul>
      <button onClick={endNight}>Finish Night → Day ☀️</button>
    </div>
  )
}

function RoleCall({ role, round }) {
  const nightNext = useGameStore((s) => s.nightNext)
  const survivors = useGameStore(selectSurvivors)
  const prev = useGameStore((s) =>
    s.actionLog.filter((a) => a.actor === role.id && a.round === round - 1),
  )
  const state = useGameStore.getState()
  const nameOf = (pid) => state.players.find((p) => p.id === pid)?.name ?? '?'

  return (
    <div className="night-layout">
      <div>
        <h2 className="night-role" style={{ color: role.color }}>{role.name}</h2>
        {prev.length > 0 && (
          <p className="prev-actions">
            Last night: {prev.map((a) => `${a.type}→${nameOf(a.target)}`).join(', ')}
          </p>
        )}
        <ActionPanel role={role} round={round} />
        <div className="night-nav">
          <button onClick={nightNext}>Done →</button>
          <button onClick={nightNext}>Skip →</button>
        </div>
      </div>
      <aside>
        <h3>Surviving players</h3>
        <ul className="survivor-list">
          {survivors.map((p) => (
            <li key={p.id}>{p.name} ({selectRoleById(state, state.assignments[p.id]).name})</li>
          ))}
        </ul>
      </aside>
    </div>
  )
}

export default function Night() {
  const cursor = useGameStore((s) => s.nightCursor)
  const round = useGameStore((s) => s.round)
  const nightRoles = useGameStore(selectNightRoles)
  const atSummary = cursor >= nightRoles.length

  return (
    <div className="app">
      <h1>🌙 Night — Round {round}</h1>
      {atSummary ? <NightSummary /> : <RoleCall role={nightRoles[cursor]} round={round} />}
    </div>
  )
}
```

- [ ] **Step 6: Modify `src/App.jsx` to route night (final routing)**

```jsx
import { useGameStore } from './store/gameStore.js'
import NewGame from './screens/NewGame.jsx'
import Setup from './screens/Setup.jsx'
import Day from './screens/Day.jsx'
import Night from './screens/Night.jsx'

export default function App() {
  const active = useGameStore((s) => s.active)
  const phase = useGameStore((s) => s.phase)
  if (!active) return <NewGame />
  if (phase === 'setup') return <Setup />
  if (phase === 'night') return <Night />
  return <Day />
}
```

- [ ] **Step 7: Run tests to verify Night passes**

Run: `npm test -- --run src/screens/Night.test.jsx`
Expected: PASS (2 tests).

- [ ] **Step 8: Add PWA to `vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/masoi/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-192.png', 'pwa-512.png'],
      manifest: {
        name: 'Werewolf Admin',
        short_name: 'Werewolf',
        start_url: '/masoi/',
        scope: '/masoi/',
        display: 'standalone',
        background_color: '#111111',
        theme_color: '#111111',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
})
```

- [ ] **Step 9: Add placeholder PWA icons**

Create two PNG icons at `public/pwa-192.png` (192×192) and `public/pwa-512.png` (512×512). Any solid-color PNG works for now. Generate with this Node one-liner (writes a minimal valid PNG is non-trivial) — instead use ImageMagick if available:

Run: `magick -size 192x192 xc:#222 public/pwa-192.png && magick -size 512x512 xc:#222 public/pwa-512.png`
If ImageMagick is not installed, create the two files by any means (e.g. export from any image editor) — they just must exist and be square PNGs of the stated sizes. Do not skip: the PWA manifest references them.
Expected: both files exist under `public/`.

- [ ] **Step 10: Add theme-color to `index.html`**

Add inside `<head>`:

```html
<meta name="theme-color" content="#111111" />
```

- [ ] **Step 11: Full test + build (build now emits service worker + manifest)**

Run: `npm test -- --run && npm run build`
Expected: all tests pass; build emits `dist/sw.js` and `dist/manifest.webmanifest`.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: Night screen (role calls, summary) + PWA config"
```

---

### Task 10: GitHub Pages deploy + manual E2E resume check

**Files:**
- Create: `.github/workflows/deploy.yml`, `public/.nojekyll`
- Modify: `README.md`

**Interfaces:**
- Consumes: the built `dist/`.
- Produces: a GitHub Action that builds and publishes to Pages on push to `main`.

- [ ] **Step 1: Create `public/.nojekyll`** (empty file — stops GitHub Pages from stripping underscore assets)

Create empty file `public/.nojekyll`.

- [ ] **Step 2: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm test -- --run
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 3: Update `README.md`**

```markdown
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
```

- [ ] **Step 4: Manual E2E resume check** (verifies the whole flow + persistence)

Run: `npm run build && npm run preview`
Then in the browser at the previewed URL:
1. Add 4 players + 2 roles (e.g. Wolf, Seer). Select all. Reorder, toggle. Start Game.
2. Setup: assign Wolf → 1 player, Seer → 1 player, Next through to Day. Confirm 2 leftovers show "Villager".
3. Day: click a card → Eliminate → Confirm → card greys with slash. Check History sidebar.
4. Go to Night: log a Bad action from Wolf, Done → Night Summary shows it → Eliminate someone → Finish Night → back to Day.
5. **Refresh the page.** Confirm the game resumes on the same phase with the same eliminations, assignments, and history (persistence works).
Expected: every step behaves as described; refresh preserves state.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: GitHub Pages deploy workflow + README"
```

- [ ] **Step 6: (Optional) push + enable Pages**

```bash
git branch -M main
# git remote add origin <your-repo-url>
# git push -u origin main
```
Then in GitHub repo settings → Pages → Source: **GitHub Actions**.

---

## Self-Review Notes (author check — all resolved)

- **Spec coverage:** library+resume (Tasks 3,4 persist); dumb tracker (no rule logic anywhere); add player/role (Task 6); drag order + game-night toggle (Task 6 RoleOrder); setup walker + villager leftovers (Task 7); first-night actions round 0 (Task 7 ActionPanel); day grid/eliminate/grayscale/history (Task 8); night role calls by order, prev-night history, multi-action, skip, summary in order, admin eliminate (Task 9); PWA + GitHub Pages (Tasks 9,10). ✓
- **Type consistency:** action shape `{id,round,actor,target,type,note}` identical across store, ActionPanel, HistorySidebar, Night. Selector names (`selectNightRoles`, `selectRoleById`, `selectSurvivors`, `selectPlayersByRole`, `selectAssignedPlayerIds`) defined in Task 4 and used unchanged after. ✓
- **Placeholder scan:** icons step (Task 9 step 9) is the only external asset — instructions require the files exist, not skipped. No TBD/TODO in code. ✓
