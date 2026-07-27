import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createSponsor, listSponsors, updateSponsor } from '@/api/catalogs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getApiErrorMessage } from '@/lib/utils'
import { HandCoins } from 'lucide-react'

const schema = z.object({
  name: z.string().min(2),
  code: z.string().optional(),
  description: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function SponsorsPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['sponsors', false],
    queryFn: () => listSponsors({ active_only: false, limit: 200 }),
  })

  const sponsors = data?.items ?? []

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const createMut = useMutation({
    mutationFn: createSponsor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] })
      reset()
      setShowForm(false)
      setError('')
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  })

  const toggleMut = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      updateSponsor(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sponsors'] }),
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Settings Catalog</p>
          <h1 className="mt-1 text-2xl font-black text-gray-900">Training Sponsors</h1>
          <p className="text-sm text-gray-500">{sponsors.length} sponsor{sponsors.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Sponsor'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">New sponsor</CardTitle></CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit((d) => createMut.mutate({
                ...d,
                code: d.code || undefined,
                description: d.description || undefined,
              }))}
              className="grid gap-4 sm:grid-cols-2"
            >
              <div className="space-y-2 sm:col-span-2">
                <Label>Sponsor name</Label>
                <Input {...register('name')} />
              </div>
              <div className="space-y-2">
                <Label>Code (optional)</Label>
                <Input {...register('code')} />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Input {...register('description')} />
              </div>
              {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}
              <Button type="submit" className="sm:col-span-2" disabled={isSubmitting || createMut.isPending}>
                {createMut.isPending ? 'Saving…' : 'Create Sponsor'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="h-48 animate-pulse rounded-xl bg-gray-100" />
      ) : sponsors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <HandCoins className="h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-500">No sponsors in the catalog yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs font-bold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3 hidden md:table-cell">Description</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sponsors.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/80">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-brand-700">{s.code ?? '—'}</td>
                  <td className="px-4 py-3 hidden text-gray-500 md:table-cell">{s.description ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={s.is_active ? 'approved' : 'rejected'}>
                      {s.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleMut.mutate({ id: s.id, is_active: !s.is_active })}
                      disabled={toggleMut.isPending}
                    >
                      {s.is_active ? 'Deactivate' : 'Activate'}
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
