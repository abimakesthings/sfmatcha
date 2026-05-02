import spots from '../data/spots.json'
import { scoreSpot } from './score.js'

export { scoreSpot }

export const topTen = [...spots]
  .filter(s => s.matchaFocus !== false)
  .sort((a, b) => scoreSpot(b) - scoreSpot(a))
  .slice(0, 10)
