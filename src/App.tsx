import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/pages/LoginPage'
import { SetupPasswordPage } from '@/pages/SetupPasswordPage'
import { VerifyPage } from '@/pages/VerifyPage'
import { hasPermission } from '@/lib/roles'

const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const ReportsPage = lazy(() =>
  import('@/pages/ReportsPage').then((m) => ({ default: m.ReportsPage })),
)
const SessionsPage = lazy(() =>
  import('@/pages/SessionsPage').then((m) => ({ default: m.SessionsPage })),
)
const SessionCreatePage = lazy(() =>
  import('@/pages/SessionCreatePage').then((m) => ({ default: m.SessionCreatePage })),
)
const SessionDetailPage = lazy(() =>
  import('@/pages/SessionDetailPage').then((m) => ({ default: m.SessionDetailPage })),
)
const ProfilePage = lazy(() =>
  import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })),
)
const ProgramsPage = lazy(() =>
  import('@/pages/ProgramsPage').then((m) => ({ default: m.ProgramsPage })),
)
const AuditLogPage = lazy(() =>
  import('@/pages/AuditLogPage').then((m) => ({ default: m.AuditLogPage })),
)
const UsersPage = lazy(() =>
  import('@/pages/UsersPage').then((m) => ({ default: m.UsersPage })),
)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
})

function PageFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-500">
      Loading…
    </div>
  )
}

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
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/setup-password" element={<SetupPasswordPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/verify/:serial" element={<VerifyPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route
              path="/reports"
              element={
                <RoleGuard permission="analytics:view">
                  <ReportsPage />
                </RoleGuard>
              }
            />
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
              path="/programs"
              element={
                <RoleGuard permission="programs:manage">
                  <ProgramsPage />
                </RoleGuard>
              }
            />
            <Route
              path="/audit"
              element={
                <RoleGuard permission="audit:view">
                  <AuditLogPage />
                </RoleGuard>
              }
            />
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
    </Suspense>
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
