import { useRef, useState } from 'react'
import { exportBackupJson, importBackupJson } from '../../../lib/storage/db'
import { Button } from '../../../components/ui/Button'

export function BackupControls({ onImported }: { onImported: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleExport = async () => {
    const json = await exportBackupJson()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `studypulse-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMessage('백업 파일을 내려받았습니다.')
    window.setTimeout(() => setMessage(null), 2500)
  }

  const handleImport: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      await importBackupJson(text)
      setMessage('복원이 완료되었습니다.')
      onImported()
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : '가져오기에 실패했습니다.',
      )
    } finally {
      e.target.value = ''
    }
    window.setTimeout(() => setMessage(null), 4000)
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Button type="button" variant="ghost" onClick={() => void handleExport()}>
        백업 보내기
      </Button>
      <Button type="button" variant="ghost" onClick={() => inputRef.current?.click()}>
        백업 가져오기
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleImport}
      />
      {message && <p className="text-sm text-[#8b92a8]">{message}</p>}
    </div>
  )
}
