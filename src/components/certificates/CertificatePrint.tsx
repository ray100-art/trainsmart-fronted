import { KenyaStripe } from '@/components/layout/Brand'
import { formatDate } from '@/lib/utils'
import type { Participant, TrainingSession } from '@/types'

interface CertificatePrintProps {
  session: TrainingSession
  participant: Participant
}

export function CertificatePrint({ session, participant }: CertificatePrintProps) {
  return (
    <div className="certificate-print mx-auto max-w-2xl border-2 border-brand-700 bg-white p-8 text-gray-900">
      <KenyaStripe />
      <div className="mt-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
          Ministry of Health Kenya · NASCOP
        </p>
        <h1 className="mt-2 text-2xl font-black text-brand-700">
          Certificate of Training Completion
        </h1>
        <p className="mt-1 text-sm text-gray-600">{session.title}</p>
      </div>

      <div className="mt-8 space-y-4 text-sm leading-relaxed">
        <p>This is to certify that</p>
        <p className="text-center text-2xl font-bold text-brand-700">{participant.name}</p>
        <p className="text-center text-gray-600">{participant.cadre} · {participant.facility}</p>
        <p>
          successfully completed training at <strong>{session.facility}</strong>,{' '}
          <strong>{session.county}</strong> County, from{' '}
          {formatDate(session.start_date)} to {formatDate(session.end_date)}.
        </p>
        {participant.post_test_score != null && (
          <p>Post-training assessment score: <strong>{participant.post_test_score}%</strong></p>
        )}
      </div>

      <div className="mt-10 border-t pt-6 text-center">
        <p className="font-mono text-sm font-bold text-brand-700">{participant.certificate_serial}</p>
        <p className="mt-1 text-xs text-gray-500">Verify at nhcsc.nascop.org/verify</p>
      </div>
    </div>
  )
}
