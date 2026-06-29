import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { createSession } from '@/api/sessions'
import { listPrograms } from '@/api/programs'
import { useAuth } from '@/hooks/useAuth'
import { KENYA_COUNTIES, SESSION_STATUSES } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getApiErrorMessage } from '@/lib/utils'
import { useState } from 'react'

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  program_id: z.string().min(1, 'Training program is required'),
  county: z.string().min(1, 'County is required'),
  facility: z.string().min(2, 'Facility is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  status: z.enum(SESSION_STATUSES),
}).refine((d) => d.start_date <= d.end_date, {
  message: 'End date must be on or after start date',
  path: ['end_date'],
})

type FormData = z.infer<typeof schema>

export function SessionCreatePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState('')

  const { data: programs = [], isLoading: programsLoading } = useQuery({
    queryKey: ['programs'],
    queryFn: () => listPrograms(true),
  })

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      county: user?.county ?? '',
      status: 'UPCOMING',
    },
  })

  const mutation = useMutation({
    mutationFn: createSession,
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      navigate(`/sessions/${session.id}`)
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  })

  const onSubmit = (data: FormData) => {
    setError('')
    mutation.mutate(data)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New Training Session</h1>
        <p className="text-sm text-gray-500">Create a session for county approval</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Session details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Training title</Label>
              <Input id="title" placeholder="e.g. NASCOP HTS Training" {...register('title')} />
              {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Training program</Label>
              <Select
                value={watch('program_id')}
                onValueChange={(v) => setValue('program_id', v)}
                disabled={programsLoading || programs.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={programsLoading ? 'Loading programs…' : 'Select NHITC program'} />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.code} — {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.program_id && <p className="text-xs text-red-600">{errors.program_id.message}</p>}
              {!programsLoading && programs.length === 0 && (
                <p className="text-xs text-amber-700">
                  No programs in catalog. Ask a system administrator to seed the NHITC program list.
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>County</Label>
                <Select value={watch('county')} onValueChange={(v) => setValue('county', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select county" />
                  </SelectTrigger>
                  <SelectContent>
                    {KENYA_COUNTIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.county && <p className="text-xs text-red-600">{errors.county.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="facility">Facility</Label>
                <Input id="facility" placeholder="Health facility name" {...register('facility')} />
                {errors.facility && <p className="text-xs text-red-600">{errors.facility.message}</p>}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start date</Label>
                <Input id="start_date" type="date" {...register('start_date')} />
                {errors.start_date && <p className="text-xs text-red-600">{errors.start_date.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End date</Label>
                <Input id="end_date" type="date" {...register('end_date')} />
                {errors.end_date && <p className="text-xs text-red-600">{errors.end_date.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={watch('status')} onValueChange={(v) => setValue('status', v as FormData['status'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SESSION_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting || mutation.isPending}>
                {mutation.isPending ? 'Creating…' : 'Create Session'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
