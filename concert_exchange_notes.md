# CONCERT EXCHANGE — Note sesiune Mai 2026

## Stack tehnic
- Next.js 16, TypeScript, Tailwind CSS v4, Montserrat
- Supabase (blocat local de Bitdefender — merge pe Vercel)
- Leaflet + OpenStreetMap + Nominatim
- Google Places API key: AIzaSyDQi44GZL__RSvqVEjBYX4pzdvPXvNzsHc
- Deploy: concert-exchange.vercel.app
- GitHub: github.com/BogdanNitaN/concert-exchange

## Pagini construite
- / Homepage
- /search — harta artisti cu filtre Nominatim RO+MD
- /dashboard/artist — profil, calendar scarcity
- /dashboard/promoter
- /dashboard/artist/venues — search invers cu bara filling
- /dashboard/client — wizard 5 pasi
- /pricing — Free/Pro/Agentie
- /venues/add
- /demo — flux vibe matching 3 pasi
- /calculator — calculator transport

## Model business
- 5% comision client — inclus in total, invizibil
- 10% comision artist — pentru booking adus de platforma
- 10% comision Forward Agency — pentru artistii reprezentati
- Boost OLX: Regional 20€ / National 50€ / Moldova 30€
- Free limitat (2 cautari/luna, fee blur) Pro 10€/luna Agentie 49€/luna
- Masiro Travel partener zbor+cazare, comision referral
- Hoteluri partenere pe viitor

## Tiers artisti
- Premium: 10.000€+
- A+: 5.000-9.999€
- A: sub 5.000€

## Transport in deviz
- Sub 300km: rutier
- Peste 300km: rutier echipa + zbor artist+1 (Masiro Travel)
- Decont: Distanta x2 x10L/100km x pret_carburant_live / curs_BNR_live x1.05
- km reali + 10% marja rotunjita — clientul vede cu marja, tu stii realul

## Cazare
- Artistul seteaza in profil: nr camere duble, single, suita
- In deviz: tip camere fara pret + link Masiro Travel
- Pe viitor: hoteluri partenere cu badge + comision

## Buton pret exact
- Text: Pretul exact, confirmat in 30 min. Fara surprize.
- Galben/amber, deasupra totalului in deviz
- Modal: telefon + email → WhatsApp + email catre tine

## Calendar artist scarcity
- Confirmat — blocat 100%
- Propunere avansata — aproape blocat
- Disponibil — fara indicator
- Agentul vede tot + raport descarcabil

## Features de implementat
1. Modal complet pret exact
2. Toggle transport rutier/zbor/decont in deviz
3. Cazare tip camere + Masiro Travel
4. Scraper pret carburant live (Petrom, Rompetrol, MOL, Lukoil)
5. Curs EUR live BNR (cursbnr.ro)
6. Freemium limitari (2 cautari/luna, fee blur)
7. Social links + Spotify/YouTube profil artist
8. Rider tehnic + EPK + AI boilerplate 3 variante
9. Import hoteluri CSV per judet
10. Feedback post-concert auto 24h
11. Feedback aplicatie buton footer
12. Dashboard agentie Forward
13. Stripe subscriptii
14. Notificari trial 15 zile
15. Google Calendar sync
16. Import .ics Forward
17. Evaluari private
18. Boost vizibilitate OLX
19. AI Agent matching 5% comision
20. Machine learning venue auto-save

## Whitelist Bitdefender IT
- supabase.co, supabase.com, supabase.io
- openstreetmap.org, nominatim.openstreetmap.org
- vercel.app, vercel.com
- github.com
- registry.npmjs.org
- googleapis.com, gstatic.com

## Supabase tabel nou
- venues_cache: place_id, name, address, lat, lng, rating, phone, website, types, search_count
