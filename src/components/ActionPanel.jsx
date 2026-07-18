import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useGameStore, selectSurvivors, selectRoleById } from '../store/gameStore.js'

const TYPES = [
  { key: 'good', label: 'Good' },
  { key: 'bad', label: 'Bad' },
  { key: 'info', label: 'Info' },
]

export default function ActionPanel({ role, round }) {
  const survivors = useGameStore(useShallow(selectSurvivors))
  const logAction = useGameStore((s) => s.logAction)
  const actions = useGameStore(
    useShallow((s) => s.actionLog.filter((a) => a.actor === role.id && a.round === round)),
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
            return <option key={p.id} value={p.id} label={`${p.name} (${r.name})`} />
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
