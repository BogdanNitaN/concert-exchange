import Link from 'next/link'

export const metadata = {
  title: 'Termeni și Condiții | GIGx',
  description: 'Termenii și condițiile de utilizare a platformei GIGx.',
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

export default function TermeniPage() {
  return (
    <div style={{minHeight:'100vh', background:'#f5f5f7', fontFamily:F}}>
      <nav style={{borderBottom:'1px solid #e7e5e4', background:'white', height:'56px', display:'flex', alignItems:'center', padding:'0 24px', justifyContent:'space-between', position:'sticky', top:0, zIndex:100}}>
        <Link href="/" style={{display:'inline-flex', alignItems:'center', gap:'8px', fontSize:'20px', fontWeight:800, color:'#1c1917', textDecoration:'none', letterSpacing:'-0.5px'}}><img src="/gigx-mark.png" width={24} height={24} alt="" style={{display:'block'}} /><span>GIG<span style={{color:'#059669'}}>x</span></span></Link>
        <Link href="/" style={{fontSize:'13px', fontWeight:600, color:'#78716c', textDecoration:'none'}}>Înapoi</Link>
      </nav>
      <div style={{maxWidth:'760px', margin:'0 auto', padding:'48px 24px 80px'}}>
        <div style={{fontSize:'11px', fontWeight:700, color:'#059669', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'12px'}}>Legal</div>
        <h1 style={{fontSize:'clamp(28px, 5vw, 38px)', fontWeight:800, letterSpacing:'-0.02em', margin:'0 0 8px', color:'#1c1917'}}>Termeni și Condiții</h1>
        <p style={{fontSize:'13px', color:'#a8a29e', marginBottom:'40px'}}>Ultima actualizare: 16 iulie 2026</p>
        <div style={{fontSize:'15px', lineHeight:1.7, color:'#44403c'}}>
          <p>Acești Termeni și Condiții reglementează utilizarea platformei GIGx, disponibilă la adresa gigx.ro, administrată de S.C. MEDIA ARTIST BOOKING S.R.L. Prin accesarea platformei, completarea formularelor, transmiterea unei cereri de ofertă sau folosirea calculatorului de transport, confirmați că ați citit, ați înțeles și acceptați acești Termeni.</p>

          <H>1. Administratorul platformei</H>
          <p>Platforma GIGx este administrată de S.C. MEDIA ARTIST BOOKING S.R.L., cu sediul în Orașa, Bacău, cod fiscal 31155633, înregistrată la Registrul Comerțului cu nr. J4/97/2013, cont bancar RO48 INGB 0000 9999 0867 5824, deschis la ING Bank. E-mail: hello@gigx.ro. În cuprinsul acestor Termeni, denumirile „GIGx”, „platforma”, „noi” sau „administratorul” desemnează această societate.</p>

          <H>2. Ce este GIGx</H>
          <p>GIGx este locul unde se rezervă artistul pentru evenimentul tău. Diferența față de căutarea pe Google, un mesaj pe Instagram sau un apel către un agent: aici primești răspuns în 30 de minute, cu prețul real și disponibilitatea reală, de la o echipă cu 20 de ani în industria muzicală.</p>
          <p>Fie că organizezi un bal de absolvire, un festival, o petrecere corporate sau un eveniment privat, procesul este același: tu spui ce ai nevoie, noi îți spunem cine.</p>

          <H>3. Rolul de intermediar</H>
          <p>GIGx acționează ca intermediar între organizator și artiști. Estimările afișate (transport, cazare, categorie de onorariu) au caracter strict orientativ și nu constituie o ofertă fermă. Oferta valabilă este exclusiv cea transmisă în scris de un agent GIGx, în urma verificării disponibilității artistului pentru data și locația solicitate.</p>
          <p>GIGx nu garantează disponibilitatea unui artist la o anumită dată sau un anumit preț, cu excepția obligațiilor asumate expres printr-o ofertă acceptată.</p>

          <H>4. Estimările din platformă</H>
          <p>Costul de transport, necesarul de cazare, categoria artistului și eventualele bilete de avion sunt calculate pe baza unor date orientative și a distanțelor rutiere aproximative. Categoriile artiștilor (Icon, Premium, Select) reflectă poziționarea comercială și impactul la evenimente, nu un preț fix. La anumite genuri, categoria reflectă cererea și impactul, nu nivelul onorariului.</p>
          <p>Conversiile valutare folosesc cursul de referință al Băncii Naționale a României, actualizat periodic. Valorile pot varia în funcție de cursul din ziua ofertei.</p>

          <H>5. Cereri de ofertă</H>
          <p>Prin transmiterea unei cereri, organizatorul confirmă că informațiile sunt reale și corecte. Ne străduim să răspundem în cel mai scurt timp, de regulă în 30 de minute în intervalul de program, dar acest termen este orientativ. Organizatorul are obligația să verifice detaliile relevante înainte de acceptarea unei oferte: preț final, disponibilitate, servicii incluse, condiții de transport, cazare și plată.</p>

          <H>6. Organizatori minori</H>
          <p>Balurile de absolvire sunt adesea organizate de elevi. Dacă persoana care completează o cerere are sub 18 ani, contractarea, discuțiile comerciale și plata se realizează exclusiv prin intermediul unui adult responsabil — părinte, profesor coordonator sau reprezentant legal. GIGx nu încheie contracte și nu procesează plăți direct cu minori. La transmiterea unei cereri de către un minor, solicităm datele de contact ale unui adult responsabil, iar relația comercială se poartă cu acesta.</p>

          <H>7. Obligațiile utilizatorilor</H>
          <p>Utilizatorii folosesc platforma în mod legal și corect. Este interzisă transmiterea de cereri fictive, folosirea de identități false, utilizarea platformei pentru spam, fraudă, testări automate sau colectarea neautorizată de date. Persoanele care folosesc o adresă falsă ori transmit comunicări în numele altei persoane pot fi raportate autorităților competente.</p>

          <H>8. Proprietate intelectuală</H>
          <p>Toate elementele platformei — structură, design, texte, grafică, logo-uri, baze de date și cod — aparțin S.C. MEDIA ARTIST BOOKING S.R.L. sau partenerilor săi. Fotografiile artiștilor pot proveni din surse publice, inclusiv platforme de streaming precum Spotify, și aparțin titularilor de drept respectivi. Reproducerea sau exploatarea conținutului fără acord scris este interzisă.</p>

          <H>9. Disponibilitatea platformei</H>
          <p>GIGx este furnizat în forma disponibilă la momentul accesării. Nu garantăm funcționarea fără întreruperi sau erori și putem efectua mentenanță ori actualizări fără notificare. Nu răspundem pentru imposibilitatea temporară de utilizare cauzată de defecțiuni tehnice, atacuri informatice, probleme ale furnizorilor de hosting sau forță majoră.</p>

          <H>10. Limitarea răspunderii</H>
          <p>În limita permisă de lege, GIGx nu răspunde pentru prejudicii directe sau indirecte rezultate din utilizarea platformei, din informațiile orientative afișate sau din relația comercială dintre organizator și artist, cu excepția obligațiilor asumate expres printr-o ofertă acceptată. Nicio prevedere nu limitează răspunderea care nu poate fi limitată potrivit legii.</p>

          <H>11. Protecția datelor</H>
          <p>Prelucrarea datelor personale se realizează conform Politicii de Confidențialitate GIGx, în acord cu Regulamentul (UE) 2016/679 (GDPR).</p>

          <H>12. Modificarea Termenilor</H>
          <p>GIGx poate modifica acești Termeni la schimbări legislative sau ale platformei. Versiunea actualizată se publică pe această pagină, cu data ultimei actualizări. Utilizarea platformei după publicare reprezintă acceptarea noilor Termeni.</p>

          <H>13. Legea aplicabilă</H>
          <p>Acești Termeni sunt guvernați de legea română. Litigiile se soluționează pe cale amiabilă, iar dacă nu este posibil, de instanțele competente din România.</p>

          <H>14. Contact</H>
          <p>Pentru orice întrebări: S.C. MEDIA ARTIST BOOKING S.R.L., cod fiscal 31155633, nr. Reg. Com. J4/97/2013, e-mail hello@gigx.ro.</p>
        </div>
        <LegalFooter />
      </div>
    </div>
  )
}
