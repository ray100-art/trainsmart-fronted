import { cn } from '@/lib/utils'

export interface StatCardProps {
  label: string
  value: number | string
  sub?: string
  icon: React.ElementType
  color: 'green' | 'blue' | 'amber' | 'purple' | 'red'
}

const palettes: Record<StatCardProps['color'], { bg: string; iconBg: string; iconColor: string; valueColor: string }> = {
  green:  { bg: 'bg-brand-50  border-brand-200/60',  iconBg: 'bg-brand-100',  iconColor: 'text-brand-700', valueColor: 'text-brand-800'  },
  blue:   { bg: 'bg-blue-50   border-blue-200/60',   iconBg: 'bg-blue-100',   iconColor: 'text-blue-700',  valueColor: 'text-blue-800'   },
  amber:  { bg: 'bg-amber-50  border-amber-200/60',  iconBg: 'bg-amber-100',  iconColor: 'text-amber-700', valueColor: 'text-amber-800'  },
  purple: { bg: 'bg-purple-50 border-purple-200/60', iconBg: 'bg-purple-100', iconColor: 'text-purple-700', valueColor: 'text-purple-800' },
  red:    { bg: 'bg-red-50    border-red-200/60',    iconBg: 'bg-red-100',    iconColor: 'text-red-700',   valueColor: 'text-red-800'    },
}

export function StatCard({ label, value, sub, icon: Icon, color }: StatCardProps) {
  const p = palettes[color]
  return (
    <div className={cn('rounded-xl border p-5 shadow-sm', p.bg)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
          <p className={cn('mt-1.5 text-3xl font-black', p.valueColor)}>{value}</p>
          {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
        </div>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', p.iconBg)}>
          <Icon className={cn('h-5 w-5', p.iconColor)} />
        </div>
      </div>
    </div>
  )
}
