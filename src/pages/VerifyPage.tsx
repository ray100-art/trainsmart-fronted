import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { verifyCertificate } from '@/api/certificates'
import { BrandLogo, KenyaStripe } from '@/components/layout/Brand'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, getApiErrorMessage } from '@/lib/utils'
import type { CertificateVerification } from '@/types'
import { CheckCircle2, ShieldCheck, XCircle } from 'lucide-react'

export function VerifyPage() {
  const { serial: routeSerial } = useParams()
  const [serial, setSerial] = useState(routeSerial ?? '')
  const [result, setResult] = useState<CertificateVerification | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleVerify = async (value?: string) => {
    const s = (value ?? serial).trim()
    if (!s) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const data = await verifyCertificate(s)
      setResult(data)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Certificate not found.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (routeSerial) {
      setSerial(routeSerial)
      handleVerify(routeSerial)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeSerial])

  return (
    <div className="min-h-screen bg-surface">
      <div className="border-b bg-white">
        <KenyaStripe />
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <BrandLogo />
          <Button variant="outline" size="sm" asChild>
            <Link to="/login">Staff Login</Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-brand-700" />
              Verify Certificate
            </CardTitle>
            <CardDescription>
              Enter a TrainSMART certificate serial number to verify authenticity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g. MOH-TS-NAI-2026-ABC123-001"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                className="font-mono"
              />
              <Button onClick={() => handleVerify()} disabled={loading}>
                {loading ? 'Checking…' : 'Verify'}
              </Button>
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4 text-red-800">
                <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {result && (
              <div className="rounded-lg border border-brand-100 bg-brand-100/30 p-6">
                <div className="mb-4 flex items-center gap-2 text-brand-700">
                  <CheckCircle2 className="h-6 w-6" />
                  <span className="text-lg font-bold">Valid Certificate</span>
                </div>
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-semibold uppercase text-gray-500">Participant</dt>
                    <dd className="font-medium">{result.participant_name}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase text-gray-500">Cadre</dt>
                    <dd>{result.cadre}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase text-gray-500">Course</dt>
                    <dd>{result.course}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase text-gray-500">County</dt>
                    <dd>{result.county}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase text-gray-500">Facility</dt>
                    <dd>{result.facility}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase text-gray-500">Training dates</dt>
                    <dd>{formatDate(result.start_date)} – {formatDate(result.end_date)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase text-gray-500">Post-test score</dt>
                    <dd>{result.post_test_score ?? '—'}%</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-semibold uppercase text-gray-500">Serial</dt>
                    <dd className="font-mono font-bold text-brand-700">{result.serial}</dd>
                  </div>
                </dl>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-gray-400">
          TrainSMART · NASCOP · Ministry of Health Kenya · nhcsc.nascop.org
        </p>
      </div>
    </div>
  )
}
