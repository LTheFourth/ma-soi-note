import { artUrl } from '../lib/art.js'

const SIZES = {
  xs: 'h-5 w-5 text-[9px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-16 w-16 text-lg',
}

const FALLBACK_COLOR = '#64748b'

// '#ef4444' -> '239, 68, 68'. Role colours always come from a colour input
// or a preset, so they are always 6-digit hex; anything else falls back.
function rgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex ?? '')
  const n = parseInt(m ? m[1] : FALLBACK_COLOR.slice(1), 16)
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`
}

// The role's portrait, or its initial on a coloured disc when the art file
// is missing. Decorative by default: every place that shows an avatar also
// prints the role name, so the image is hidden from screen readers to avoid
// announcing the role twice. Pass `labelled` where it stands on its own.
export default function RoleAvatar({ role, size = 'md', dead = false, labelled = false, className = '' }) {
  const name = role?.name ?? '?'
  const url = artUrl(role?.art)
  const c = rgb(role?.color)

  return (
    <div
      {...(dead ? { 'data-dead': 'true' } : {})}
      className={`role-avatar relative grid shrink-0 place-items-center overflow-hidden rounded-full border font-semibold ${SIZES[size] ?? SIZES.md} ${className}`}
      style={{
        borderColor: `rgba(${c}, 0.55)`,
        background: `radial-gradient(120% 120% at 50% 15%, rgba(${c}, 0.30), rgba(${c}, 0.08) 70%, rgba(0,0,0,0.25))`,
        boxShadow: `0 0 0 1px rgba(${c}, 0.18), 0 6px 16px -10px rgba(${c}, 0.9)`,
        color: `rgb(${c})`,
      }}
    >
      {url ? (
        <img
          src={url}
          loading="lazy"
          className="h-full w-full object-cover"
          {...(labelled ? { role: 'img', alt: name } : { alt: '', 'aria-hidden': 'true' })}
        />
      ) : (
        <span aria-hidden={labelled ? undefined : 'true'}>{name.trim().charAt(0).toUpperCase()}</span>
      )}
    </div>
  )
}
