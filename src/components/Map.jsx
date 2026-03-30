import { useEffect, useRef, useState } from 'react'
import { useScrollVisible } from '../hooks/useScrollVisible'
import spots from '../data/spots.json'

const MAP_ID = '6d2b821952b606c152cfc147'
const PLACES_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

const SF_CENTER = { lat: 37.7749, lng: -122.4194 }
const MARKER_BASE = { fillOpacity: 1, strokeColor: '#faf6f2', strokeWeight: 2, scale: 7 }
const GREEN_ICON = { ...MARKER_BASE, fillColor: '#405d35' }
const GOLD_ICON  = { ...MARKER_BASE, fillColor: '#b8922a' }

const filtered = spots

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

      filtered.forEach(spot => {
        const icon = spot.matchaFocus === false ? GREEN_ICON : GOLD_ICON
        const marker = new google.maps.Marker({
          position: { lat: spot.lat, lng: spot.lng },
          map,
          title: spot.name,
          icon: { ...icon, path: google.maps.SymbolPath.CIRCLE },
        })
        listeners.push(marker.addListener('click', () => setSelectedSpot(spot)))
      })

      listeners.push(map.addListener('click', () => setSelectedSpot(null)))
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
            matcha worth trying, even if it's not the focus
          </span>
        </div>
      </div>
      <div className='map-wrapper'>
        <div className='map-container' ref={mapRef} />
        {selectedSpot && (
          <div className='spot-card'>
            <button className='spot-card-close' onClick={() => setSelectedSpot(null)}>×</button>
            {selectedSpot.photo && (
              <img
                className='spot-card-photo'
                src={`https://places.googleapis.com/v1/${selectedSpot.photo}/media?maxWidthPx=400&key=${PLACES_API_KEY}`}
                alt={selectedSpot.name}
              />
            )}
            <p className='spot-card-name'>{selectedSpot.name}</p>
            <p className='spot-card-rating'>
              {selectedSpot.rating}<span className='spot-card-star'>★</span>
              <span className='spot-card-count'>({selectedSpot.reviewCount?.toLocaleString()})</span>
            </p>
            {selectedSpot.summary && <p className='spot-card-summary'>{selectedSpot.summary}</p>}
            {selectedSpot.topReview && <p className='spot-card-review'>"{selectedSpot.topReview}"</p>}
            {selectedSpot.website && (
              <a className='spot-card-link' href={selectedSpot.website} target='_blank' rel='noreferrer'>
                Visit website →
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
