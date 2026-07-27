import type { SessionSummary } from '@/types'
import { statusBadgeVariant } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { CalendarDays, MapPin, Users, ArrowRight, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SessionCardProps {
  session: SessionSummary
}

const statusAccent: Record<string, string> = {
  APPROVED: 'border-l-brand-500', PENDING: 'border-l-amber-400', REJECTED: 'border-l-red-400',
  UPCOMING: 'border-l-blue-400', IN_PROGRESS: 'border-l-amber-400', COMPLETED: 'border-l-brand-500',
}

const statusDot: Record<string, string> = {
  APPROVED: 'bg-brand-500', PENDING: 'bg-amber-400', REJECTED: 'bg-red-400',
  UPCOMING: 'bg-blue-400', IN_PROGRESS: 'bg-amber-400', COMPLETED: 'bg-brand-500',
}

function StatusPill({ status }: { status: string }) {
  const variant = statusBadgeVariant(status)
  const variantStyles: Record<string, string> = {
    approved: 'bg-brand-50 text-brand-700 ring-1 ring-brand-200',
    pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    rejected: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    upcoming: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    progress: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    completed: 'bg-brand-50 text-brand-700 ring-1 ring-brand-200',
    default: 'bg-gray-100 text-gray-600',
  }
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold', variantStyles[variant ?? 'default'])}>
      <span className={cn('h-1.5 w-1.5 rounded-full', statusDot[status] ?? 'bg-gray-400')} />
      {status.replace(/_/g, ' ')}
    </span>
  )
}

export function SessionCard({ session }: SessionCardProps) {
  const accentClass = statusAccent[session.approval_status] ?? 'border-l-gray-300'
  return (
    <Link to={`/sessions/${session.id}`} className="group block">
      <div className={cn(
        'flex overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm',
        'transition-all duration-200 group-hover:-translate-y-px group-hover:shadow-md',
      )}>
        <div className={cn('w-1 shrink-0 self-stretch rounded-l-xl border-l-4', accentClass)} />
        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-[13px] font-bold leading-snug text-gray-900 transition-colors group-hover:text-brand-700">
              {session.title}
            </h3>
            <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-400" />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            {session.program_code && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-brand-700">
                <BookOpen className="h-3 w-3" />
                {session.program_code}
              </span>
            )}
            <span className="flex items-center gap-1 text-[11px] text-gray-500">
              <MapPin className="h-3 w-3 text-gray-400" />
              {session.facility}, {session.county}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-gray-500">
              <CalendarDays className="h-3 w-3 text-gray-400" />
              {formatDate(session.start_date)} – {formatDate(session.end_date)}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              <StatusPill status={session.status} />
              <StatusPill status={session.approval_status} />
              {session.report_submitted_at && <StatusPill status={session.report_approval_status} />}
            </div>
            <span className="flex items-center gap-1 text-[11px] text-gray-500">
              <Users className="h-3 w-3" />
              {session.trainee_count} participant{session.trainee_count !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
