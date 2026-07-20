import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ACTION_TYPES, roleTiming, roleActions } from '../lib/actions.js'

const TIMINGS = [
  { key: 'every', label: 'Every night' },
  { key: 'first', label: 'First night' },
  { key: 'never', label: 'Setup only' },
]

function Row({ role, onSetTiming, onToggleAction, onToggleElim }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: role.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const timing = roleTiming(role)
  const acts = roleActions(role)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="mb-1.5 rounded-lg border border-white/10 bg-white/5 p-2"
    >
      <div className="flex items-center gap-3">
        <span
          className="cursor-grab touch-none px-1 text-gray-500"
          {...attributes}
          {...listeners}
          aria-label={`drag ${role.name}`}
        >
          ⠿
        </span>
        <span className="flex-1 font-semibold" style={{ color: role.color }}>{role.name}</span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 pl-6 text-sm">
        <span className="flex items-center gap-1">
          {TIMINGS.map((t) => (
            <button
              key={t.key}
              aria-label={`${role.name} ${t.label}`}
              aria-pressed={timing === t.key}
              onClick={() => onSetTiming(role.id, t.key)}
              className={`rounded-md px-2 py-1 text-xs ${
                timing === t.key ? 'bg-indigo-600 text-white' : 'bg-white/10 hover:bg-white/15'
              }`}
            >
              {t.label}
            </button>
          ))}
        </span>
        <span className="flex items-center gap-2 text-gray-300">
          {ACTION_TYPES.map((a) => (
            <label key={a.key} className="flex cursor-pointer items-center gap-1">
              <input
                type="checkbox"
                aria-label={`${role.name} can ${a.label}`}
                checked={acts.includes(a.key)}
                onChange={(e) => onToggleAction(role.id, a.key, e.target.checked)}
                className="h-4 w-4 accent-indigo-500"
              />
              {a.icon}
            </label>
          ))}
        </span>
        <label className="flex cursor-pointer items-center gap-1 text-gray-300">
          <input
            type="checkbox"
            aria-label={`${role.name} elimination cause`}
            checked={!!role.canEliminate}
            onChange={(e) => onToggleElim(role.id, e.target.checked)}
            className="h-4 w-4 accent-red-500"
          />
          🪦 elim cause
        </label>
      </div>
    </div>
  )
}

export default function RoleOrder({ roles, onReorder, onSetTiming, onToggleAction, onToggleElim }) {
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
        {roles.map((r) => (
          <Row
            key={r.id}
            role={r}
            onSetTiming={onSetTiming}
            onToggleAction={onToggleAction}
            onToggleElim={onToggleElim}
          />
        ))}
      </SortableContext>
    </DndContext>
  )
}
