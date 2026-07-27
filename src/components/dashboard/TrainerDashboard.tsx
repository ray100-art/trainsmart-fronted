import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { listSessions } from '@/api/sessions'
import { getOverviewStats } from '@/api/stats'
import type { AuthState } from '@/types'
import { SessionCard } from '@/components/sessions/SessionCard'
import { Button } from '@/components/ui/button'
import { StatCard } from './StatCard'
import { DashboardHeader, EmptySessions, SectionHeader, SessionGridSkeleton } from './shared'
import {
  Plus, AlertCircle, FileText, GraduationCap, Users,
  ClipboardList, RotateCcw,
} from 'lucide-react'

export function TrainerDashboard({ user }: { user: AuthState }) {
  const { data, isLoading } = useQuery({
    queryKey: ['sessions', 'trainer', user.county],
    queryFn: () => listSessions(user.county, 0, 50),
  })
  const sessions = data?.items ?? []

  const { data: stats } = useQuery({
    queryKey: ['stats', 'trainer', user.county],
    queryFn: () => getOverviewStats(user.county),
  })

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const pendingApproval = sessions.filter((s) => s.approval_status === 'PENDING')
  const rejected = sessions.filter((s) => s.approval_status === 'REJECTED')
  const inProgress = sessions.filter((s) => s.status === 'IN_PROGRESS')
  const reportDue = sessions.filter(
    (s) => s.approval_status === 'APPROVED' && s.status === 'COMPLETED' && !s.report_submitted_at,
  )
  const reportRejected = sessions.filter((s) => s.report_approval_status === 'REJECTED')
  const needsAction = [...rejected, ...reportDue, ...reportRejected, ...pendingApproval]

  return (
    <div className="space-y-8">
      <DashboardHeader
        subtitle="Field Trainer · My Training Sessions"
        greeting={`${greeting}, ${user.full_name.split(' ')[0]}`}
        action={
          <Button asChild>
            <Link to="/sessions/new">
              <Plus className="h-4 w-4" />
              New Session
            </Link>
          </Button>
        }
      />

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="My Sessions" value={stats.total_sessions} icon={GraduationCap} color="blue" />
          <StatCard
            label="Participants Trained"
            value={stats.present_participants}
            sub={`${stats.total_participants} registered`}
            icon={Users}
            color="green"
          />
          <StatCard
            label="Awaiting Approval"
            value={stats.pending_session_approvals}
            icon={AlertCircle}
            color="amber"
          />
          <StatCard
            label="Reports Due"
            value={stats.reports_due}
            sub={stats.rejected_reports ? `${stats.rejected_reports} rejected` : undefined}
            icon={FileText}
            color="purple"
          />
        </div>
      )}

      {needsAction.length > 0 && (
        <section>
          <SectionHeader title="Action required" icon={ClipboardList} linkTo="/sessions" />
          <div className="grid gap-4 md:grid-cols-2">
            {needsAction.slice(0, 4).map((s) => (
              <SessionCard key={s.id} session={s} />
            ))}
          </div>
        </section>
      )}

      {inProgress.length > 0 && (
        <section>
          <SectionHeader title="Sessions in progress" icon={RotateCcw} />
          <div className="grid gap-4 md:grid-cols-2">
            {inProgress.slice(0, 4).map((s) => (
              <SessionCard key={s.id} session={s} />
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionHeader title="My recent sessions" linkTo="/sessions" />
        {isLoading ? (
          <SessionGridSkeleton />
        ) : sessions.length === 0 ? (
          <EmptySessions
            message="You haven't created any training sessions yet."
            cta={
              <Link to="/sessions/new" className="text-sm font-medium text-brand-700 hover:underline">
                Create your first session in {user.county}
              </Link>
            }
          />
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
