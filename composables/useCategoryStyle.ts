export interface CategoryStyle {
  icon: string
  bg: string
  color: string
}

const CATEGORY_ICON_MAP: Array<{ match: RegExp } & CategoryStyle> = [
  { match: /veg/i, icon: 'mdi-carrot', bg: 'var(--green-50)', color: 'var(--green-800)' },
  { match: /fruit/i, icon: 'mdi-food-apple-outline', bg: 'var(--green-50)', color: 'var(--green-800)' },
  { match: /grocer/i, icon: 'mdi-cart-outline', bg: 'var(--amber-50)', color: 'var(--amber-800)' },
  { match: /milk|dairy/i, icon: 'mdi-cup-outline', bg: 'var(--amber-50)', color: 'var(--amber-800)' },
  { match: /transport|fuel|petrol|gas|car/i, icon: 'mdi-gas-station-outline', bg: 'var(--amber-50)', color: 'var(--amber-800)' },
  { match: /rent|house|home/i, icon: 'mdi-home-outline', bg: 'var(--green-50)', color: 'var(--green-800)' },
  { match: /health|medic|pharma/i, icon: 'mdi-medical-bag', bg: 'var(--amber-50)', color: 'var(--amber-800)' },
  { match: /entertain|movie|game/i, icon: 'mdi-movie-outline', bg: 'var(--green-50)', color: 'var(--green-800)' },
  { match: /outside|restaurant|food|eat/i, icon: 'mdi-silverware-fork-knife', bg: 'var(--amber-50)', color: 'var(--amber-800)' },
]

const FALLBACK_PALETTE: CategoryStyle[] = [
  { icon: 'mdi-wallet-outline', bg: 'var(--green-50)', color: 'var(--green-800)' },
  { icon: 'mdi-wallet-outline', bg: 'var(--amber-50)', color: 'var(--amber-800)' },
]

export function categoryStyle(name: string): CategoryStyle {
  const found = CATEGORY_ICON_MAP.find(m => m.match.test(name))
  if (found) return found
  const idx = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % FALLBACK_PALETTE.length
  return FALLBACK_PALETTE[idx]
}
