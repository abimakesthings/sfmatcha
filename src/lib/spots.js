import spots from '../data/spots.json'

export const scoreSpot = s => s.rating + (s.reviewCount / (s.reviewCount + 50)) * 0.1

export const topTen = [...spots]
  .filter(s => s.matchaFocus !== false)
  .sort((a, b) => scoreSpot(b) - scoreSpot(a))
  .slice(0, 10)
