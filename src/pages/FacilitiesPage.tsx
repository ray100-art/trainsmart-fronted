import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createFacility, listFacilities, updateFacility } from '@/api/catalogs'
import { KENYA_COUNTIES } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getApiErrorMessage } from '@/lib/utils'
import { Building2, ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZE = 50

const schema = z.object({
  name: z.string().min(2),
  county: z.string().min(1),
  mfl_code: z.string().optional(),
  facility_type: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function FacilitiesPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [countyFilter, setCountyFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['facilities', search, countyFilter, page],
    queryFn: () => listFacilities({
      q: search || undefined,
      county: countyFilter || undefined,
      active_only: false,
      skip: page * PAGE_SIZE,
      limit: PAGE_SIZE,
    }),
  })

  const facilities = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const { register, handleSubmit, setValue, watch, reset, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { county: 'Nairobi' },
  })

  const createMut = useMutation({
    mutationFn: createFacility,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] })
      reset({ county: 'Nairobi' })
      setShowForm(false)
      setError('')
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  })

  const toggleMut = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      updateFacility(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['facilities'] }),
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Settings Catalog</p>
          <h1 className="mt-1 text-2xl font-black text-gray-900">Health Facilities</h1>
          <p className="text-sm text-gray-500">{total} facilit{total !== 1 ? 'ies' : 'y'}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Facility'}
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search facilities…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0) }}
          className="max-w-sm"
        />
        <Select value={countyFilter || 'all'} onValueChange={(v) => { setCountyFilter(v === 'all' ? '' : v); setPage(0) }}>
          <SelectTrigger className="w-48"><SelectValue placeholder="All counties" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All counties</SelectItem>
            {KENYA_COUNTIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">New facility</CardTitle></CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit((d) => createMut.mutate({
                ...d,
                mfl_code: d.mfl_code || undefined,
                facility_type: d.facility_type || undefined,
              }))}
              className="grid gap-4 sm:grid-cols-2"
            >
              <div className="space-y-2 sm:col-span-2">
                <Label>Facility name</Label>
                <Input {...register('name')} />
              </div>
              <div className="space-y-2">
                <Label>County</Label>
                <Select value={watch('county')} onValueChange={(v) => setValue('county', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {KENYA_COUNTIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>MFL code (optional)</Label>
                <Input {...register('mfl_code')} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Facility type (optional)</Label>
                <Input placeholder="e.g. Hospital, Health Centre" {...register('facility_type')} />
              </div>
              {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}
              <Button type="submit" className="sm:col-span-2" disabled={isSubmitting || createMut.isPending}>
                {createMut.isPending ? 'Saving…' : 'Create Facility'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="h-48 animate-pulse rounded-xl bg-gray-100" />
      ) : facilities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Building2 className="h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-500">No facilities found.</p>
          </CardContent>
        </Card>
      ) : (
        <>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs font-bold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">County</th>
                <th className="px-4 py-3 hidden md:table-cell">MFL Code</th>
                <th className="px-4 py-3 hidden lg:table-cell">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {facilities.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50/80">
                  <td className="px-4 py-3 font-medium text-gray-900">{f.name}</td>
                  <td className="px-4 py-3 text-gray-600">{f.county}</td>
                  <td className="px-4 py-3 hidden font-mono text-xs text-gray-500 md:table-cell">{f.mfl_code ?? '—'}</td>
                  <td className="px-4 py-3 hidden text-gray-500 lg:table-cell">{f.facility_type ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={f.is_active ? 'approved' : 'rejected'}>
                      {f.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleMut.mutate({ id: f.id, is_active: !f.is_active })}
                      disabled={toggleMut.isPending}
                    >
                      {f.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{total} facilit{total === 1 ? 'y' : 'ies'}</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span>Page {page + 1} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
