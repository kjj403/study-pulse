import Confetti from 'react-confetti'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { NcsPreset } from '../../types'
import { playShortBeep, vibratePulse } from '../../lib/audio/alerts'
import { createId } from '../../lib/id'
import { addSession } from '../../lib/storage/db'
import { useSettingsStore } from '../../stores/settingsStore'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { DEFAULT_NCS_PRESETS } from './ncsPresets'
import { NcsTimerHud } from './components/NcsTimerHud'
import { ProblemChecklist } from './components/ProblemChecklist'

function buildChecklist(n: number) {
  return Array.from({ length: n }, () => false)
}

export function NcsModePage() {
  const soundEnabled = useSettingsStore((s) => s.soundEnabled)
  const vibrateEnabled = useSettingsStore((s) => s.vibrateEnabled)

  const [selectedId, setSelectedId] = useState<string>(DEFAULT_NCS_PRESETS[0].id)
  const [custom, setCustom] = useState({ label: '커스텀', minutes: 15, questions: 10 })
  const [useCustom, setUseCustom] = useState(false)

  const activePreset: NcsPreset = useMemo(() => {
    if (useCustom) {
      return {
        id: 'custom',
        label: custom.label.trim() || '커스텀',
        areaId: 'custom',
        questionCount: Math.max(1, custom.questions),
        minutes: Math.max(1, custom.minutes),
      }
    }
    const base = DEFAULT_NCS_PRESETS.find((p) => p.id === selectedId)!
    return base
  }, [useCustom, selectedId, custom.label, custom.minutes, custom.questions])

  const totalSeconds = activePreset.minutes * 60

  const [running, setRunning] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds)
  const [checklist, setChecklist] = useState(() =>
    buildChecklist(activePreset.questionCount),
  )
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [celebrate, setCelebrate] = useState(false)
  const lastMinuteRef = useRef(false)
  const completionSavedRef = useRef(false)

  useEffect(() => {
    if (!running) {
      setSecondsLeft(totalSeconds)
      setChecklist(buildChecklist(activePreset.questionCount))
      lastMinuteRef.current = false
      completionSavedRef.current = false
    }
  }, [activePreset.questionCount, activePreset.minutes, running, totalSeconds])

  const unsolvedCount = useMemo(() => {
    return checklist.reduce((acc, v) => acc + (v ? 0 : 1), 0)
  }, [checklist])

  const avgPerRemaining =
    unsolvedCount > 0 ? secondsLeft / unsolvedCount : null

  const urgent = secondsLeft > 0 && secondsLeft <= 60

  useEffect(() => {
    if (!running || secondsLeft <= 0) return
    const id = window.setTimeout(() => {
      setSecondsLeft((s) => Math.max(0, s - 1))
    }, 1000)
    return () => window.clearTimeout(id)
  }, [running, secondsLeft])

  useEffect(() => {
    if (!running) return
    if (secondsLeft === 60 && !lastMinuteRef.current) {
      lastMinuteRef.current = true
      if (soundEnabled) playShortBeep()
      if (vibrateEnabled) vibratePulse([80, 40, 80])
    }
  }, [running, secondsLeft, soundEnabled, vibrateEnabled])

  const persistSession = useCallback(
    async (endedAt: number) => {
      if (!startedAt) return
      const durationRaw = Math.round((endedAt - startedAt) / 1000)
      const durationSec = Math.min(durationRaw, totalSeconds)
      await addSession({
        kind: 'ncs',
        id: createId(),
        startedAt,
        endedAt,
        areaId: activePreset.areaId,
        areaLabel: activePreset.label,
        questionCount: activePreset.questionCount,
        solvedCount: checklist.filter(Boolean).length,
        durationSec,
      })
    },
    [startedAt, totalSeconds, activePreset, checklist],
  )

  useEffect(() => {
    if (!running || secondsLeft !== 0) return
    if (completionSavedRef.current) return
    completionSavedRef.current = true
    void (async () => {
      const ended = Date.now()
      await persistSession(ended)
      setRunning(false)
      setStartedAt(null)
      setCelebrate(true)
      window.setTimeout(() => setCelebrate(false), 4500)
      if (soundEnabled) playShortBeep()
    })()
  }, [running, secondsLeft, persistSession, soundEnabled])

  const handleStart = () => {
    completionSavedRef.current = false
    setChecklist(buildChecklist(activePreset.questionCount))
    setSecondsLeft(activePreset.minutes * 60)
    setStartedAt(Date.now())
    setRunning(true)
    lastMinuteRef.current = false
  }

  const handleStop = async () => {
    if (!running) return
    const ended = Date.now()
    await persistSession(ended)
    setRunning(false)
    setStartedAt(null)
    setSecondsLeft(activePreset.minutes * 60)
    lastMinuteRef.current = false
  }

  const toggleProblem = (index: number) => {
    setChecklist((prev) => {
      const next = [...prev]
      next[index] = !next[index]
      return next
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      {celebrate && typeof window !== 'undefined' && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={220}
          gravity={0.25}
        />
      )}
      <Card>
        <h2 className="text-lg font-semibold">영역 프리셋</h2>
        <p className="mt-1 text-sm text-[#8b92a8]">
          실전처럼 제한 시간 안에서 체크리스트로 진행 상황을 표시합니다.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {DEFAULT_NCS_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              disabled={running}
              onClick={() => {
                setUseCustom(false)
                setSelectedId(p.id)
              }}
              className={`rounded-full px-3 py-1.5 text-sm ring-1 transition ${
                !useCustom && selectedId === p.id
                  ? 'bg-[#5b8cff]/20 text-white ring-[#5b8cff]'
                  : 'bg-[#10131c] text-[#c9cfde] ring-[#252a3a] hover:bg-[#151a26]'
              }`}
            >
              {p.label}{' '}
              <span className="text-[#8b92a8]">
                {p.questionCount}문항 / {p.minutes}분
              </span>
            </button>
          ))}
          <button
            type="button"
            disabled={running}
            onClick={() => setUseCustom(true)}
            className={`rounded-full px-3 py-1.5 text-sm ring-1 transition ${
              useCustom
                ? 'bg-[#5b8cff]/20 text-white ring-[#5b8cff]'
                : 'bg-[#10131c] text-[#c9cfde] ring-[#252a3a] hover:bg-[#151a26]'
            }`}
          >
            커스텀
          </button>
        </div>
        {useCustom && (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <label className="text-sm text-[#8b92a8]">
              라벨
              <input
                className="mt-1 w-full rounded-lg border border-[#252a3a] bg-[#10131c] px-3 py-2 text-[#e8eaf0]"
                value={custom.label}
                disabled={running}
                onChange={(e) =>
                  setCustom((c) => ({ ...c, label: e.target.value }))
                }
              />
            </label>
            <label className="text-sm text-[#8b92a8]">
              문항 수
              <input
                type="number"
                min={1}
                className="mt-1 w-full rounded-lg border border-[#252a3a] bg-[#10131c] px-3 py-2 text-[#e8eaf0]"
                value={custom.questions}
                disabled={running}
                onChange={(e) =>
                  setCustom((c) => ({
                    ...c,
                    questions: Number(e.target.value) || 1,
                  }))
                }
              />
            </label>
            <label className="text-sm text-[#8b92a8]">
              제한 시간(분)
              <input
                type="number"
                min={1}
                className="mt-1 w-full rounded-lg border border-[#252a3a] bg-[#10131c] px-3 py-2 text-[#e8eaf0]"
                value={custom.minutes}
                disabled={running}
                onChange={(e) =>
                  setCustom((c) => ({
                    ...c,
                    minutes: Number(e.target.value) || 1,
                  }))
                }
              />
            </label>
          </div>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button disabled={running} onClick={handleStart}>
            시작
          </Button>
          <Button variant="danger" disabled={!running} onClick={() => void handleStop()}>
            종료 및 기록
          </Button>
        </div>
      </Card>
      <div className="flex flex-col gap-4">
        <NcsTimerHud
          secondsLeft={secondsLeft}
          totalSeconds={totalSeconds}
          avgPerRemainingSec={avgPerRemaining}
          urgent={urgent && running}
        />
        <Card>
          <ProblemChecklist
            total={activePreset.questionCount}
            solved={checklist}
            disabled={!running}
            onToggle={toggleProblem}
          />
        </Card>
      </div>
    </div>
  )
}
