import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { setupPassword } from '@/api/auth'
import { useAuth } from '@/hooks/useAuth'
import { BrandLogo, KenyaStripe } from '@/components/layout/Brand'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getApiErrorMessage } from '@/lib/utils'

const schema = z.object({
  new_password: z.string().min(8, 'At least 8 characters'),
  confirm_password: z.string().min(1, 'Required'),
}).refine((d) => d.new_password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

type FormData = z.infer<typeof schema>

export function SetupPasswordPage() {
  const { user, refreshAuth } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  if (user) return <Navigate to="/dashboard" replace />

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Invalid setup link</CardTitle>
            <CardDescription>This password setup link is missing or invalid.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild><Link to="/login">Go to sign in</Link></Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      await setupPassword(token, data.new_password)
      await refreshAuth()
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not set password. The link may have expired.'))
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="bg-gradient-to-br from-brand-700 to-brand-500">
        <KenyaStripe />
        <div className="px-6 py-10 text-white">
          <BrandLogo light />
          <p className="mt-2 text-sm text-white/80">Set your password to activate your account</p>
        </div>
      </div>
      <div className="mx-auto max-w-md px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Set your password</CardTitle>
            <CardDescription>Choose a strong password for your TrainSMART account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new">New password</Label>
                <Input id="new" type="password" autoComplete="new-password" {...register('new_password')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input id="confirm" type="password" autoComplete="new-password" {...register('confirm_password')} />
              </div>
              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Set Password & Sign In'}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-500">
              <Link to="/login" className="font-medium text-brand-700 hover:underline">Back to sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
