import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/pages/LoginPage'
import { SetupPasswordPage } from '@/pages/SetupPasswordPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { SessionsPage } from '@/pages/SessionsPage'
import { SessionCreatePage } from '@/pages/SessionCreatePage'
import { SessionDetailPage } from '@/pages/SessionDetailPage'
import { VerifyPage } from '@/pages/VerifyPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { UsersPage } from '@/pages/UsersPage'
import { hasPermission } from '@/lib/roles'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
})

function RoleGuard({
  permission,
  children,
}: {
  permission: Parameters<typeof hasPermission>[1]
  children: React.ReactNode
}) {
  const { user } = useAuth()
  if (!user || !hasPermission(user.role, permission)) {
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/setup-password" element={<SetupPasswordPage />} />
      <Route path="/verify" element={<VerifyPage />} />
      <Route path="/verify/:serial" element={<VerifyPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/sessions" element={<SessionsPage />} />
        <Route
          path="/sessions/new"
          element={
            <RoleGuard permission="sessions:create">
              <SessionCreatePage />
            </RoleGuard>
          }
        />
        <Route path="/sessions/:sessionId" element={<SessionDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route
          path="/users"
          element={
            <RoleGuard permission="users:manage">
              <UsersPage />
            </RoleGuard>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
