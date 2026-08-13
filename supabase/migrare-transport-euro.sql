-- Migrare transport lei -> euro, artisti FWD
-- Generat din TRANSPORT_EURO_FWD_OFERTA_ARTISTI_08-2026.docx
-- Ruleaza intr-o singura tranzactie. Verificarile sunt inainte si dupa.

-- ================= VERIFICARE INAINTE =================
SELECT nume, lei_km, transport_moneda, formate FROM oferta_artisti
WHERE nume IN ('Adi Istrate', 'Albert NBN', 'Albwho', 'Alina Eremia', 'Ami', 'Andre Rizo', 'Andrei Ursu', 'Andrew Dum', 'Antonia', 'Babasha', 'Bob Ramanka', 'Bruja', 'Carla''s Dreams', 'Chris Hype', 'Dara', 'Emaa', 'Erika Isac', 'Eva Timush', 'Feli', 'Florian Rus', 'Grasu XXL', 'Guess Who', 'HVNDS', 'Holy Molly', 'IDK', 'Irina Rimes', 'Lazy Ed', 'Manuel Riva', 'Mario', 'Minelli', 'Mira', 'MoonSound', 'Noua Unspe', 'Nuanțe', 'Omul cu Șobolani', 'Parazitii', 'Petre Stefan', 'Puya', 'Randi', 'Rares', 'Robin and the Backstabbers', 'Satra Benz', 'Speak', 'Stefania', 'Tania Turtureanu', 'The Kryptonite Sparks', 'The Motans', 'Tobi Ibitoye', 'Tussin', 'Vescan', 'Vlad Corb', 'White Mahala', 'Zodier') ORDER BY nume;

BEGIN;

