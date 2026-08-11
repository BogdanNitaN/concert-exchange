p = 'app/oferta/page.tsx'
s = open(p).read()
# scot linia de echivalent EUR de sub onorariu (in ramura PDF institutie publica)
old = """      if (institutiePublica) {
        rows.push('Onorariu: ' + c.feeLeiConv.toLocaleString('ro-RO') + ' lei + TVA')
        rows.push('(echivalent: ' + l.fee + ' EUR onorariu, curs ' + c.cursAdaos.toFixed(4) + ' lei/EUR)')
      } else {"""
new = """      let echivEurPdf = ''
      if (institutiePublica) {
        rows.push('Onorariu: ' + c.feeLeiConv.toLocaleString('ro-RO') + ' lei + TVA')
        echivEurPdf = '(echivalent: ' + l.fee + ' EUR onorariu, curs ' + c.cursAdaos.toFixed(4) + ' lei/EUR)'
      } else {"""
assert s.count(old) == 1, f"echiv: {s.count(old)}"
s = s.replace(old, new)

# adaug echivalentul la final, dupa durata
old2 = "      if (l.durata) rows.push('Durata: ' + l.durata)\n      if (!institutiePublica && c.discount > 0) {"
new2 = "      if (l.durata) rows.push('Durata: ' + l.durata)\n      if (echivEurPdf) rows.push(echivEurPdf)\n      if (!institutiePublica && c.discount > 0) {"
assert s.count(old2) == 1, f"final: {s.count(old2)}"
s = s.replace(old2, new2)

open(p, 'w').write(s)
print("Echivalent EUR mutat la final in PDF institutie publica")
