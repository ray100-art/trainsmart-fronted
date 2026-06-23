import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { listSessions } from '@/api/sessions'
import { useAuth } from '@/hooks/useAuth'
import { hasPermission } from '@/lib/roles'
import { KENYA_COUNTIES } from '@/lib/constants'
import { SessionCard } from '@/components/sessions/SessionCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'

export function SessionsPage() {
  const { user } = useAuth()
  const [countyFilter, setCountyFilter] = useState('')
  const [search, setSearch] = useState('')

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions', countyFilter || user?.county],
    queryFn: () => {
      const county = countyFilter || (user?.role === 'ROLE_COUNTY_OFFICER' ? user.county : undefined)
      return listSessions(county)
    },
    enabled: !!user,
  })

  const filtered = sessions.filter((s) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      s.title.toLowerCase().includes(q) ||
      s.facility.toLowerCase().includes(q) ||
      s.county.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Training Sessions</h1>
          <p className="text-sm text-gray-500">{filtered.length} session{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        {user && hasPermission(user.role, 'sessions:create') && (
          <Button asChild>
            <Link to="/sessions/new">
              <Plus className="h-4 w-4" />
              New Session
            </Link>
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search by title, facility, county…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        {user?.role !== 'ROLE_COUNTY_OFFICER' && (
          <Select value={countyFilter || 'all'} onValueChange={(v) => setCountyFilter(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All counties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All counties</SelectItem>
              {KENYA_COUNTIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-500">No sessions found.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((s) => (
            <SessionCard key={s.id} session={s} />
          ))}
        </div>
      )}
    </div>
  )
}
