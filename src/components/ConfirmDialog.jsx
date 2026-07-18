export default function ConfirmDialog({ message, open, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-xs rounded-xl border border-white/10 bg-[#141a24] p-5">
        <p className="mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg bg-white/10 px-3 py-2 hover:bg-white/15"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-3 py-2 font-medium hover:bg-red-500"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