-- 1. tariful principal, in euro
UPDATE oferta_artisti SET lei_km = 1.0, transport_moneda = 'euro' WHERE nume = 'Adi Istrate';  -- era 5 lei/km
UPDATE oferta_artisti SET lei_km = 0.6, transport_moneda = 'euro' WHERE nume = 'Albert NBN';  -- era 3 lei/km
UPDATE oferta_artisti SET lei_km = 0.4, transport_moneda = 'euro' WHERE nume = 'Albwho';  -- era 2 lei/km
UPDATE oferta_artisti SET lei_km = 1.3, transport_moneda = 'euro' WHERE nume = 'Alina Eremia';  -- era 6 lei/km
UPDATE oferta_artisti SET lei_km = 1.0, transport_moneda = 'euro' WHERE nume = 'Ami';  -- era 5 lei/km
UPDATE oferta_artisti SET lei_km = 0.4, transport_moneda = 'euro' WHERE nume = 'Andre Rizo';  -- era 1.5 lei/km
UPDATE oferta_artisti SET lei_km = 1.0, transport_moneda = 'euro' WHERE nume = 'Andrei Ursu';  -- era 5 lei/km
UPDATE oferta_artisti SET lei_km = 0.4, transport_moneda = 'euro' WHERE nume = 'Andrew Dum';  -- era 1.5 lei/km
UPDATE oferta_artisti SET lei_km = 1.4, transport_moneda = 'euro' WHERE nume = 'Antonia';  -- era 7 lei/km
UPDATE oferta_artisti SET lei_km = 1.4, transport_moneda = 'euro' WHERE nume = 'Babasha';  -- era 7 lei/km
UPDATE oferta_artisti SET lei_km = 0.5, transport_moneda = 'euro' WHERE nume = 'Bob Ramanka';  -- era 2.5 lei/km
UPDATE oferta_artisti SET lei_km = 0.6, transport_moneda = 'euro' WHERE nume = 'Bruja';  -- era 3 lei/km
UPDATE oferta_artisti SET lei_km = 1.3, transport_moneda = 'euro' WHERE nume = 'Carla''s Dreams';  -- era 6.5 lei/km
UPDATE oferta_artisti SET lei_km = 0.4, transport_moneda = 'euro' WHERE nume = 'Chris Hype';  -- era 2 lei/km
UPDATE oferta_artisti SET lei_km = 1.0, transport_moneda = 'euro' WHERE nume = 'Dara';  -- era 4 lei/km
UPDATE oferta_artisti SET lei_km = 1.3, transport_moneda = 'euro' WHERE nume = 'Emaa';  -- era 6 lei/km
UPDATE oferta_artisti SET lei_km = 1.0, transport_moneda = 'euro' WHERE nume = 'Erika Isac';  -- era 5 lei/km
UPDATE oferta_artisti SET lei_km = 0.7, transport_moneda = 'euro' WHERE nume = 'Eva Timush';  -- era 3 lei/km
UPDATE oferta_artisti SET lei_km = 1.3, transport_moneda = 'euro' WHERE nume = 'Feli';  -- era 6 lei/km
UPDATE oferta_artisti SET lei_km = 1.0, transport_moneda = 'euro' WHERE nume = 'Florian Rus';  -- era 5 lei/km
UPDATE oferta_artisti SET lei_km = 1.0, transport_moneda = 'euro' WHERE nume = 'Grasu XXL';  -- era 5 lei/km
UPDATE oferta_artisti SET lei_km = 0.5, transport_moneda = 'euro' WHERE nume = 'Guess Who';  -- era 2.5 lei/km
UPDATE oferta_artisti SET lei_km = 1.0, transport_moneda = 'euro' WHERE nume = 'HVNDS';  -- era 4 lei/km
UPDATE oferta_artisti SET lei_km = 1.2, transport_moneda = 'euro' WHERE nume = 'Holy Molly';  -- era 6 lei/km
UPDATE oferta_artisti SET lei_km = 0.6, transport_moneda = 'euro' WHERE nume = 'IDK';  -- era 3 lei/km
UPDATE oferta_artisti SET lei_km = 2.0, transport_moneda = 'euro' WHERE nume = 'Irina Rimes';  -- era 10 lei/km
UPDATE oferta_artisti SET lei_km = 0.5, transport_moneda = 'euro' WHERE nume = 'Lazy Ed';  -- era 2.5 lei/km
UPDATE oferta_artisti SET lei_km = 0.4, transport_moneda = 'euro' WHERE nume = 'Manuel Riva';  -- era 1.5 lei/km
UPDATE oferta_artisti SET lei_km = 1.1, transport_moneda = 'euro' WHERE nume = 'Mario';  -- era 5.5 lei/km
UPDATE oferta_artisti SET lei_km = 1.0, transport_moneda = 'euro' WHERE nume = 'Minelli';  -- era 5 lei/km
UPDATE oferta_artisti SET lei_km = 1.2, transport_moneda = 'euro' WHERE nume = 'Mira';  -- era 6 lei/km
UPDATE oferta_artisti SET lei_km = 0.4, transport_moneda = 'euro' WHERE nume = 'MoonSound';  -- era 0 lei/km
UPDATE oferta_artisti SET lei_km = 0.8, transport_moneda = 'euro' WHERE nume = 'Noua Unspe';  -- era 4 lei/km
UPDATE oferta_artisti SET lei_km = 0.6, transport_moneda = 'euro' WHERE nume = 'Nuanțe';  -- era 3 lei/km
UPDATE oferta_artisti SET lei_km = 0.7, transport_moneda = 'euro' WHERE nume = 'Omul cu Șobolani';  -- era 3.3 lei/km
UPDATE oferta_artisti SET lei_km = 0.5, transport_moneda = 'euro' WHERE nume = 'Parazitii';  -- era 2 lei/km
UPDATE oferta_artisti SET lei_km = 0.6, transport_moneda = 'euro' WHERE nume = 'Petre Stefan';  -- era 3 lei/km
UPDATE oferta_artisti SET lei_km = 0.6, transport_moneda = 'euro' WHERE nume = 'Puya';  -- era 3 lei/km
UPDATE oferta_artisti SET lei_km = 1.3, transport_moneda = 'euro' WHERE nume = 'Randi';  -- era 6 lei/km
UPDATE oferta_artisti SET lei_km = 1.3, transport_moneda = 'euro' WHERE nume = 'Rares';  -- era 6 lei/km
UPDATE oferta_artisti SET lei_km = 0.7, transport_moneda = 'euro' WHERE nume = 'Robin and the Backstabbers';  -- era 3.3 lei/km
UPDATE oferta_artisti SET lei_km = 1.0, transport_moneda = 'euro' WHERE nume = 'Satra Benz';  -- era 4 lei/km
UPDATE oferta_artisti SET lei_km = 1.2, transport_moneda = 'euro' WHERE nume = 'Speak';  -- era 6 lei/km
UPDATE oferta_artisti SET lei_km = 1.2, transport_moneda = 'euro' WHERE nume = 'Stefania';  -- era 6 lei/km
UPDATE oferta_artisti SET lei_km = 1.5, transport_moneda = 'euro' WHERE nume = 'Tania Turtureanu';  -- era 7.5 lei/km
UPDATE oferta_artisti SET lei_km = 0.7, transport_moneda = 'euro' WHERE nume = 'The Kryptonite Sparks';  -- era 3.3 lei/km
UPDATE oferta_artisti SET lei_km = 1.7, transport_moneda = 'euro' WHERE nume = 'The Motans';  -- era 8 lei/km
UPDATE oferta_artisti SET lei_km = 0.8, transport_moneda = 'euro' WHERE nume = 'Tobi Ibitoye';  -- era 3.9 lei/km
UPDATE oferta_artisti SET lei_km = 0.6, transport_moneda = 'euro' WHERE nume = 'Tussin';  -- era 3 lei/km
UPDATE oferta_artisti SET lei_km = 0.7, transport_moneda = 'euro' WHERE nume = 'Vescan';  -- era 3 lei/km
UPDATE oferta_artisti SET lei_km = 0.7, transport_moneda = 'euro' WHERE nume = 'Vlad Corb';  -- era 3 lei/km
UPDATE oferta_artisti SET lei_km = 0.7, transport_moneda = 'euro' WHERE nume = 'White Mahala';  -- era 3.3 lei/km
UPDATE oferta_artisti SET lei_km = 1.0, transport_moneda = 'euro' WHERE nume = 'Zodier';  -- era 5 lei/km

