/**
 * Official partner logos loaded from the public internet (CDN / government hosts).
 * Local /brand copies remain as offline fallback only.
 */
export const BRAND_LOGOS = {
  /** Full MoH wordmark lockup (Wikimedia Commons — sourced from health.go.ke) */
  moh: 'https://upload.wikimedia.org/wikipedia/commons/9/92/KenyaMinHealth.png',
  /** Official Kenyan Coat of Arms (Wikimedia Commons) */
  coatOfArms:
    'https://upload.wikimedia.org/wikipedia/commons/f/f6/Coat_of_arms_of_Kenya_(Official).svg',
  /** MoH site header mark */
  mohSite: 'https://www.health.go.ke/sites/default/files/g4588.png',
  /**
   * Cleaned NASCOP mark hosted from this repo via jsDelivr
   * (updates after the asset is on GitHub main).
   */
  nascop:
    'https://cdn.jsdelivr.net/gh/ray100-art/trainsmart-fronted@main/public/brand/nascop-logo-hq.png',
  /** Cleaned MoH crest lockup from this repo via jsDelivr */
  mohHq:
    'https://cdn.jsdelivr.net/gh/ray100-art/trainsmart-fronted@main/public/brand/moh-logo-hq.png',
} as const
