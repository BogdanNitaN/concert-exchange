p = 'app/api/share/[token]/route.ts'
s = open(p).read()

old_gen = "        nume: a.nume, genuri: genuriPentru(a.nume, meta?.genres || []), tier: (balP && balP.tier) ? balP.tier : tierPentru(a.nume, meta?.tier || null, fee),"
new_gen = "        nume: a.nume, genuri: (genuriPentru(a.nume, meta?.genres || []).length ? genuriPentru(a.nume, meta?.genres || []) : (a.categorie ? [a.categorie] : [])), esteFwd: a.tip !== 'intermediere', tier: (balP && balP.tier) ? balP.tier : tierPentru(a.nume, meta?.tier || null, fee),"
assert s.count(old_gen) == 1, f"gen: {s.count(old_gen)}"
s = s.replace(old_gen, new_gen)

old_piata = """    } else if (link.scop === 'piata') {
      const { data: toti } = await supabase.from('oferta_artisti').select('*')
      let lista = (toti || []).filter(a => a.tip === 'intermediere' && !esteAscuns(a.nume))
      if (link.filtru_gen) {
        const g = link.filtru_gen.toLowerCase()
        lista = lista.filter(a => (a.categorie || '').toLowerCase() === g)
      }
      payload = { tip: 'roster', artisti: lista.map(fa).sort((a, b) => (b.preturi?.standard || 0) - (a.preturi?.standard || 0)) }"""
new_piata = """    } else if (link.scop === 'piata') {
      const { data: toti } = await supabase.from('oferta_artisti').select('*')
      let lista = (toti || []).filter(a => !esteAscuns(a.nume))
      if (link.filtru_gen) {
        const g = link.filtru_gen.toLowerCase()
        lista = lista.filter(a => (a.categorie || '').toLowerCase() === g)
      }
      const ordGen: Record<string, number> = { pop: 0, trap: 1, rap: 2, rock: 3, dance: 4, balcanic_pop: 5, manele: 6, lautareasca: 7, latino: 8, petrecere: 9, cover: 10, altele: 11 }
      const mapate = lista.map(fa)
      mapate.sort((a: any, b: any) => {
        const ga = ordGen[(a.genuri?.[0] || 'altele').toLowerCase()] ?? 99
        const gb = ordGen[(b.genuri?.[0] || 'altele').toLowerCase()] ?? 99
        if (ga !== gb) return ga - gb
        if (a.esteFwd !== b.esteFwd) return a.esteFwd ? -1 : 1
        return (b.preturi?.standard || 0) - (a.preturi?.standard || 0)
      })
      payload = { tip: 'roster', piata: true, artisti: mapate }"""
assert s.count(old_piata) == 1, f"piata: {s.count(old_piata)}"
s = s.replace(old_piata, new_piata)

open(p, 'w').write(s)
print("Pas 1 (punte gen-categorie + esteFwd) + Pas 2 (branch piata FWD+externi)")
