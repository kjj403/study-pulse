export type SessionKind = 'ncs' | 'study'

export interface NcsSessionRecord {
  kind: 'ncs'
  id: string
  startedAt: number
  endedAt: number
  areaId: string
  areaLabel: string
  questionCount: number
  solvedCount: number
  durationSec: number
}

export interface StudySessionRecord {
  kind: 'study'
  id: string
  startedAt: number
  endedAt: number
  phase: 'focus' | 'break'
  subject: string
  tags: string[]
  durationSec: number
  presetLabel: string
}

export type StoredSession = NcsSessionRecord | StudySessionRecord

export interface BackupPayload {
  version: 1
  exportedAt: number
  sessions: StoredSession[]
}
