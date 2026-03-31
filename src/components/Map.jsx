import { useEffect, useRef, useState } from 'react'
import { useScrollVisible } from '../hooks/useScrollVisible'
import spots from '../data/spots.json'

const MAP_ID = '6d2b821952b606c152cfc147'
const PLACES_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

const SF_CENTER = { lat: 37.7749, lng: -122.4194 }
const MARKER_BASE = { fillOpacity: 1, strokeColor: '#faf6f2', strokeWeight: 2, scale: 7 }
const GREEN_ICON = { ...MARKER_BASE, fillColor: '#405d35' }
const GOLD_ICON  = { ...MARKER_BASE, fillColor: '#b8922a' }

function SpotCard({ spot, onClose }) {
  const [photoIndex, setPhotoIndex] = useState(0)

  const localPhotos = spot.photos ?? []
  const placesUrl = spot.photo
    ? `https://places.googleapis.com/v1/${spot.photo}/media?maxWidthPx=400&key=${PLACES_API_KEY}`
    : null
  const photos = placesUrl ? [...localPhotos, placesUrl] : localPhotos
  const hasCarousel = photos.length > 1

  const prev = e => { e.stopPropagation(); setPhotoIndex(i => (i - 1 + photos.length) % photos.length) }
  const next = e => { e.stopPropagation(); setPhotoIndex(i => (i + 1) % photos.length) }

  return (
    <div className='spot-card'>
      <button className='spot-card-close' onClick={onClose}>×</button>
      {photos.length > 0 && (
        <div className='spot-card-photos'>
          <img className='spot-card-photo' src={photos[photoIndex]} alt={spot.name} />
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
      <p className='spot-card-name'>{spot.name}</p>
      <p className='spot-card-rating'>
        {spot.rating}<span className='spot-card-star'>★</span>
        <span className='spot-card-count'>({spot.reviewCount?.toLocaleString()})</span>
      </p>
      {spot.summary && <p className='spot-card-summary'>{spot.summary}</p>}
      {spot.topReview && <p className='spot-card-review'>"{spot.topReview}"</p>}
      {spot.website && (
        <a className='spot-card-link' href={spot.website} target='_blank' rel='noreferrer'>
          Visit website →
        </a>
      )}
    </div>
  )
}

export default function Map() {
  const mapRef = useRef(null)
  const sectionRef = useScrollVisible()
  const [selectedSpot, setSelectedSpot] = useState(null)

  useEffect(() => {
    const listeners = []

    function initMap() {
      const map = new google.maps.Map(mapRef.current, {
        center: SF_CENTER, zoom: 13, mapId: MAP_ID, disableDefaultUI: true, zoomControl: true,
      })

      spots.forEach(spot => {
        const icon = spot.matchaFocus === false ? GREEN_ICON : GOLD_ICON
        const marker = new google.maps.Marker({
          position: { lat: spot.lat, lng: spot.lng },
          map,
          title: spot.name,
          icon: { ...icon, path: google.maps.SymbolPath.CIRCLE },
        })
        listeners.push(marker.addListener('click', () => setSelectedSpot(spot)))
      })

      // Block native Google Maps POI/neighborhood tooltip on label click
      listeners.push(map.addListener('click', e => {
        if (e.placeId) e.stop()
        else setSelectedSpot(null)
      }))
    }

    if (window.google?.maps) {
      initMap()
    } else if (!document.getElementById('gmap-script')) {
      const s = document.createElement('script')
      s.id = 'gmap-script'
      s.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      s.onload = initMap
      document.head.appendChild(s)
    }

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
        {selectedSpot && (
          <SpotCard
            key={selectedSpot.id}
            spot={selectedSpot}
            onClose={() => setSelectedSpot(null)}
          />
        )}
      </div>
    </section>
  )
}
