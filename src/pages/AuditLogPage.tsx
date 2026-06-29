import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAuditLogs } from '@/api/audit'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatDate } from '@/lib/utils'
import { ScrollText, ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZE = 25

export function AuditLogPage() {
  const [offset, setOffset] = useState(0)
  const [action, setAction] = useState('')
  const [entityType, setEntityType] = useState('')

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['audit-logs', offset, action, entityType],
    queryFn: () => getAuditLogs({
      limit: PAGE_SIZE,
      offset,
      action: action || undefined,
      entity_type: entityType || undefined,
    }),
  })

  const total = data?.total ?? 0
  const page = Math.floor(offset / PAGE_SIZE) + 1
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
          System Accountability
        </p>
        <h1 className="mt-1 text-2xl font-black text-gray-900">Audit Log</h1>
        <p className="mt-1 text-sm text-gray-500">
          Immutable record of user actions across sessions, certificates, and administration.
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="action-filter" className="text-xs font-bold uppercase tracking-wide text-gray-500">
            Action
          </Label>
          <Input
            id="action-filter"
            placeholder="e.g. SESSION_CREATE"
            value={action}
            onChange={(e) => { setAction(e.target.value); setOffset(0) }}
            className="w-48"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="entity-filter" className="text-xs font-bold uppercase tracking-wide text-gray-500">
            Entity type
          </Label>
          <Input
            id="entity-filter"
            placeholder="e.g. session"
            value={entityType}
            onChange={(e) => { setEntityType(e.target.value); setOffset(0) }}
            className="w-48"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="h-48 animate-pulse rounded-xl bg-gray-100" />
      ) : !data?.items.length ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-200 py-16 text-center">
          <ScrollText className="h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-500">No audit entries match your filters.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs font-bold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3 hidden md:table-cell">Entity</th>
                <th className="px-4 py-3 hidden lg:table-cell">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.items.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50/80">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                    {entry.created_at ? formatDate(entry.created_at) : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-900">{entry.user_name ?? 'System'}</td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-gray-700">
                      {entry.action}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-gray-600 md:table-cell">
                    {entry.entity_type}
                    {entry.entity_id && (
                      <span className="ml-1 font-mono text-[10px] text-gray-400">
                        {entry.entity_id.slice(0, 8)}…
                      </span>
                    )}
                  </td>
                  <td className="hidden max-w-xs truncate px-4 py-3 text-gray-500 lg:table-cell">
                    {entry.detail ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {total} entries · page {page} of {totalPages}
            {isFetching && !isLoading && <span className="ml-2 text-brand-600">Updating…</span>}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={offset + PAGE_SIZE >= total}
              onClick={() => setOffset(offset + PAGE_SIZE)}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
