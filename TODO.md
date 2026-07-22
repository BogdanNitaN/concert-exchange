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
- Neurodesign complet /oferta (card curat, badge EXTERN/FWD distinct, oferta verde dominanta, TOTAL onorarii dominant)
- Neurodesign istoric = tablou de bord (status badge-uri colorate, sume dominante, mov redus)
- Neurodesign roster (badge FWD verde, fee vizibil) + modal artist (buton verde)
- Neurodesign disponibilitate (toggle activ vizibil, butoane cu umbra, tooltips pe moduri)

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
11. [FACUT] Bucuresti + Ilfov: transport/cazare 0 + masa pe diurna la artistii cu rezidenta Bucuresti (camp oras_rezidenta in roster)
12. Mod LANDED pe linie (fee cu transport inclus, ex The Motans Sibiu 12000 landed) — dezactiveaza calcul transport pe km, raman doar diurna/masa/cazare
13. Avertizare avion la landed: cand linia e landed + distanta cere zbor (>300km, ex Iasi) -> atentionare ca biletul de avion nu e estimat, verifica daca fee-ul acopera zborul (informativ, nu blocheaza)
14. Asistent AI conversational (RO) — input text SI voce, limbaj natural fuzzy ("caut artist liber pe data de", "ce ar merge pe", "recomanda", "da-mi liberi", "fa-mi oferta"). Sa inteleaga comenzi vagi, sa raspunda in romana, sa lege interogari -> disponibilitate -> oferta. Comanda vocala + conversatie.
15. /prom BUG: cardurile de selectie artisti (cu poze) se blocheaza sus unde scrii manual nume, nu merg jos in zona de selectie. De reparat scroll/pozitionare.

## URMATORUL (prioritar) — Distanta/transport PER ARTIST din resedinta lui
Acum: fromCity e GLOBAL (default Bucuresti), km e UN singur state pt toata oferta. Gresit cand artistii sunt din orase diferite (ex eu, Bogdan, resedinta Iasi, dar imi calcula Buc-Buc).
DE FACUT (varianta A, agreata): fiecare artist pleaca din oras_rezidenta al lui. Distanta calculata per linie (l.km din resedinta artistului -> toCity), NU global.
- Refactor: km global -> l.km per linie in calcLinie (atinge transport, marja, zbor >300km)
- La adaugare artist in oferta SAU la schimbarea toCity: recalculez l.km pt fiecare linie din resedinta lui
- Artist fara resedinta = Bucuresti default (deja rezolvat)
- fromCity global devine inutil (sau ramane fallback)
- Regula local (Buc/Ilfov) devine automata: artist Buc + eveniment Buc/Ilfov = distanta 0 = transport 0 (nu mai e exceptie separata)
- ATENTIE: e refactor mare, atinge inima calculului. Testat temeinic sa nu strice calculele existente.
- Deja FACUT: camp oras_rezidenta in roster + modal adauga artist + API-uri (salveaza corect). Ramane doar calculul distantei per artist.

## NOTA sursa date clienti
- Baza de clienti se poate popula din fisele de eveniment existente (au deja: detalii eveniment, contacte, intermediari, clienti). Nu construim de la zero — importam din fise.

## SCHEMA propusa pt sistem client (piesa 1)
- Tabela clienti: id, nume, telefon, email, tip (intermediar/direct), created_at
- Tabela cereri_disponibilitate (jurnal): id, client_id, artisti[], oras, data_ceruta, fee-uri, created_at
