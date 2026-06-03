import './Map.css'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useScrollVisible } from '../../hooks/useScrollVisible'
import spots from '../../data/spots.json'
import { track } from '../../lib/analytics'
import { placesPhotoUrl } from '../../lib/places'

function MapSearch({ onSelect }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return spots.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.neighborhood.toLowerCase().includes(q)
    ).slice(0, 6)
  }, [query])

  useEffect(() => {
    function onPointerDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  function handleSelect(spot) {
    onSelect(spot)
    setQuery('')
    setOpen(false)
    track('map_search_select', { spot_name: spot.name })
  }

  return (
    <div className='map-search' ref={containerRef}>
      <div className='map-search-input-wrap'>
        <svg className='map-search-icon' width='14' height='14' viewBox='0 0 14 14' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <circle cx='6' cy='6' r='4.5' stroke='currentColor' strokeWidth='1.4'/>
            <line x1='9.5' y1='9.5' x2='13' y2='13' stroke='currentColor' strokeWidth='1.4' strokeLinecap='round'/>
          </svg>
        <input
          className='map-search-input'
          type='text'
          placeholder='Search spots'
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={e => { if (e.key === 'Escape') { setOpen(false); setQuery('') } }}
        />
        {query && (
          <button className='map-search-clear' onPointerDown={e => { e.preventDefault(); setQuery(''); setOpen(false) }}>×</button>
        )}
      </div>
      {open && results.length > 0 && (
        <ul className='map-search-dropdown'>
          {results.map(spot => (
            <li key={spot.id} className='map-search-result' onPointerDown={() => handleSelect(spot)}>
              <span className='map-search-result-name'>{spot.name}</span>
              <span className='map-search-result-neighborhood'>{spot.neighborhood}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const MAP_ID = '6d2b821952b606c152cfc147'

const SF_CENTER = { lat: 37.7749, lng: -122.4194 }

function makeMarkerEl(color, size) {
  const el = document.createElement('div')
  el.className = 'map-marker'
  el.style.setProperty('--marker-color', color)
  el.style.setProperty('--marker-size', `${size}px`)
  return el
}

function SpotCard({ spot, onClose }) {
  const [photoIndex, setPhotoIndex] = useState(0)
  const cardRef = useRef(null)
  const stripRef = useRef(null)
  const touchStart = useRef(null) // { x, y, t }
  const gesture = useRef(null)    // 'sheet' | 'carousel' | null

  const photos = useMemo(() => {
    const base = import.meta.env.BASE_URL
    // BASE_URL ends with '/', local paths start with '/' — slice(1) avoids double slash
    const localPhotos = (spot.photos ?? []).map(p => p.startsWith('http') ? p : base + p.slice(1))
    const placesUrl = spot.photo ? placesPhotoUrl(spot.photo) : null
    return placesUrl ? [...localPhotos, placesUrl] : localPhotos
  }, [spot.photo, spot.photos])
  const hasCarousel = photos.length > 1

  // Drives the strip directly so React state doesn't fight the CSS transform during swipe.
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

      // Block pull-to-refresh before gesture locks — browser fires it during the
      // threshold window before we call preventDefault inside the sheet branch.
      if (!gesture.current && dy > 0) e.preventDefault()

      // Lock gesture direction on first significant movement.
      // Sheet requires clearly-vertical angle + 20px before committing — prevents
      // diagonal drift during horizontal carousel swipes from dragging the sheet.
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

    function onTouchCancel() {
      touchStart.current = null
      gesture.current = null
      card.style.transition = ''
      card.style.transform = ''
      const strip = stripRef.current
      if (strip) {
        strip.style.transition = ''
        strip.style.transform = `translateX(-${photoIndexRef.current * 100}%)`
      }
    }

    card.addEventListener('touchstart', onTouchStart, { passive: true })
    card.addEventListener('touchmove', onTouchMove, { passive: false })
    card.addEventListener('touchend', onTouchEnd, { passive: true })
    card.addEventListener('touchcancel', onTouchCancel, { passive: true })
    return () => {
      card.removeEventListener('touchstart', onTouchStart)
      card.removeEventListener('touchmove', onTouchMove)
      card.removeEventListener('touchend', onTouchEnd)
      card.removeEventListener('touchcancel', onTouchCancel)
    }
  }, [onClose, hasCarousel])

  return (
    <div className='spot-card' ref={cardRef}>
      <div className='spot-card-handle' />
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
      <div className={`spot-card-body${photos.length === 0 ? ' spot-card-body--no-photos' : ''}`}>
        <p className='spot-card-name'>{spot.name}</p>
        <p className='spot-card-rating'>
          {spot.rating}<span className='spot-card-star'>★</span>
          <span className='spot-card-count'>({spot.reviewCount?.toLocaleString()})</span>
        </p>
        {spot.aiSummary && <p className='spot-card-summary'>{spot.aiSummary}</p>}
        {spot.review && <p className='spot-card-review'>"{spot.review}"</p>}
        {spot.website && (
          <a className='spot-card-link' href={spot.website} target='_blank' rel='noreferrer' onClick={() => track('spot_website_click', { spot_name: spot.name })}>
            Visit website →
          </a>
        )}
      </div>
    </div>
  )
}

export default function Map() {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerEls = useRef({})       // spot.id → DOM element
  const markerInstances = useRef({}) // spot.id → AdvancedMarkerElement
  const sectionRef = useScrollVisible()
  const [selectedSpot, setSelectedSpot] = useState(null)
  const [mapError, setMapError] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 620)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 620px)')
    const handler = e => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const closeSpot = useCallback(() => setSelectedSpot(null), [])

  useEffect(() => {
    Object.entries(markerEls.current).forEach(([id, el]) => {
      el.classList.remove('map-marker--selected')
      if (markerInstances.current[id]) markerInstances.current[id].zIndex = 0
    })
    if (selectedSpot) {
      markerEls.current[selectedSpot.id]?.classList.add('map-marker--selected')
      if (markerInstances.current[selectedSpot.id]) markerInstances.current[selectedSpot.id].zIndex = 10
    }
  }, [selectedSpot])

  const selectSpot = useCallback(spot => {
    setSelectedSpot(spot)
    mapInstanceRef.current?.panTo({ lat: spot.lat, lng: spot.lng })
  }, [])

  useEffect(() => {
    if (!selectedSpot || !isMobile) return
    const scrollY = window.scrollY
    document.body.style.cssText = `position:fixed;top:-${scrollY}px;left:0;right:0;overflow-y:scroll;overflow-x:hidden;`
    return () => {
      document.body.style.cssText = ''
      window.scrollTo(0, scrollY)
    }
  }, [selectedSpot, isMobile])

  useEffect(() => {
    const listeners = []
    const domListeners = []

    async function initMap() {
      const [{ Map }, { AdvancedMarkerElement }] = await Promise.all([
        google.maps.importLibrary('maps'),
        google.maps.importLibrary('marker'),
      ])

      const map = new Map(mapRef.current, {
        center: SF_CENTER, zoom: 13, mapId: MAP_ID, disableDefaultUI: true, zoomControl: true,
      })
      mapInstanceRef.current = map

      const isMobileViewport = window.innerWidth <= 620
      const markerSize = isMobileViewport ? 20 : 17
      spots.forEach(spot => {
        const color = spot.matchaFocus === false ? '#405d35' : '#b8922a'
        const el = makeMarkerEl(color, markerSize)
        markerEls.current[spot.id] = el
        const marker = new AdvancedMarkerElement({
          position: { lat: spot.lat, lng: spot.lng },
          map,
          title: spot.name,
          content: el,
        })
        markerInstances.current[spot.id] = marker
        const handleClick = () => {
          setSelectedSpot(spot)
          track('spot_click', { spot_name: spot.name, neighborhood: spot.neighborhood })
        }
        listeners.push(marker.addListener('gmp-click', handleClick))
        if (isMobileViewport) {
          el.addEventListener('click', handleClick)
          domListeners.push({ el, handleClick })
        }
      })

      // Block native Google Maps POI/neighborhood tooltip on label click
      listeners.push(map.addListener('click', e => {
        if (e.placeId) e.stop()
        else setSelectedSpot(null)
      }))
    }

    initMap().catch(() => { setMapError(true); track('map_load_error') })

    return () => {
      listeners.forEach(l => l.remove())
      domListeners.forEach(({ el, handleClick }) => el.removeEventListener('click', handleClick))
    }
  }, [])

  // Mobile: portal to body so position:fixed escapes the map-wrapper's animation transform.
  // Desktop: render inline so position:absolute is relative to map-wrapper.
  const spotCard = selectedSpot && (
    <>
      <div className='spot-card-backdrop' onPointerDown={closeSpot} />
      <SpotCard
        key={selectedSpot.id}
        spot={selectedSpot}
        onClose={closeSpot}
      />
    </>
  )

  return (
    <section className='map-section' ref={sectionRef}>
      <div className='map-header'>
        <h2 className='map-title'>the map</h2>
        <div className='map-legend'>
          <span className='map-legend-item'>
            <span className='map-legend-dot map-legend-dot--gold' aria-hidden='true' />
            spots where matcha is the main event
          </span>
          <span className='map-legend-item'>
            <span className='map-legend-dot map-legend-dot--green' aria-hidden='true' />
            spots where matcha is not the main focus, but still worth trying
          </span>
        </div>
      </div>
      <div className='map-wrapper'>
        <div className='map-container' ref={mapRef}>
          {mapError && <p className='map-error'>map failed to load — try refreshing</p>}
        </div>
        <MapSearch onSelect={selectSpot} />
        {spotCard && (isMobile ? createPortal(spotCard, document.body) : spotCard)}
      </div>
    </section>
  )
}
