import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'ghost' | 'danger'

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-b from-[#6b9aff] to-[#4778f5] text-white shadow-[0_8px_24px_-6px_rgba(91,140,255,0.55)] hover:brightness-105 active:brightness-95 disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none',
  ghost:
    'border border-white/[0.08] bg-white/[0.03] text-[#d6dae6] hover:bg-white/[0.06] hover:border-white/[0.12]',
  danger:
    'bg-gradient-to-b from-[#f87171] to-[#dc2626] text-white shadow-[0_8px_24px_-6px_rgba(239,68,68,0.45)] hover:brightness-105',
}

export function Button({
  className,
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold tracking-tight transition',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
