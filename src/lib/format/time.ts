export function formatClock(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
}

export function formatMinutesLabel(minutes: number) {
  return `${minutes}분`
}

/** 짧은 표기: 45초 / 1:05 */
export function formatShortDuration(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds))
  if (s < 60) return `${s}초`
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${String(r).padStart(2, '0')}`
}
