# GIGx — TODO & Status

## LIVRAT (in productie, main)
- 12 artisti de bal + Diaspora la tipuri de eveniment
- Fix PDF institutie publica (curs BNR)
- Oscar + MGL pe /prom
- Km automat la incarcare (avionul apare corect)
- Cautarea inversa: fuzzy + multi-artist + oras
- Clasificare inteligenta (concert/indisponibil/echipa/nota/verifica) — validata pe 2500 evenimente, extrasa in lib/clasificare.ts
- Verificare 2 date side-by-side + context logistic (ziua +/-1)
- Modul Perioada: mini-calendar colorat, weekend liber evidentiat, ferestre consecutive, zile ocupate expandabile, zile comune (multi-artist)
- Export din perioada: selectie manuala zile + o linie per artist (un pret, zilele ca optiuni) in deviz + WhatsApp + PDF
- Perioade indisponibile expandabile
- Fereastra dinamica (interogare in trecut pt istoric)
- Paralelizare cautare (3x viteza), culoarea verifica mov

## DE FACUT (in ordine)
1. Sistem client + jurnal — baza clienti, atasare la interogarea de disponibilitate (avertizare pt clienti noi), jurnal cereri
2. Raportare peste jurnal — pe client, artist, oras, fee, perioada (de cate ori a cerut X intermediar, ce artisti, ce orase, ce fee-uri)
3. Raportare concerte pe artist din calendar (nr concerte/an, orase) — in pagina Istoric
4. Verificare live la trimitere (reverifica bifatii inainte de oferta)
5. Client Secret Google — REGENERARE (siguranta, expus in chat)
6. Portal privat clienti (parola rotativa, roster, filtrare pe tip eveniment, fisiere)
7. Status oferta (trimisa/confirmata/refuzata) + 2FA
8. Sistem complet preturi per tip eveniment (formate per tip)
9. Smart booking — alerte artist-client (dupa ce exista baza de clienti)
10. Cleanup: fisierul corupt pusave-images.mjssave-images.mjs

## SCHEMA propusa pt sistem client (piesa 1)
- Tabela clienti: id, nume, telefon, email, tip (intermediar/direct), created_at
- Tabela cereri_disponibilitate (jurnal): id, client_id, artisti[], oras, data_ceruta, fee-uri, created_at
