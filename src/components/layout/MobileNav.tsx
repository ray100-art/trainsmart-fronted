import {
  ClipboardList, LayoutDashboard, ShieldCheck, UserCircle, Award,
  MoreHorizontal, BarChart3, ScrollText, BookOpen, Building2, Users,
  HandCoins, GraduationCap, X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { hasPermission, hasAnyPermission, type Permission } from '@/lib/roles'
import { cn } from '@/lib/utils'

type NavItem = {
  to: string
  label: string
  icon: typeof LayoutDashboard
  permission?: Permission | null
  permissions?: readonly Permission[]
}

/** Primary bar stays ≤4 destinations; overflow goes into More. */
const primaryItems: NavItem[] = [
  { to: '/dashboard', label: 'Home',     icon: LayoutDashboard, permission: 'sessions:view' },
  { to: '/sessions',  label: 'Sessions', icon: ClipboardList,   permission: 'sessions:view' },
  { to: '/people',    label: 'People',   icon: UserCircle,      permission: 'people:view' },
  { to: '/certificates', label: 'Certs', icon: Award,           permission: 'sessions:view' },
]

const moreItems: NavItem[] = [
  { to: '/verify',    label: 'Verify Certificate', icon: ShieldCheck, permission: null },
  { to: '/moodle',    label: 'Moodle',             icon: GraduationCap, permission: 'sessions:view' },
  { to: '/reports',   label: 'Reports',            icon: BarChart3,   permission: 'analytics:view' },
  { to: '/audit',     label: 'Audit Log',          icon: ScrollText,  permission: 'audit:view' },
  { to: '/programs',  label: 'Programs',           icon: BookOpen,    permission: 'programs:manage' },
  { to: '/facilities', label: 'Facilities',        icon: Building2,   permissions: ['programs:manage', 'catalogs:manage'] },
  { to: '/sponsors',  label: 'Sponsors',           icon: HandCoins,   permissions: ['programs:manage', 'catalogs:manage'] },
  { to: '/users',     label: 'User Management',    icon: Users,       permission: 'users:manage' },
]

function isVisible(item: NavItem, role: Parameters<typeof hasPermission>[0]) {
  if (item.permissions) return hasAnyPermission(role, [...item.permissions])
  return !item.permission || hasPermission(role, item.permission)
}

export function MobileNav() {
  const { user } = useAuth()
  const location = useLocation()
  const [moreOpen, setMoreOpen] = useState(false)

  const visiblePrimary = useMemo(
    () => (user ? primaryItems.filter((i) => isVisible(i, user.role)) : []),
    [user],
  )
  const visibleMore = useMemo(
    () => (user ? moreItems.filter((i) => isVisible(i, user.role)) : []),
    [user],
  )

  if (!user) return null

  const moreActive = visibleMore.some(
    (i) => location.pathname === i.to || (i.to !== '/dashboard' && location.pathname.startsWith(i.to)),
  )

  return (
    <>
      {moreOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMoreOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border border-gray-200 bg-white pb-[max(1rem,env(safe-area-inset-bottom))] shadow-lg">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <p className="text-sm font-bold text-gray-900">More</p>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="max-h-[60vh] overflow-y-auto px-2 py-2">
              {visibleMore.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to))
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors',
                      active ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50',
                    )}
                  >
                    <Icon className={cn('h-5 w-5', active ? 'text-brand-700' : 'text-gray-400')} />
                    {label}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden">
        <div className="flex justify-around px-1 py-1.5">
          {visiblePrimary.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to))
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-semibold transition-all duration-150',
                  active ? 'bg-brand-50 text-brand-700' : 'text-gray-500 hover:text-gray-700',
                )}
              >
                <Icon className={cn('h-5 w-5', active ? 'text-brand-700' : 'text-gray-400')} />
                {label}
              </Link>
            )
          })}
          {visibleMore.length > 0 && (
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-semibold transition-all duration-150',
                moreActive || moreOpen ? 'bg-brand-50 text-brand-700' : 'text-gray-500 hover:text-gray-700',
              )}
            >
              <MoreHorizontal className={cn('h-5 w-5', moreActive || moreOpen ? 'text-brand-700' : 'text-gray-400')} />
              More
            </button>
          )}
        </div>
      </nav>
    </>
  )
}
