import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'ghost' | 'danger'

const variants: Record<Variant, string> = {
  primary:
    'bg-[#5b8cff] text-white hover:bg-[#4a7aef] disabled:opacity-40 disabled:pointer-events-none',
  ghost:
    'bg-transparent text-[#c9cfde] hover:bg-white/5 border border-[#252a3a]',
  danger: 'bg-red-600/90 text-white hover:bg-red-600',
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
        'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
