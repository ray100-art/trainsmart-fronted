import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createPerson, listPeople } from '@/api/people'
import { useAuth } from '@/hooks/useAuth'
import { hasPermission } from '@/lib/roles'
import { KENYA_COUNTIES } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getApiErrorMessage } from '@/lib/utils'
import { ChevronLeft, ChevronRight, UserPlus, Users } from 'lucide-react'

const GENDERS = ['Male', 'Female', 'Other'] as const

const schema = z.object({
  national_id: z.string().min(5),
  first_name: z.string().min(1),
  middle_name: z.string().optional(),
  last_name: z.string().min(1),
  gender: z.enum(GENDERS),
  qualification: z.string().min(1),
  facility: z.string().min(1),
  county: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

const PAGE_SIZE = 50

function personName(p: { first_name: string; middle_name?: string | null; last_name: string }) {
  return [p.first_name, p.middle_name, p.last_name].filter(Boolean).join(' ')
}

export function PeoplePage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [countyFilter, setCountyFilter] = useState('')
  const [page, setPage] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  const countyLocked = user?.role === 'ROLE_TRAINER' || user?.role === 'ROLE_COUNTY_OFFICER'
  const canManage = user && hasPermission(user.role, 'people:manage')
  const showCountyFilter = !countyLocked && (
    user?.role === 'ROLE_NATIONAL_ADMIN' ||
    user?.role === 'ROLE_ME_MANAGER' ||
    user?.role === 'ROLE_SYSTEM_ADMIN'
  )

  const { data, isLoading } = useQuery({
    queryKey: ['people', search, countyFilter, page, user?.role],
    queryFn: () => listPeople({
      q: search || undefined,
      county: countyFilter || undefined,
      skip: page * PAGE_SIZE,
      limit: PAGE_SIZE,
    }),
    enabled: !!user,
  })

  const people = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const { register, handleSubmit, setValue, watch, reset, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      gender: 'Male',
      county: user?.county ?? 'Nairobi',
    },
  })

  const createMut = useMutation({
    mutationFn: createPerson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] })
      reset({ gender: 'Male', county: user?.county ?? 'Nairobi' })
      setShowForm(false)
      setError('')
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Healthcare Workers</p>
          <h1 className="mt-1 text-2xl font-black text-gray-900">People Registry</h1>
          <p className="text-sm text-gray-500">{total} registered person{total !== 1 ? 's' : ''}</p>
        </div>
        {canManage && (
          <Button onClick={() => setShowForm(!showForm)}>
            <UserPlus className="h-4 w-4" />
            {showForm ? 'Cancel' : 'Add Person'}
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search by name, national ID, facility…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0) }}
          className="max-w-sm"
        />
        {showCountyFilter && (
          <Select
            value={countyFilter || 'all'}
            onValueChange={(v) => { setCountyFilter(v === 'all' ? '' : v); setPage(0) }}
          >
            <SelectTrigger className="w-48"><SelectValue placeholder="All counties" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All counties</SelectItem>
              {KENYA_COUNTIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      {showForm && canManage && (
        <Card>
          <CardHeader><CardTitle className="text-base">New person</CardTitle></CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit((d) => createMut.mutate({
                ...d,
                middle_name: d.middle_name || undefined,
                phone: d.phone || undefined,
                email: d.email || undefined,
                county: countyLocked && user?.county ? user.county : d.county,
              }))}
              className="grid gap-4 sm:grid-cols-2"
            >
              <div className="space-y-2">
                <Label>National ID</Label>
                <Input {...register('national_id')} />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={watch('gender')} onValueChange={(v) => setValue('gender', v as FormData['gender'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GENDERS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>First name</Label>
                <Input {...register('first_name')} />
              </div>
              <div className="space-y-2">
                <Label>Middle name</Label>
                <Input {...register('middle_name')} />
              </div>
              <div className="space-y-2">
                <Label>Last name</Label>
                <Input {...register('last_name')} />
              </div>
              <div className="space-y-2">
                <Label>Qualification</Label>
                <Input {...register('qualification')} />
              </div>
              <div className="space-y-2">
                <Label>Facility</Label>
                <Input {...register('facility')} />
              </div>
              <div className="space-y-2">
                <Label>County</Label>
                {countyLocked ? (
                  <Input value={user?.county ?? ''} disabled readOnly />
                ) : (
                  <Select value={watch('county')} onValueChange={(v) => setValue('county', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {KENYA_COUNTIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label>Phone (optional)</Label>
                <Input {...register('phone')} />
              </div>
              <div className="space-y-2">
                <Label>Email (optional)</Label>
                <Input type="email" {...register('email')} />
              </div>
              {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}
              <Button type="submit" className="sm:col-span-2" disabled={isSubmitting || createMut.isPending}>
                {createMut.isPending ? 'Saving…' : 'Add Person'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading people…</p>
      ) : people.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border bg-white py-16 text-center shadow-sm">
          <Users className="h-10 w-10 text-gray-300" />
          <p className="text-sm font-semibold text-gray-700">No people found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="border-b bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">National ID</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3">Qualification</th>
                <th className="px-4 py-3">Facility</th>
                <th className="px-4 py-3">County</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {people.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{personName(p)}</td>
                  <td className="px-4 py-3 font-mono text-xs">{p.national_id}</td>
                  <td className="px-4 py-3">{p.gender}</td>
                  <td className="px-4 py-3">{p.qualification}</td>
                  <td className="px-4 py-3">{p.facility}</td>
                  <td className="px-4 py-3">{p.county}</td>
                  <td className="px-4 py-3">
                    <Badge variant={p.is_active ? 'approved' : 'rejected'}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-gray-500">Page {page + 1} of {totalPages}</p>
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
    </div>
  )
}
