import Link from 'next/link'

export const metadata = {
  title: 'Politica de Cookies | GIGx',
  description: 'Cum folosește GIGx cookie-urile și tehnologiile similare.',
}
const F = 'Montserrat,sans-serif'

function H({ children }: { children: React.ReactNode }) {
  return <h2 style={{fontSize:'18px', fontWeight:800, color:'#1c1917', margin:'32px 0 12px', letterSpacing:'-0.01em'}}>{children}</h2>
}
function LegalFooter() {
  return (
    <div style={{marginTop:'48px', paddingTop:'24px', borderTop:'1px solid #e7e5e4', display:'flex', gap:'20px', flexWrap:'wrap'}}>
      <Link href="/termeni" style={{fontSize:'13px', color:'#78716c', textDecoration:'none'}}>Termeni și Condiții</Link>
      <Link href="/confidentialitate" style={{fontSize:'13px', color:'#78716c', textDecoration:'none'}}>Confidențialitate</Link>
      <Link href="/cookies" style={{fontSize:'13px', color:'#78716c', textDecoration:'none'}}>Cookies</Link>
    </div>
  )
}

export default function CookiesPage() {
  return (
    <div style={{minHeight:'100vh', background:'#f5f5f7', fontFamily:F}}>
      <nav style={{borderBottom:'1px solid #e7e5e4', background:'white', height:'56px', display:'flex', alignItems:'center', padding:'0 24px', justifyContent:'space-between', position:'sticky', top:0, zIndex:100}}>
        <Link href="/prom" style={{fontSize:'20px', fontWeight:800, color:'#1c1917', textDecoration:'none', letterSpacing:'-0.5px'}}>GIG<span style={{color:'#059669'}}>x</span></Link>
        <Link href="/prom" style={{fontSize:'13px', fontWeight:600, color:'#78716c', textDecoration:'none'}}>Înapoi la GIGx</Link>
      </nav>
      <div style={{maxWidth:'760px', margin:'0 auto', padding:'48px 24px 80px'}}>
        <div style={{fontSize:'11px', fontWeight:700, color:'#059669', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'12px'}}>Legal</div>
        <h1 style={{fontSize:'clamp(28px, 5vw, 38px)', fontWeight:800, letterSpacing:'-0.02em', margin:'0 0 8px', color:'#1c1917'}}>Politica de Cookies</h1>
        <p style={{fontSize:'13px', color:'#a8a29e', marginBottom:'40px'}}>Ultima actualizare: 16 iulie 2026</p>
        <div style={{fontSize:'15px', lineHeight:1.7, color:'#44403c'}}>
          <p>Această politică explică ce sunt cookie-urile, cum și de ce le folosim pe platforma GIGx (gigx.ro) și cum le puteți controla. Politica se completează cu Politica de Confidențialitate.</p>

          <H>1. Ce sunt cookie-urile</H>
          <p>Cookie-urile sunt fișiere text de mici dimensiuni stocate pe dispozitivul dumneavoastră atunci când vizitați un site. Ele permit site-ului să funcționeze corect, să rețină anumite preferințe și, în unele cazuri, să colecteze informații statistice despre utilizare.</p>

          <H>2. Ce tehnologii folosim</H>
          <p>GIGx este construit pe tehnologii moderne și folosește un număr minim de cookie-uri și tehnologii similare (precum stocarea locală în browser), strict pentru funcționarea platformei și pentru o experiență bună de utilizare. Nu folosim mai multe date decât este necesar.</p>

          <H>3. Categorii de cookie-uri</H>
          <p><strong>Cookie-uri strict necesare.</strong> Sunt esențiale pentru funcționarea platformei — de exemplu, pentru securitate, pentru încărcarea corectă a paginilor și pentru reținerea acțiunilor dumneavoastră în timpul unei sesiuni. Fără ele, platforma nu poate funcționa corespunzător. Acestea nu necesită consimțământ.</p>
          <p><strong>Cookie-uri de performanță și analiză.</strong> Dacă sunt folosite, ne ajută să înțelegem cum este utilizată platforma (pagini vizitate, timp petrecut), pentru a o îmbunătăți. Aceste date sunt, de regulă, agregate și nu vă identifică direct.</p>
          <p><strong>Cookie-uri de la terți.</strong> Anumite componente pot proveni de la furnizori externi — de exemplu, imagini ale artiștilor încărcate din surse publice sau servicii de hărți și calcul al distanțelor folosite în calculatorul de transport. Aceștia își pot seta propriile cookie-uri, conform politicilor lor.</p>

          <H>4. Cookie-uri terțe pe care le putem folosi</H>
          <p>În funcție de funcționalitățile accesate, pot fi implicați furnizori precum servicii de găzduire și livrare de conținut, servicii de hărți și distanțe rutiere, precum și surse publice de imagini pentru artiști. Vă recomandăm să consultați politicile de confidențialitate ale acestor furnizori pentru detalii despre cookie-urile lor.</p>

          <H>5. Cum controlați cookie-urile</H>
          <p>Puteți controla și șterge cookie-urile din setările browserului dumneavoastră. Majoritatea browserelor permit blocarea sau ștergerea cookie-urilor, precum și notificarea la primirea unui cookie nou. Dezactivarea cookie-urilor strict necesare poate afecta funcționarea platformei.</p>
          <p>Instrucțiuni pentru browserele uzuale găsiți în secțiunile de ajutor ale acestora (Chrome, Safari, Firefox, Edge).</p>

          <H>6. Modificări</H>
          <p>Putem actualiza această politică atunci când apar schimbări tehnice sau legislative. Versiunea curentă este publicată pe această pagină, cu data ultimei actualizări.</p>

          <H>7. Contact</H>
          <p>Pentru întrebări privind cookie-urile: S.C. MEDIA ARTIST BOOKING S.R.L., e-mail hello@gigx.ro.</p>
        </div>
        <LegalFooter />
      </div>
    </div>
  )
}
