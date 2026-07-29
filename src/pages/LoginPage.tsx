import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { startMfaSetup } from '@/api/auth'
import { BrandLogo, KenyaStripe, PartnerLogos } from '@/components/layout/Brand'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getApiErrorMessage } from '@/lib/utils'
import { AlertCircle, GraduationCap, ShieldCheck, Users } from 'lucide-react'

const credentialsSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})
type CredentialsForm = z.infer<typeof credentialsSchema>

const codeSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code from your authenticator app'),
})
type CodeForm = z.infer<typeof codeSchema>

const features = [
  { icon: GraduationCap, text: 'Manage training sessions end-to-end' },
  { icon: Users,         text: 'Track participants and certifications' },
  { icon: ShieldCheck,   text: 'Verify certificates instantly' },
]

export function LoginPage() {
  const { login, user, mfaChallenge, completeMfa, completeMfaSetup, clearMfaChallenge } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [setupSecret, setSetupSecret] = useState('')
  const [setupUri, setSetupUri] = useState('')
  const [setupLoading, setSetupLoading] = useState(false)

  const credentialsForm = useForm<CredentialsForm>({
    resolver: zodResolver(credentialsSchema),
  })
  const codeForm = useForm<CodeForm>({
    resolver: zodResolver(codeSchema),
  })

  useEffect(() => {
    if (!mfaChallenge || mfaChallenge.mode !== 'setup') {
      setSetupSecret('')
      setSetupUri('')
      return
    }
    let cancelled = false
    setSetupLoading(true)
    setError('')
    startMfaSetup(mfaChallenge.mfa_token)
      .then((res) => {
        if (cancelled) return
        setSetupSecret(res.secret)
        setSetupUri(res.otpauth_uri)
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, 'Could not start MFA setup.'))
      })
      .finally(() => {
        if (!cancelled) setSetupLoading(false)
      })
    return () => { cancelled = true }
  }, [mfaChallenge])

  if (user) return <Navigate to="/dashboard" replace />

  const onCredentials = async (data: CredentialsForm) => {
    setError('')
    try {
      const result = await login(data.username, data.password)
      if (result === 'ok') navigate('/dashboard', { replace: true })
      codeForm.reset()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Login failed. Check your credentials.'))
    }
  }

  const onVerify = async (data: CodeForm) => {
    setError('')
    try {
      await completeMfa(data.code)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid authenticator code.'))
    }
  }

  const onSetupConfirm = async (data: CodeForm) => {
    setError('')
    if (!setupSecret) {
      setError('Authenticator secret is not ready yet. Wait a moment and try again.')
      return
    }
    try {
      await completeMfaSetup(setupSecret, data.code)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not confirm MFA setup.'))
    }
  }

  const step = mfaChallenge?.mode ?? 'credentials'

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
          <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">
            <PartnerLogos size="md" />
          </div>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center bg-surface px-6 py-12 md:px-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 md:hidden"><BrandLogo /></div>

          {step === 'credentials' && (
            <>
              <h2 className="text-2xl font-black text-gray-900">Welcome back</h2>
              <p className="mt-1 text-sm text-gray-500">Sign in to your TrainSMART account</p>
              <form onSubmit={credentialsForm.handleSubmit(onCredentials)} className="mt-8 space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="username" className="text-sm font-semibold text-gray-700">Username</Label>
                  <Input id="username" autoComplete="username" autoFocus className="h-11" {...credentialsForm.register('username')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
                  <Input id="password" type="password" autoComplete="current-password" className="h-11" {...credentialsForm.register('password')} />
                </div>
                {error && (
                  <div className="flex items-start gap-2.5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    {error}
                  </div>
                )}
                <Button type="submit" size="lg" className="w-full" disabled={credentialsForm.formState.isSubmitting}>
                  {credentialsForm.formState.isSubmitting ? 'Signing in…' : 'Sign in →'}
                </Button>
              </form>
              <p className="mt-4 text-center text-sm text-gray-500">
                <Link to="/forgot-password" className="font-semibold text-brand-700 hover:text-brand-600 hover:underline">
                  Forgot password?
                </Link>
              </p>
            </>
          )}

          {step === 'verify' && (
            <>
              <h2 className="text-2xl font-black text-gray-900">Authenticator code</h2>
              <p className="mt-1 text-sm text-gray-500">
                Enter the 6-digit code from your authenticator app
                {mfaChallenge?.full_name ? ` for ${mfaChallenge.full_name}` : ''}.
              </p>
              <form onSubmit={codeForm.handleSubmit(onVerify)} className="mt-8 space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="mfa-code" className="text-sm font-semibold text-gray-700">Authentication code</Label>
                  <Input
                    id="mfa-code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    autoFocus
                    className="h-11 tracking-[0.3em] text-center text-lg"
                    maxLength={6}
                    {...codeForm.register('code')}
                  />
                </div>
                {error && (
                  <div className="flex items-start gap-2.5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    {error}
                  </div>
                )}
                <Button type="submit" size="lg" className="w-full" disabled={codeForm.formState.isSubmitting}>
                  {codeForm.formState.isSubmitting ? 'Verifying…' : 'Verify and continue'}
                </Button>
                <Button type="button" variant="outline" className="w-full" onClick={() => { clearMfaChallenge(); setError('') }}>
                  Back to sign in
                </Button>
              </form>
            </>
          )}

          {step === 'setup' && (
            <>
              <h2 className="text-2xl font-black text-gray-900">Set up MFA</h2>
              <p className="mt-1 text-sm text-gray-500">
                Privileged accounts require an authenticator app before access is granted.
              </p>
              <div className="mt-6 space-y-4">
                {setupLoading && <p className="text-sm text-gray-500">Generating secret…</p>}
                {setupUri && (
                  <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Scan or enter key</p>
                    <p className="mt-2 break-all font-mono text-xs text-gray-700">{setupSecret}</p>
                    <p className="mt-2 text-xs text-gray-500">
                      Add this account in Google Authenticator, Microsoft Authenticator, or Authy, then enter the code below.
                    </p>
                  </div>
                )}
                <form onSubmit={codeForm.handleSubmit(onSetupConfirm)} className="space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="setup-code" className="text-sm font-semibold text-gray-700">Authentication code</Label>
                    <Input
                      id="setup-code"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      className="h-11 tracking-[0.3em] text-center text-lg"
                      maxLength={6}
                      {...codeForm.register('code')}
                    />
                  </div>
                  {error && (
                    <div className="flex items-start gap-2.5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                      {error}
                    </div>
                  )}
                  <Button type="submit" size="lg" className="w-full" disabled={codeForm.formState.isSubmitting || !setupSecret}>
                    {codeForm.formState.isSubmitting ? 'Confirming…' : 'Enable MFA and continue'}
                  </Button>
                  <Button type="button" variant="outline" className="w-full" onClick={() => { clearMfaChallenge(); setError('') }}>
                    Back to sign in
                  </Button>
                </form>
              </div>
            </>
          )}

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
