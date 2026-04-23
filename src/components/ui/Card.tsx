import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/[0.06] bg-[#12151f]/95 p-5 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.65)] backdrop-blur-sm',
        className,
      )}
      {...props}
    />
  )
}
