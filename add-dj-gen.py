p1 = 'app/api/share/[token]/route.ts'
s1 = open(p1).read()
old1 = "const ordGen: Record<string, number> = { pop: 0, trap: 1, rap: 2, rock: 3, dance: 4, balcanic_pop: 5, manele: 6, lautareasca: 7, latino: 8, petrecere: 9, cover: 10, altele: 11 }"
new1 = "const ordGen: Record<string, number> = { pop: 0, trap: 1, rap: 2, rock: 3, dance: 4, dj: 5, balcanic_pop: 6, manele: 7, lautareasca: 8, latino: 9, petrecere: 10, cover: 11, altele: 12 }"
assert s1.count(old1) == 1, f"api ordGen: {s1.count(old1)}"
s1 = s1.replace(old1, new1)
open(p1, 'w').write(s1)

p2 = 'app/r/[token]/page.tsx'
s2 = open(p2).read()
old2 = "const etGen: Record<string, string> = { pop: 'Pop', trap: 'Trap', rap: 'Rap / Hip-Hop', rock: 'Rock', dance: 'Dance', balcanic_pop: 'Balcanic Pop', manele: 'Manele', lautareasca: 'Lautareasca', latino: 'Latino', petrecere: 'Petrecere', cover: 'Covers', altele: 'Altele' }"
new2 = "const etGen: Record<string, string> = { pop: 'Pop', trap: 'Trap', rap: 'Rap / Hip-Hop', rock: 'Rock', dance: 'Dance', dj: 'DJs', balcanic_pop: 'Balcanic Pop', manele: 'Manele', lautareasca: 'Lautareasca', latino: 'Latino', petrecere: 'Petrecere', cover: 'Covers', altele: 'Altele' }"
assert s2.count(old2) == 1, f"front etGen: {s2.count(old2)}"
s2 = s2.replace(old2, new2)
open(p2, 'w').write(s2)
print("Adaugat dj: API ordGen (dupa dance) + frontend etGen ('DJs')")
