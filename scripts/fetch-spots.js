// Fetches matcha spots in San Francisco from multiple sources:
//   - The Infatuation SF matcha guide (scraped, cached in scripts/infatuation-cache.json)
//   - Google Places API text search
//   - Hardcoded seed spots (only queried if not found by broad search)
//
// Usage:
//   npm run fetch-spots                  # normal run (uses cached Infatuation list)
//   npm run fetch-spots -- --refresh     # re-scrapes Infatuation + re-queries all seeds
//
// Requires: GOOGLE_MAPS_API_KEY set in .env

import 'dotenv/config'
import { readFile, writeFile } from 'fs/promises'
import { extractTopReview } from './places-utils.js'

const API_KEY = process.env.GOOGLE_MAPS_API_KEY
const INFATUATION_CACHE_PATH = new URL('./infatuation-cache.json', import.meta.url).pathname
const REFRESH = process.argv.includes('--refresh')
const CLOSED_PERMANENTLY = 'CLOSED_PERMANENTLY'

// SF bounding box — excludes East Bay, Marin, Peninsula
const SF_BOUNDS = {
  minLat: 37.70, maxLat: 37.84,
  minLng: -122.53, maxLng: -122.35,
}

const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.addressComponents',
  'places.location',
  'places.rating',
  'places.userRatingCount',
  'places.editorialSummary',
  'places.generativeSummary',
  'places.reviews',
  'places.priceLevel',
  'places.websiteUri',
  'places.businessStatus',
  'places.photos',
].join(',')

// Always include these — queried individually only if not already found by broad search
const SEED_SPOTS = [
  'Shoji San Francisco',
  'Stonemill Matcha San Francisco',
  'Tadaima San Francisco',
  'OISHII MATCHA San Francisco',
  'Komeya No Bento San Francisco',
  'Maruwu Seicha San Francisco',
  'Kiss of Matcha San Francisco',
  'Black Bird Bookstore and Café San Francisco',
  'Cafe Nagomi San Francisco',
  'Progeny Coffee San Francisco',
  'Sohn San Francisco',
  "Compton's Coffee House San Francisco",
  'Breadbelly San Francisco',
  'The Wild Fox San Francisco',
  'Ceré Tea San Francisco',
  'Tokyo Cream San Francisco',
  'Junbi Matcha San Francisco',
  'Kopiku San Francisco',
  'Kissaten HiFi San Francisco',
]

