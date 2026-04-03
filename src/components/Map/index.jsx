import './Map.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useScrollVisible } from '../../hooks/useScrollVisible'
import spots from '../../data/spots.json'

const MAP_ID = '6d2b821952b606c152cfc147'

const SF_CENTER = { lat: 37.7749, lng: -122.4194 }

function makeMarkerEl(color) {
  const size = window.innerWidth <= 620 ? 20 : 14
  const el = document.createElement('div')
  el.style.cssText = `width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid #faf6f2;box-sizing:border-box;`
  return el
}

function SpotCard({ spot, onClose }) {
  const [photoIndex, setPhotoIndex] = useState(0)
  const cardRef = useRef(null)
  const stripRef = useRef(null)
  const touchStart = useRef(null) // { x, y }
  const gesture = useRef(null)    // 'sheet' | 'carousel' | null

  const photos = useMemo(() => {
    const base = import.meta.env.BASE_URL
    const localPhotos = (spot.photos ?? []).map(p => base + p.slice(1))
    const placesUrl = spot.photo
      ? `https://places.googleapis.com/v1/${spot.photo}/media?maxWidthPx=400&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      : null
    return placesUrl ? [...localPhotos, placesUrl] : localPhotos
  }, [spot.photo, spot.photos])
  const hasCarousel = photos.length > 1

  // goTo: drives the strip directly so React state doesn't fight the transform
  const photoIndexRef = useRef(photoIndex)
  photoIndexRef.current = photoIndex
  function goTo(index, animate = true) {
    const strip = stripRef.current
    if (strip) {
      strip.style.transition = animate ? 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)' : 'none'
      strip.style.transform = `translateX(-${index * 100}%)`
    }
    setPhotoIndex(index)
  }

  const prev = e => { e.stopPropagation(); goTo((photoIndexRef.current - 1 + photos.length) % photos.length) }
  const next = e => { e.stopPropagation(); goTo((photoIndexRef.current + 1) % photos.length) }

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    function onTouchStart(e) {
      if (card.scrollTop !== 0) return
      touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() }
      gesture.current = null
      card.style.animation = 'none'
    }

    function onTouchMove(e) {
      if (!touchStart.current) return
      const dx = e.touches[0].clientX - touchStart.current.x
      const dy = e.touches[0].clientY - touchStart.current.y

      // Lock gesture direction on first significant movement.
      // Sheet requires 10px vertical before committing — prevents a slight
      // diagonal during horizontal carousel swipes from dragging the sheet.
      if (!gesture.current) {
        if (Math.abs(dx) > Math.abs(dy) && hasCarousel) gesture.current = 'carousel'
        else if (Math.abs(dy) > Math.abs(dx) * 2 && Math.abs(dy) > 20) gesture.current = 'sheet'
        else return
      }

      if (gesture.current === 'sheet') {
        if (dy > 0) {
          e.preventDefault()
          card.style.transition = 'none'
          card.style.transform = `translateY(${dy}px)`
        }
      } else if (gesture.current === 'carousel') {
        const strip = stripRef.current
        if (strip) {
          strip.style.transition = 'none'
          strip.style.transform = `translateX(calc(-${photoIndexRef.current * 100}% + ${dx}px))`
        }
      }
    }

    function onTouchEnd(e) {
      if (!touchStart.current) return
      const dx = e.changedTouches[0].clientX - touchStart.current.x
      const dy = e.changedTouches[0].clientY - touchStart.current.y

      if (gesture.current === 'sheet') {
        const velocity = dy / (Date.now() - touchStart.current.t)
        const shouldDismiss = dy > 80 || velocity > 0.5
        if (shouldDismiss) {
          card.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)'
          card.style.transform = `translateY(100%)`
          card.addEventListener('transitionend', onClose, { once: true })
        } else {
          card.style.transition = ''
          card.style.transform = ''
        }
      } else if (gesture.current === 'carousel') {
        const idx = photoIndexRef.current
        if (Math.abs(dx) > 50) {
          goTo(dx < 0 ? (idx + 1) % photos.length : (idx - 1 + photos.length) % photos.length)
        } else {
          goTo(idx) // snap back
        }
      }

      touchStart.current = null
      gesture.current = null
    }

    card.addEventListener('touchstart', onTouchStart, { passive: true })
    card.addEventListener('touchmove', onTouchMove, { passive: false })
    card.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      card.removeEventListener('touchstart', onTouchStart)
      card.removeEventListener('touchmove', onTouchMove)
      card.removeEventListener('touchend', onTouchEnd)
    }
  }, [onClose, hasCarousel, photos.length])

  return (
    <div className='spot-card' ref={cardRef}>
      {photos.length > 0 && (
        <div className='spot-card-photos'>
          <div
            ref={stripRef}
            className='spot-card-photo-strip'
          >
            {photos.map((src, i) => (
              <img key={i} className='spot-card-photo' src={src} alt={spot.name} />
            ))}
          </div>
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
        <button className='spot-card-close' onClick={onClose}>×</button>
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
    if (!selectedSpot || window.innerWidth > 620) return
    const scrollY = window.scrollY
    document.body.style.cssText = `position:fixed;top:-${scrollY}px;left:0;right:0;overflow-y:scroll;`
    return () => {
      document.body.style.cssText = ''
      window.scrollTo(0, scrollY)
    }
  }, [selectedSpot])

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

  // Mobile: portal to body so position:fixed escapes the map-wrapper's animation transform.
  // Desktop: render inline so position:absolute is relative to map-wrapper.
  const spotCard = selectedSpot && (
    <>
      <div className='spot-card-backdrop' onPointerDown={() => setSelectedSpot(null)} />
      <SpotCard
        key={selectedSpot.id}
        spot={selectedSpot}
        onClose={() => setSelectedSpot(null)}
      />
    </>
  )

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
        {spotCard && (window.innerWidth <= 620 ? createPortal(spotCard, document.body) : spotCard)}
      </div>
    </section>
  )
}
