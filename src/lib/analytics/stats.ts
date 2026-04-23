import type { StoredSession } from '../../types'

const DAY_MS = 86_400_000

function startOfLocalDay(ts: number) {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function sumStudyFocusSeconds(
  sessions: StoredSession[],
  from: number,
  to: number,
) {
  return sessions.reduce((acc, s) => {
    if (s.kind !== 'study') return acc
    if (s.phase !== 'focus') return acc
    if (s.startedAt < from || s.startedAt > to) return acc
    return acc + s.durationSec
  }, 0)
}

export function ncsAreaAverages(sessions: StoredSession[]) {
  const map = new Map<
    string,
    { label: string; totalSec: number; totalSolved: number; sessions: number }
  >()
  for (const s of sessions) {
    if (s.kind !== 'ncs') continue
    const cur = map.get(s.areaId) ?? {
      label: s.areaLabel,
      totalSec: 0,
      totalSolved: 0,
      sessions: 0,
    }
    cur.label = s.areaLabel
    cur.totalSec += s.durationSec
    cur.totalSolved += s.solvedCount
    cur.sessions += 1
    map.set(s.areaId, cur)
  }
  return [...map.entries()].map(([areaId, v]) => ({
    areaId,
    areaLabel: v.label,
    sessions: v.sessions,
    avgSecPerQuestion:
      v.totalSolved > 0 ? Math.round(v.totalSec / v.totalSolved) : null,
  }))
}

export function subjectPieData(sessions: StoredSession[], days = 14) {
  const from = Date.now() - days * DAY_MS
  const map = new Map<string, number>()
  for (const s of sessions) {
    if (s.kind !== 'study') continue
    if (s.phase !== 'focus') continue
    if (s.startedAt < from) continue
    const key = s.subject.trim() || '미분류'
    map.set(key, (map.get(key) ?? 0) + s.durationSec)
  }
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

export function weeklyFocusMinutes(sessions: StoredSession[]) {
  const now = new Date()
  const out: { label: string; minutes: number }[] = []
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    const start = d.getTime()
    const end = start + DAY_MS - 1
    const sec = sumStudyFocusSeconds(sessions, start, end)
    const label = `${d.getMonth() + 1}/${d.getDate()}`
    out.push({ label, minutes: Math.round(sec / 60) })
  }
  return out
}

export function productivityHeatmap24x7(sessions: StoredSession[], days = 7) {
  const matrix: number[][] = Array.from({ length: 7 }, () =>
    Array.from({ length: 24 }, () => 0),
  )
  const from = Date.now() - days * DAY_MS
  for (const s of sessions) {
    if (s.startedAt < from) continue
    const dur = s.durationSec
    const day = new Date(s.startedAt).getDay()
    const hour = new Date(s.startedAt).getHours()
    matrix[day][hour] += dur
  }
  return matrix
}

export function studyStreakDays(sessions: StoredSession[]) {
  const activeDays = new Set<number>()
  for (const s of sessions) {
    if (s.durationSec <= 0) continue
    if (s.kind === 'study' && s.phase !== 'focus') continue
    activeDays.add(startOfLocalDay(s.startedAt))
  }
  for (const s of sessions) {
    if (s.kind === 'ncs' && s.durationSec > 0) {
      activeDays.add(startOfLocalDay(s.startedAt))
    }
  }
  if (activeDays.size === 0) return 0
  let streak = 0
  let probe = startOfLocalDay(Date.now())
  if (!activeDays.has(probe)) probe -= DAY_MS
  while (activeDays.has(probe)) {
    streak += 1
    probe -= DAY_MS
  }
  return streak
}
