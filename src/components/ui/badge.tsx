import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-700',
        pending: 'bg-amber-100 text-amber-800',
        approved: 'bg-brand-100 text-brand-700',
        rejected: 'bg-red-100 text-red-800',
        upcoming: 'bg-blue-100 text-blue-800',
        progress: 'bg-amber-100 text-amber-800',
        completed: 'bg-brand-100 text-brand-700',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export function statusBadgeVariant(status: string): BadgeProps['variant'] {
  const map: Record<string, BadgeProps['variant']> = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    UPCOMING: 'upcoming',
    IN_PROGRESS: 'progress',
    COMPLETED: 'completed',
    PRESENT: 'approved',
    ABSENT: 'rejected',
  }
  return map[status] ?? 'default'
}
