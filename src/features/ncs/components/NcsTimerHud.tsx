import { formatClock } from '../../../lib/format/time'
import { cn } from '../../../lib/cn'

interface NcsTimerHudProps {
  secondsLeft: number
  totalSeconds: number
  avgPerRemainingSec: number | null
  urgent: boolean
  /** 세션이 살아 있음 (일시정지 포함) */
  active: boolean
  paused: boolean
}

export function NcsTimerHud({
  secondsLeft,
  totalSeconds,
  avgPerRemainingSec,
  urgent,
  active,
  paused,
}: NcsTimerHudProps) {
  const ticking = active && !paused
  const progress =
    totalSeconds > 0
      ? Math.min(100, Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100))
      : 0

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border p-6 transition sm:p-8',
        paused
          ? 'border-white/[0.12] bg-gradient-to-b from-[#1a1f2e] to-[#0f1118]'
          : urgent && ticking
            ? 'border-amber-500/45 bg-gradient-to-b from-amber-500/15 to-[#141824] shadow-[0_0_40px_-12px_rgba(245,158,11,0.35)]'
            : 'border-white/[0.07] bg-gradient-to-b from-[#161a28] to-[#0f1118]',
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />
      <div className="relative flex flex-col items-center gap-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7a8499]">
          {paused ? '일시정지' : '남은 시간'}
        </p>
        <p
          className={cn(
            'font-mono text-5xl font-semibold tabular-nums tracking-tight sm:text-6xl',
            paused ? 'text-[#9aa3b8]' : urgent && ticking ? 'text-amber-100' : 'text-white',
          )}
        >
          {formatClock(secondsLeft)}
        </p>
        <p className="text-sm text-[#8b92a8]">
          남은 문항당 여유{' '}
          <span className="font-mono font-medium text-[#dce2f0]">
            {avgPerRemainingSec != null
              ? `${Math.floor(avgPerRemainingSec / 60)}:${String(
                  Math.floor(avgPerRemainingSec % 60),
                ).padStart(2, '0')}`
              : '—'}
          </span>
        </p>
        {paused && (
          <p className="mt-1 text-xs text-[#7d8699]">
            재개하면 타이머만 이어지고, 휴식한 동안은 문항 시간에 잡히지 않습니다.
          </p>
        )}
        {!active && (
          <p className="mt-1 text-xs text-[#5c6578]">시작 후 체크할 때마다 문항별 시간이 쌓입니다</p>
        )}
      </div>
      <div className="relative mt-6 h-2.5 w-full overflow-hidden rounded-full bg-black/40 ring-1 ring-white/[0.06]">
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-500 ease-out',
            paused
              ? 'bg-[#3d4454]'
              : urgent && ticking
                ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                : 'bg-gradient-to-r from-[#4f7ae8] to-[#5b8cff]',
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
