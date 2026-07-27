import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { listSessions } from '@/api/sessions'
import { useAuth } from '@/hooks/useAuth'
import { hasPermission } from '@/lib/roles'
import { KENYA_COUNTIES } from '@/lib/constants'
import { SessionCard } from '@/components/sessions/SessionCard'
import { SessionsSkeleton } from '@/components/ui/PageLoader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZE = 50

export function SessionsPage() {
  const { user } = useAuth()
  const [countyFilter, setCountyFilter] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['sessions', countyFilter, user?.role, page],
    queryFn: () => {
      const county = countyFilter || (user?.role === 'ROLE_COUNTY_OFFICER' || user?.role === 'ROLE_TRAINER' ? user.county : undefined)
      return listSessions(county, page * PAGE_SIZE, PAGE_SIZE)
    },
    enabled: !!user,
  })

  const sessions = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const filtered = sessions.filter((s) => {
    if (!search) return true
    const q = search.toLowerCase()
    return s.title.toLowerCase().includes(q) || s.facility.toLowerCase().includes(q) || s.county.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Training Registry</p>
          <h1 className="mt-1 text-2xl font-black text-gray-900">Training Sessions</h1>
          <p className="text-sm text-gray-500">
            {total} session{total !== 1 ? 's' : ''}
            {search ? ` · ${filtered.length} match on this page` : ''}
          </p>
        </div>
        {user && hasPermission(user.role, 'sessions:create') && (
          <Button asChild>
            <Link to="/sessions/new"><Plus className="h-4 w-4" />New Session</Link>
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search this page by title, facility, county…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        {user?.role !== 'ROLE_COUNTY_OFFICER' && user?.role !== 'ROLE_TRAINER' && (
          <Select
            value={countyFilter || 'all'}
            onValueChange={(v) => {
              setCountyFilter(v === 'all' ? '' : v)
              setPage(0)
            }}
          >
            <SelectTrigger className="w-48"><SelectValue placeholder="All counties" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All counties</SelectItem>
              {KENYA_COUNTIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>
      {isLoading ? (
        <SessionsSkeleton />
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-700">
          Could not load sessions. Please try again.
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border bg-white py-16 text-center shadow-sm">
          <ClipboardList className="h-10 w-10 text-gray-300" />
          <p className="text-sm font-semibold text-gray-700">No sessions found</p>
          {user && hasPermission(user.role, 'sessions:create') && (
            <Link to="/sessions/new" className="text-sm font-medium text-brand-700 hover:underline">Create a session</Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((s) => <SessionCard key={s.id} session={s} />)}
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
