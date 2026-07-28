import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { login as apiLogin, logout as apiLogout, getMe } from '@/api/auth'
import type { AuthState, User, UserRole } from '@/types'

/** UI profile cache only — JWT lives in httpOnly cookie, never localStorage. */
const STORAGE_KEY = 'trainsmart_auth'

interface AuthContextValue {
  user: AuthState | null
  profile: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthState | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
    await apiLogin(username, password)
    try {
      const p = await getMe()
      const auth = profileToAuth(p)
      persistAuth(auth)
      setUser(auth)
      setProfile(p)
    } catch (err) {
      // Login API succeeded but session cookie was not accepted/sent (common when
      // FE and API are on different domains without SameSite=None).
      clearPersistedAuth()
      setUser(null)
      setProfile(null)
      throw err
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } catch {
      // Clear local state even if server call fails
    }
    clearPersistedAuth()
    setUser(null)
    setProfile(null)
  }, [])

  const hasRole = useCallback(
    (...roles: UserRole[]) => (user ? roles.includes(user.role) : false),
    [user],
  )

  const value = useMemo(
    () => ({ user, profile, isLoading, login, logout, refreshAuth, hasRole }),
    [user, profile, isLoading, login, logout, refreshAuth, hasRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
