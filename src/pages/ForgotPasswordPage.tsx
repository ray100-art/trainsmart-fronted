import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '@/api/auth'
import { BrandLogo, KenyaStripe } from '@/components/layout/Brand'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getApiErrorMessage } from '@/lib/utils'

export function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setSubmitting(true)
    try {
      const res = await forgotPassword(identifier)
      setMessage(res.message)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not send reset link.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="relative flex flex-col justify-between bg-brand-800 text-white md:w-[46%] md:min-h-screen">
        <KenyaStripe />
        <div className="relative px-8 pt-10 pb-4 md:px-12 md:pt-14">
          <BrandLogo light />
          <p className="mt-6 max-w-xs text-[15px] leading-relaxed text-white/70">
            Reset your TrainSMART password using the email on your account.
          </p>
        </div>
        <div className="relative px-8 pb-8 md:px-12" />
      </div>
      <div className="flex flex-1 items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-black text-gray-900">Forgot password</h2>
          <p className="mt-2 text-sm text-gray-500">
            Enter your username or email. If an account exists, we will send a reset link.
          </p>
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">Username or email</Label>
              <Input
                id="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {message && <p className="text-sm text-brand-700">{message}</p>}
            <Button type="submit" className="w-full" disabled={submitting || !identifier.trim()}>
              {submitting ? 'Sending…' : 'Send reset link'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-500">
            <Link to="/login" className="font-semibold text-brand-700 hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
