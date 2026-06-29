import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { login as apiLogin, logout as apiLogout, getMe } from '@/api/auth'
import type { AuthState, User, UserRole } from '@/types'

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

function loadStoredToken(): string | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return undefined
    return (JSON.parse(raw) as AuthState).token
  } catch {
    return undefined
  }
}

function authFromProfile(profile: User): AuthState {
  const auth = profileToAuth(profile)
  const token = loadStoredToken()
  if (token) auth.token = token
  return auth
}

function persistAuth(auth: AuthState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthState | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getMe()
      .then((p) => {
        setProfile(p)
        const auth = authFromProfile(p)
        setUser(auth)
        persistAuth(auth)
      })
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY)
        setUser(null)
        setProfile(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const refreshAuth = useCallback(async () => {
    const p = await getMe()
    setProfile(p)
    const auth = authFromProfile(p)
    setUser(auth)
    persistAuth(auth)
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const data = await apiLogin(username, password)
    const auth: AuthState = {
      token: data.token,
      role: data.role,
      county: data.county,
      username: data.username,
      full_name: data.full_name,
      staff_number: data.staff_number,
    }
    persistAuth(auth)
    setUser(auth)
    const p = await getMe()
    setProfile(p)
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } catch {
      // Clear local state even if server call fails
    }
    localStorage.removeItem(STORAGE_KEY)
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
