import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { login as apiLogin, logout as apiLogout, getMe } from '@/api/auth'
import type { AuthState, User, UserRole } from '@/types'

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthState | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getMe()
      .then((p) => {
        setProfile(p)
        setUser(profileToAuth(p))
      })
      .catch(() => {
        setUser(null)
        setProfile(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const refreshAuth = useCallback(async () => {
    const p = await getMe()
    setProfile(p)
    setUser(profileToAuth(p))
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const data = await apiLogin(username, password)
    const auth: AuthState = {
      role: data.role,
      county: data.county,
      username: data.username,
      full_name: data.full_name,
      staff_number: data.staff_number,
    }
    setUser(auth)
    const p = await getMe()
    setProfile(p)
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } catch {
      // Clear local state even if the server call fails
    }
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
