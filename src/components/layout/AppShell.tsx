import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  Award, ClipboardList, LayoutDashboard, LogOut, ShieldCheck, Users,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { ROLE_LABELS } from '@/lib/constants'
import { hasPermission } from '@/lib/roles'
import { BrandLogo, KenyaStripe } from './Brand'
import { MobileNav } from './MobileNav'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'sessions:view' as const },
  { to: '/sessions', label: 'Sessions', icon: ClipboardList, permission: 'sessions:view' as const },
  { to: '/users', label: 'Users', icon: Users, permission: 'users:manage' as const },
  { to: '/verify', label: 'Verify Certificate', icon: ShieldCheck, permission: null },
]

export function AppShell() {
  const { user, logout } = useAuth()
  const location = useLocation()

  if (!user) return null

  const visibleNav = navItems.filter(
    (item) => !item.permission || hasPermission(user.role, item.permission),
  )

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-40 border-b bg-white shadow-sm">
        <KenyaStripe />
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/dashboard">
            <BrandLogo />
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-gray-900">{user.full_name}</p>
              <p className="text-xs text-gray-500">
                {ROLE_LABELS[user.role]} · {user.county}
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/profile">Password</Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={logout} title="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 pb-24 md:pb-6">
        <aside className="hidden w-56 shrink-0 md:block">
          <nav className="space-y-1">
            {visibleNav.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  location.pathname.startsWith(to)
                    ? 'bg-brand-100 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-100',
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 rounded-lg border bg-white p-4">
            <div className="flex items-center gap-2 text-brand-700">
              <Award className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">nhcsc.nascop.org</span>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Ministry of Health Kenya training registry
            </p>
          </div>
        </aside>

        <main className="min-w-0 flex-1"><Outlet /></main>
      </div>
      <MobileNav />
    </div>
  )
}
