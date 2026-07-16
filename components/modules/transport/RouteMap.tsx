'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

interface Props {
  fromCity: string
  toCity: string
}

async function geocode(city: string): Promise<[number, number] | null> {
  try {
    const q = encodeURIComponent(city.trim())
    const url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + q
      + '.json?types=place,locality,region&limit=1&language=ro&proximity=26.1025,44.4268&access_token=' + MAPBOX_TOKEN
    const res = await fetch(url)
    const data = await res.json()
    const c = data?.features?.[0]?.center
    return c ? [c[0], c[1]] : null
  } catch { return null }
}

export default function RouteMap({ fromCity, toCity }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!MAPBOX_TOKEN || !mapContainer.current) { setLoading(false); return }
    let map: mapboxgl.Map | null = null
    let cancelled = false

    ;(async () => {
      const [from, to] = await Promise.all([geocode(fromCity || 'Bucuresti'), geocode(toCity)])
      if (cancelled || !from || !to || !mapContainer.current) { setLoading(false); return }

      mapboxgl.accessToken = MAPBOX_TOKEN
      map = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2],
        zoom: 5.5,
        attributionControl: false,
      })
      mapRef.current = map
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')

      map.on('load', async () => {
        if (!map) return
        const mk = (color: string) => {
          const el = document.createElement('div')
          el.style.width = '16px'; el.style.height = '16px'
          el.style.borderRadius = '50%'; el.style.background = color
          el.style.boxShadow = '0 0 12px ' + color
          el.style.border = '2px solid #ffffff'
          return el
        }
        new mapboxgl.Marker({ element: mk('#00ff88') }).setLngLat(from)
          .setPopup(new mapboxgl.Popup({ offset: 14 }).setText(fromCity || 'Bucuresti')).addTo(map)
        new mapboxgl.Marker({ element: mk('#00ff88') }).setLngLat(to)
          .setPopup(new mapboxgl.Popup({ offset: 14 }).setText(toCity)).addTo(map)

        try {
          const url = 'https://api.mapbox.com/directions/v5/mapbox/driving/'
            + from[0] + ',' + from[1] + ';' + to[0] + ',' + to[1]
            + '?geometries=geojson&overview=full&access_token=' + MAPBOX_TOKEN
          const res = await fetch(url)
          const data = await res.json()
          const route = data?.routes?.[0]?.geometry
          if (route && map) {
            map.addSource('route', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: route } })
            map.addLayer({ id: 'route-glow', type: 'line', source: 'route',
              layout: { 'line-join': 'round', 'line-cap': 'round' },
              paint: { 'line-color': '#00ff88', 'line-width': 10, 'line-opacity': 0.25, 'line-blur': 6 } })
            map.addLayer({ id: 'route-line', type: 'line', source: 'route',
              layout: { 'line-join': 'round', 'line-cap': 'round' },
              paint: { 'line-color': '#00ff88', 'line-width': 3.5, 'line-opacity': 0.95 } })
            const coords = route.coordinates as [number, number][]
            const bounds = coords.reduce((b, c) => b.extend(c as [number, number]), new mapboxgl.LngLatBounds(coords[0], coords[0]))
            map.fitBounds(bounds, { padding: 50, duration: 800 })
          }
        } catch {}
        setLoading(false)
      })
    })()

    return () => { cancelled = true; if (map) map.remove() }
  }, [fromCity, toCity])

  if (!MAPBOX_TOKEN) return null

  return (
    <div style={{marginTop:'20px', borderRadius:'16px', overflow:'hidden', border:'1px solid #e7e5e4', position:'relative', background:'#1c1917'}}>
      <div ref={mapContainer} style={{width:'100%', height:'360px'}} />
      {loading && (
        <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', color:'#78716c', fontSize:'13px', pointerEvents:'none'}}>
          Se incarca harta...
        </div>
      )}
    </div>
  )
}
