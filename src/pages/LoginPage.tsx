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
import { getApiErrorMessage } from '@/lib/utils'
import { AlertCircle, GraduationCap, ShieldCheck, Users } from 'lucide-react'

const schema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>

const features = [
  { icon: GraduationCap, text: 'Manage training sessions end-to-end' },
  { icon: Users,         text: 'Track participants and certifications' },
  { icon: ShieldCheck,   text: 'Verify certificates instantly' },
]

export function LoginPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  if (user) return <Navigate to="/dashboard" replace />

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
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="relative flex flex-col justify-between bg-brand-800 text-white md:w-[46%] md:min-h-screen">
        <KenyaStripe />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-brand-700/40" />
          <div className="absolute bottom-32 -left-16 h-56 w-56 rounded-full bg-brand-900/60" />
          <div className="absolute top-1/2 right-8 h-32 w-32 rounded-full bg-white/5" />
        </div>
        <div className="relative px-8 pt-10 pb-4 md:px-12 md:pt-14">
          <BrandLogo light />
          <p className="mt-6 max-w-xs text-[15px] leading-relaxed text-white/70">
            Kenya&apos;s national platform for healthcare professional training,
            certification, and registry management.
          </p>
          <ul className="mt-8 space-y-3">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="h-4 w-4 text-brand-accent" />
                </span>
                <span className="text-sm text-white/80">{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative px-8 pb-8 md:px-12">
          <div className="flex items-center gap-3 rounded-xl bg-white/8 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-kenya-red">
              <span className="text-xs font-black text-white">MOH</span>
            </div>
            <div>
              <p className="text-xs font-bold text-white">Ministry of Health Kenya</p>
              <p className="text-[11px] text-white/50">NASCOP · nhcsc.nascop.org</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center bg-surface px-6 py-12 md:px-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 md:hidden"><BrandLogo /></div>
          <h2 className="text-2xl font-black text-gray-900">Welcome back</h2>
          <p className="mt-1 text-sm text-gray-500">Sign in to your TrainSMART account</p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm font-semibold text-gray-700">Username</Label>
              <Input id="username" autoComplete="username" autoFocus className="h-11" {...register('username')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" className="h-11" {...register('password')} />
            </div>
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                {error}
              </div>
            )}
            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign in →'}
            </Button>
          </form>
          <div className="mt-8 border-t border-gray-200 pt-6">
            <p className="text-center text-sm text-gray-500">
              Need to verify a certificate?{' '}
              <Link to="/verify" className="font-semibold text-brand-700 hover:text-brand-600 hover:underline">
                Verify here
              </Link>
            </p>
          </div>
          <p className="mt-8 text-center text-[11px] text-gray-400">
            TrainSMART · NASCOP · Ministry of Health Kenya
          </p>
        </div>
      </div>
    </div>
  )
}
