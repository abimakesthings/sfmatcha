import './TopTen.css'
import { useState } from 'react'
import { useScrollVisible } from '../../hooks/useScrollVisible'
import { track } from '../../lib/analytics'
import { topTen } from '../../lib/spots'

export default function TopTenSpots() {
  const sectionRef = useScrollVisible()
  const [activeId, setActiveId] = useState(null)

  function handleRowClick(id, name, index) {
    setActiveId(prev => prev === id ? null : id)
    track('top10_click', { spot_name: name, rank: index + 1 })
  }

  return (
    <section className='top-ten-section' ref={sectionRef}>
      <div className='top-ten-header'>
        <div className='top-ten-headings'>
          <h2 className='top-ten-title'>top 10</h2>
          <h2 className='top-ten-subheading'>matcha spots</h2>
        </div>
        <p className='subtitle'>matcha-first spots in SF, ranked by star rating</p>
      </div>
      <div className='top-ten-list'>
        {topTen.map(({ id, name, neighborhood, rating, reviewCount, note }, index) => (
          <div
            className={`top-ten-list-item${activeId === id ? ' tooltip-active' : ''}`}
            key={id}
            onClick={() => note && handleRowClick(id, name, index)}
            onKeyDown={e => note && (e.key === 'Enter' || e.key === ' ') && handleRowClick(id, name, index)}
            role={note ? 'button' : undefined}
            tabIndex={note ? 0 : undefined}
            aria-expanded={note ? activeId === id : undefined}
          >
            <div className='list-item-left'>
              <span className='spot-id'>{index + 1}</span>
              <div className='name-neighborhood-wrapper'>
                <div className='spot-name'>{name}</div>
                <div className='spot-neighborhood subtitle'>{neighborhood}</div>
              </div>
            </div>
            <div className='spot-rating subtitle'>{rating}<span className='star'>★</span></div>
            {note && (
              <div className='row-tooltip'>
                <p className='row-tooltip-desc'>{note}</p>
                <p className='row-tooltip-reviews'>{reviewCount?.toLocaleString()} reviews</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
