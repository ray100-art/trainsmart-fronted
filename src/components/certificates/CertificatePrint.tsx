import { formatDate } from '@/lib/utils'
import type { Participant, TrainingSession } from '@/types'

interface CertificatePrintProps {
  session: TrainingSession
  participant: Participant
}

export function CertificatePrint({ session, participant }: CertificatePrintProps) {
  return (
    <div className="certificate-print mx-auto max-w-2xl bg-white text-gray-900">
      <div className="relative border-8 border-double border-brand-700 p-0">
        <div className="flex h-2">
          <div className="flex-1 bg-brand-700" />
          <div className="flex-1 bg-kenya-red" />
          <div className="flex-1 bg-gray-200" />
        </div>
        <div className="px-10 py-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border-2 border-brand-700 bg-brand-50">
              <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden="true">
                <rect x="9.5" y="3" width="5" height="18" rx="1.5" fill="#006622" />
                <rect x="3" y="9.5" width="18" height="5" rx="1.5" fill="#006622" />
                <circle cx="12" cy="12" r="10.5" stroke="#006622" strokeWidth="1.5" fill="none" />
              </svg>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
              Ministry of Health Kenya · NASCOP
            </p>
            <h1 className="mt-2 text-2xl font-black uppercase tracking-wide text-brand-800">
              Certificate of Training Completion
            </h1>
            <div className="mx-auto mt-2 h-0.5 w-24 bg-kenya-red" />
          </div>
          <div className="space-y-3 text-center text-sm leading-relaxed text-gray-700">
            <p>This is to certify that</p>
            <p className="text-3xl font-black text-brand-700">{participant.name}</p>
            <p className="text-base font-semibold text-gray-600">
              {participant.cadre}{participant.facility ? ` · ${participant.facility}` : ''}
            </p>
            <p className="mx-auto max-w-lg text-[13px] leading-relaxed text-gray-600">
              has successfully completed the training programme{' '}
              <span className="font-bold text-gray-900">&ldquo;{session.title}&rdquo;</span>
              {session.program_code ? (
                <> (<span className="font-semibold">{session.program_code}</span>)</>
              ) : null}{' '}
              held at{' '}
              <span className="font-semibold">{session.facility}</span>,{' '}
              <span className="font-semibold">{session.county}</span> County, from{' '}
              <span className="font-semibold">{formatDate(session.start_date)}</span> to{' '}
              <span className="font-semibold">{formatDate(session.end_date)}</span>.
            </p>
            {participant.post_test_score != null && (
              <p className="text-sm">
                Post-training assessment score:{' '}
                <span className="font-black text-brand-700">{participant.post_test_score}%</span>
              </p>
            )}
          </div>
          <div className="mt-10 flex justify-around text-center text-xs text-gray-500">
            <div>
              <div className="mx-auto mb-1 h-0.5 w-32 bg-gray-400" />
              <p className="font-semibold text-gray-700">County Health Officer</p>
              <p>Signature &amp; Stamp</p>
            </div>
            <div>
              <div className="mx-auto mb-1 h-0.5 w-32 bg-gray-400" />
              <p className="font-semibold text-gray-700">NASCOP Director</p>
              <p>Authorised Signatory</p>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-5 text-center">
            <p className="font-mono text-base font-black tracking-wider text-brand-700">
              {participant.certificate_serial}
            </p>
            <p className="mt-1 text-[11px] text-gray-400">
              Verify the authenticity of this certificate at{' '}
              <span className="font-semibold text-brand-600">nhcsc.nascop.org/verify</span>
            </p>
          </div>
        </div>
        <div className="flex h-2">
          <div className="flex-1 bg-gray-200" />
          <div className="flex-1 bg-kenya-red" />
          <div className="flex-1 bg-brand-700" />
        </div>
      </div>
    </div>
  )
}
