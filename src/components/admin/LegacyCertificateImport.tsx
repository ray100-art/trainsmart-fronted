import { useRef, useState } from 'react'
import { Download, Upload, Archive, AlertCircle, CheckCircle2 } from 'lucide-react'
import { api } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getApiErrorMessage } from '@/lib/utils'

interface LegacyImportResult {
  imported: number
  skipped: number
  errors: { row: number; message: string }[]
}

export function LegacyCertificateImport() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<LegacyImportResult | null>(null)

  const downloadTemplate = async () => {
    const { data } = await api.get<Blob>('/certificates/legacy/import/template.csv', { responseType: 'blob' })
    const url = URL.createObjectURL(data)
    const a = document.createElement('a')
    a.href = url
    a.download = 'legacy-certificates-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleFile = async (file: File) => {
    setUploading(true)
    setError('')
    setResult(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const { data } = await api.post<LegacyImportResult>('/certificates/legacy/import', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(data)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Legacy import failed.'))
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Archive className="h-5 w-5 text-brand-700" />
          <CardTitle>Legacy certificate migration</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Import certificates from the old TrainSMART system (pre-2026 and post-2026) so they
          remain verifiable at nhcsc.nascop.org.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={downloadTemplate}>
            <Download className="h-3.5 w-3.5" />
            Download CSV template
          </Button>
          <Button type="button" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
            <Upload className="h-3.5 w-3.5" />
            {uploading ? 'Importing…' : 'Upload legacy CSV'}
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
          <div className="rounded-lg bg-brand-50 px-4 py-3 ring-1 ring-brand-200">
            <div className="flex items-center gap-2 text-sm font-semibold text-brand-800">
              <CheckCircle2 className="h-4 w-4" />
              {result.imported} imported · {result.skipped} skipped (duplicates)
            </div>
            {result.errors.length > 0 && (
              <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs text-red-700">
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
