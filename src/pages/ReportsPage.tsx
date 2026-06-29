import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAnalyticsStats, downloadSessionsExport, downloadParticipantsExport } from '@/api/stats'
import { useAuth } from '@/hooks/useAuth'
import { KENYA_COUNTIES } from '@/lib/constants'
import { hasPermission } from '@/lib/roles'
import { BreakdownTable } from '@/components/dashboard/shared'
import { StatCard } from '@/components/dashboard/StatCard'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, GraduationCap, Users, Award, TrendingUp } from 'lucide-react'
import { getApiErrorMessage } from '@/lib/utils'

export function ReportsPage() {
  const { user } = useAuth()
  const [county, setCounty] = useState('')
  const [exporting, setExporting] = useState<'sessions' | 'participants' | null>(null)
  const [exportError, setExportError] = useState('')

  const countyFilter = county || undefined
  const isCountyLocked = user?.role === 'ROLE_COUNTY_OFFICER'

  const { data: stats, isLoading } = useQuery({
    queryKey: ['analytics', countyFilter],
    queryFn: () => getAnalyticsStats(countyFilter),
    enabled: !!user && hasPermission(user.role, 'analytics:view'),
  })

  if (!user || !hasPermission(user.role, 'analytics:view')) return null

  const effectiveCounty = isCountyLocked ? user.county : countyFilter

  const handleExport = async (type: 'sessions' | 'participants') => {
    setExporting(type)
    setExportError('')
    try {
      if (type === 'sessions') {
        await downloadSessionsExport(effectiveCounty)
      } else {
        await downloadParticipantsExport(effectiveCounty)
      }
    } catch (err) {
      setExportError(getApiErrorMessage(err, 'Export failed. Please try again.'))
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
            National M&E Reports
          </p>
          <h1 className="mt-1 text-2xl font-black text-gray-900">Training Analytics & Export</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor training coverage, cadre distribution, and export data for stakeholder reporting.
          </p>
        </div>
        {hasPermission(user.role, 'reports:export') && (
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => handleExport('sessions')} disabled={!!exporting}>
              <Download className="h-4 w-4" />
              {exporting === 'sessions' ? 'Exporting…' : 'Export Sessions CSV'}
            </Button>
            <Button variant="outline" onClick={() => handleExport('participants')} disabled={!!exporting}>
              <Download className="h-4 w-4" />
              {exporting === 'participants' ? 'Exporting…' : 'Export Participants CSV'}
            </Button>
          </div>
        )}
      </div>

      {!isCountyLocked && (
        <div className="max-w-xs">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-500">
            Filter by County
          </label>
          <Select value={county || 'all'} onValueChange={(v) => setCounty(v === 'all' ? '' : v)}>
            <SelectTrigger>
              <SelectValue placeholder="All counties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All counties</SelectItem>
              {KENYA_COUNTIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {exportError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          {exportError}
        </p>
      )}

      {isLoading ? (
        <div className="h-48 animate-pulse rounded-xl bg-gray-100" />
      ) : stats && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Sessions" value={stats.total_sessions} icon={GraduationCap} color="blue" />
            <StatCard label="Participants" value={stats.total_participants} icon={Users} color="green" />
            <StatCard
              label="Certified"
              value={stats.certified_participants}
              icon={Award}
              color="purple"
            />
            <StatCard
              label="Completed"
              value={stats.completed_sessions}
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
    </div>
  )
}
