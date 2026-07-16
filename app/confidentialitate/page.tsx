import Link from 'next/link'

export const metadata = {
  title: 'Politica de Confidențialitate | GIGx',
  description: 'Cum prelucrează GIGx datele cu caracter personal, conform GDPR.',
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

export default function ConfidentialitatePage() {
  return (
    <div style={{minHeight:'100vh', background:'#f5f5f7', fontFamily:F}}>
      <nav style={{borderBottom:'1px solid #e7e5e4', background:'white', height:'56px', display:'flex', alignItems:'center', padding:'0 24px', justifyContent:'space-between', position:'sticky', top:0, zIndex:100}}>
        <Link href="/prom" style={{fontSize:'20px', fontWeight:800, color:'#1c1917', textDecoration:'none', letterSpacing:'-0.5px'}}>GIG<span style={{color:'#059669'}}>x</span></Link>
        <Link href="/prom" style={{fontSize:'13px', fontWeight:600, color:'#78716c', textDecoration:'none'}}>Înapoi la GIGx</Link>
      </nav>
      <div style={{maxWidth:'760px', margin:'0 auto', padding:'48px 24px 80px'}}>
        <div style={{fontSize:'11px', fontWeight:700, color:'#059669', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'12px'}}>Legal</div>
        <h1 style={{fontSize:'clamp(28px, 5vw, 38px)', fontWeight:800, letterSpacing:'-0.02em', margin:'0 0 8px', color:'#1c1917'}}>Politica de Confidențialitate</h1>
        <p style={{fontSize:'13px', color:'#a8a29e', marginBottom:'40px'}}>Ultima actualizare: 16 iulie 2026</p>
        <div style={{fontSize:'15px', lineHeight:1.7, color:'#44403c'}}>
          <p>Confidențialitatea datelor dumneavoastră este importantă pentru noi. Această politică explică ce date colectăm prin platforma GIGx, în ce scop, pe ce temei legal și ce drepturi aveți, în conformitate cu Regulamentul (UE) 2016/679 (GDPR) și Legea nr. 190/2018.</p>

          <H>1. Operatorul de date</H>
          <p>Operatorul datelor cu caracter personal este S.C. MEDIA ARTIST BOOKING S.R.L., cu sediul în Orașa, Bacău, cod fiscal 31155633, înregistrată la Registrul Comerțului cu nr. J4/97/2013. Pentru orice solicitare privind datele personale, ne puteți contacta la hello@gigx.ro.</p>

          <H>2. Ce date colectăm</H>
          <p>Prin formularele de pe platformă (cerere de ofertă, contact prin expert) putem colecta: nume și prenume, număr de telefon, adresă de e-mail, denumirea instituției sau a organizatorului, orașul și data evenimentului, bugetul orientativ, artiștii doriți și eventuale mențiuni transmise de dumneavoastră.</p>
          <p>Dacă organizatorul este minor, colectăm suplimentar datele de contact ale unui adult responsabil (părinte, profesor coordonator sau reprezentant legal).</p>
          <p>Automat, prin navigare, pot fi prelucrate date tehnice: adresă IP, tip de dispozitiv și browser, precum și informații colectate prin cookie-uri, conform Politicii de Cookies.</p>

          <H>3. Scopurile prelucrării</H>
          <p>Prelucrăm datele pentru: gestionarea și transmiterea cererilor de ofertă; contactarea dumneavoastră cu o ofertă sau clarificări; încheierea și executarea eventualelor contracte; îndeplinirea obligațiilor legale (financiar-contabile, arhivare); și pentru interesul nostru legitim de a răspunde solicitărilor și de a îmbunătăți platforma.</p>

          <H>4. Temeiul juridic</H>
          <p>Prelucrarea se întemeiază, după caz, pe: executarea de măsuri precontractuale la cererea dumneavoastră și executarea contractului (art. 6 alin. 1 lit. b GDPR); consimțământul dumneavoastră (art. 6 alin. 1 lit. a); obligațiile legale ale operatorului (art. 6 alin. 1 lit. c); și interesul legitim al operatorului (art. 6 alin. 1 lit. f), respectiv gestionarea cererilor și apărarea drepturilor sale.</p>

          <H>5. Comunicări prin WhatsApp și e-mail</H>
          <p>Atunci când alegeți să ne contactați prin WhatsApp sau e-mail, prelucrăm numărul de telefon, ID-ul de utilizator și mesajele transmise, pentru a răspunde solicitării. Nu vă trimitem comunicări comerciale fără temei legal, iar dacă v-ați abonat la comunicări, vă puteți dezabona oricând, gratuit.</p>

          <H>6. Cât timp păstrăm datele</H>
          <p>Păstrăm datele doar cât este necesar scopurilor de mai sus: pentru cererile de ofertă, pe durata necesară procesării și, ulterior, pe perioada impusă de obligațiile legale (de exemplu, cele financiar-contabile). Datele prelucrate pe bază de consimțământ sunt păstrate până la retragerea acestuia.</p>

          <H>7. Cui divulgăm datele</H>
          <p>Datele pot fi accesate de furnizori care ne sprijină operarea platformei (găzduire, e-mail tranzacțional, servicii de mesagerie), care acționează ca persoane împuternicite și prelucrează datele doar conform instrucțiunilor noastre. Nu vindem datele dumneavoastră. Le putem divulga autorităților atunci când legea o impune.</p>

          <H>8. Transferuri în afara UE</H>
          <p>Unii furnizori de servicii (de exemplu, de găzduire sau e-mail) pot prelucra date pe servere din afara Spațiului Economic European. În astfel de cazuri, ne asigurăm că transferul beneficiază de garanții adecvate conform GDPR, precum clauzele contractuale standard.</p>

          <H>9. Fotografiile artiștilor</H>
          <p>Imaginile artiștilor afișate în catalog pot fi preluate din surse publice, inclusiv platforme de streaming precum Spotify, și aparțin titularilor de drept. Acestea nu constituie date personale ale utilizatorilor platformei.</p>

          <H>10. Datele minorilor</H>
          <p>GIGx nu se adresează prelucrării directe a datelor minorilor în scopuri comerciale. Când un bal este organizat de elevi, relația comercială și prelucrarea aferentă se realizează prin intermediul unui adult responsabil. Recomandăm ca minorii să nu transmită date personale fără acordul unui părinte sau tutore.</p>

          <H>11. Securitatea datelor</H>
          <p>Aplicăm măsuri tehnice și organizatorice pentru protejarea datelor: acces restricționat la baza de date, transmitere criptată, limitarea colectării la strictul necesar și stocare în condiții de securitate. Cu toate acestea, nicio transmitere pe internet nu este complet lipsită de risc.</p>

          <H>12. Drepturile dumneavoastră</H>
          <p>Conform GDPR, aveți: dreptul de informare și de acces la date; dreptul la rectificare; dreptul la ștergere („dreptul de a fi uitat”); dreptul la restricționarea prelucrării; dreptul la portabilitatea datelor; dreptul la opoziție; și dreptul de a nu face obiectul unei decizii automate. Nu folosim procese decizionale automate sau profilare.</p>
          <p>Vă puteți exercita drepturile printr-o cerere la hello@gigx.ro. Aveți, de asemenea, dreptul de a depune o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP, dataprotection.ro) sau de a vă adresa instanțelor competente.</p>

          <H>13. Modificări</H>
          <p>Putem actualiza această politică atunci când apar schimbări legislative sau ale platformei. Versiunea curentă este publicată pe această pagină, cu data ultimei actualizări.</p>

          <H>14. Contact</H>
          <p>Pentru orice întrebare privind protecția datelor: S.C. MEDIA ARTIST BOOKING S.R.L., e-mail hello@gigx.ro.</p>
        </div>
        <LegalFooter />
      </div>
    </div>
  )
}
