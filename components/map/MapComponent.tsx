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