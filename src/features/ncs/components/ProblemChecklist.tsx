import { cn } from '../../../lib/cn'

interface ProblemChecklistProps {
  total: number
  solved: boolean[]
  disabled?: boolean
  onToggle: (index: number) => void
}

export function ProblemChecklist({
  total,
  solved,
  disabled,
  onToggle,
}: ProblemChecklistProps) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-[#c9cfde]">문제 체크</p>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: total }, (_, i) => {
          const done = !!solved[i]
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => onToggle(i)}
              className={cn(
                'h-9 w-9 rounded-lg text-sm font-semibold transition',
                done
                  ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40'
                  : 'bg-[#1b2130] text-[#8b92a8] ring-1 ring-[#252a3a] hover:bg-[#222838]',
                disabled && 'opacity-40',
              )}
            >
              {i + 1}
            </button>
          )
        })}
      </div>
    </div>
  )
}
