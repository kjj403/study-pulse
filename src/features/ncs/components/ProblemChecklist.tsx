import { formatShortDuration } from '../../../lib/format/time'
import { cn } from '../../../lib/cn'

interface ProblemChecklistProps {
  total: number
  solved: boolean[]
  durationsSec: Array<number | null>
  disabled?: boolean
  onToggle: (index: number) => void
}

export function ProblemChecklist({
  total,
  solved,
  durationsSec,
  disabled,
  onToggle,
}: ProblemChecklistProps) {
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-white">문항 체크</p>
          <p className="mt-0.5 text-xs text-[#6b7385]">
            번호를 누르면 완료와 동시에 직전 기록 이후 경과 시간이 저장됩니다
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {Array.from({ length: total }, (_, i) => {
          const done = !!solved[i]
          const dur = durationsSec[i]
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => onToggle(i)}
              className={cn(
                'flex min-h-[3.25rem] min-w-[3.25rem] flex-col items-center justify-center rounded-xl px-2 py-1.5 text-sm font-semibold transition',
                done
                  ? 'bg-emerald-500/[0.12] text-emerald-200 ring-1 ring-emerald-400/35 shadow-[0_0_20px_-8px_rgba(52,211,153,0.35)]'
                  : 'bg-[#0d1018] text-[#8b92a8] ring-1 ring-white/[0.06] hover:bg-[#141a24] hover:text-[#c9cfde]',
                disabled && 'pointer-events-none opacity-45',
              )}
            >
              <span>{i + 1}</span>
              {done && dur != null && (
                <span className="mt-0.5 font-mono text-[10px] font-medium text-emerald-300/90">
                  {formatShortDuration(dur)}
                </span>
              )}
              {done && dur == null && (
                <span className="mt-0.5 text-[10px] text-emerald-400/50">—</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
