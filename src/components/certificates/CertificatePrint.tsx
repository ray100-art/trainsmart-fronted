import { formatDate } from '@/lib/utils'
import { BRAND_LOGOS } from '@/lib/brand'
import type { Participant, TrainingSession } from '@/types'

interface CertificatePrintProps {
  session: TrainingSession
  participant: Participant
}

export function CertificatePrint({ session, participant }: CertificatePrintProps) {
  return (
    <div className="certificate-print mx-auto max-w-4xl bg-white text-gray-900">
      <div className="relative overflow-hidden border-[10px] border-double border-brand-700 bg-white">
        <div className="absolute inset-6 rounded-[28px] border border-brand-100" aria-hidden="true" />
        <div className="absolute left-0 right-0 top-0 flex h-2" aria-hidden="true">
          <div className="flex-1 bg-brand-700" />
          <div className="flex-1 bg-kenya-red" />
          <div className="flex-1 bg-gray-200" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 flex h-2" aria-hidden="true">
          <div className="flex-1 bg-gray-200" />
          <div className="flex-1 bg-kenya-red" />
          <div className="flex-1 bg-brand-700" />
        </div>

        <div className="relative px-12 py-12">
          <div className="mb-8 flex items-start justify-between gap-6 border-b border-brand-100 pb-6">
            <div className="max-w-[180px]">
              <img
                src={BRAND_LOGOS.moh}
                alt="Ministry of Health Kenya"
                className="h-24 w-auto object-contain"
              />
            </div>
            <div className="flex-1 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-gray-500">
                Republic of Kenya
              </p>
              <p className="mt-2 text-sm font-semibold uppercase tracking-[0.22em] text-brand-700">
                Ministry of Health
              </p>
              <h1 className="mt-4 text-4xl font-black uppercase tracking-[0.18em] text-brand-800">
                Certificate
              </h1>
              <p className="mt-2 text-sm font-semibold uppercase tracking-[0.28em] text-gray-500">
                Of Training Completion
              </p>
            </div>
            <div className="flex max-w-[160px] items-start justify-end">
              <img
                src={BRAND_LOGOS.nascop}
                alt="NASCOP"
                className="h-16 w-auto object-contain"
              />
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm italic tracking-wide text-gray-500">This is to certify that</p>
            <p className="mt-4 text-4xl font-black tracking-wide text-brand-700">
              {participant.name}
            </p>
            <div className="mx-auto mt-3 h-px w-80 max-w-full bg-brand-200" />
            <p className="mt-3 text-sm font-medium uppercase tracking-[0.18em] text-gray-500">
              {participant.cadre}
              {participant.facility ? ` · ${participant.facility}` : ''}
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-3xl rounded-3xl border border-brand-100 bg-brand-50/35 px-8 py-7 text-center shadow-sm">
            <p className="text-[15px] leading-8 text-gray-700">
              has successfully completed the training programme
            </p>
            <p className="mt-3 text-2xl font-bold leading-relaxed text-gray-900">
              &ldquo;{session.title}&rdquo;
            </p>
            {session.program_code ? (
              <p className="mt-1 text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">
                Programme Code: {session.program_code}
              </p>
            ) : null}
            <p className="mt-4 text-[15px] leading-8 text-gray-700">
              conducted at <span className="font-semibold text-gray-900">{session.facility}</span>,{' '}
              <span className="font-semibold text-gray-900">{session.county}</span> County from{' '}
              <span className="font-semibold text-gray-900">{formatDate(session.start_date)}</span> to{' '}
              <span className="font-semibold text-gray-900">{formatDate(session.end_date)}</span>.
            </p>
            {participant.post_test_score != null && (
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-2 text-sm shadow-sm">
                <span className="text-gray-500">Post-training assessment score</span>
                <span className="font-black text-brand-700">{participant.post_test_score}%</span>
              </div>
            )}
          </div>

          <div className="mt-10 grid gap-4 text-sm text-gray-600 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                Awarded To
              </p>
              <p className="mt-2 font-semibold text-gray-900">{participant.name}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                Training Venue
              </p>
              <p className="mt-2 font-semibold text-gray-900">{session.facility}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                County
              </p>
              <p className="mt-2 font-semibold text-gray-900">{session.county}</p>
            </div>
          </div>

          <div className="mt-12 grid gap-10 text-center text-xs text-gray-500 md:grid-cols-2">
            <div>
              <div className="mx-auto h-px w-40 bg-gray-400" />
              <p className="mt-2 font-semibold uppercase tracking-[0.16em] text-gray-700">
                County Health Officer
              </p>
              <p>Signature &amp; Official Stamp</p>
            </div>
            <div>
              <div className="mx-auto h-px w-40 bg-gray-400" />
              <p className="mt-2 font-semibold uppercase tracking-[0.16em] text-gray-700">
                NASCOP Director
              </p>
              <p>Authorised Signatory</p>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-brand-100 bg-gray-50 px-6 py-5 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">
              Certificate Serial Number
            </p>
            <p className="mt-2 font-mono text-lg font-black tracking-[0.24em] text-brand-700">
              {participant.certificate_serial}
            </p>
            <p className="mt-2 text-[11px] text-gray-500">
              Verify the authenticity of this certificate at{' '}
              <span className="font-semibold text-brand-700">nhcsc.nascop.org/verify</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
