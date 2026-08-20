p = 'app/oferta/disponibilitate/page.tsx'
s = open(p).read()

old1 = "const m: Record<string,string> = { show: '#2563eb', indisponibil: '#dc2626', echipa: '#78716c', nota: '#a8a29e', blocat: '#dc2626' }"
new1 = "const m: Record<string,string> = { show: '#2563eb', indisponibil: '#dc2626', echipa: '#78716c', nota: '#ea580c', blocat: '#dc2626' }"
assert s.count(old1) == 1, f"badgeCol: {s.count(old1)}"
s = s.replace(old1, new1)

old2 = "    const cfg = cfgMap[st] || cfgMap.ocupat"
new2 = """    let cfg = cfgMap[st] || cfgMap.ocupat
    // liber dar cu evenimente notate (activare, nota) -> iese in evidenta galben, nu verde curat
    if (st === 'liber' && pd.evenimente && pd.evenimente.length > 0) {
      cfg = { bg:'#fffbeb', bd:'#fcd34d', col:'#b45309', txt:'✓ LIBER — dar ai ceva notat' }
    }"""
assert s.count(old2) == 1, f"cfg: {s.count(old2)}"
s = s.replace(old2, new2)

open(p, 'w').write(s)
print("Fix aplicat: card galben la liber+evenimente, badge nota portocaliu")
