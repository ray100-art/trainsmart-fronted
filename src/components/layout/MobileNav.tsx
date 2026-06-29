import { Link, useLocation } from 'react-router-dom'
import { BarChart3, ClipboardList, LayoutDashboard, ShieldCheck, Users, ScrollText, BookOpen } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { hasPermission } from '@/lib/roles'
import { cn } from '@/lib/utils'

const items = [
  { to: '/dashboard', label: 'Home',     icon: LayoutDashboard, permission: 'sessions:view' as const },
  { to: '/sessions',  label: 'Sessions', icon: ClipboardList,   permission: 'sessions:view' as const },
  { to: '/reports',   label: 'Reports',  icon: BarChart3,       permission: 'analytics:view' as const },
  { to: '/audit',     label: 'Audit',    icon: ScrollText,      permission: 'audit:view' as const },
  { to: '/programs',  label: 'Programs', icon: BookOpen,        permission: 'programs:manage' as const },
  { to: '/users',     label: 'Users',    icon: Users,           permission: 'users:manage' as const },
  { to: '/verify',    label: 'Verify',   icon: ShieldCheck,     permission: null },
]

export function MobileNav() {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return null

  const visible = items.filter((i) => !i.permission || hasPermission(user.role, i.permission))

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-sm md:hidden">
      <div className="flex justify-around px-1 py-1.5">
        {visible.map(({ to, label, icon: Icon }) => {
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
      </div>
    </nav>
  )
}
