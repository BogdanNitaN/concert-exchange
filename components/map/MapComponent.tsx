'use client'

import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

interface Artist {
  id: number
  name: string
  lat: number
  lng: number
  tier: string
  fee: string
  genres: string[]
  events: string[]
  nearby: boolean
  available: boolean
  dist: number
}

interface Venue {
  id: number
  name: string
  lat: number
  lng: number
  type: string
  city: string
  capacity: number
}

interface MapProps {
  artists: Artist[]
  venues?: Venue[]
  center: [number, number]
  radius: number
  onSelectArtist: (artist: Artist) => void
}

const ROMANIA_OUTLINE = [
  [48.265,22.085],[48.178,22.681],[47.976,22.949],[47.962,23.343],
  [48.020,23.627],[47.987,24.022],[47.718,24.295],[47.778,24.884],
  [47.692,25.166],[47.979,25.532],[48.112,25.928],[47.994,26.326],
  [48.008,26.650],[47.688,26.990],[47.531,27.194],[47.470,27.547],
  [47.169,27.580],[46.872,27.748],[46.496,28.023],[46.253,28.228],
  [45.944,28.229],[45.670,28.505],[45.574,28.726],[45.318,28.580],
  [45.179,28.900],[44.820,29.073],[44.672,28.979],[44.405,28.758],
  [44.225,28.557],[43.788,28.609],[43.743,28.156],[43.871,27.745],
  [44.106,27.305],[44.175,26.625],[44.015,26.183],[43.944,25.628],
  [43.729,25.372],[43.664,24.967],[43.786,24.501],[43.692,24.167],
  [43.792,23.777],[44.003,23.461],[44.109,22.873],[44.478,22.659],
  [44.535,22.432],[44.772,22.231],[45.019,22.144],[45.161,21.735],
  [45.500,21.427],[45.734,20.961],[45.749,20.574],[45.490,20.362],
  [45.436,20.061],[45.170,19.892],[44.975,20.031],[44.809,20.459],
  [44.597,20.662],[44.420,20.751],[44.293,21.433],[44.073,21.584],
  [44.008,21.939],[44.165,22.309],[44.256,22.490],[44.478,22.659],
  [44.535,22.432],[44.772,22.231],[45.019,22.144],[45.500,21.427],
  [45.749,20.574],[45.850,20.261],[46.174,20.260],[46.186,19.900],
  [46.504,19.827],[46.877,20.102],[47.271,20.035],[47.449,20.551],
  [47.744,20.754],[47.851,21.175],[48.059,21.426],[48.265,22.085]
]

const MOLDOVA_OUTLINE = [
  [48.472,26.614],[48.380,26.920],[48.108,27.312],[47.994,27.594],
  [47.688,27.771],[47.531,27.900],[47.338,28.167],[46.985,28.865],
  [46.519,29.139],[46.221,29.447],[45.944,29.562],[45.790,29.214],
  [45.574,28.726],[45.670,28.505],[45.944,28.229],[46.253,28.228],
  [46.496,28.023],[46.872,27.748],[47.169,27.580],[47.470,27.547],
  [47.531,27.194],[47.688,26.990],[48.008,26.650],[48.112,26.325],
  [48.472,26.614]
]

export default function MapComponent({ artists, venues = [], center, radius, onSelectArtist }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!mapRef.current || initializedRef.current) return
    initializedRef.current = true

    import('leaflet').then(L => {
      if (!mapRef.current || mapInstanceRef.current) return
      const mapContainer = mapRef.current as any
      if (mapContainer._leaflet_id) return

      const map = L.default.map(mapRef.current, {
        center: [45.7489, 24.9668],
        zoom: 7,
        minZoom: 6,
        maxZoom: 16,
        maxBounds: [[43.0, 19.0],[48.8, 31.5]],
        maxBoundsViscosity: 0.8
      })
      mapInstanceRef.current = map

      L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map)

      L.default.polyline(ROMANIA_OUTLINE as [number,number][], {
        color: '#1c1917',
        weight: 3,
        opacity: 0.85,
        smoothFactor: 1
      }).addTo(map)

      L.default.polyline(MOLDOVA_OUTLINE as [number,number][], {
        color: '#44403c',
        weight: 2,
        opacity: 0.7,
        dashArray: '6,4',
        smoothFactor: 1
      }).addTo(map)
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        initializedRef.current = false
      }
    }
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current) {
      const timer = setTimeout(() => {
        if (mapInstanceRef.current) renderMarkers()
      }, 600)
      return () => clearTimeout(timer)
    }
    renderMarkers()
  }, [artists, venues, radius, center])

  const renderMarkers = () => {
    if (!mapInstanceRef.current) return
    import('leaflet').then(L => {
      if (!mapInstanceRef.current) return

      markersRef.current.forEach(m => { try { m.remove() } catch {} })
      markersRef.current = []

      const circle = L.default.circle(center, {
        radius: radius * 1000,
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.05,
        weight: 1.5,
        dashArray: '6,4'
      }).addTo(mapInstanceRef.current)
      markersRef.current.push(circle)

      const centerPin = L.default.circleMarker(center, {
        radius: 8,
        color: '#1d4ed8',
        fillColor: '#3b82f6',
        fillOpacity: 1,
        weight: 2
      }).addTo(mapInstanceRef.current)
      centerPin.bindTooltip('📍 Locația evenimentului')
      markersRef.current.push(centerPin)

      artists.forEach(artist => {
        const color = artist.nearby ? '#22c55e' :
          artist.tier === 'Premium' ? '#f59e0b' :
          artist.tier === 'A+' ? '#3b82f6' : '#6b7280'

        const icon = L.default.divIcon({
          html: `<div style="background:${color};color:white;border:2px solid white;border-radius:8px;padding:4px 10px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.25);font-family:Montserrat,sans-serif;cursor:pointer;">${artist.name.split(' ')[0]}${artist.nearby ? ' 📍' : ''}</div>`,
          className: '',
          iconAnchor: [0, 0]
        })

        const marker = L.default.marker([artist.lat, artist.lng], { icon })
          .addTo(mapInstanceRef.current)
          .on('click', () => onSelectArtist(artist))

        marker.bindTooltip(`<div style="font-family:Montserrat,sans-serif;font-size:12px;padding:2px 4px"><strong>${artist.name}</strong><br/>${artist.tier} • ${artist.fee}<br/>${artist.dist}km${artist.nearby ? '<br/><span style="color:#16a34a;font-weight:600">📍 Deja în zonă</span>' : ''}</div>`)
        markersRef.current.push(marker)
      })

      venues.forEach(venue => {
        const icon = L.default.divIcon({
          html: `<div style="background:#7c3aed;color:white;border:2px solid white;border-radius:8px;padding:4px 10px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.25);font-family:Montserrat,sans-serif;">🏛️ ${venue.name.split(' ')[0]}</div>`,
          className: '',
          iconAnchor: [0, 0]
        })

        const marker = L.default.marker([venue.lat, venue.lng], { icon }).addTo(mapInstanceRef.current)
        marker.bindTooltip(`<div style="font-family:Montserrat,sans-serif;font-size:12px;padding:2px 4px"><strong>${venue.name}</strong><br/>${venue.type} • ${venue.city}<br/>Capacitate: ${venue.capacity} pers.</div>`)
        markersRef.current.push(marker)
      })

      if (center[0] !== 45.7489) {
        mapInstanceRef.current.setView(center, 10)
      }
    })
  }

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
}