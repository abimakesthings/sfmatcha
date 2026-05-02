import './PopularityChart.css'
import spots from '../../data/spots.json'
import { useScrollVisible } from '../../hooks/useScrollVisible'
import { lastUpdatedLabel } from '../../lib/lastUpdated'

function groupByChain(list) {
  const map = new Map()
  list.forEach(s => {
    const key = s.chainName ?? s.name
    if (!map.has(key)) {
      map.set(key, { ...s, displayName: s.chainName ?? s.displayName ?? s.name, reviewCount: 0, neighborhoods: [] })
    }
    const entry = map.get(key)
    entry.reviewCount += s.reviewCount ?? 0
    entry.neighborhoods.push(s.neighborhood)
  })
  return [...map.values()]
}

const popular = groupByChain(spots.filter(s => s.matchaFocus !== false))
  .sort((a, b) => b.reviewCount - a.reviewCount)
  .slice(0, 10)
const maxReviews = popular[0]?.reviewCount ?? 1

export default function PopularityChart() {
  const sectionRef = useScrollVisible()

  return (
    <section className='popular-section' ref={sectionRef}>
      <div className='popular-inner'>
        <div className='popular-header'>
          <div className='popular-headings'>
            <h2 className='popular-title'>most popular</h2>
            <h2 className='popular-subtitle'>matcha spots</h2>
          </div>
          <p className='subtitle popular-meta'>matcha-first spots, ranked by review count</p>
          <p className='data-freshness'>last updated {lastUpdatedLabel}, source: Google Maps</p>
        </div>
        <div className='popular-chart'>
          <div className='popular-chart-head'>
            <span className='popular-name-spacer' />
            <span className='subtitle popular-reviews-label'>reviews</span>
          </div>
          {popular.map((spot, i) => (
            <div key={spot.id} className='popular-row'>
              <div className='popular-name-cell'>
                <span className='popular-name'>{spot.displayName ?? spot.name}</span>
                {spot.neighborhoods.length > 1 && (
                  <span className='popular-locations-pill'>{spot.neighborhoods.length} locations</span>
                )}
              </div>
              <div className='popular-bar-track'>
                <div
                  className='popular-bar-fill'
                  style={{
                    '--bar-w': `${(spot.reviewCount / maxReviews) * 100}%`,
                    '--bar-delay': `${i * 0.07}s`,
                    '--shimmer-delay': `${i * 0.12}s`,
                  }}
                />
              </div>
              <span className='popular-count'>{spot.reviewCount?.toLocaleString()}</span>
              <div className='popular-bar-tooltip'>
                {spot.rating} ★ · {spot.neighborhoods.length > 1
                  ? `${spot.neighborhoods.length} locations: ${spot.neighborhoods.join(', ')}`
                  : (spot.tooltipLabel ?? spot.neighborhood)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
