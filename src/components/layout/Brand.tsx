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

function RemoteImg({
  src,
  fallback,
  alt,
  className,
}: {
  src: string
  fallback?: string
  alt: string
  className?: string
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      draggable={false}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={(e) => {
        if (fallback && e.currentTarget.src !== fallback) {
          e.currentTarget.src = fallback
        }
      }}
    />
  )
}

type BrandLogoProps = {
  compact?: boolean
  light?: boolean
  className?: string
}

/**
 * TrainSMART mark with MoH crest loaded from Wikimedia Commons.
 */
export function BrandLogo({ compact = false, light = false, className }: BrandLogoProps) {
  const textColor = light ? 'text-white' : 'text-brand-800'
  const accentColor = light ? 'text-brand-accent' : 'text-brand-500'
  const subColor = light ? 'text-white/55' : 'text-gray-400'

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-xl bg-white shadow-sm',
          compact ? 'h-11 px-1.5' : 'h-12 px-2',
        )}
      >
        <RemoteImg
          src={BRAND_LOGOS.coatOfArms}
          fallback={BRAND_LOGOS.moh}
          alt="Republic of Kenya — Ministry of Health"
          className={cn('w-auto object-contain', compact ? 'h-9' : 'h-10')}
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

/** MoH + NASCOP partnership logos from public internet URLs */
export function PartnerLogos({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const mohH = size === 'lg' ? 'h-16' : size === 'sm' ? 'h-10' : 'h-12'
  const nascopH = size === 'lg' ? 'h-12' : size === 'sm' ? 'h-7' : 'h-9'

  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-5 sm:gap-7', className)}>
      <RemoteImg
        src={BRAND_LOGOS.moh}
        fallback={BRAND_LOGOS.mohSite}
        alt="Republic of Kenya Ministry of Health"
        className={cn(mohH, 'w-auto max-w-[220px] object-contain')}
      />
      <div className="hidden h-10 w-px bg-gray-200 sm:block" aria-hidden="true" />
      <RemoteImg
        src={BRAND_LOGOS.nascop}
        fallback="/brand/nascop-logo-hq.png"
        alt="NASCOP"
        className={cn(nascopH, 'w-auto max-w-[200px] object-contain')}
      />
    </div>
  )
}

/** Compact dual marks on white plates for dark headers */
export function OfficialMarks({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex h-9 items-center rounded-lg bg-white px-1.5 shadow-sm">
        <RemoteImg
          src={BRAND_LOGOS.coatOfArms}
          fallback={BRAND_LOGOS.moh}
          alt="Ministry of Health"
          className="h-7 w-auto object-contain"
        />
      </div>
      <div className="flex h-9 items-center rounded-lg bg-white px-2 shadow-sm">
        <RemoteImg
          src={BRAND_LOGOS.nascop}
          fallback="/brand/nascop-logo-hq.png"
          alt="NASCOP"
          className="h-5 w-auto object-contain"
        />
      </div>
    </div>
  )
}
