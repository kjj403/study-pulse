import type { NcsPreset } from '../../types'

export const DEFAULT_NCS_PRESETS: NcsPreset[] = [
  {
    id: 'comm',
    label: '의사소통능력',
    areaId: 'communication',
    questionCount: 10,
    minutes: 10,
  },
  {
    id: 'math',
    label: '수리능력',
    areaId: 'quant',
    questionCount: 10,
    minutes: 15,
  },
  {
    id: 'solve',
    label: '문제해결능력',
    areaId: 'problem_solving',
    questionCount: 10,
    minutes: 15,
  },
  {
    id: 'resource',
    label: '자원관리능력',
    areaId: 'resource',
    questionCount: 10,
    minutes: 12,
  },
]
