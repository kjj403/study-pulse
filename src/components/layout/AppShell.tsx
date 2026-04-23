import { useAppTab, type AppTab } from '../../stores/appTabStore'
import { cn } from '../../lib/cn'

const tabs: { id: AppTab; label: string }[] = [
  { id: 'ncs', label: 'NCS 모의고사' },
  { id: 'study', label: '공부 타이머' },
  { id: 'stats', label: '통계' },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const tab = useAppTab((s) => s.tab)
  const setTab = useAppTab((s) => s.setTab)

  return (
    <div className="min-h-full bg-[#0c0e14] text-[#e8eaf0]">
      <header className="border-b border-[#252a3a] bg-[#0c0e14]/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-left">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#5b8cff]">
              StudyPulse
            </p>
            <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
              NCS 시험장의 긴박함을 일상에
            </h1>
            <p className="mt-1 max-w-xl text-sm text-[#8b92a8]">
              실전 타이머와 루틴을 한 앱에서. 데이터는 기기 안에만 저장됩니다.
            </p>
          </div>
          <nav className="flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition',
                  tab === t.id
                    ? 'bg-[#5b8cff] text-white'
                    : 'bg-[#141824] text-[#c9cfde] ring-1 ring-[#252a3a] hover:bg-[#1b2130]',
                )}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  )
}
