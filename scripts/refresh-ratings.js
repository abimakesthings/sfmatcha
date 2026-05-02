// Refreshes rating, reviewCount, and aiSummary for existing spots in spots.json
// using Place Details (by ID) — does NOT touch curated review, note, or photos.
//
// Usage: npm run refresh-ratings

import 'dotenv/config'
import { readFile, writeFile } from 'fs/promises'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const API_KEY = process.env.GOOGLE_MAPS_API_KEY

const FIELD_MASK = [
  'rating',
  'userRatingCount',
  'generativeSummary',
].join(',')


async function fetchPlaceDetails(placeId) {
  const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: {
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': FIELD_MASK,
    },
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Place Details error ${res.status} for ${placeId}: ${err}`)
  }
  return res.json()
}

async function main() {
  if (!API_KEY) {
    console.error('Missing GOOGLE_MAPS_API_KEY in environment')
    process.exit(1)
  }

  const spotsPath = new URL('../src/data/spots.json', import.meta.url).pathname
  const spots = JSON.parse(await readFile(spotsPath, 'utf8'))
  console.log(`Refreshing ratings for ${spots.length} spots...`)

  const updated = await Promise.all(spots.map(async (spot) => {
    try {
      const place = await fetchPlaceDetails(spot.id)
      const rating = place.rating ?? spot.rating
      const reviewCount = place.userRatingCount ?? spot.reviewCount
      const aiSummary = place.generativeSummary?.overview?.text ?? spot.aiSummary
      const changed = rating !== spot.rating || reviewCount !== spot.reviewCount || aiSummary !== spot.aiSummary
      if (changed) console.log(`  ✓ ${spot.name}${rating !== spot.rating ? ` (${spot.rating}★ → ${rating}★)` : ''}`)
      return { ...spot, rating, reviewCount, aiSummary }
    } catch (err) {
      console.warn(`  ⚠ ${spot.name}: ${err.message}`)
      return spot
    }
  }))

  const { scoreSpot } = await import('../src/lib/score.js')
  const sorted = [...updated].sort((a, b) => scoreSpot(b) - scoreSpot(a))

  const metaPath = new URL('../src/data/metadata.json', import.meta.url).pathname
  await writeFile(spotsPath, JSON.stringify(sorted, null, 2))
  await writeFile(metaPath, JSON.stringify({ lastUpdated: new Date().toISOString().slice(0, 10) }, null, 2))
  console.log(`\nDone — wrote ${sorted.length} spots to src/data/spots.json`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