// Place IDs manually confirmed as non-matcha — excluded from output on every scrape
const BLOCKLIST = new Set([
  'ChIJwZsJXQCBhYARn1LoVpz3ZX4', // SAIGONESE CAFÉ
  'ChIJNRhdpfiBhYARK9WOuF0UHwA', // LearnUp Centers
  'ChIJ9W7ofPSAhYARPkhgF24V8KI', // City Lights Booksellers & Publishers
  'ChIJyYModPGAhYARl_9XlTZjDmk', // North Beach Psychic
  'ChIJ95TkKTN-j4ARjgP69VUAPSo', // San Francisco Center for the Book (SFCB)
  'ChIJabLD85Odj4AR_d8Bbu8-pCQ', // Sentence Center
  'ChIJHV5KOMaAhYARnIb_FjQ2-0I', // Browser Books
  'ChIJd2spnJuAhYARhkuvhLCp3us', // Main Library - San Francisco Public Library
  'ChIJee4DupqHhYARXadb2DlBtr8', // Andytown Coffee Roasters (Lawton St)
  'ChIJyQd9b2N9j4ARU0bf2M8oyAk', // Andytown Coffee Roasters (Taraval St)
  'ChIJUaf97nt9j4AR5zDiKQn-4ks', // Andytown Roastery, Training Lab, & Coffee Supply
  'ChIJi7zRBSKBhYARDBE08ZVsLq0', // Andytown Coffee Roasters (Front St)
  'ChIJLUki9b1_j4AROgJvYw51QKo', // Andytown Coffee Roasters (Diamond St)
  'ChIJZTx2MVOBhYARcUzH3cTQN7I', // Andytown Coffee Roasters (Fremont St Rooftop)
  'ChIJIWto0vGHhYAR1koqXLM7-Io', // Andytown Coffee Roasters (Great Hwy)
  'ChIJWQe5ev9_j4ARzeiwS1Z2H5E', // Andytown Coffee Roasters (Harrison St)
  'ChIJNeQAcw9-j4ARP9-nCnYB30o', // Neighbor's Corner
  'ChIJE5Lfmxx-j4ARjAvOuX5SrmE', // Crystal Way
  'ChIJE_VoLrR_j4ARmg6rTCznE4M', // CoffeeShop
  'ChIJRwabyj1-j4ARUXRf6Pem9H0', // Dog Eared Books
  'ChIJ5cT2TfV_j4ARKKWYGROl6Tc', // The Rustic - San Francisco
  'ChIJheKTZdt_j4ARaSU2l4-jQf0', // psychic reader
  'ChIJrao-01WHhYARTyKnWw4j9Eg', // Intuitive Tarot Card Readings, by Sea Tarot
  'ChIJ6af9PBt-j4ARwGYT5g_2tV8', // INTUITIVE PSYCHIC THERAPY/EMPATHS
  'ChIJk2Z4dtJ9j4ARpuk2GJRGwIM', // Jessica Boyer, Medium and TRE Guide
  'ChIJjZg-XSCBhYARgD3vNTSEcFk', // The spiritual Eye
  'ChIJyx-kQLV_j4AR-6zpfu2qpgg', // Psychic Mission Street Candle Shop
  'ChIJp0qlAo6AhYARRfc5T_LLff0', // Psychic Readings By Hilary
  'ChIJfVHZgQuBhYARgVuQdM6OPLc', // Psychic Reading By Sophia Knight
  'ChIJxTjdRhZ-j4ARCPBZhi8FuzI', // Intuitive Tarot Readings by Jeannie Zukav
  'ChIJ_fRRLeqGhYAROWsCl5027X8', // Fort Point National Historic Site
  'ChIJP43ood-GhYAR-hXQ02Q3Z-U', // Presidio of San Francisco
  'ChIJZ76fAGGAhYARlzR3Drlx4qM', // Books Inc.
  'ChIJ5RdoUKWAhYARFfoSJGdFS5c', // Alamo Square Park
  'ChIJmYCFv-SBhYARVrbcmH2ybbg', // Best Boy Electric
  'ChIJtbmElXyAhYARbDYABzKFeB0', // The Melt
  'ChIJ-4IyM2OBhYARv5mXa1iLa8U', // Sana'a cafe
  'ChIJaTq4jgiBhYARnQNUgwjW-k0', // Book Writing Lane
  'ChIJWTGPjmaAhYARxz6l1hOj92w', // Ferry Building
  'ChIJWTGPjmaAhYARPcAJdmCZmYI', // Book Passage
  'ChIJ1f5_4_KAhYAR-rIwsCEGAvk', // Chinatown San Francisco
  'ChIJTfb1d_uHhYARRpn5d_Fk1SU', // The Coffee Movement (Balboa St)
  'ChIJoTMb3PKAhYARsXkQt469sBw', // The Coffee Movement (Washington St)
  'ChIJ24eJZwB_j4AR1hVAchUxbKY', // The Coffee Movement (19th St)
  'ChIJ40UnhsGBhYARAEYv8hqHPCw', // Persona
  'ChIJmZa_nCWBhYAR-gWlk5ZX0r0', // Haraz Coffee House
  // Obvious non-matcha
  'ChIJnTAa43-BhYARI_APzmPARyw', // Content Writing Xpert
  'ChIJuRzSVSh-j4ARRTMQBeBJRFw', // Bay Area Reporter (newspaper)
  'ChIJjVaeHpOBhYARteGpqv2vmuc', // San Francisco City Guides
  'ChIJKfw7pI6AhYAR5fB_ON9IQbA', // San Francisco Eye Institute
  'ChIJqfLB8pKAhYARUKTu-tdEB_s', // San Francisco Writers Conference
  'ChIJ5fq_rT1-j4ARgOhw10ZTbtQ', // Borderlands Books
  'ChIJJ6cSNxt-j4ARvKO2gp1qScI', // Fabulosa Books
  'ChIJ3cFX-1x_j4ARouahLAN8Eyg', // Marigold Event Space
  'ChIJmdXseYqAhYARqOaGBlCsxPo', // Privately Owned Public Space
  'ChIJZ8d24biAhYAR3b-k3lgVQXI', // Kinokuniya Bookstore
  'ChIJOU4E7Z6AhYARJ2d3NI-sm4M', // Anchor Coworking San Francisco
  'ChIJ56LdFnmAhYARq7WbUju80E8', // The Writers Grotto
  'ChIJoYiOqfGAhYAR8J-KiogVyCQ', // Washington Square (park)
  'ChIJcyL4M8yBhYARlZOZbfdyQ2Y', // Page street writers
  'ChIJW5D3LYmAhYARb92CmHj1bOM', // Union Square (public square)
  'ChIJExXNdCh-j4AR6JuGm4ElqcQ', // Hole In the Wall Saloon (bar)
  'ChIJ_wo6bauBhYARIpTgHGRLL7U', // Heart of San Francisco Series
  'ChIJCRhXr5uAhYARN0C527WdciM', // Pioneer Monument
  'ChIJCbHZRZiAhYARuvdfSp9LbRI', // SFUSD (school district)
  'ChIJe1pfXNR_j4ARCJ-GMXw44cc', // Microsoft
  'ChIJQXEtcK6AhYARJyORU4aqeaY', // San Francisco DMV
  'ChIJeUB5OR-BhYARKv1ucvbHQQo', // Elite Book Writing
  'ChIJJcR5WAeBhYAR3VSb5a5vTak', // Secret Bar at Son & Garden
  'ChIJ88EItqWBhYAR6oOhmbmOjgs', // SPRO
  'ChIJXVOcv9SBhYAR84QtGtCafxk', // Third Wheel Coffee
  'ChIJ81fzsc-BhYARdZtCXcbJ-7E', // LOQUAT
  'ChIJy8vmGC2BhYARu919i3bko-Q', // Doppio Coffee & Brunch
  'ChIJo9Z6AbeBhYARvtu1ZYzOno0', // Na Ya Dessert Cafe
  'ChIJyQm3b0GBhYARO9AIklc2_EY', // Mellow Coffee
  'ChIJq0gFptmBhYAR0Us2v-9sUzY', // YakiniQ CAFE
  'ChIJm4MmyT9_j4ARuiSgNng3RSY', // Marigold
  'ChIJhX252XV_j4ARjowOHlDAjUc', // Marigold Café
  'ChIJTTq11ZmBhYARmN1Y-YkucFs', // Juniper (not matcha-focused)
  'ChIJh_24QJ-AhYAR_xbUNVN2Xns', // Rich Table
  'ChIJw9g0TJ6AhYARM7O-xtJpFSE', // Veer & Wander
  'ChIJ5Z-h8Q9_j4ARyARE5bLhg1U', // Goodhart Coffee Catering
  'ChIJUd2oYWt_j4ARp0ZTuccEnrE', // Officially Hitched
  'ChIJ3d31Iz1-j4ARkwerSZRVQjM', // Dandelion Chocolate
  'ChIJkVSnJpKAhYARCSaDnRo5brE', // Liholiho Yacht Club
  'ChIJQcdLBsx_j4AROyDSIMBYKH8', // Bottom of the Hill
  'ChIJAQAAQIyAhYARRN3yIQG4hd4', // Coit Tower
  'ChIJZYKHDZiAhYARXV0sNJgKAi8', // Smuggler's Cove
  'ChIJjT-up56AhYARyoew8kbEB_0', // Mr. Tipple's Jazz Club
  'ChIJi2CdSa6BhYARP6xkfxOB8OA', // Outta Sight Pizza
  'ChIJm82lK-qBhYARFjp6dZUgiZg', // The Pawn Shop
  'ChIJfRa8OTx-j4ARAIUacuQEvmM', // 20 Spot
  'ChIJd5Gi0zp-j4AR59LwvYq0k7g', // Rite Spot Cafe
  'ChIJz83c5DOHhYARCA7KDzU8fck', // Books Inc
  'ChIJlck0TCJ-j4ARy_D_VDE1zlc', // Forest Books
  'ChIJsYdOvCx-j4ARJItjWBikyOk', // Marufuku Ramen
  'ChIJe0YgbeiAhYAR5olhEmlulE4', // The New Spot On Polk
  'ChIJ7-1fxZ6AhYARmP0wJXXZ9nQ', // Rickshaw Stop
  'ChIJdzrG1LuAhYARwq4upU3rdw8', // Merchant Roots
  'ChIJZZ_cOYaAhYARnyfbDrAkvJ8', // The View Lounge
  'ChIJO7u9q5-AhYARiSSXyWv9eJ8', // Zuni Café
  'ChIJaSBxxa-AhYARBotIvZ6iIbE', // Emporium Arcade Bar
  'ChIJyzdPuJiAhYAR_Bl-8T3riX4', // Linden Room
  'ChIJv-DRdaCAhYARd6X8k87eWLY', // The Mint Karaoke Lounge
  'ChIJXZc0HJyAhYAR1O96nCqTohw', // Little Griddle @ Dough
  'ChIJlZn9AxyBhYARAY1cJE9KydY', // Kiln
  'ChIJP3BkbhWBhYARthx5NASt5DE', // SF OrganiCA
  'ChIJz4BFC2mBhYARYAcuIa_bhS0', // Rise & Set
  'ChIJbZrTRzx-j4AR1AzhXfq8_4c', // Garden Creamery
  'ChIJtdUYv5iAhYARaOOFfGK1TKU', // Doppio Zero San Francisco
  'ChIJI4yBh91_j4ARwhmrL1Q-WLg', // side a
  'ChIJZZe2z4iAhYAR418hAvlqxxE', // Winter Walk
  'ChIJyUG4pT1_j4ARiG6WgT-c3pA', // Off The Charts (matcha powder shop, not a cafe)
  'ChIJvw-c_biAhYARdfM6jENFhYw', // ChaTo (matcha powder retailer, not a cafe)
])

