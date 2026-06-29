import { useRef, useState } from 'react'
import { Download, Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react'
import { downloadParticipantTemplate, importParticipantsCsv } from '@/api/participants'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getApiErrorMessage } from '@/lib/utils'

interface ParticipantBulkImportProps {
  sessionId: string
  onImported: () => void
}

export function ParticipantBulkImport({ sessionId, onImported }: ParticipantBulkImportProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ imported: number; errors: { row: number; message: string }[] } | null>(null)

  const handleFile = async (file: File) => {
    setUploading(true)
    setError('')
    setResult(null)
    try {
      const res = await importParticipantsCsv(sessionId, file)
      setResult(res)
      if (res.imported > 0) onImported()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Import failed.'))
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <Card className="border-brand-200 bg-brand-50/40">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4 text-brand-700" />
          <CardTitle className="text-base">Bulk import from CSV</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600">
          Upload a spreadsheet of participants from paper registers. Required columns:{' '}
          <span className="font-mono text-xs">name, cadre, facility</span>
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => downloadParticipantTemplate(sessionId)}>
            <Download className="h-3.5 w-3.5" />
            Download template
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5" />
            {uploading ? 'Importing…' : 'Upload CSV'}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFile(f)
            }}
          />
        </div>
        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
        {result && (
          <div className="space-y-2 rounded-lg bg-white px-3 py-3 ring-1 ring-brand-200">
            <div className="flex items-center gap-2 text-sm font-semibold text-brand-800">
              <CheckCircle2 className="h-4 w-4" />
              {result.imported} participant{result.imported !== 1 ? 's' : ''} imported
            </div>
            {result.errors.length > 0 && (
              <ul className="max-h-32 space-y-1 overflow-y-auto text-xs text-red-700">
                {result.errors.map((e) => (
                  <li key={e.row}>Row {e.row}: {e.message}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
