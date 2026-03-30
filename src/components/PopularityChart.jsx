import spots from '../data/spots.json'
import { useScrollVisible } from '../hooks/useScrollVisible'

const popular = [...spots].filter(s => s.matchaFocus !== false).sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 10)
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
          <p className='subtitle popular-meta'>dedicated matcha spots, ranked by review count</p>
        </div>
        <div className='popular-chart'>
          <div className='popular-chart-head'>
            <span className='popular-name-spacer' />
            <span className='subtitle popular-reviews-label'>reviews</span>
          </div>
          {popular.map((spot, i) => (
            <div key={spot.id} className='popular-row'>
              <span className='popular-name'>{spot.name === 'Matcha Cafe Maiko' ? `Matcha Cafe Maiko - ${spot.neighborhood}` : spot.name}</span>
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
              <span className='popular-count'>{spot.reviewCount.toLocaleString()}</span>
              <div className='popular-bar-tooltip'>
                {spot.rating} ★ · {spot.tooltipLabel ?? spot.neighborhood}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
