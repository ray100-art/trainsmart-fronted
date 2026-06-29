import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  Award, BarChart3, ClipboardList, LayoutDashboard, LogOut,
  ShieldCheck, Users, ChevronRight, Settings, BookOpen, ScrollText,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { ROLE_LABELS } from '@/lib/constants'
import { hasPermission } from '@/lib/roles'
import { BrandLogo, KenyaStripe } from './Brand'
import { MobileNav } from './MobileNav'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard', label: 'Dashboard',          icon: LayoutDashboard, permission: 'sessions:view' as const },
  { to: '/sessions',  label: 'Sessions',            icon: ClipboardList,   permission: 'sessions:view' as const },
  { to: '/reports',   label: 'Reports',             icon: BarChart3,       permission: 'analytics:view' as const },
  { to: '/audit',     label: 'Audit Log',           icon: ScrollText,      permission: 'audit:view' as const },
  { to: '/programs',  label: 'Programs',            icon: BookOpen,        permission: 'programs:manage' as const },
  { to: '/users',     label: 'User Management',     icon: Users,           permission: 'users:manage' as const },
  { to: '/verify',    label: 'Verify Certificate',  icon: ShieldCheck,     permission: null },
]

function UserAvatar({ name }: { name: string }) {
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-bold text-white ring-2 ring-white/20">
      {initials}
    </div>
  )
}

function SidebarAvatar({ name }: { name: string }) {
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
      {initials}
    </div>
  )
}

export function AppShell() {
  const { user, logout } = useAuth()
  const location = useLocation()
  if (!user) return null

  const visibleNav = navItems.filter(
    (item) => !item.permission || hasPermission(user.role, item.permission),
  )

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-40 bg-brand-800 text-white">
        <KenyaStripe />
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/dashboard" className="shrink-0">
            <BrandLogo light />
          </Link>
          <div className="flex items-center gap-1">
            <div className="mr-2 hidden items-center gap-2.5 sm:flex">
              <UserAvatar name={user.full_name} />
              <div className="text-right leading-none">
                <p className="text-sm font-semibold">{user.full_name}</p>
                <p className="mt-0.5 text-[11px] text-white/55">
                  {ROLE_LABELS[user.role]} · {user.county}
                </p>
              </div>
            </div>
            <div className="mx-1 hidden h-6 w-px bg-white/20 sm:block" />
            <Link
              to="/profile"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Settings className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Account</span>
            </Link>
            <button
              type="button"
              onClick={() => logout()}
              title="Sign out"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 pb-24 md:pb-6">
        <aside className="hidden w-60 shrink-0 md:block">
          <nav className="space-y-0.5">
            {visibleNav.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to))
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150',
                    active
                      ? 'bg-brand-700 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm',
                  )}
                >
                  <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600')} />
                  <span className="flex-1">{label}</span>
                  {active && <ChevronRight className="h-3.5 w-3.5 text-white/50" />}
                </Link>
              )
            })}
          </nav>
          <div className="mt-5 rounded-xl border border-gray-200 bg-white px-3.5 py-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <SidebarAvatar name={user.full_name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-gray-900">{user.full_name}</p>
                <p className="truncate text-[11px] text-gray-500">{ROLE_LABELS[user.role]}</p>
              </div>
            </div>
          </div>
          <div className="mt-2.5 rounded-xl border border-gray-200 bg-white px-3.5 py-3 shadow-sm">
            <div className="flex items-center gap-2 text-brand-700">
              <Award className="h-4 w-4 shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-wide">nhcsc.nascop.org</span>
            </div>
            <p className="mt-1 text-[11px] leading-snug text-gray-400">
              Ministry of Health Kenya · National Healthcare Training Registry
            </p>
          </div>
        </aside>
        <main className="min-w-0 flex-1 animate-fade-in-up">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
