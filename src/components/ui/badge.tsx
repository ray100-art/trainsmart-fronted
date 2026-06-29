import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
  {
    variants: {
      variant: {
        default:   'bg-gray-100 text-gray-700',
        pending:   'bg-amber-100 text-amber-800',
        approved:  'bg-brand-50 text-brand-700 ring-1 ring-brand-200',
        rejected:  'bg-red-100 text-red-800',
        upcoming:  'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
        progress:  'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
        completed: 'bg-brand-50 text-brand-700 ring-1 ring-brand-200',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

export function Badge({ className, variant, dot = false, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            variant === 'approved' || variant === 'completed' ? 'bg-brand-500'
              : variant === 'rejected' ? 'bg-red-500'
              : variant === 'pending' || variant === 'progress' ? 'bg-amber-500'
              : variant === 'upcoming' ? 'bg-blue-500'
              : 'bg-gray-400',
          )}
        />
      )}
      {children}
    </span>
  )
}

export function statusBadgeVariant(status: string): BadgeProps['variant'] {
  const map: Record<string, BadgeProps['variant']> = {
    PENDING: 'pending', APPROVED: 'approved', REJECTED: 'rejected',
    UPCOMING: 'upcoming', IN_PROGRESS: 'progress', COMPLETED: 'completed',
    PRESENT: 'approved', ABSENT: 'rejected',
  }
  return map[status] ?? 'default'
}
