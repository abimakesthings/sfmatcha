// Refreshes rating, reviewCount, and aiSummary for existing spots in spots.json
// using Place Details (by ID) — does NOT touch curated review, note, or photos.
//
// Usage: npm run refresh-ratings

import 'dotenv/config'
import { readFile, writeFile } from 'fs/promises'

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

  // Weighted score: rating + small bonus for review count, breaks ties with more precision
  // e.g. 4.8 with 175 reviews scores ~4.844, 4.8 with 9 reviews scores ~4.804
  const score = s => s.rating + (s.reviewCount / (s.reviewCount + 50)) * 0.1
  const sorted = [...updated].sort((a, b) => score(b) - score(a))

  await writeFile(spotsPath, JSON.stringify(sorted, null, 2))
  console.log(`\nDone — wrote ${sorted.length} spots to src/data/spots.json`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
