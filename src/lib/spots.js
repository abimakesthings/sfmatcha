import spots from '../data/spots.json'

export const topTen = [...spots]
  .filter(s => s.matchaFocus !== false)
  .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
  .slice(0, 10)

export const spotsLastUpdated = typeof __SPOTS_LAST_UPDATED__ !== 'undefined' ? __SPOTS_LAST_UPDATED__ : null

export function formatFreshness(isoDate) {
  if (!isoDate) return 'source: Google Maps'

  const updated = new Date(isoDate)
  const now = new Date()
  const startOfDay = d => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const diffDays = Math.round((startOfDay(now) - startOfDay(updated)) / 86400000)

  let label
  if (diffDays <= 0) label = 'updated today'
  else if (diffDays === 1) label = 'updated yesterday'
  else {
    const opts = { month: 'short', day: 'numeric' }
    if (updated.getFullYear() !== now.getFullYear()) opts.year = 'numeric'
    label = `updated ${updated.toLocaleDateString('en-US', opts)}`
  }

  return `${label}, source: Google Maps`
}
