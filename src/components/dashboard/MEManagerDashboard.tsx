import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getAnalyticsStats } from '@/api/stats'
import type { AuthState } from '@/types'
import { Button } from '@/components/ui/button'
import { StatCard } from './StatCard'
import { BreakdownTable, DashboardHeader } from './shared'
import { BarChart3, Download, GraduationCap, Users, Award, TrendingUp } from 'lucide-react'

export function MEManagerDashboard({ user }: { user: AuthState }) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['analytics', 'national'],
    queryFn: () => getAnalyticsStats(),
  })

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-8">
      <DashboardHeader
        subtitle="M&E Manager · Monitoring & Evaluation"
        greeting={`${greeting}, ${user.full_name.split(' ')[0]}`}
        action={
          <Button variant="outline" asChild>
            <Link to="/reports">
              <BarChart3 className="h-4 w-4" />
              Full Reports
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : stats && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Sessions"
              value={stats.total_sessions}
              sub={`${stats.approved_sessions} approved`}
              icon={GraduationCap}
              color="blue"
            />
            <StatCard
              label="Participants"
              value={stats.total_participants}
              sub={`${stats.present_participants} attended`}
              icon={Users}
              color="green"
            />
            <StatCard
              label="Certification Rate"
              value={
                stats.total_participants
                  ? `${Math.round((stats.certified_participants / stats.total_participants) * 100)}%`
                  : '—'
              }
              sub={`${stats.certified_participants} certified`}
              icon={Award}
              color="purple"
            />
            <StatCard
              label="Completion Rate"
              value={
                stats.total_sessions
                  ? `${Math.round((stats.completed_sessions / stats.total_sessions) * 100)}%`
                  : '—'
              }
              sub={`${stats.completed_sessions} completed`}
              icon={TrendingUp}
              color="green"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <BreakdownTable title="Participants by Cadre" data={stats.participants_by_cadre} />
            <BreakdownTable title="Sessions by County" data={stats.sessions_by_county} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <BreakdownTable title="Sessions by Status" data={stats.sessions_by_status} />
            <BreakdownTable title="Sessions by Approval" data={stats.sessions_by_approval} />
          </div>
        </>
      )}

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-gray-900">Export training data</h3>
            <p className="mt-1 text-sm text-gray-500">
              Download a CSV of all sessions for donor reports and national M&E.
            </p>
          </div>
          <Button asChild>
            <Link to="/reports">
              <Download className="h-4 w-4" />
              Go to Reports
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
