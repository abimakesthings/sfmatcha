import { lastUpdated as isoDate } from '../data/metadata.json'

function relativeDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  const updated = new Date(y, m - 1, d)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((today - updated) / 86400000)
  if (diff === 0) return 'today'
  if (diff === 1) return 'yesterday'
  return `${m}/${d}/${String(y).slice(2)}`
}

export const lastUpdatedLabel = relativeDate(isoDate)
