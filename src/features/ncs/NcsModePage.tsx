import Confetti from 'react-confetti'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { NcsPreset } from '../../types'
import { playShortBeep, vibratePulse } from '../../lib/audio/alerts'
import { createId } from '../../lib/id'
import { addSession } from '../../lib/storage/db'
import { useSettingsStore } from '../../stores/settingsStore'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { cn } from '../../lib/cn'
import { DEFAULT_NCS_PRESETS } from './ncsPresets'
import { NcsTimerHud } from './components/NcsTimerHud'
import { ProblemChecklist } from './components/ProblemChecklist'

function buildChecklist(n: number) {
  return Array.from({ length: n }, () => false)
}

function buildNullDurations(n: number) {
  return Array.from({ length: n }, () => null as number | null)
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

  /** 세션 진행 중(일시정지 포함) */
  const [active, setActive] = useState(false)
  const [paused, setPaused] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds)
  const [checklist, setChecklist] = useState(() =>
    buildChecklist(activePreset.questionCount),
  )
  const [perQuestionSec, setPerQuestionSec] = useState<Array<number | null>>(() =>
    buildNullDurations(activePreset.questionCount),
  )
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [celebrate, setCelebrate] = useState(false)
  const lastMinuteRef = useRef(false)
  const completionSavedRef = useRef(false)
  const lastMarkAtRef = useRef<number>(Date.now())

  const ticking = active && !paused

  useEffect(() => {
    setSecondsLeft(totalSeconds)
    setChecklist(buildChecklist(activePreset.questionCount))
    setPerQuestionSec(buildNullDurations(activePreset.questionCount))
    lastMinuteRef.current = false
    completionSavedRef.current = false
  }, [activePreset.questionCount, activePreset.minutes, totalSeconds])

  const unsolvedCount = useMemo(() => {
    return checklist.reduce((acc, v) => acc + (v ? 0 : 1), 0)
  }, [checklist])

  const avgPerRemaining =
    unsolvedCount > 0 ? secondsLeft / unsolvedCount : null

  const urgent = secondsLeft > 0 && secondsLeft <= 60

  useEffect(() => {
    if (!ticking || secondsLeft <= 0) return
    const id = window.setTimeout(() => {
      setSecondsLeft((s) => Math.max(0, s - 1))
    }, 1000)
    return () => window.clearTimeout(id)
  }, [ticking, secondsLeft])

  useEffect(() => {
    if (!ticking) return
    if (secondsLeft === 60 && !lastMinuteRef.current) {
      lastMinuteRef.current = true
      if (soundEnabled) playShortBeep()
      if (vibrateEnabled) vibratePulse([80, 40, 80])
    }
  }, [ticking, secondsLeft, soundEnabled, vibrateEnabled])

  const persistSession = useCallback(
    async (endedAt: number) => {
      if (!startedAt) return
      const durationSec = Math.min(
        Math.max(0, totalSeconds - secondsLeft),
        totalSeconds,
      )
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
        problemDurationsSec: [...perQuestionSec],
      })
    },
    [startedAt, totalSeconds, activePreset, checklist, perQuestionSec, secondsLeft],
  )

  useEffect(() => {
    if (!ticking || secondsLeft !== 0) return
    if (completionSavedRef.current) return
    completionSavedRef.current = true
    void (async () => {
      const ended = Date.now()
      await persistSession(ended)
      setActive(false)
      setPaused(false)
      setStartedAt(null)
      setCelebrate(true)
      window.setTimeout(() => setCelebrate(false), 4500)
      if (soundEnabled) playShortBeep()
    })()
  }, [ticking, secondsLeft, persistSession, soundEnabled])

  const handleStart = () => {
    completionSavedRef.current = false
    setChecklist(buildChecklist(activePreset.questionCount))
    setPerQuestionSec(buildNullDurations(activePreset.questionCount))
    const t = Date.now()
    setStartedAt(t)
    lastMarkAtRef.current = t
    setSecondsLeft(activePreset.minutes * 60)
    setPaused(false)
    setActive(true)
    lastMinuteRef.current = false
  }

  const handlePauseTimer = () => {
    if (!active || paused) return
    setPaused(true)
  }

  const handleResumeTimer = () => {
    if (!active || !paused) return
    lastMarkAtRef.current = Date.now()
    setPaused(false)
  }

  const handleStop = async () => {
    if (!active) return
    const ended = Date.now()
    await persistSession(ended)
    setActive(false)
    setPaused(false)
    setStartedAt(null)
    setSecondsLeft(activePreset.minutes * 60)
    lastMinuteRef.current = false
  }

  const toggleProblem = (index: number) => {
    setChecklist((prev) => {
      const turningOn = !prev[index] && ticking
      const turningOff = prev[index] && ticking
      const next = [...prev]
      next[index] = !next[index]

      if (turningOn) {
        const now = Date.now()
        const delta = Math.max(0, Math.round((now - lastMarkAtRef.current) / 1000))
        lastMarkAtRef.current = now
        queueMicrotask(() => {
          setPerQuestionSec((ps) => {
            const arr =
              ps.length === next.length ? [...ps] : buildNullDurations(next.length)
            arr[index] = delta
            return arr
          })
        })
      } else if (turningOff) {
        queueMicrotask(() => {
          setPerQuestionSec((ps) => {
            const arr = [...ps]
            arr[index] = null
            return arr
          })
        })
      }
      return next
    })
  }

  const markNextInOrder = () => {
    if (!ticking) return
    const i = checklist.findIndex((v) => !v)
    if (i < 0) return
    const now = Date.now()
    const delta = Math.max(0, Math.round((now - lastMarkAtRef.current) / 1000))
    lastMarkAtRef.current = now
    setChecklist((prev) => {
      const n = [...prev]
      n[i] = true
      return n
    })
    setPerQuestionSec((prev) => {
      const arr = [...prev]
      while (arr.length < activePreset.questionCount) arr.push(null)
      arr[i] = delta
      return arr
    })
  }

  const inputClass =
    'mt-1.5 w-full rounded-xl border border-white/[0.08] bg-[#0a0c12] px-3 py-2.5 text-[#e8eaf0] outline-none transition placeholder:text-[#4b5263] focus:border-[#5b8cff]/50 focus:ring-2 focus:ring-[#5b8cff]/20'

  const chip = (isActive: boolean) =>
    cn(
      'rounded-xl px-3 py-2 text-left text-sm transition',
      isActive
        ? 'bg-[#5b8cff]/18 text-white ring-1 ring-[#5b8cff]/55 shadow-[0_0_24px_-10px_rgba(91,140,255,0.45)]'
        : 'border border-white/[0.06] bg-[#0d1018] text-[#b4bccf] hover:border-white/[0.1] hover:bg-[#121722]',
    )

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      {celebrate && typeof window !== 'undefined' && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={220}
          gravity={0.25}
        />
      )}
      <Card className="lg:order-none">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-white">시험 설정</h2>
            <p className="mt-1 text-sm leading-relaxed text-[#7d8699]">
              영역·문항 수·제한 시간을 고른 뒤 시작하세요. 체크할 때마다 그 문항까지 걸린
              시간이 기록됩니다.
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {DEFAULT_NCS_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              disabled={active}
              onClick={() => {
                setUseCustom(false)
                setSelectedId(p.id)
              }}
              className={cn(chip(!useCustom && selectedId === p.id), 'disabled:opacity-45')}
            >
              <span className="font-semibold text-[#eef1f7]">{p.label}</span>
              <span className="mt-0.5 block text-xs text-[#8b92a8]">
                {p.questionCount}문항 · {p.minutes}분
              </span>
            </button>
          ))}
          <button
            type="button"
            disabled={active}
            onClick={() => setUseCustom(true)}
            className={cn(chip(useCustom), 'disabled:opacity-45')}
          >
            <span className="font-semibold">커스텀</span>
            <span className="mt-0.5 block text-xs text-[#8b92a8]">
              문항 수·시간 직접 입력
            </span>
          </button>
        </div>
        {useCustom && (
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <label className="text-xs font-medium text-[#8b92a8]">
              라벨
              <input
                className={inputClass}
                value={custom.label}
                disabled={active}
                onChange={(e) =>
                  setCustom((c) => ({ ...c, label: e.target.value }))
                }
              />
            </label>
            <label className="text-xs font-medium text-[#8b92a8]">
              문항 수
              <input
                type="number"
                min={1}
                className={inputClass}
                value={custom.questions}
                disabled={active}
                onChange={(e) =>
                  setCustom((c) => ({
                    ...c,
                    questions: Number(e.target.value) || 1,
                  }))
                }
              />
            </label>
            <label className="text-xs font-medium text-[#8b92a8]">
              제한 시간(분)
              <input
                type="number"
                min={1}
                className={inputClass}
                value={custom.minutes}
                disabled={active}
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
        <div className="mt-6 flex flex-wrap gap-3 border-t border-white/[0.06] pt-6">
          <Button className="min-w-[7rem]" disabled={active} onClick={handleStart}>
            세션 시작
          </Button>
          <Button
            variant="ghost"
            disabled={!active || paused}
            onClick={handlePauseTimer}
          >
            일시정지
          </Button>
          <Button variant="ghost" disabled={!active || !paused} onClick={handleResumeTimer}>
            재개
          </Button>
          <Button
            variant="danger"
            disabled={!active}
            onClick={() => void handleStop()}
          >
            종료 후 기록
          </Button>
        </div>
      </Card>
      <div className="flex flex-col gap-4">
        <NcsTimerHud
          secondsLeft={secondsLeft}
          totalSeconds={totalSeconds}
          avgPerRemainingSec={avgPerRemaining}
          urgent={urgent && ticking}
          active={active}
          paused={paused}
        />
        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <ProblemChecklist
              total={activePreset.questionCount}
              solved={checklist}
              durationsSec={perQuestionSec}
              disabled={!ticking}
              onToggle={toggleProblem}
            />
            <div className="flex shrink-0 flex-col gap-2 sm:w-44">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#5c6578]">
                순서 풀이
              </p>
              <Button
                className="w-full"
                disabled={!ticking || unsolvedCount === 0}
                variant="ghost"
                onClick={markNextInOrder}
              >
                다음 번호 완료
              </Button>
              <p className="text-[11px] leading-snug text-[#5c6578]">
                1번부터 순서대로 끝낼 때 한 번에 누르기 좋아요.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
