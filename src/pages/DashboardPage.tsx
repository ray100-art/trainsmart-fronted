import { useAuth } from '@/hooks/useAuth'
import { TrainerDashboard } from '@/components/dashboard/TrainerDashboard'
import { CountyOfficerDashboard } from '@/components/dashboard/CountyOfficerDashboard'
import { NationalAdminDashboard } from '@/components/dashboard/NationalAdminDashboard'
import { MEManagerDashboard } from '@/components/dashboard/MEManagerDashboard'
import type { UserRole } from '@/types'

export function DashboardPage() {
  const { user } = useAuth()
  if (!user) return null

  const dashboards: Partial<Record<UserRole, React.ReactNode>> = {
    ROLE_TRAINER:         <TrainerDashboard user={user} />,
    ROLE_COUNTY_OFFICER:  <CountyOfficerDashboard user={user} />,
    ROLE_NATIONAL_ADMIN:  <NationalAdminDashboard user={user} />,
    ROLE_ME_MANAGER:      <MEManagerDashboard user={user} />,
    ROLE_SYSTEM_ADMIN:    <NationalAdminDashboard user={user} />,
  }

  return dashboards[user.role] ?? <TrainerDashboard user={user} />
}
