import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useScrollVisible } from '../hooks/useScrollVisible'
import spots from '../data/spots.json'

const MAP_ID = '6d2b821952b606c152cfc147'

const SF_CENTER = { lat: 37.7749, lng: -122.4194 }

function makeMarkerEl(color) {
  const el = document.createElement('div')
  el.style.cssText = `width:14px;height:14px;border-radius:50%;background:${color};border:2px solid #faf6f2;box-sizing:border-box;`
  return el
}

function SpotCard({ spot, onClose }) {
  const [photoIndex, setPhotoIndex] = useState(0)
  const cardRef = useRef(null)
  const dragStartY = useRef(null)

  const base = import.meta.env.BASE_URL
  const localPhotos = (spot.photos ?? []).map(p => base + p.slice(1))
  const placesUrl = spot.photo
    ? `https://places.googleapis.com/v1/${spot.photo}/media?maxWidthPx=400&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
    : null
  const photos = placesUrl ? [...localPhotos, placesUrl] : localPhotos
  const hasCarousel = photos.length > 1

  const prev = e => { e.stopPropagation(); setPhotoIndex(i => (i - 1 + photos.length) % photos.length) }
  const next = e => { e.stopPropagation(); setPhotoIndex(i => (i + 1) % photos.length) }

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    function handleTouchStart(e) {
      if (card.scrollTop !== 0) return
      dragStartY.current = e.touches[0].clientY
      card.style.transition = 'none'
    }

    function handleTouchMove(e) {
      if (dragStartY.current === null) return
      const dy = e.touches[0].clientY - dragStartY.current
      if (dy > 0) {
        e.preventDefault()
        card.style.transform = `translateY(${dy}px)`
      }
    }

    function handleTouchEnd(e) {
      if (dragStartY.current === null) return
      const dy = e.changedTouches[0].clientY - dragStartY.current
      card.style.transition = ''
      if (dy > 100) {
        onClose()
      } else {
        card.style.transform = ''
      }
      dragStartY.current = null
    }

    card.addEventListener('touchstart', handleTouchStart, { passive: true })
    card.addEventListener('touchmove', handleTouchMove, { passive: false })
    card.addEventListener('touchend', handleTouchEnd, { passive: true })
    return () => {
      card.removeEventListener('touchstart', handleTouchStart)
      card.removeEventListener('touchmove', handleTouchMove)
      card.removeEventListener('touchend', handleTouchEnd)
    }
  }, [onClose])

  return (
    <div
      className='spot-card'
      ref={cardRef}
    >
      {photos.length > 0 && (
        <div className='spot-card-photos'>
          <img className='spot-card-photo' src={photos[photoIndex]} alt={spot.name} />
          <div className='spot-card-handle' />
          <button className='spot-card-close' onClick={onClose}>×</button>
          {hasCarousel && (
            <>
              <button className='spot-card-arrow spot-card-arrow--prev' onClick={prev}>‹</button>
              <button className='spot-card-arrow spot-card-arrow--next' onClick={next}>›</button>
              <div className='spot-card-dots'>
                {photos.map((_, i) => (
                  <span key={i} className='spot-card-dot' data-active={i === photoIndex} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
      {photos.length === 0 && (
        <>
          <div className='spot-card-handle' />
          <button className='spot-card-close' onClick={onClose}>×</button>
        </>
      )}
      <div className='spot-card-body'>
        <p className='spot-card-name'>{spot.name}</p>
        <p className='spot-card-rating'>
          {spot.rating}<span className='spot-card-star'>★</span>
          <span className='spot-card-count'>({spot.reviewCount?.toLocaleString()})</span>
        </p>
        {spot.aiSummary && <p className='spot-card-summary'>{spot.aiSummary}</p>}
        {spot.review && <p className='spot-card-review'>"{spot.review}"</p>}
        {spot.website && (
          <a className='spot-card-link' href={spot.website} target='_blank' rel='noreferrer'>
            Visit website →
          </a>
        )}
      </div>
    </div>
  )
}

export default function Map() {
  const mapRef = useRef(null)
  const sectionRef = useScrollVisible()
  const [selectedSpot, setSelectedSpot] = useState(null)

  useEffect(() => {
    const listeners = []

    async function initMap() {
      const { Map } = await google.maps.importLibrary('maps')
      const { AdvancedMarkerElement } = await google.maps.importLibrary('marker')

      const map = new Map(mapRef.current, {
        center: SF_CENTER, zoom: 13, mapId: MAP_ID, disableDefaultUI: true, zoomControl: true,
      })

      spots.forEach(spot => {
        const color = spot.matchaFocus === false ? '#405d35' : '#b8922a'
        const marker = new AdvancedMarkerElement({
          position: { lat: spot.lat, lng: spot.lng },
          map,
          title: spot.name,
          content: makeMarkerEl(color),
        })
        listeners.push(marker.addListener('gmp-click', () => setSelectedSpot(spot)))
      })

      // Block native Google Maps POI/neighborhood tooltip on label click
      listeners.push(map.addListener('click', e => {
        if (e.placeId) e.stop()
        else setSelectedSpot(null)
      }))
    }

    initMap()

    return () => listeners.forEach(l => l.remove())
  }, [])

  return (
    <section className='map-section' ref={sectionRef}>
      <div className='map-header'>
        <h2 className='map-title'>the map</h2>
        <div className='map-legend'>
          <span className='map-legend-item'>
            <span className='map-legend-dot map-legend-dot--gold' />
            spots where matcha is the main event, not just on the menu
          </span>
          <span className='map-legend-item'>
            <span className='map-legend-dot map-legend-dot--green' />
            spots where matcha is not the main focus, but still worth trying
          </span>
        </div>
      </div>
      <div className='map-wrapper'>
        <div className='map-container' ref={mapRef} />
        {selectedSpot && createPortal(
          <>
            <div className='spot-card-backdrop' onPointerDown={() => setSelectedSpot(null)} />
            <SpotCard
              key={selectedSpot.id}
              spot={selectedSpot}
              onClose={() => setSelectedSpot(null)}
            />
          </>,
          document.body
        )}
      </div>
    </section>
  )
}
