import { formatClock } from '../../../lib/format/time'
import { cn } from '../../../lib/cn'

interface NcsTimerHudProps {
  secondsLeft: number
  totalSeconds: number
  avgPerRemainingSec: number | null
  urgent: boolean
}

export function NcsTimerHud({
  secondsLeft,
  totalSeconds,
  avgPerRemainingSec,
  urgent,
}: NcsTimerHudProps) {
  const progress =
    totalSeconds > 0
      ? Math.min(100, Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100))
      : 0

  return (
    <div
      className={cn(
        'rounded-2xl border p-6 transition',
        urgent
          ? 'border-amber-500/60 bg-amber-500/10'
          : 'border-[#252a3a] bg-[#10131c]',
      )}
    >
      <div className="flex flex-col items-center gap-2">
        <p className="text-xs uppercase tracking-widest text-[#8b92a8]">
          남은 시간
        </p>
        <p className="font-mono text-5xl font-semibold tabular-nums sm:text-6xl">
          {formatClock(secondsLeft)}
        </p>
        <p className="text-sm text-[#8b92a8]">
          남은 문제당 평균{' '}
          <span className="font-mono text-[#e8eaf0]">
            {avgPerRemainingSec != null
              ? `${Math.floor(avgPerRemainingSec / 60)}:${String(
                  Math.floor(avgPerRemainingSec % 60),
                ).padStart(2, '0')}`
              : '—'}
          </span>
        </p>
      </div>
      <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-[#1b2130]">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            urgent ? 'bg-amber-400' : 'bg-[#5b8cff]',
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
