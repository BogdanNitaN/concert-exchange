'use client'

interface ArtistTransport {
  costPerKm?: number
  nrBileteAvion?: number
  cazareTip?: string
  cazareNrCamere?: number
  currency?: string
}

interface Props {
  distantaKm: number
  artist: ArtistTransport
  currency?: string
}

export default function TransportBreakdown({ distantaKm, artist, currency = 'EUR' }: Props) {
  const distantaAfisata = Math.round(distantaKm * 1.1)
  const costPerKm = artist.costPerKm || 2
  const costRutier = Math.round(distantaAfisata * costPerKm / 10) * 10
  const necesitaZbor = distantaKm > 300
  const nrBilete = artist.nrBileteAvion || 1
  const costZborEstimat = nrBilete * 150

  return (
    <div style={{display:'flex', flexDirection:'column', gap:'10px', fontFamily:'Montserrat,sans-serif'}}>

      <div style={{background:'white', border:'1px solid #e7e5e4', borderRadius:'12px', padding:'14px 16px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
            <span style={{fontSize:'16px'}}>🚗</span>
            <div>
              <div style={{fontSize:'13px', fontWeight:700, color:'#1c1917'}}>Transport rutier</div>
              <div style={{fontSize:'11px', color:'#a8a29e'}}>{distantaAfisata} km • echipa si echipament</div>
            </div>
          </div>
          <div style={{fontWeight:800, fontSize:'14px', color:'#1c1917'}}>{costRutier.toLocaleString()} {currency}</div>
        </div>
      </div>

      {necesitaZbor && (
        <div style={{background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:'12px', padding:'14px 16px'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
              <span style={{fontSize:'16px'}}>✈️</span>
              <div>
                <div style={{fontSize:'13px', fontWeight:700, color:'#1e40af'}}>Zbor artist</div>
                <div style={{fontSize:'11px', color:'#3b82f6'}}>{nrBilete} {nrBilete === 1 ? 'bilet' : 'bilete'} • distanta peste 300km</div>
              </div>
            </div>
            <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'4px'}}>
              <div style={{fontWeight:800, fontSize:'14px', color:'#1e40af'}}>~{costZborEstimat.toLocaleString()} {currency}</div>
              <a href="https://masirotravel.ro" target="_blank" rel="noopener noreferrer"
                style={{fontSize:'10px', color:'#1e40af', textDecoration:'none', fontWeight:700, background:'white', padding:'2px 8px', borderRadius:'6px', border:'1px solid #bfdbfe'}}>
                Vezi zboruri →
              </a>
            </div>
          </div>
        </div>
      )}

      {artist.cazareTip && (
        <div style={{background:'#f5f3ff', border:'1px solid #ddd6fe', borderRadius:'12px', padding:'14px 16px'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
              <span style={{fontSize:'16px'}}>🏨</span>
              <div>
                <div style={{fontSize:'13px', fontWeight:700, color:'#7c3aed'}}>Cazare necesara</div>
                <div style={{fontSize:'11px', color:'#8b5cf6'}}>
                  {artist.cazareNrCamere || 1}x {artist.cazareTip}
                </div>
              </div>
            </div>
            <a href="https://masirotravel.ro" target="_blank" rel="noopener noreferrer"
              style={{fontSize:'11px', color:'#7c3aed', textDecoration:'none', fontWeight:700, background:'white', padding:'4px 12px', borderRadius:'8px', border:'1px solid #ddd6fe'}}>
              Vezi hoteluri →
            </a>
          </div>
        </div>
      )}

      <div style={{fontSize:'10px', color:'#a8a29e', textAlign:'right', paddingTop:'4px'}}>
        * Transport calculat din profilul artistului
      </div>
    </div>
  )
}
