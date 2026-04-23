import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[#252a3a] bg-[#141824] p-5 shadow-sm',
        className,
      )}
      {...props}
    />
  )
}
