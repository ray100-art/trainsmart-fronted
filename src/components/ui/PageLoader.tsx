export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-200 border-t-brand-700" />
      </div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
    </div>
  )
}

export function SessionsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="skeleton h-36" />
      ))}
    </div>
  )
}
