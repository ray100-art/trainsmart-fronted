import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { listPrograms, createProgram, updateProgram, seedPrograms } from '@/api/programs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getApiErrorMessage } from '@/lib/utils'
import { BookOpen, RefreshCw } from 'lucide-react'

const schema = z.object({
  code: z.string().min(2).max(32),
  name: z.string().min(3),
  description: z.string().optional(),
  category: z.string().min(2),
  target_cadres: z.string().optional(),
  duration_days: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const CATEGORIES = ['HTS', 'Clinical', 'Laboratory', 'M&E', 'Leadership', 'Other']

export function ProgramsPage() {
  const queryClient = useQueryClient()
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  const { data: programs = [], isLoading } = useQuery({
    queryKey: ['programs', false],
    queryFn: () => listPrograms(false),
  })

  const { register, handleSubmit, setValue, watch, reset, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'HTS' },
  })

  const seedMut = useMutation({
    mutationFn: seedPrograms,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] })
      setError('')
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  })

  const createMut = useMutation({
    mutationFn: createProgram,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] })
      reset()
      setShowForm(false)
      setError('')
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  })

  const toggleMut = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      updateProgram(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['programs'] }),
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
            National Training Catalog
          </p>
          <h1 className="mt-1 text-2xl font-black text-gray-900">Training Programs</h1>
          <p className="mt-1 text-sm text-gray-500">
            NHITC-aligned program codes used when creating training sessions nationwide.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => seedMut.mutate()}
            disabled={seedMut.isPending}
          >
            <RefreshCw className={`h-4 w-4 ${seedMut.isPending ? 'animate-spin' : ''}`} />
            {seedMut.isPending ? 'Seeding…' : 'Seed NHITC Defaults'}
          </Button>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add Program'}
          </Button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{error}</p>
      )}

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">New training program</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit((d) => createMut.mutate({
              ...d,
              duration_days: d.duration_days ? Number(d.duration_days) : undefined,
            }))} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="code">Program code</Label>
                <Input id="code" placeholder="e.g. NHITC-HTS-01" {...register('code')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Program name</Label>
                <Input id="name" placeholder="Full program title" {...register('name')} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" {...register('description')} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={watch('category')} onValueChange={(v) => setValue('category', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="target_cadres">Target cadres</Label>
                <Input id="target_cadres" placeholder="e.g. Nurses, HTS Counsellors" {...register('target_cadres')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration_days">Duration (days)</Label>
                <Input id="duration_days" type="number" min={1} {...register('duration_days')} />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={isSubmitting || createMut.isPending}>
                  {createMut.isPending ? 'Saving…' : 'Create Program'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="h-48 animate-pulse rounded-xl bg-gray-100" />
      ) : programs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <BookOpen className="h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-500">No programs in the catalog yet.</p>
            <Button variant="outline" onClick={() => seedMut.mutate()} disabled={seedMut.isPending}>
              Seed NHITC default programs
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs font-bold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3 hidden md:table-cell">Category</th>
                <th className="px-4 py-3 hidden lg:table-cell">Cadres</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {programs.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/80">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-brand-700">{p.code}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-3 hidden text-gray-600 md:table-cell">{p.category}</td>
                  <td className="px-4 py-3 hidden text-gray-500 lg:table-cell">{p.target_cadres ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={p.is_active ? 'approved' : 'rejected'}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleMut.mutate({ id: p.id, is_active: !p.is_active })}
                      disabled={toggleMut.isPending}
                    >
                      {p.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
