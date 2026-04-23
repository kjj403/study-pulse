import { useCallback, useEffect, useState } from 'react'
import {
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { useAppTab } from '../../stores/appTabStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { getAllSessions } from '../../lib/storage/db'
import type { StoredSession } from '../../types'
import {
  ncsAreaAverages,
  productivityHeatmap24x7,
  studyStreakDays,
  subjectPieData,
  sumStudyFocusSeconds,
  weeklyFocusMinutes,
} from '../../lib/analytics/stats'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { BackupControls } from './components/BackupControls'
import { HourHeatmap } from './components/HourHeatmap'

const PIE_COLORS = ['#5b8cff', '#34d399', '#fbbf24', '#f472b6', '#a78bfa', '#38bdf8']

export function StatsPage() {
  const tab = useAppTab((s) => s.tab)
  const [sessions, setSessions] = useState<StoredSession[]>([])
  const setSound = useSettingsStore((s) => s.setSoundEnabled)
  const setVibrate = useSettingsStore((s) => s.setVibrateEnabled)
  const sound = useSettingsStore((s) => s.soundEnabled)
  const vibrate = useSettingsStore((s) => s.vibrateEnabled)

  const load = useCallback(async () => {
    setSessions(await getAllSessions())
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (tab === 'stats') void load()
  }, [tab, load])

  const now = Date.now()
  const dayMs = 86_400_000
  const startToday = new Date()
  startToday.setHours(0, 0, 0, 0)
  const todayStart = startToday.getTime()
  const weekStart = todayStart - 6 * dayMs

  const todayFocus = sumStudyFocusSeconds(sessions, todayStart, now)
  const weekFocus = sumStudyFocusSeconds(sessions, weekStart, now)

  const weekly = weeklyFocusMinutes(sessions)
  const pie = subjectPieData(sessions, 14)
  const heatmap = productivityHeatmap24x7(sessions, 7)
  const streak = studyStreakDays(sessions)
  const ncsAvg = ncsAreaAverages(sessions)

  const pieData = pie.map((p) => ({
    name: p.name,
    value: Math.round(p.value / 60),
  }))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold">통계 & 리포트</h2>
          <p className="text-sm text-[#8b92a8]">
            모든 데이터는 이 브라우저의 IndexedDB에만 저장됩니다.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="ghost" type="button" onClick={() => void load()}>
            새로고침
          </Button>
          <BackupControls onImported={() => void load()} />
        </div>
      </div>

      <Card className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-[#c9cfde]">
          <input
            type="checkbox"
            checked={sound}
            onChange={(e) => setSound(e.target.checked)}
          />
          알림음
        </label>
        <label className="flex items-center gap-2 text-sm text-[#c9cfde]">
          <input
            type="checkbox"
            checked={vibrate}
            onChange={(e) => setVibrate(e.target.checked)}
          />
          진동 (지원 기기)
        </label>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-[#8b92a8]">오늘 집중(공부 타이머)</p>
          <p className="mt-2 text-3xl font-semibold">
            {Math.round(todayFocus / 60)}분
          </p>
        </Card>
        <Card>
          <p className="text-sm text-[#8b92a8]">최근 7일 집중</p>
          <p className="mt-2 text-3xl font-semibold">
            {Math.round(weekFocus / 60)}분
          </p>
        </Card>
        <Card>
          <p className="text-sm text-[#8b92a8]">연속 기록(집중+NCS)</p>
          <p className="mt-2 text-3xl font-semibold">{streak}일</p>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold">주간 집중 시간</h3>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weekly}>
              <CartesianGrid stroke="#252a3a" strokeDasharray="3 3" />
              <XAxis dataKey="label" stroke="#8b92a8" />
              <YAxis stroke="#8b92a8" />
              <Tooltip
                contentStyle={{ background: '#141824', borderColor: '#252a3a' }}
              />
              <Line
                type="monotone"
                dataKey="minutes"
                stroke="#5b8cff"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold">과목별 집중(분, 14일)</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {pieData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={PIE_COLORS[i % PIE_COLORS.length]}
                      stroke="#0c0e14"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#141824', borderColor: '#252a3a' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold">NCS 영역별 평균 속도</h3>
          <p className="mt-1 text-sm text-[#8b92a8]">
            기록된 세션 기준, 문제 1개당 평균 소요 시간(초)
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {ncsAvg.length === 0 && (
              <li className="text-[#8b92a8]">아직 NCS 기록이 없습니다.</li>
            )}
            {ncsAvg.map((row) => (
              <li
                key={row.areaId}
                className="flex items-center justify-between rounded-lg bg-[#10131c] px-3 py-2"
              >
                <span>{row.areaLabel}</span>
                <span className="font-mono text-[#c9cfde]">
                  {row.avgSecPerQuestion != null
                    ? `${row.avgSecPerQuestion}s`
                    : '—'}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold">시간대 히트맵</h3>
        <div className="mt-4">
          <HourHeatmap matrix={heatmap} />
        </div>
      </Card>
    </div>
  )
}
