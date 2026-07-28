import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createPerson, listPeople, updatePerson, importPeopleCsv } from '@/api/people'
import { listFacilities } from '@/api/catalogs'
import { useAuth } from '@/hooks/useAuth'
import { hasPermission, isCountyScopedRole } from '@/lib/roles'
import { KENYA_COUNTIES } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getApiErrorMessage } from '@/lib/utils'
import type { Person } from '@/types'
import { ChevronLeft, ChevronRight, Pencil, Upload, UserPlus, Users } from 'lucide-react'

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
  const [editing, setEditing] = useState<Person | null>(null)
  const [error, setError] = useState('')
  const [importMsg, setImportMsg] = useState('')

  const countyLocked = !!user && isCountyScopedRole(user.role)
  const canManage = user && hasPermission(user.role, 'people:manage')
  const showCountyFilter = user && !countyLocked && (
    user.role === 'ROLE_NATIONAL_ADMIN' ||
    user.role === 'ROLE_ME_MANAGER' ||
    user.role === 'ROLE_SYSTEM_ADMIN'
  )

  const formCounty = countyLocked ? (user?.county ?? '') : (editing?.county || countyFilter || user?.county || 'Nairobi')

  const { data: facilitiesData } = useQuery({
    queryKey: ['facilities', formCounty],
    queryFn: () => listFacilities({ county: formCounty || undefined, active_only: true, limit: 200 }),
    enabled: !!formCounty,
  })
  const facilities = facilitiesData?.items ?? []

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

  const openCreate = () => {
    setEditing(null)
    setError('')
    reset({ gender: 'Male', county: user?.county ?? 'Nairobi', national_id: '', first_name: '', middle_name: '', last_name: '', qualification: '', facility: '', phone: '', email: '' })
    setShowForm(true)
  }

  const openEdit = (p: Person) => {
    setEditing(p)
    setError('')
    reset({
      national_id: p.national_id,
      first_name: p.first_name,
      middle_name: p.middle_name ?? '',
      last_name: p.last_name,
      gender: p.gender as FormData['gender'],
      qualification: p.qualification,
      facility: p.facility,
      county: p.county,
      phone: p.phone ?? '',
      email: p.email ?? '',
    })
    setShowForm(true)
  }

  const createMut = useMutation({
    mutationFn: createPerson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] })
      setShowForm(false)
      setEditing(null)
      setError('')
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updatePerson>[1] }) =>
      updatePerson(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] })
      setShowForm(false)
      setEditing(null)
      setError('')
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  })

  const toggleActive = (p: Person) => {
    updateMut.mutate({ id: p.id, payload: { is_active: !p.is_active } })
  }

  const onSubmit = (d: FormData) => {
    const county = countyLocked && user?.county ? user.county : d.county
    if (editing) {
      updateMut.mutate({
        id: editing.id,
        payload: {
          first_name: d.first_name,
          middle_name: d.middle_name || null,
          last_name: d.last_name,
          gender: d.gender,
          qualification: d.qualification,
          facility: d.facility,
          county,
          phone: d.phone || null,
          email: d.email || null,
        },
      })
    } else {
      createMut.mutate({
        ...d,
        middle_name: d.middle_name || undefined,
        phone: d.phone || undefined,
        email: d.email || undefined,
        county,
      })
    }
  }

  const onImport = async (file: File | null) => {
    if (!file) return
    setImportMsg('')
    setError('')
    try {
      const result = await importPeopleCsv(file)
      setImportMsg(`Imported ${result.imported}, skipped ${result.skipped}, errors ${result.error_count}`)
      queryClient.invalidateQueries({ queryKey: ['people'] })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Import failed.'))
    }
  }

  const facilityOptions = useMemo(() => {
    const names = facilities.map((f) => f.name)
    const current = watch('facility')
    if (current && !names.includes(current)) names.unshift(current)
    return names
  }, [facilities, watch('facility')])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Healthcare Workers</p>
          <h1 className="mt-1 text-2xl font-black text-gray-900">People Registry</h1>
          <p className="text-sm text-gray-500">{total} registered person{total !== 1 ? 's' : ''}</p>
        </div>
        {canManage && (
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Upload className="h-4 w-4" />
              Import CSV
              <input type="file" accept=".csv" className="hidden" onChange={(e) => onImport(e.target.files?.[0] ?? null)} />
            </label>
            <Button onClick={() => showForm ? (setShowForm(false), setEditing(null)) : openCreate()}>
              <UserPlus className="h-4 w-4" />
              {showForm ? 'Cancel' : 'Add Person'}
            </Button>
          </div>
        )}
      </div>

      {importMsg && <p className="text-sm text-brand-700">{importMsg}</p>}

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
          <CardHeader>
            <CardTitle className="text-base">{editing ? 'Edit person' : 'New person'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>National ID</Label>
                <Input {...register('national_id')} disabled={!!editing} />
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
                <Label>County</Label>
                {countyLocked ? (
                  <Input value={user?.county ?? ''} disabled readOnly />
                ) : (
                  <Select value={watch('county')} onValueChange={(v) => { setValue('county', v); setValue('facility', '') }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {KENYA_COUNTIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label>Facility</Label>
                {facilityOptions.length > 0 ? (
                  <Select value={watch('facility') || undefined} onValueChange={(v) => setValue('facility', v)}>
                    <SelectTrigger><SelectValue placeholder="Select facility" /></SelectTrigger>
                    <SelectContent>
                      {facilityOptions.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input placeholder="Type facility name" {...register('facility')} />
                )}
                {facilityOptions.length === 0 && (
                  <p className="text-xs text-gray-500">No catalog facilities for this county — type the name.</p>
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
              <Button type="submit" className="sm:col-span-2" disabled={isSubmitting || createMut.isPending || updateMut.isPending}>
                {editing ? 'Save changes' : 'Add Person'}
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
          <table className="w-full min-w-[980px] text-sm">
            <thead className="border-b bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">National ID</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3">Qualification</th>
                <th className="px-4 py-3">Facility</th>
                <th className="px-4 py-3">County</th>
                <th className="px-4 py-3">Status</th>
                {canManage && <th className="px-4 py-3">Actions</th>}
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
                  {canManage && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button type="button" size="sm" variant="outline" onClick={() => openEdit(p)}>
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => toggleActive(p)}>
                          {p.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </td>
                  )}
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
