import { useQuery } from '@tanstack/react-query'
import { listSessions } from '@/api/sessions'
import { getOverviewStats } from '@/api/stats'
import type { AuthState } from '@/types'
import { SessionCard } from '@/components/sessions/SessionCard'
import { StatCard } from './StatCard'
import { DashboardHeader, SectionHeader, SessionGridSkeleton } from './shared'
import { AlertCircle, FileCheck, GraduationCap, Users, MapPin } from 'lucide-react'

export function CountyOfficerDashboard({ user }: { user: AuthState }) {
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions', 'county', user.county],
    queryFn: () => listSessions(user.county),
  })

  const { data: stats } = useQuery({
    queryKey: ['stats', 'county', user.county],
    queryFn: () => getOverviewStats(user.county),
  })

  const pendingSessionApprovals = sessions.filter((s) => s.approval_status === 'PENDING')
  const pendingReportApprovals = sessions.filter(
    (s) => s.report_submitted_at && s.report_approval_status === 'PENDING',
  )

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-8">
      <DashboardHeader
        subtitle={`County Training Officer · ${user.county}`}
        greeting={`${greeting}, ${user.full_name.split(' ')[0]}`}
      />

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label={`Sessions in ${user.county}`}
            value={stats.total_sessions}
            sub={`${stats.completed_sessions} completed`}
            icon={GraduationCap}
            color="blue"
          />
          <StatCard
            label="Participants"
            value={stats.total_participants}
            sub={`${stats.certified_participants} certified`}
            icon={Users}
            color="green"
          />
          <StatCard
            label="Pending Approvals"
            value={stats.pending_session_approvals}
            icon={AlertCircle}
            color="amber"
          />
          <StatCard
            label="Reports to Review"
            value={stats.pending_report_approvals}
            icon={FileCheck}
            color="purple"
          />
        </div>
      )}

      {pendingSessionApprovals.length > 0 && (
        <section>
          <SectionHeader
            title={`Sessions awaiting your approval (${pendingSessionApprovals.length})`}
            icon={AlertCircle}
          />
          <div className="grid gap-4 md:grid-cols-2">
            {pendingSessionApprovals.map((s) => (
              <SessionCard key={s.id} session={s} />
            ))}
          </div>
        </section>
      )}

      {pendingReportApprovals.length > 0 && (
        <section>
          <SectionHeader
            title={`Reports awaiting your review (${pendingReportApprovals.length})`}
            icon={FileCheck}
          />
          <div className="grid gap-4 md:grid-cols-2">
            {pendingReportApprovals.map((s) => (
              <SessionCard key={s.id} session={s} />
            ))}
          </div>
        </section>
      )}

      {pendingSessionApprovals.length === 0 && pendingReportApprovals.length === 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-brand-200 bg-brand-50 px-5 py-4">
          <MapPin className="h-5 w-5 shrink-0 text-brand-700" />
          <p className="text-sm text-brand-800">
            No pending approvals in <strong>{user.county}</strong>. All caught up.
          </p>
        </div>
      )}

      <section>
        <SectionHeader title={`Recent sessions in ${user.county}`} linkTo="/sessions" />
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
