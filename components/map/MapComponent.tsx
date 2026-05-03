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

interface MapProps {
  artists: Artist[]
  center: [number, number]
  radius: number
  onSelectArtist: (artist: Artist) => void
}

export default function MapComponent({ artists, center, radius, onSelectArtist }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    import('leaflet').then(L => {
      const map = L.default.map(mapRef.current!, {
        center: [45.9432, 24.9668],
        zoom: 7,
        minZoom: 6,
        maxZoom: 13,
        maxBounds: [[43.5, 20.0],[48.5, 30.5]],
        maxBoundsViscosity: 1.0
      })
      mapInstanceRef.current = map

      L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map)

      updateMarkers(L.default, map)
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  const updateMarkers = (L: any, map: any) => {
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    const circle = L.circle(center, {
      radius: radius * 1000,
      color: '#3b82f6',
      fillColor: '#3b82f6',
      fillOpacity: 0.05,
      weight: 1.5,
      dashArray: '6,4'
    }).addTo(map)
    markersRef.current.push(circle)

    const centerPin = L.circleMarker(center, {
      radius: 8,
      color: '#1d4ed8',
      fillColor: '#3b82f6',
      fillOpacity: 1,
      weight: 2
    }).addTo(map)
    markersRef.current.push(centerPin)

    artists.forEach(artist => {
      const color = artist.nearby ? '#22c55e' :
        artist.tier === 'Premium' ? '#f59e0b' :
        artist.tier === 'A+' ? '#3b82f6' : '#6b7280'

      const icon = L.divIcon({
        html: `<div style="background:${color};color:white;border:2px solid white;border-radius:8px;padding:4px 10px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.25);font-family:sans-serif;cursor:pointer;">${artist.name.split(' ')[0]}${artist.nearby ? ' 📍' : ''}</div>`,
        className: '',
        iconAnchor: [0, 0]
      })

      const marker = L.marker([artist.lat, artist.lng], { icon })
        .addTo(map)
        .on('click', () => onSelectArtist(artist))

      marker.bindTooltip(`<div style="font-family:sans-serif;font-size:12px;padding:2px 4px"><strong>${artist.name}</strong><br/>${artist.tier} • ${artist.fee}<br/>${artist.dist}km distanță${artist.nearby ? '<br/><span style="color:#16a34a;font-weight:600">📍 Deja în zonă</span>' : ''}</div>`)
      markersRef.current.push(marker)
    })
  }

  useEffect(() => {
    if (!mapInstanceRef.current) return
    import('leaflet').then(L => {
      updateMarkers(L.default, mapInstanceRef.current)
    })
  }, [artists, radius])

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
}