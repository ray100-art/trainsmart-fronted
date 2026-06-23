import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { listSessions } from '@/api/sessions'
import { getOverviewStats } from '@/api/stats'
import { useAuth } from '@/hooks/useAuth'
import { hasPermission } from '@/lib/roles'
import { SessionCard } from '@/components/sessions/SessionCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, AlertCircle, Award, FileCheck, Users, GraduationCap } from 'lucide-react'

export function DashboardPage() {
  const { user } = useAuth()
  const countyFilter = user?.role === 'ROLE_COUNTY_OFFICER' ? user.county : undefined

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions', countyFilter],
    queryFn: () => listSessions(countyFilter),
    enabled: !!user,
  })

  const { data: stats } = useQuery({
    queryKey: ['stats', countyFilter],
    queryFn: () => getOverviewStats(countyFilter),
    enabled: !!user,
  })

  if (!user) return null

  const pendingSessionApprovals = sessions.filter((s) => s.approval_status === 'PENDING')
  const pendingReportApprovals = sessions.filter(
    (s) => s.report_submitted_at && s.report_approval_status === 'PENDING',
  )
  const readyForCerts = sessions.filter(
    (s) => s.report_approval_status === 'APPROVED' && !s.certificates_issued,
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back, {user.full_name}</p>
        </div>
        {hasPermission(user.role, 'sessions:create') && (
          <Button asChild>
            <Link to="/sessions/new">
              <Plus className="h-4 w-4" />
              New Session
            </Link>
          </Button>
        )}
      </div>

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <GraduationCap className="h-4 w-4" /> Total Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.total_sessions}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <Users className="h-4 w-4" /> Participants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.total_participants}</p>
              <p className="text-xs text-gray-500">{stats.certified_participants} certified</p>
            </CardContent>
          </Card>
          {hasPermission(user.role, 'sessions:approve') && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <AlertCircle className="h-4 w-4 text-amber-600" /> Pending Approvals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.pending_session_approvals}</p>
              </CardContent>
            </Card>
          )}
          {hasPermission(user.role, 'certificates:issue') && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <Award className="h-4 w-4 text-brand-700" /> Ready for Certs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.ready_for_certificates}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {(hasPermission(user.role, 'sessions:approve') && pendingSessionApprovals.length > 0) && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Sessions awaiting approval</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {pendingSessionApprovals.slice(0, 4).map((s) => (
              <SessionCard key={s.id} session={s} />
            ))}
          </div>
        </section>
      )}

      {(hasPermission(user.role, 'reports:approve') && pendingReportApprovals.length > 0) && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <FileCheck className="h-5 w-5 text-brand-700" />
            Reports awaiting approval
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {pendingReportApprovals.slice(0, 4).map((s) => (
              <SessionCard key={s.id} session={s} />
            ))}
          </div>
        </section>
      )}

      {(hasPermission(user.role, 'certificates:issue') && readyForCerts.length > 0) && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Issue certificates</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {readyForCerts.slice(0, 4).map((s) => (
              <SessionCard key={s.id} session={s} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent sessions</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/sessions">View all</Link>
          </Button>
        </div>
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading sessions…</p>
        ) : sessions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-gray-500">
              No sessions yet.
              {hasPermission(user.role, 'sessions:create') && (
                <> <Link to="/sessions/new" className="text-brand-700 underline">Create your first session</Link></>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {sessions.slice(0, 5).map((s) => (
              <SessionCard key={s.id} session={s} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