const INFATUATION_URL = 'https://www.theinfatuation.com/san-francisco/guides/best-matcha-san-francisco'

async function scrapeInfatuation() {
  try {
    const res = await fetch(INFATUATION_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const html = await res.text()
    const matches = [...html.matchAll(/<h2[^>]*>([^<]{3,60})<\/h2>/g)]
    return matches
      .map(m => m[1].trim())
      .filter(name => !name.toLowerCase().includes('matcha') || name.length < 60)
      .map(name => `${name} San Francisco`)
  } catch (err) {
    console.warn(`  ⚠ Could not scrape Infatuation: ${err.message}`)
    return []
  }
}

async function getInfatuationQueries() {
  if (!REFRESH) {
    try {
      const cached = JSON.parse(await readFile(INFATUATION_CACHE_PATH, 'utf8'))
      console.log(`  → ${cached.length} spots from cache (pass --refresh to re-scrape)\n`)
      return cached
    } catch {
      // no cache yet — fall through to live scrape
    }
  }
  console.log('  → scraping live...')
  const queries = await scrapeInfatuation()
  await writeFile(INFATUATION_CACHE_PATH, JSON.stringify(queries, null, 2))
  console.log(`  → ${queries.length} spots found, cache updated\n`)
  return queries
}

async function searchPlaces(query) {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify({
      textQuery: query,
      locationBias: {
        circle: {
          center: { latitude: 37.7749, longitude: -122.4194 },
          radius: 15000,
        },
      },
      maxResultCount: 1,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Places API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  return data.places ?? []
}

function isInSF({ location }) {
  const { latitude: lat, longitude: lng } = location ?? {}
  if (!lat || !lng) return false
  return (
    lat >= SF_BOUNDS.minLat && lat <= SF_BOUNDS.maxLat &&
    lng >= SF_BOUNDS.minLng && lng <= SF_BOUNDS.maxLng
  )
}


function normalizePriceLevel(raw) {
  const map = {
    PRICE_LEVEL_FREE: 0,
    PRICE_LEVEL_INEXPENSIVE: 1,
    PRICE_LEVEL_MODERATE: 2,
    PRICE_LEVEL_EXPENSIVE: 3,
    PRICE_LEVEL_VERY_EXPENSIVE: 4,
  }
  return map[raw] ?? null
}

function extractNeighborhood(addressComponents) {
  if (!addressComponents) return null
  const types = ['neighborhood', 'sublocality_level_1', 'sublocality']
  for (const type of types) {
    const component = addressComponents.find(c => c.types?.includes(type))
    if (component) return component.longText ?? component.shortText ?? null
  }
  return null
}

function transformPlace(place) {
  return {
    id: place.id,
    name: place.displayName?.text ?? '',
    address: place.formattedAddress ?? '',
    neighborhood: extractNeighborhood(place.addressComponents),
    lat: place.location?.latitude ?? null,
    lng: place.location?.longitude ?? null,
    rating: place.rating ?? null,
    reviewCount: place.userRatingCount ?? null,
    summary: place.editorialSummary?.text ?? null,
    aiSummary: place.generativeSummary?.overview?.text ?? null,
    topReview: extractTopReview(place.reviews),
    priceLevel: normalizePriceLevel(place.priceLevel),
    photo: place.photos?.[0]?.name ?? null,
    website: place.websiteUri ?? null,
  }
}

async function main() {
  if (!API_KEY) {
    console.error('Missing GOOGLE_MAPS_API_KEY in environment')
    process.exit(1)
  }

  console.log('Getting Infatuation spots...')
  const infatuationQueries = await getInfatuationQueries()

  const allQueries = [...new Set([...infatuationQueries, ...SEED_SPOTS])]
  console.log(`Running ${allQueries.length} queries...`)
  const results = await Promise.all(allQueries.map(q => searchPlaces(q)))

  const byId = new Map()
  for (const places of results)
    for (const place of places)
      if (!byId.has(place.id)) byId.set(place.id, place)

  console.log(`\n${allQueries.length} total API requests used`)

  const spots = [...byId.values()]
    .filter(isInSF)
    .filter(p => !BLOCKLIST.has(p.id))
    .filter(p => p.businessStatus !== CLOSED_PERMANENTLY)
    .filter(p => p.rating != null)
    .map(transformPlace)
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)

  console.log(`${byId.size} unique → ${spots.length} after filtering (SF only, open)\n`)

  const outPath = new URL('../src/data/spots.json', import.meta.url).pathname
  await writeFile(outPath, JSON.stringify(spots, null, 2))
  console.log(`Wrote ${spots.length} spots to src/data/spots.json`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
