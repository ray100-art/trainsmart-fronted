import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  login as apiLogin,
  logout as apiLogout,
  getMe,
  verifyMfa as apiVerifyMfa,
  confirmMfaSetup as apiConfirmMfaSetup,
} from '@/api/auth'
import type { AuthState, LoginResponse, User, UserRole } from '@/types'

/** UI profile cache only — JWT lives in httpOnly cookie, never localStorage. */
const STORAGE_KEY = 'trainsmart_auth'

export type MfaChallenge = {
  mode: 'verify' | 'setup'
  mfa_token: string
  username?: string | null
  full_name?: string | null
}

interface AuthContextValue {
  user: AuthState | null
  profile: User | null
  isLoading: boolean
  mfaChallenge: MfaChallenge | null
  login: (username: string, password: string) => Promise<'ok' | 'mfa'>
  completeMfa: (code: string) => Promise<void>
  completeMfaSetup: (secret: string, code: string) => Promise<void>
  clearMfaChallenge: () => void
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
  hasRole: (...roles: UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

function profileToAuth(profile: User): AuthState {
  return {
    role: profile.role,
    county: profile.county,
    username: profile.username,
    full_name: profile.full_name,
    staff_number: profile.staff_number,
  }
}

function persistAuth(auth: AuthState) {
  const { role, county, username, full_name, staff_number } = auth
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ role, county, username, full_name, staff_number }),
  )
}

function clearPersistedAuth() {
  localStorage.removeItem(STORAGE_KEY)
}

function challengeFromLogin(res: LoginResponse): MfaChallenge | null {
  if (!res.mfa_token) return null
  if (res.mfa_setup_required) {
    return {
      mode: 'setup',
      mfa_token: res.mfa_token,
      username: res.username,
      full_name: res.full_name,
    }
  }
  if (res.mfa_required) {
    return {
      mode: 'verify',
      mfa_token: res.mfa_token,
      username: res.username,
      full_name: res.full_name,
    }
  }
  return null
}

async function loadSessionAfterAuth(
  setUser: (u: AuthState | null) => void,
  setProfile: (p: User | null) => void,
) {
  const p = await getMe()
  const auth = profileToAuth(p)
  persistAuth(auth)
  setUser(auth)
  setProfile(p)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthState | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mfaChallenge, setMfaChallenge] = useState<MfaChallenge | null>(null)

  useEffect(() => {
    // Clear any legacy JWT stored from older builds
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as { token?: string }
        if (parsed.token) {
          const { token: _t, ...rest } = parsed
          localStorage.setItem(STORAGE_KEY, JSON.stringify(rest))
        }
      }
    } catch {
      clearPersistedAuth()
    }

    getMe()
      .then((p) => {
        setProfile(p)
        const auth = profileToAuth(p)
        setUser(auth)
        persistAuth(auth)
      })
      .catch(() => {
        clearPersistedAuth()
        setUser(null)
        setProfile(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const refreshAuth = useCallback(async () => {
    const p = await getMe()
    setProfile(p)
    const auth = profileToAuth(p)
    setUser(auth)
    persistAuth(auth)
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const res = await apiLogin(username, password)
    const challenge = challengeFromLogin(res)
    if (challenge) {
      setMfaChallenge(challenge)
      return 'mfa' as const
    }
    setMfaChallenge(null)
    try {
      await loadSessionAfterAuth(setUser, setProfile)
    } catch (err) {
      clearPersistedAuth()
      setUser(null)
      setProfile(null)
      throw err
    }
    return 'ok' as const
  }, [])

  const completeMfa = useCallback(async (code: string) => {
    if (!mfaChallenge || mfaChallenge.mode !== 'verify') {
      throw new Error('No MFA challenge in progress')
    }
    await apiVerifyMfa(mfaChallenge.mfa_token, code)
    setMfaChallenge(null)
    await loadSessionAfterAuth(setUser, setProfile)
  }, [mfaChallenge])

  const completeMfaSetup = useCallback(async (secret: string, code: string) => {
    if (!mfaChallenge || mfaChallenge.mode !== 'setup') {
      throw new Error('No MFA setup in progress')
    }
    await apiConfirmMfaSetup({
      secret,
      code,
      mfa_token: mfaChallenge.mfa_token,
    })
    setMfaChallenge(null)
    await loadSessionAfterAuth(setUser, setProfile)
  }, [mfaChallenge])

  const clearMfaChallenge = useCallback(() => setMfaChallenge(null), [])

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } catch {
      // Clear local state even if server call fails
    }
    clearPersistedAuth()
    setUser(null)
    setProfile(null)
    setMfaChallenge(null)
  }, [])

  const hasRole = useCallback(
    (...roles: UserRole[]) => (user ? roles.includes(user.role) : false),
    [user],
  )

  const value = useMemo(
    () => ({
      user,
      profile,
      isLoading,
      mfaChallenge,
      login,
      completeMfa,
      completeMfaSetup,
      clearMfaChallenge,
      logout,
      refreshAuth,
      hasRole,
    }),
    [
      user, profile, isLoading, mfaChallenge, login, completeMfa,
      completeMfaSetup, clearMfaChallenge, logout, refreshAuth, hasRole,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
