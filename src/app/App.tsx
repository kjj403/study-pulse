import { AppShell } from '../components/layout/AppShell'
import { NcsModePage } from '../features/ncs/NcsModePage'
import { StudyModePage } from '../features/study/StudyModePage'
import { StatsPage } from '../features/stats/StatsPage'
import { useAppTab } from '../stores/appTabStore'

export default function App() {
  const tab = useAppTab((s) => s.tab)

  return (
    <AppShell>
      {tab === 'ncs' && <NcsModePage />}
      {tab === 'study' && <StudyModePage />}
      {tab === 'stats' && <StatsPage />}
    </AppShell>
  )
}
