import type { StudyPreset } from '../../types'

export const DEFAULT_STUDY_PRESETS: StudyPreset[] = [
  { id: 'pomodoro', label: '뽀모도로', focusMin: 25, breakMin: 5 },
  { id: 'deep', label: '심화 학습', focusMin: 50, breakMin: 10 },
  { id: 'short', label: '단기 집중', focusMin: 15, breakMin: 3 },
]
