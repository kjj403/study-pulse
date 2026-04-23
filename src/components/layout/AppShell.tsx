import { useAppTab, type AppTab } from '../../stores/appTabStore'
import { cn } from '../../lib/cn'

const tabs: { id: AppTab; label: string; hint: string }[] = [
  { id: 'ncs', label: 'NCS 모의', hint: '제한시간·문항별 기록' },
  { id: 'study', label: '공부 타이머', hint: '뽀모도로·과목' },
  { id: 'stats', label: '통계', hint: '누적·백업' },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const tab = useAppTab((s) => s.tab)
  const setTab = useAppTab((s) => s.setTab)

  return (
    <div className="min-h-full text-[#e8eaf0]">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#5b8cff]/50 to-transparent" />
      <header className="border-b border-white/[0.06] bg-[#0c0e14]/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
          <div className="max-w-xl text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[#8eb4ff]">
              StudyPulse
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-[1.65rem] sm:leading-snug">
              <span className="bg-gradient-to-r from-[#e8eeff] via-[#93b4ff] to-[#5b8cff] bg-clip-text text-transparent">
                만능 타이머
              </span>
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#9aa3b8]">
              시험 모드·집중 루틴·통계까지 한 앱에서. 데이터는 이 기기 안에만
              저장됩니다.
            </p>
          </div>
          <nav className="flex shrink-0 flex-col gap-2 sm:items-end">
            <p className="hidden text-right text-[11px] font-medium uppercase tracking-wider text-[#5c6578] sm:block">
              모드
            </p>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={cn(
                    'group rounded-2xl px-4 py-2.5 text-left transition sm:min-w-[9.5rem]',
                    tab === t.id
                      ? 'bg-gradient-to-b from-[#5b8cff] to-[#3d6fd9] text-white shadow-[0_12px_32px_-10px_rgba(91,140,255,0.55)]'
                      : 'border border-white/[0.07] bg-[#12151f]/80 text-[#c9cfde] hover:border-white/[0.12] hover:bg-[#161a26]',
                  )}
                >
                  <span className="block text-sm font-semibold">{t.label}</span>
                  <span
                    className={cn(
                      'mt-0.5 block text-[11px] leading-tight',
                      tab === t.id ? 'text-white/75' : 'text-[#6b7385]',
                    )}
                  >
                    {t.hint}
                  </span>
                </button>
              ))}
            </div>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-10">{children}</main>
    </div>
  )
}
