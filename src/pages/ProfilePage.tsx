import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { changePassword, startMfaSetup, confirmMfaSetup, disableMfa } from '@/api/auth'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getApiErrorMessage } from '@/lib/utils'

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Required'),
  new_password: z.string().min(8, 'At least 8 characters'),
  confirm_password: z.string().min(1, 'Required'),
}).refine((d) => d.new_password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

type PasswordForm = z.infer<typeof passwordSchema>

const codeSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Enter a 6-digit code'),
})
type CodeForm = z.infer<typeof codeSchema>

const disableSchema = z.object({
  current_password: z.string().min(1, 'Required'),
  code: z.string().regex(/^\d{6}$/, 'Enter a 6-digit code'),
})
type DisableForm = z.infer<typeof disableSchema>

export function ProfilePage() {
  const { profile, refreshAuth, logout } = useAuth()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [mfaMessage, setMfaMessage] = useState('')
  const [mfaError, setMfaError] = useState('')
  const [pendingSecret, setPendingSecret] = useState('')
  const [setupBusy, setSetupBusy] = useState(false)

  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) })
  const confirmForm = useForm<CodeForm>({ resolver: zodResolver(codeSchema) })
  const disableForm = useForm<DisableForm>({ resolver: zodResolver(disableSchema) })

  const onPassword = async (data: PasswordForm) => {
    setMessage('')
    setError('')
    try {
      await changePassword(data.current_password, data.new_password)
      setMessage('Password updated. Please sign in again.')
      passwordForm.reset()
      await logout()
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  const onStartMfa = async () => {
    setMfaError('')
    setMfaMessage('')
    setSetupBusy(true)
    try {
      const res = await startMfaSetup()
      setPendingSecret(res.secret)
      setMfaMessage('Scan or copy the secret into your authenticator app, then enter a code to confirm.')
    } catch (err) {
      setMfaError(getApiErrorMessage(err))
    } finally {
      setSetupBusy(false)
    }
  }

  const onConfirmMfa = async (data: CodeForm) => {
    setMfaError('')
    setMfaMessage('')
    try {
      await confirmMfaSetup({ secret: pendingSecret, code: data.code })
      setPendingSecret('')
      confirmForm.reset()
      await refreshAuth()
      setMfaMessage('MFA enabled successfully.')
    } catch (err) {
      setMfaError(getApiErrorMessage(err))
    }
  }

  const onDisableMfa = async (data: DisableForm) => {
    setMfaError('')
    setMfaMessage('')
    try {
      await disableMfa(data.current_password, data.code)
      disableForm.reset()
      await refreshAuth()
      setMfaMessage('MFA disabled.')
    } catch (err) {
      setMfaError(getApiErrorMessage(err))
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Account</h1>
        <p className="text-sm text-gray-500">Password and authenticator settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>Use a strong password you have not used before</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onPassword)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current">Current password</Label>
              <Input id="current" type="password" {...passwordForm.register('current_password')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new">New password</Label>
              <Input id="new" type="password" {...passwordForm.register('new_password')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm new password</Label>
              <Input id="confirm" type="password" {...passwordForm.register('confirm_password')} />
            </div>
            {message && <p className="rounded-lg bg-brand-100 px-3 py-2 text-sm text-brand-700">{message}</p>}
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
              {passwordForm.formState.isSubmitting ? 'Updating…' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Two-factor authentication</CardTitle>
          <CardDescription>
            {profile?.mfa_enabled
              ? 'MFA is enabled on this account.'
              : 'Add an authenticator app for stronger account protection.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!profile?.mfa_enabled && !pendingSecret && (
            <Button type="button" onClick={onStartMfa} disabled={setupBusy}>
              {setupBusy ? 'Preparing…' : 'Enable MFA'}
            </Button>
          )}

          {pendingSecret && (
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Secret key</p>
                <p className="mt-1 break-all font-mono text-xs text-gray-800">{pendingSecret}</p>
              </div>
              <form onSubmit={confirmForm.handleSubmit(onConfirmMfa)} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="mfa-confirm">Authenticator code</Label>
                  <Input id="mfa-confirm" inputMode="numeric" autoComplete="one-time-code" maxLength={6} {...confirmForm.register('code')} />
                </div>
                <Button type="submit" disabled={confirmForm.formState.isSubmitting}>
                  Confirm and enable
                </Button>
              </form>
            </div>
          )}

          {profile?.mfa_enabled && (
            <form onSubmit={disableForm.handleSubmit(onDisableMfa)} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="disable-pass">Current password</Label>
                <Input id="disable-pass" type="password" {...disableForm.register('current_password')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="disable-code">Authenticator code</Label>
                <Input id="disable-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} {...disableForm.register('code')} />
              </div>
              <Button type="submit" variant="outline" disabled={disableForm.formState.isSubmitting}>
                Disable MFA
              </Button>
            </form>
          )}

          {mfaMessage && <p className="rounded-lg bg-brand-100 px-3 py-2 text-sm text-brand-700">{mfaMessage}</p>}
          {mfaError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{mfaError}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
