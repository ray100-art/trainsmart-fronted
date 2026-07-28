/**
 * Brand logos served from this app (same origin on Vercel).
 * Absolute site URLs also work: https://trainsmart-fronted.vercel.app/brand/...
 */
export const BRAND_LOGOS = {
  /** Full MoH crest + wordmark */
  moh: '/brand/moh-logo-hq.png',
  /** Compact MoH for headers */
  mohCompact: '/brand/moh-logo-256.png',
  /** NASCOP ribbon wordmark */
  nascop: '/brand/nascop-logo-hq.png',
  nascopCompact: '/brand/nascop-logo-128.png',
} as const

/** Public absolute URLs (for docs / print / external embeds) */
export const BRAND_LOGOS_ABSOLUTE = {
  moh: 'https://trainsmart-fronted.vercel.app/brand/moh-logo-hq.png',
  nascop: 'https://trainsmart-fronted.vercel.app/brand/nascop-logo-hq.png',
} as const