-- 2. tariful din interiorul formatelor (altfel formatul selectat foloseste valoarea in lei ca si cum ar fi euro)
UPDATE oferta_artisti SET formate = jsonb_set(formate::jsonb, '{0,leiKm}', '1.4'::jsonb) WHERE nume = 'Babasha';  -- Band
UPDATE oferta_artisti SET formate = jsonb_set(formate::jsonb, '{1,leiKm}', '1.0'::jsonb) WHERE nume = 'Babasha';  -- DJ Set
UPDATE oferta_artisti SET formate = jsonb_set(formate::jsonb, '{0,leiKm}', '1.0'::jsonb) WHERE nume = 'Erika Isac';  -- Cu dansatoare
UPDATE oferta_artisti SET formate = jsonb_set(formate::jsonb, '{1,leiKm}', '1.0'::jsonb) WHERE nume = 'Erika Isac';  -- DJ Set
UPDATE oferta_artisti SET formate = jsonb_set(formate::jsonb, '{0,leiKm}', '1.0'::jsonb) WHERE nume = 'Killa Fonic';  -- Live Band
UPDATE oferta_artisti SET formate = jsonb_set(formate::jsonb, '{1,leiKm}', '1.0'::jsonb) WHERE nume = 'Killa Fonic';  -- DJ Set
UPDATE oferta_artisti SET formate = jsonb_set(formate::jsonb, '{0,leiKm}', '0.8'::jsonb) WHERE nume = 'Tobi Ibitoye';  -- Solo
UPDATE oferta_artisti SET formate = jsonb_set(formate::jsonb, '{1,leiKm}', '0.8'::jsonb) WHERE nume = 'Tobi Ibitoye';  -- Live Band

COMMIT;

-- ================= VERIFICARE DUPA =================
-- toate trebuie sa aiba transport_moneda='euro' si lei_km <= 2
SELECT nume, lei_km, transport_moneda,
       jsonb_path_query_array(formate::jsonb, '$[*].leiKm') AS km_formate
FROM oferta_artisti WHERE nume IN ('Adi Istrate', 'Albert NBN', 'Albwho', 'Alina Eremia', 'Ami', 'Andre Rizo', 'Andrei Ursu', 'Andrew Dum', 'Antonia', 'Babasha', 'Bob Ramanka', 'Bruja', 'Carla''s Dreams', 'Chris Hype', 'Dara', 'Emaa', 'Erika Isac', 'Eva Timush', 'Feli', 'Florian Rus', 'Grasu XXL', 'Guess Who', 'HVNDS', 'Holy Molly', 'IDK', 'Irina Rimes', 'Lazy Ed', 'Manuel Riva', 'Mario', 'Minelli', 'Mira', 'MoonSound', 'Noua Unspe', 'Nuanțe', 'Omul cu Șobolani', 'Parazitii', 'Petre Stefan', 'Puya', 'Randi', 'Rares', 'Robin and the Backstabbers', 'Satra Benz', 'Speak', 'Stefania', 'Tania Turtureanu', 'The Kryptonite Sparks', 'The Motans', 'Tobi Ibitoye', 'Tussin', 'Vescan', 'Vlad Corb', 'White Mahala', 'Zodier') ORDER BY nume;

-- ramase pe lei (trebuie sa fie doar intermediere + cei fara tarif convenit):
SELECT nume, tip, lei_km FROM oferta_artisti WHERE transport_moneda <> 'euro' AND tip = 'propriu' ORDER BY nume;
