import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { verifyCertificate } from '@/api/certificates'
import { BrandLogo, KenyaStripe, PartnerLogos } from '@/components/layout/Brand'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDate, getApiErrorMessage } from '@/lib/utils'
import type { CertificateVerification } from '@/types'
import {
  CheckCircle2, ShieldCheck, XCircle, Search, Award,
  CalendarDays, MapPin, User, GraduationCap, History,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type CertEra = 'post_2018' | 'pre_2018'

export function VerifyPage() {
  const { serial: routeSerial } = useParams()
  const [serial, setSerial] = useState(routeSerial ?? '')
  const [era, setEra] = useState<CertEra>('post_2018')
  const [result, setResult] = useState<CertificateVerification | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleVerify = async (value?: string, eraOverride?: CertEra) => {
    const s = (value ?? serial).trim()
    if (!s) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      setResult(await verifyCertificate(s, eraOverride ?? era))
    } catch (err) {
      setError(getApiErrorMessage(err, 'Certificate not found. Check the serial number and period.'))
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
      <header className="bg-brand-800">
        <KenyaStripe />
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <BrandLogo light />
          <Button variant="outline" size="sm" asChild className="border-white/20 bg-white/10 text-white hover:bg-white/20">
            <Link to="/login">Staff Login</Link>
          </Button>
        </div>
      </header>
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8 text-center">
          <div className="mb-5 rounded-2xl border border-gray-100 bg-white px-6 py-4 shadow-sm">
            <PartnerLogos size="md" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Certificate Verification</h1>
          <p className="mt-1 text-sm text-gray-500">
            Verify NASCOP TrainSMART certificates — current system and legacy records
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
            Certificate Serial Number
          </label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. MOH-TS-NAI-2026-ABC123-001"
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              className="h-11 flex-1 font-mono text-[13px]"
            />
            <Button onClick={() => handleVerify()} disabled={loading || !serial.trim()} className="h-11 px-5">
              <Search className="h-4 w-4" />
              {loading ? 'Checking…' : 'Verify'}
            </Button>
          </div>

          <div className="mt-5">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-500">
              <History className="h-3.5 w-3.5" />
              Certificate period
            </p>
            <div className="grid grid-cols-2 gap-2">
              {([
                ['post_2018', 'On or after 1 Jan 2026'],
                ['pre_2018', 'Before 1 Jan 2026'],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setEra(value)}
                  className={cn(
                    'rounded-xl border px-3 py-2.5 text-left text-sm transition-all',
                    era === value
                      ? 'border-brand-500 bg-brand-50 font-semibold text-brand-800 ring-1 ring-brand-200'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-3 text-[11px] text-gray-400">
            New certificates: MOH-TS-[COUNTY]-[YEAR]-[SESSION]-[SEQ]. Legacy serials from the old TrainSMART system are also supported.
          </p>
        </div>
        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-xl bg-red-50 px-5 py-4 ring-1 ring-red-200">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            <div>
              <p className="text-sm font-semibold text-red-800">Certificate not found</p>
              <p className="mt-0.5 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}
        {result && (
          <div className="mt-5 overflow-hidden rounded-2xl border border-brand-200 bg-white shadow-sm">
            <div className="flex items-start gap-4 bg-brand-700 px-6 py-5 text-white">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <CheckCircle2 className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/60">Valid Certificate</p>
                <p className="mt-0.5 text-lg font-black">{result.participant_name}</p>
                <p className="text-sm text-white/75">{result.cadre}</p>
                {result.source === 'legacy' && (
                  <p className="mt-1 text-[11px] text-white/50">Legacy TrainSMART record ({result.era?.replace('_', ' ')})</p>
                )}
              </div>
              <div className="ml-auto hidden text-right sm:block">
                <p className="text-[11px] text-white/50">Serial</p>
                <p className="font-mono text-sm font-bold text-brand-accent">{result.serial}</p>
              </div>
            </div>
            <dl className="grid grid-cols-2 divide-y divide-gray-100">
              <DetailItem icon={GraduationCap} label="Course" value={result.course} span />
              <DetailItem icon={User} label="Facility" value={result.facility} />
              <DetailItem icon={MapPin} label="County" value={result.county} />
              {result.start_date && result.end_date && (
                <DetailItem icon={CalendarDays} label="Training Dates" value={`${formatDate(result.start_date)} – ${formatDate(result.end_date)}`} />
              )}
              <DetailItem icon={Award} label="Post-test Score" value={result.post_test_score != null ? `${result.post_test_score}%` : '—'} />
              {result.issued_date && (
                <DetailItem icon={CalendarDays} label="Issued" value={formatDate(result.issued_date)} />
              )}
            </dl>
            <div className="border-t px-6 py-3">
              <p className="text-[11px] text-gray-400">Issued by Ministry of Health Kenya · NASCOP · nhcsc.nascop.org</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DetailItem({ icon: Icon, label, value, span }: { icon: React.ElementType; label: string; value: string; span?: boolean }) {
  return (
    <div className={['px-6 py-4', span ? 'col-span-2' : ''].join(' ')}>
      <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
        <Icon className="h-3 w-3" />{label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-gray-900">{value}</dd>
    </div>
  )
}
