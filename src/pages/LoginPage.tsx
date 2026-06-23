import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { BrandLogo, KenyaStripe } from '@/components/layout/Brand'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getApiErrorMessage } from '@/lib/utils'

const schema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

type FormData = z.infer<typeof schema>

export function LoginPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      await login(data.username, data.password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Login failed. Check your credentials.'))
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="bg-gradient-to-br from-brand-700 to-brand-500">
        <KenyaStripe />
        <div className="px-6 py-10 text-white">
          <BrandLogo light />
          <p className="mt-2 text-sm text-white/80">
            Sign in to manage healthcare training across Kenya
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your TrainSMART credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" autoComplete="username" {...register('username')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" autoComplete="current-password" {...register('password')} />
              </div>
              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in…' : 'Sign In →'}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-500">
              <Link to="/verify" className="font-medium text-brand-700 hover:underline">
                Verify a certificate
              </Link>
            </p>
          </CardContent>
        </Card>
        <p className="mt-6 text-center text-xs text-gray-400">
          TrainSMART · NASCOP · Ministry of Health Kenya · nhcsc.nascop.org
        </p>
      </div>
    </div>
  )
}
