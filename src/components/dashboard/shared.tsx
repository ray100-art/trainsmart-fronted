import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SectionHeader({
  title,
  icon: Icon,
  linkTo,
  linkLabel,
}: {
  title: string
  icon?: React.ElementType
  linkTo?: string
  linkLabel?: string
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-5 w-5 text-brand-700" />}
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
      </div>
      {linkTo && (
        <Button variant="ghost" size="sm" asChild className="text-brand-700 hover:text-brand-600">
          <Link to={linkTo} className="flex items-center gap-1">
            {linkLabel ?? 'View all'} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      )}
    </div>
  )
}

export function DashboardHeader({
  greeting,
  subtitle,
  action,
}: {
  greeting: string
  subtitle: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">{subtitle}</p>
        <h1 className="mt-1 text-2xl font-black text-gray-900">{greeting}</h1>
      </div>
      {action}
    </div>
  )
}

export function EmptySessions({ message, cta }: { message: string; cta?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border bg-white py-12 text-center shadow-sm">
      <p className="text-sm font-semibold text-gray-700">{message}</p>
      {cta}
    </div>
  )
}

export function SessionGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="h-36 animate-pulse rounded-xl bg-gray-100" />
      ))}
    </div>
  )
}

export function BreakdownTable({
  title,
  data,
  valueLabel = 'Count',
}: {
  title: string
  data: Record<string, number>
  valueLabel?: string
}) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1])
  if (entries.length === 0) return null

  const max = entries[0][1]

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-bold text-gray-900">{title}</h3>
      <div className="space-y-3">
        {entries.map(([key, count]) => (
          <div key={key}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium text-gray-700">{key}</span>
              <span className="tabular-nums text-gray-500">{count} {valueLabel.toLowerCase()}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-brand-600 transition-all"
                style={{ width: `${max ? (count / max) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
