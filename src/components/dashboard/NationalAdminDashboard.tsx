import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { listSessions } from '@/api/sessions'
import { getOverviewStats } from '@/api/stats'
import type { AuthState } from '@/types'
import { SessionCard } from '@/components/sessions/SessionCard'
import { Button } from '@/components/ui/button'
import { StatCard } from './StatCard'
import { BreakdownTable, DashboardHeader, SectionHeader, SessionGridSkeleton } from './shared'
import {
  Award, FileCheck, GraduationCap, Users, MapPin,
  BarChart3,
} from 'lucide-react'
import { hasPermission } from '@/lib/roles'

export function NationalAdminDashboard({ user }: { user: AuthState }) {
  const { data, isLoading } = useQuery({
    queryKey: ['sessions', 'national'],
    queryFn: () => listSessions({ skip: 0, limit: 50 }),
  })
  const sessions = data?.items ?? []

  const { data: stats } = useQuery({
    queryKey: ['stats', 'national'],
    queryFn: () => getOverviewStats(),
  })

  const readyForCerts = sessions.filter(
    (s) => s.report_approval_status === 'APPROVED' && !s.certificates_issued,
  )
  const pendingReports = sessions.filter(
    (s) => s.report_submitted_at && s.report_approval_status === 'PENDING',
  )

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-8">
      <DashboardHeader
        subtitle="National Administrator · Country-wide Overview"
        greeting={`${greeting}, ${user.full_name.split(' ')[0]}`}
        action={
          hasPermission(user.role, 'analytics:view') ? (
            <Button variant="outline" asChild>
              <Link to="/reports">
                <BarChart3 className="h-4 w-4" />
                National Reports
              </Link>
            </Button>
          ) : undefined
        }
      />

      {stats && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Sessions"
              value={stats.total_sessions}
              sub={`${stats.completed_sessions} completed`}
              icon={GraduationCap}
              color="blue"
            />
            <StatCard
              label="Participants Nationwide"
              value={stats.total_participants}
              sub={`${stats.certified_participants} certified`}
              icon={Users}
              color="green"
            />
            <StatCard
              label="Ready for Certificates"
              value={stats.ready_for_certificates}
              icon={Award}
              color="purple"
            />
            <StatCard
              label="Certificates Issued"
              value={stats.certificates_issued_sessions}
              sub={`${stats.certified_participants} trainees`}
              icon={Award}
              color="green"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <BreakdownTable title="Sessions by County" data={stats.sessions_by_county} />
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
                <MapPin className="h-4 w-4 text-brand-700" />
                National Pipeline
              </h3>
              <dl className="grid grid-cols-2 gap-4">
                <PipelineItem label="Pending session approvals" value={stats.pending_session_approvals} />
                <PipelineItem label="Pending report reviews" value={stats.pending_report_approvals} />
                <PipelineItem label="In progress" value={stats.in_progress_sessions} />
                <PipelineItem label="Approved sessions" value={stats.approved_sessions} />
              </dl>
            </div>
          </div>
        </>
      )}

      {readyForCerts.length > 0 && (
        <section>
          <SectionHeader
            title={`Issue certificates (${readyForCerts.length} sessions ready)`}
            icon={Award}
          />
          <div className="grid gap-4 md:grid-cols-2">
            {readyForCerts.slice(0, 6).map((s) => (
              <SessionCard key={s.id} session={s} />
            ))}
          </div>
        </section>
      )}

      {pendingReports.length > 0 && (
        <section>
          <SectionHeader
            title={`Reports awaiting county review (${pendingReports.length})`}
            icon={FileCheck}
          />
          <p className="mb-4 text-sm text-gray-500">
            County officers review reports. You issue certificates once reports are approved.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {pendingReports.slice(0, 4).map((s) => (
              <SessionCard key={s.id} session={s} />
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionHeader title="Recent sessions nationwide" linkTo="/sessions" />
        {isLoading ? (
          <SessionGridSkeleton />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {sessions.slice(0, 6).map((s) => (
              <SessionCard key={s.id} session={s} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function PipelineItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-gray-50 px-4 py-3">
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="mt-0.5 text-2xl font-black text-gray-900">{value}</dd>
    </div>
  )
}
