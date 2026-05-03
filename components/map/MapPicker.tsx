'use client'

import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

interface MapPickerProps {
  center: [number, number]
  pin: [number, number] | null
  onMapClick: (lat: number, lng: number) => void
}

export default function MapPicker({ center, pin, onMapClick }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const pinMarkerRef = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current) return
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    import('leaflet').then(L => {
      if (!mapRef.current) return

      const map = L.default.map(mapRef.current, {
        center: center,
        zoom: 7,
        minZoom: 6,
        maxZoom: 18,
        maxBounds: [[43.0, 19.0],[48.8, 31.5]],
        maxBoundsViscosity: 0.8
      })
      mapInstanceRef.current = map

      L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map)

      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng
        onMapClick(lat, lng)

        if (pinMarkerRef.current) {
          pinMarkerRef.current.remove()
          pinMarkerRef.current = null
        }

        const icon = L.default.divIcon({
          html: `<div style="
            background:#ef4444;
            width:20px;
            height:20px;
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            border:3px solid white;
            box-shadow:0 2px 8px rgba(0,0,0,0.3);
          "></div>`,
          className: '',
          iconAnchor: [10, 20]
        })

        pinMarkerRef.current = L.default.marker([lat, lng], { icon }).addTo(map)
      })

      if (pin) {
        const icon = L.default.divIcon({
          html: `<div style="
            background:#ef4444;
            width:20px;
            height:20px;
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            border:3px solid white;
            box-shadow:0 2px 8px rgba(0,0,0,0.3);
          "></div>`,
          className: '',
          iconAnchor: [10, 20]
        })
        pinMarkerRef.current = L.default.marker(pin, { icon }).addTo(map)
        map.setView(pin, 15)
      }
    })

    return () => {
      if (pinMarkerRef.current) {
        pinMarkerRef.current.remove()
        pinMarkerRef.current = null
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      <div style={{
        position: 'absolute',
        top: 8,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.6)',
        color: 'white',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: 500,
        zIndex: 1000,
        pointerEvents: 'none',
        whiteSpace: 'nowrap'
      }}>
        Click pe hartă pentru a plasa pinul
      </div>
    </div>
  )
}