import { useState } from 'react'
import { useScrollVisible } from '../hooks/useScrollVisible'
import flavorStacks from '../data/flavors.js'

const PLACES_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

function FlavorStack({ stack }) {
  const [topIndex, setTopIndex] = useState(0)
  const clickable = stack.length > 1

  const advance = () => {
    if (clickable) setTopIndex(i => (i + 1) % stack.length)
  }

  return (
    <div
      className='flavor-stack'
      data-count={stack.length}
      data-clickable={clickable}
      onClick={advance}
    >
      {stack.map((card, i) => {
        const pos = (i - topIndex + stack.length) % stack.length
        return (
          <div
            key={card.id}
            className='flavor-card'
            data-pos={pos}
            style={{ zIndex: stack.length - pos }}
          >
            <div className='flavor-photo'>
              {card.photoUrl ? (
                <img src={card.photoUrl} alt={card.flavor} />
              ) : card.photo ? (
                <img
                  src={`https://places.googleapis.com/v1/${card.photo}/media?maxWidthPx=400&key=${PLACES_API_KEY}`}
                  alt={card.flavor}
                />
              ) : null}
            </div>
            <div className='flavor-caption'>
              <p className='flavor-name'>{card.flavor}</p>
              <p className='flavor-cafe'>{card.cafe}</p>
              {clickable && (
                <div className='flavor-stack-dots'>
                  {Array.from({ length: stack.length }, (_, i) => (
                    <span key={i} className='flavor-stack-dot' data-active={i === topIndex} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })}

    </div>
  )
}

export default function StandoutFlavors() {
  const sectionRef = useScrollVisible()

  return (
    <section className='flavors-section' ref={sectionRef}>
      <div className='flavors-inner'>
        <div className='flavors-header'>
          <h2 className='flavors-title'>standout</h2>
          <h2 className='flavors-subtitle'>flavors</h2>
        </div>
        <div className='flavors-grid'>
          {flavorStacks.map(stack => (
            <FlavorStack key={stack[0].id} stack={stack} />
          ))}
        </div>
        <p className='flavors-swipe-hint'>swipe to browse →</p>
      </div>
    </section>
  )
}
