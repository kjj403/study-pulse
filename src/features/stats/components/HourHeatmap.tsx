import { useMemo } from 'react'

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

interface HourHeatmapProps {
  matrix: number[][]
}

export function HourHeatmap({ matrix }: HourHeatmapProps) {
  const max = useMemo(() => {
    let m = 1
    for (const row of matrix) {
      for (const v of row) m = Math.max(m, v)
    }
    return m
  }, [matrix])

  const color = (v: number) => {
    const t = Math.min(1, v / max)
    const alpha = 0.15 + t * 0.85
    return `rgba(91, 140, 255, ${alpha})`
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[720px]">
        <div className="mb-1 grid grid-cols-[32px_repeat(24,minmax(0,1fr))] gap-1 text-[10px] text-[#8b92a8]">
          <span />
          {Array.from({ length: 24 }, (_, h) => (
            <span key={h} className="text-center">
              {h}
            </span>
          ))}
        </div>
        {matrix.map((row, d) => (
          <div
            key={d}
            className="mb-1 grid grid-cols-[32px_repeat(24,minmax(0,1fr))] gap-1"
          >
            <span className="text-xs text-[#c9cfde]">{DAY_LABELS[d]}</span>
            {row.map((cell, h) => (
              <div
                key={h}
                title={`${DAY_LABELS[d]} ${h}시 · ${Math.round(cell / 60)}분`}
                className="h-6 rounded-sm"
                style={{ background: color(cell) }}
              />
            ))}
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-[#8b92a8]">
        최근 7일간 시작 시각 기준으로 집중/NCS 시간을 쌓았습니다.
      </p>
    </div>
  )
}
