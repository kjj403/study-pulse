import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { BackupPayload, StoredSession } from '../../types'

interface StudyPulseDB extends DBSchema {
  sessions: {
    key: string
    value: StoredSession
    indexes: { 'by-started': number }
  }
}

const DB_NAME = 'studypulse'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<StudyPulseDB>> | null = null

export function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<StudyPulseDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore('sessions', { keyPath: 'id' })
        store.createIndex('by-started', 'startedAt')
      },
    })
  }
  return dbPromise
}

export async function addSession(session: StoredSession) {
  const db = await getDb()
  await db.add('sessions', session)
}

export async function getAllSessions(): Promise<StoredSession[]> {
  const db = await getDb()
  return db.getAll('sessions')
}

export async function getSessionsBetween(
  fromMs: number,
  toMs: number,
): Promise<StoredSession[]> {
  const db = await getDb()
  const idx = db.transaction('sessions').store.index('by-started')
  return idx.getAll(IDBKeyRange.bound(fromMs, toMs))
}

export async function clearAllSessions() {
  const db = await getDb()
  await db.clear('sessions')
}

export async function bulkAddSessions(sessions: StoredSession[]) {
  const db = await getDb()
  const tx = db.transaction('sessions', 'readwrite')
  await Promise.all([...sessions.map((s) => tx.store.put(s)), tx.done])
}

export async function exportBackupJson(): Promise<string> {
  const sessions = await getAllSessions()
  const payload: BackupPayload = {
    version: 1,
    exportedAt: Date.now(),
    sessions,
  }
  return JSON.stringify(payload, null, 2)
}

export async function importBackupJson(raw: string) {
  const parsed = JSON.parse(raw) as BackupPayload
  if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.sessions)) {
    throw new Error('잘못된 백업 형식입니다.')
  }
  await clearAllSessions()
  await bulkAddSessions(parsed.sessions)
}
