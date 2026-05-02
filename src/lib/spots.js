import spots from '../data/spots.json'

export const topTen = [...spots]
  .filter(s => s.matchaFocus !== false)
  .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
  .slice(0, 10)
