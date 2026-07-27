import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { listCertificatePipeline, signCertificates, type CertificatePipelineTab } from '@/api/certificates'
import { useAuth } from '@/hooks/useAuth'
import { hasPermission } from '@/lib/roles'
import { Button } from '@/components/ui/button'
import { Badge, statusBadgeVariant } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDate, getApiErrorMessage } from '@/lib/utils'
import { Award, ChevronLeft, ChevronRight, ExternalLink, PenLine } from 'lucide-react'

const TABS: { value: CertificatePipelineTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'certified', label: 'Certified' },
  { value: 'signed', label: 'Signed' },
]

const PAGE_SIZE = 50

export function CertificatesPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<CertificatePipelineTab>('all')
  const [page, setPage] = useState(0)
  const [error, setError] = useState('')

  const canSign = user && hasPermission(user.role, 'certificates:issue')

  const { data, isLoading } = useQuery({
    queryKey: ['certificates-pipeline', tab, page],
    queryFn: () => listCertificatePipeline({ tab, skip: page * PAGE_SIZE, limit: PAGE_SIZE }),
    enabled: !!user,
  })

  const sessions = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const signMut = useMutation({
    mutationFn: signCertificates,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates-pipeline'] })
      setError('')
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  })

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">National Registry</p>
        <h1 className="mt-1 text-2xl font-black text-gray-900">Certificate Pipeline</h1>
        <p className="text-sm text-gray-500">Track certificate issuance and signing across training sessions</p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{error}</p>
      )}

      <Tabs
        value={tab}
        onValueChange={(v) => { setTab(v as CertificatePipelineTab); setPage(0) }}
      >
        <TabsList className="w-full justify-start overflow-x-auto rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
          {TABS.map(({ value, label }) => (
            <TabsTrigger key={value} value={value}>{label}</TabsTrigger>
          ))}
        </TabsList>

        {TABS.map(({ value }) => (
          <TabsContent key={value} value={value} className="mt-4">
            {isLoading ? (
              <p className="text-sm text-gray-500">Loading sessions…</p>
            ) : sessions.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-xl border bg-white py-16 text-center shadow-sm">
                <Award className="h-10 w-10 text-gray-300" />
                <p className="text-sm font-semibold text-gray-700">No sessions in this pipeline</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border bg-white">
                <table className="w-full min-w-[800px] text-sm">
                  <thead className="border-b bg-gray-50 text-left text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Session</th>
                      <th className="px-4 py-3">County</th>
                      <th className="px-4 py-3">Dates</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Certificates</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s) => (
                      <tr key={s.id} className="border-b last:border-0">
                        <td className="px-4 py-3">
                          <Link to={`/sessions/${s.id}`} className="font-medium text-brand-700 hover:underline">
                            {s.title}
                          </Link>
                          {s.program_code && (
                            <p className="text-xs text-gray-500">{s.program_code}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">{s.county}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {formatDate(s.start_date)} – {formatDate(s.end_date)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusBadgeVariant(s.status)} dot>
                            {s.status.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {s.certificates_issued ? (
                              <Badge variant="approved">Issued</Badge>
                            ) : (
                              <Badge variant="pending">Not issued</Badge>
                            )}
                            {s.certificates_signed && (
                              <Badge variant="approved">Signed</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/sessions/${s.id}`}>
                                <ExternalLink className="h-3.5 w-3.5" />
                                View
                              </Link>
                            </Button>
                            {canSign && s.certificates_issued && !s.certificates_signed && (
                              <Button
                                size="sm"
                                disabled={signMut.isPending}
                                onClick={() => signMut.mutate(s.id)}
                              >
                                <PenLine className="h-3.5 w-3.5" />
                                Sign
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-xs text-gray-500">
                  {total} session{total !== 1 ? 's' : ''} · Page {page + 1} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
