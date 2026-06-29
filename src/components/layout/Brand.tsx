export function KenyaStripe() {
  return (
    <div className="flex h-1.5 w-full">
      <div className="flex-1 bg-brand-700" />
      <div className="flex-1 bg-kenya-red" />
      <div className="flex-1 bg-white" />
    </div>
  )
}

export function BrandLogo({
  compact = false,
  light = false,
}: {
  compact?: boolean
  light?: boolean
}) {
  const textColor = light ? 'text-white' : 'text-brand-800'
  const accentColor = light ? 'text-brand-accent' : 'text-brand-500'
  const subColor = light ? 'text-white/50' : 'text-gray-400'

  return (
    <div className="flex items-center gap-2.5">
      <div
        className={[
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
          light ? 'bg-white/15' : 'bg-brand-700',
        ].join(' ')}
      >
        <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
          <rect x="8.5" y="3" width="3" height="14" rx="1" fill="white" />
          <rect x="3" y="8.5" width="14" height="3" rx="1" fill="white" />
          <circle cx="10" cy="10" r="9" stroke="white" strokeOpacity="0.25" strokeWidth="1" />
        </svg>
      </div>
      <div>
        <p className={[compact ? 'text-xl' : 'text-2xl', 'font-black leading-none tracking-tight', textColor].join(' ')}>
          Train<span className={accentColor}>SMART</span>
        </p>
        {!compact && (
          <p className={['mt-0.5 text-[9px] font-semibold uppercase tracking-widest', subColor].join(' ')}>
            National Healthcare Training Registry · NASCOP · MOH Kenya
          </p>
        )}
      </div>
    </div>
  )
}
