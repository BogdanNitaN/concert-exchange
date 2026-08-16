p = 'app/oferta/fisa/page.tsx'
s = open(p).read()

handler = """  function enterUrmator(e: React.KeyboardEvent<HTMLDivElement>) {
    // doar pe mobil: Enter sare la urmatorul camp (pe desktop ramane Tab nativ)
    const eMobil = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
    if (!eMobil || e.key !== 'Enter') return
    const t = e.target as HTMLElement
    if (t.tagName !== 'INPUT') return
    if ((t as HTMLInputElement).dataset.noenter === '1') return
    e.preventDefault()
    const box = e.currentTarget
    const inputs = Array.from(box.querySelectorAll('input')).filter(i => !(i as HTMLInputElement).disabled && (i as HTMLInputElement).type !== 'hidden')
    const idx = inputs.indexOf(t as HTMLInputElement)
    if (idx >= 0 && idx < inputs.length - 1) (inputs[idx + 1] as HTMLInputElement).focus()
  }
"""
old_ret = "  return (\n    <div style={{minHeight:'100vh', background:UI.bg, fontFamily:F, padding:'20px 14px 60px'}}>\n      <div style={{maxWidth:'620px', margin:'0 auto'}}>"
new_ret = handler + "  return (\n    <div style={{minHeight:'100vh', background:UI.bg, fontFamily:F, padding:'20px 14px 60px'}}>\n      <div style={{maxWidth:'620px', margin:'0 auto'}} onKeyDown={enterUrmator}>"
assert s.count(old_ret) == 1, f"container: {s.count(old_ret)}"
s = s.replace(old_ret, new_ret)

s = s.replace(
  "<input value={f.artist} onChange={e => { set('artist', e.target.value); setArtQuery(e.target.value); setArtOpen(true) }} onFocus={() => setArtOpen(true)} placeholder=\"Caută artistul…\" style={inp} />",
  "<input data-noenter=\"1\" value={f.artist} onChange={e => { set('artist', e.target.value); setArtQuery(e.target.value); setArtOpen(true) }} onFocus={() => setArtOpen(true)} placeholder=\"Caută artistul…\" style={inp} />"
)
s = s.replace(
  "<input value={f.oras} onChange={e => cautaOras(e.target.value)} onBlur={() => setTimeout(() => setShowOrasSugg(false), 150)} style={inp} />",
  "<input data-noenter=\"1\" value={f.oras} onChange={e => cautaOras(e.target.value)} onBlur={() => setTimeout(() => setShowOrasSugg(false), 150)} style={inp} />"
)

open(p, 'w').write(s)
print("Enter sare la urmatorul camp DOAR pe mobil; Tab ramane nativ pe desktop; artist/oras excluse")
