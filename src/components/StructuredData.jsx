import { useEffect } from 'react'
import spots from '../data/spots.json'

const score = s => s.rating + (s.reviewCount / (s.reviewCount + 50)) * 0.1
const topTen = [...spots]
  .filter(s => s.matchaFocus !== false)
  .sort((a, b) => score(b) - score(a))
  .slice(0, 10)

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Best Matcha Spots in San Francisco',
  description: 'A curated list of the best matcha spots in San Francisco, ranked by quality and reviewed by locals.',
  url: 'https://sfmatcha.com',
  itemListElement: topTen.map((spot, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': 'CafeOrCoffeeShop',
      name: spot.name,
      address: spot.address,
      geo: {
        '@type': 'GeoCoordinates',
        latitude: spot.lat,
        longitude: spot.lng,
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: spot.rating,
        reviewCount: spot.reviewCount,
      },
      ...(spot.website ? { url: spot.website } : {}),
    },
  })),
}

export default function StructuredData() {
  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify(structuredData)
    document.head.appendChild(script)
    return () => document.head.removeChild(script)
  }, [])

  return null
}
