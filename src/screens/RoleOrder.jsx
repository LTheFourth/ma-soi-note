import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Toggle from '../components/Toggle.jsx'

function Row({ role, onToggle }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: role.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="mb-1.5 flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-2"
    >
      <span
        className="cursor-grab touch-none px-1 text-gray-500"
        {...attributes}
        {...listeners}
        aria-label={`drag ${role.name}`}
      >
        ⠿
      </span>
      <span className="flex-1 font-semibold" style={{ color: role.color }}>{role.name}</span>
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
