import Confetti from 'react-confetti'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { StudyPreset } from '../../types'
import {
  playPhaseCompleteChime,
  playShortBeep,
  vibratePulse,
} from '../../lib/audio/alerts'
import { formatClock } from '../../lib/format/time'
import { createId } from '../../lib/id'
import { addSession } from '../../lib/storage/db'
import { useSettingsStore } from '../../stores/settingsStore'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { cn } from '../../lib/cn'
import { DEFAULT_STUDY_PRESETS } from './studyPresets'

type Phase = 'focus' | 'break'

export function StudyModePage() {
  const soundEnabled = useSettingsStore((s) => s.soundEnabled)
  const vibrateEnabled = useSettingsStore((s) => s.vibrateEnabled)

  const [presetId, setPresetId] = useState(DEFAULT_STUDY_PRESETS[0].id)
  const [custom, setCustom] = useState({ focusMin: 30, breakMin: 5 })
  const [useCustom, setUseCustom] = useState(false)
  const [subject, setSubject] = useState('')
  const [tagsRaw, setTagsRaw] = useState('')
  const [phase, setPhase] = useState<Phase>('focus')
  const [running, setRunning] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(
    DEFAULT_STUDY_PRESETS[0].focusMin * 60,
  )
  const [cycles, setCycles] = useState(0)
  const [celebrate, setCelebrate] = useState(false)

  const preset: StudyPreset = useMemo(() => {
    if (useCustom) {
      return {
        id: 'custom',
        label: '커스텀',
        focusMin: Math.max(1, custom.focusMin),
        breakMin: Math.max(1, custom.breakMin),
      }
    }
    return DEFAULT_STUDY_PRESETS.find((p) => p.id === presetId)!
  }, [useCustom, presetId, custom.focusMin, custom.breakMin])

  const phaseSeconds =
    phase === 'focus' ? preset.focusMin * 60 : preset.breakMin * 60
  const phaseLabel = phase === 'focus' ? '집중' : '휴식'

  const phaseStartedAt = useRef<number | null>(null)
  const completionSavedRef = useRef(false)

  useEffect(() => {
    if (!running) {
      setSecondsLeft(
        phase === 'focus' ? preset.focusMin * 60 : preset.breakMin * 60,
      )
    }
  }, [preset.focusMin, preset.breakMin, phase, running])

  useEffect(() => {
    if (secondsLeft > 0) completionSavedRef.current = false
  }, [secondsLeft])

  useEffect(() => {
    if (!running || secondsLeft <= 0) return
    const id = window.setTimeout(() => {
      setSecondsLeft((s) => Math.max(0, s - 1))
    }, 1000)
    return () => window.clearTimeout(id)
  }, [running, secondsLeft])

  const persistPhase = useCallback(
    async (endedAt: number, phaseSnapshot: Phase) => {
      if (!phaseStartedAt.current) return
      const durationSec = Math.round(
        (endedAt - phaseStartedAt.current) / 1000,
      )
      const tags = tagsRaw
        .split(/[,#]/g)
        .map((t) => t.trim())
        .filter(Boolean)
      await addSession({
        kind: 'study',
        id: createId(),
        startedAt: phaseStartedAt.current,
        endedAt,
        phase: phaseSnapshot,
        subject: subject.trim() || '미지정',
        tags,
        durationSec,
        presetLabel: preset.label,
      })
    },
    [preset.label, subject, tagsRaw],
  )

  useEffect(() => {
    if (!running || secondsLeft !== 0) return
    if (completionSavedRef.current) return
    completionSavedRef.current = true
    void (async () => {
      const ended = Date.now()
      const snapshot = phase
      await persistPhase(ended, snapshot)
      if (snapshot === 'focus') {
        if (soundEnabled) playPhaseCompleteChime()
        if (vibrateEnabled) vibratePulse([100, 60, 100])
        setCelebrate(true)
        window.setTimeout(() => setCelebrate(false), 3500)
        setCycles((c) => c + 1)
        setPhase('break')
        setSecondsLeft(preset.breakMin * 60)
        phaseStartedAt.current = Date.now()
      } else {
        if (soundEnabled) playShortBeep()
        setPhase('focus')
        setSecondsLeft(preset.focusMin * 60)
        phaseStartedAt.current = Date.now()
      }
    })()
  }, [
    running,
    secondsLeft,
    phase,
    persistPhase,
    preset.breakMin,
    preset.focusMin,
    soundEnabled,
    vibrateEnabled,
  ])

  const handleStart = () => {
    completionSavedRef.current = false
    setPhase('focus')
    setSecondsLeft(preset.focusMin * 60)
    phaseStartedAt.current = Date.now()
    setRunning(true)
  }

  const handlePause = async () => {
    if (!running) return
    const ended = Date.now()
    await persistPhase(ended, phase)
    setRunning(false)
    phaseStartedAt.current = null
    setSecondsLeft(
      phase === 'focus' ? preset.focusMin * 60 : preset.breakMin * 60,
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      {celebrate && typeof window !== 'undefined' && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={180}
          gravity={0.22}
        />
      )}
      <Card>
        <h2 className="text-lg font-semibold">프리셋</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {DEFAULT_STUDY_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              disabled={running}
              onClick={() => {
                setUseCustom(false)
                setPresetId(p.id)
              }}
              className={cn(
                'rounded-full px-3 py-1.5 text-sm ring-1 transition',
                !useCustom && presetId === p.id
                  ? 'bg-[#5b8cff]/20 text-white ring-[#5b8cff]'
                  : 'bg-[#10131c] text-[#c9cfde] ring-[#252a3a] hover:bg-[#151a26]',
              )}
            >
              {p.label}{' '}
              <span className="text-[#8b92a8]">
                {p.focusMin}/{p.breakMin}분
              </span>
            </button>
          ))}
          <button
            type="button"
            disabled={running}
            onClick={() => setUseCustom(true)}
            className={cn(
              'rounded-full px-3 py-1.5 text-sm ring-1 transition',
              useCustom
                ? 'bg-[#5b8cff]/20 text-white ring-[#5b8cff]'
                : 'bg-[#10131c] text-[#c9cfde] ring-[#252a3a] hover:bg-[#151a26]',
            )}
          >
            커스텀
          </button>
        </div>
        {useCustom && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-[#8b92a8]">
              집중(분)
              <input
                type="number"
                min={1}
                className="mt-1 w-full rounded-lg border border-[#252a3a] bg-[#10131c] px-3 py-2 text-[#e8eaf0]"
                value={custom.focusMin}
                disabled={running}
                onChange={(e) =>
                  setCustom((c) => ({
                    ...c,
                    focusMin: Number(e.target.value) || 1,
                  }))
                }
              />
            </label>
            <label className="text-sm text-[#8b92a8]">
              휴식(분)
              <input
                type="number"
                min={1}
                className="mt-1 w-full rounded-lg border border-[#252a3a] bg-[#10131c] px-3 py-2 text-[#e8eaf0]"
                value={custom.breakMin}
                disabled={running}
                onChange={(e) =>
                  setCustom((c) => ({
                    ...c,
                    breakMin: Number(e.target.value) || 1,
                  }))
                }
              />
            </label>
          </div>
        )}
        <div className="mt-5 grid gap-3">
          <label className="text-sm text-[#8b92a8]">
            과목
            <input
              className="mt-1 w-full rounded-lg border border-[#252a3a] bg-[#10131c] px-3 py-2 text-[#e8eaf0]"
              placeholder="예: 운영체제"
              value={subject}
              disabled={running}
              onChange={(e) => setSubject(e.target.value)}
            />
          </label>
          <label className="text-sm text-[#8b92a8]">
            태그 (쉼표 구분)
            <input
              className="mt-1 w-full rounded-lg border border-[#252a3a] bg-[#10131c] px-3 py-2 text-[#e8eaf0]"
              placeholder="SQL, 정처기"
              value={tagsRaw}
              disabled={running}
              onChange={(e) => setTagsRaw(e.target.value)}
            />
          </label>
        </div>
        <p className="mt-3 text-xs text-[#8b92a8]">
          집중이 끝나면 자동으로 휴식으로 넘어가고, 휴식 후 다시 집중으로 이어집니다.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button disabled={running} onClick={handleStart}>
            시작
          </Button>
          <Button variant="ghost" disabled={!running} onClick={() => void handlePause()}>
            일시정지 및 기록
          </Button>
        </div>
      </Card>
      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#8b92a8]">
              현재 세션
            </p>
            <p className="text-lg font-semibold">{phaseLabel}</p>
            <p className="text-sm text-[#8b92a8]">
              완료한 집중 라운드:{' '}
              <span className="text-[#e8eaf0]">{cycles}</span>
            </p>
          </div>
          <span
            className={cn(
              'rounded-full px-3 py-1 text-xs font-semibold ring-1',
              phase === 'focus'
                ? 'bg-emerald-500/15 text-emerald-200 ring-emerald-500/30'
                : 'bg-sky-500/15 text-sky-100 ring-sky-500/30',
            )}
          >
            {preset.label}
          </span>
        </div>
        <div className="mt-6 text-center">
          <p className="font-mono text-5xl font-semibold tabular-nums">
            {formatClock(secondsLeft)}
          </p>
          <p className="mt-2 text-sm text-[#8b92a8]">
            {phase === 'focus'
              ? `다음 휴식 ${preset.breakMin}분`
              : `다음 집중 ${preset.focusMin}분`}
          </p>
        </div>
        <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-[#1b2130]">
          <div
            className="h-full rounded-full bg-[#5b8cff] transition-all"
            style={{
              width: `${phaseSeconds ? Math.min(100, Math.round(((phaseSeconds - secondsLeft) / phaseSeconds) * 100)) : 0}%`,
            }}
          />
        </div>
      </Card>
    </div>
  )
}
