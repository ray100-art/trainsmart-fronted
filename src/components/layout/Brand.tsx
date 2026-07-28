import { cn } from '@/lib/utils'
import { BRAND_LOGOS } from '@/lib/brand'

/** Kenya flag stripe used on auth / public chrome */
export function KenyaStripe() {
  return (
    <div className="flex h-1.5 w-full" aria-hidden="true">
      <div className="flex-1 bg-brand-700" />
      <div className="flex-1 bg-kenya-red" />
      <div className="flex-1 bg-white" />
    </div>
  )
}

type BrandLogoProps = {
  compact?: boolean
  light?: boolean
  className?: string
}

/**
 * TrainSMART product mark with MoH crest (full colour on a white plate).
 */
export function BrandLogo({ compact = false, light = false, className }: BrandLogoProps) {
  const textColor = light ? 'text-white' : 'text-brand-800'
  const accentColor = light ? 'text-brand-accent' : 'text-brand-500'
  const subColor = light ? 'text-white/55' : 'text-gray-400'

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/5',
          compact ? 'h-11 px-1.5' : 'h-12 px-2',
        )}
      >
        <img
          src={BRAND_LOGOS.mohCompact}
          alt="Republic of Kenya — Ministry of Health"
          className={cn('w-auto object-contain', compact ? 'h-9' : 'h-10')}
          draggable={false}
        />
      </div>
      <div>
        <p className={cn(compact ? 'text-xl' : 'text-2xl', 'font-black leading-none tracking-tight', textColor)}>
          Train<span className={accentColor}>SMART</span>
        </p>
        {!compact && (
          <p className={cn('mt-1 text-[9px] font-semibold uppercase tracking-[0.14em]', subColor)}>
            National Healthcare Training Registry · NASCOP
          </p>
        )}
      </div>
    </div>
  )
}

/** MoH + NASCOP logos — used on login, verify, and certificates */
export function PartnerLogos({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const mohH = size === 'lg' ? 'h-24' : size === 'sm' ? 'h-14' : 'h-20'
  const nascopH = size === 'lg' ? 'h-14' : size === 'sm' ? 'h-9' : 'h-11'

  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-4 sm:gap-8', className)}>
      <img
        src={BRAND_LOGOS.moh}
        alt="Republic of Kenya Ministry of Health"
        className={cn(mohH, 'w-auto max-w-[200px] object-contain')}
        draggable={false}
      />
      <div className="hidden h-12 w-px bg-gray-200 sm:block" aria-hidden="true" />
      <img
        src={BRAND_LOGOS.nascop}
        alt="NASCOP"
        className={cn(nascopH, 'w-auto max-w-[220px] object-contain')}
        draggable={false}
      />
    </div>
  )
}

/** Compact dual marks on white plates */
export function OfficialMarks({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex h-10 items-center rounded-lg bg-white px-1.5 shadow-sm ring-1 ring-black/5">
        <img
          src={BRAND_LOGOS.mohCompact}
          alt="Ministry of Health"
          className="h-8 w-auto object-contain"
          draggable={false}
        />
      </div>
      <div className="flex h-10 items-center rounded-lg bg-white px-2 shadow-sm ring-1 ring-black/5">
        <img
          src={BRAND_LOGOS.nascopCompact}
          alt="NASCOP"
          className="h-6 w-auto object-contain"
          draggable={false}
        />
      </div>
    </div>
  )
}
