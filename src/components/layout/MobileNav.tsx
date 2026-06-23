import { Link, useLocation } from 'react-router-dom'
import { Award, ClipboardList, LayoutDashboard, ShieldCheck, Users } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { hasPermission } from '@/lib/roles'
import { cn } from '@/lib/utils'

const items = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard, permission: 'sessions:view' as const },
  { to: '/sessions', label: 'Sessions', icon: ClipboardList, permission: 'sessions:view' as const },
  { to: '/users', label: 'Users', icon: Users, permission: 'users:manage' as const },
  { to: '/verify', label: 'Verify', icon: ShieldCheck, permission: null },
]

export function MobileNav() {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return null

  const visible = items.filter((i) => !i.permission || hasPermission(user.role, i.permission))

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white md:hidden">
      <div className="flex justify-around py-2">
        {visible.map(({ to, label, icon: Icon }) => {
          const active = location.pathname.startsWith(to)
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium',
                active ? 'text-brand-700' : 'text-gray-500',
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          )
        })}
      </div>
      <div className="flex items-center justify-center gap-1 pb-1 text-[9px] text-gray-400">
        <Award className="h-3 w-3" /> nhcsc.nascop.org
      </div>
    </nav>
  )
}
