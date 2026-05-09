'use client'

import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

interface Venue {
  id: number
  name: string
  lat: number
  lng: number
  type: string
  city: string
  capacity: number
}

interface MapVenuesProps {
  venues: Venue[]
  center: [number, number]
  radius: number
  onSelectVenue: (venue: Venue) => void
}

export default function MapVenues({ venues, center, radius, onSelectVenue }: MapVenuesProps) {
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
  }, [venues, radius, center])

  const renderMarkers = () => {
    if (!mapInstanceRef.current) return
    import('leaflet').then(L => {
      if (!mapInstanceRef.current) return

      markersRef.current.forEach(m => { try { m.remove() } catch {} })
      markersRef.current = []

      L.default.circle(center, {
        radius: radius * 1000,
        color: '#7c3aed',
        fillColor: '#7c3aed',
        fillOpacity: 0.04,
        weight: 2,
        dashArray: '6,4'
      }).addTo(mapInstanceRef.current)

      L.default.circleMarker(center, {
        radius: 8,
        color: '#6d28d9',
        fillColor: '#7c3aed',
        fillOpacity: 1,
        weight: 2
      }).addTo(mapInstanceRef.current).bindTooltip('📍 Locatia ta')

      venues.forEach(venue => {
        const icon = L.default.divIcon({
          html: '<div style="background:#7c3aed;color:white;border:2px solid white;border-radius:8px;padding:4px 10px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.25);font-family:Montserrat,sans-serif;cursor:pointer;">🏛️ ' + venue.name.split(' ')[0] + '</div>',
          className: '',
          iconAnchor: [0, 0]
        })

        const marker = L.default.marker([venue.lat, venue.lng], { icon })
          .addTo(mapInstanceRef.current)
          .on('click', () => onSelectVenue(venue))

        marker.bindTooltip('<div style="font-family:Montserrat,sans-serif;font-size:12px;padding:2px 4px"><strong>' + venue.name + '</strong><br/>' + venue.type + ' • ' + venue.city + '<br/>' + venue.capacity.toLocaleString() + ' persoane</div>')
        markersRef.current.push(marker)
      })

      if (center[0] !== 45.7489) {
        mapInstanceRef.current.setView(center, 10)
      }
    })
  }

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
}