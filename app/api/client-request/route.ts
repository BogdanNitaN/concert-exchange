import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const TO = 'booking@gigx.ro'
const BCC = ['scmabsrl@gmail.com', 'alexandra.stefan@forward.ro']
// pana cand domeniul e verificat in Resend, expeditorul de test poate trimite doar catre adresa contului;
// incercam catre toti, iar daca e refuzat retrimitem doar catre Bogdan ca sa nu pierdem cererea

const rateLimit = new Map<string, { count: number; reset: number }>()
function checkRate(ip: string): boolean {
  const now = Date.now()
  const e = rateLimit.get(ip)
  if (!e || now > e.reset) { rateLimit.set(ip, { count: 1, reset: now + 10 * 60 * 1000 }); return true }
  if (e.count >= 15) return false
  e.count++
  return true
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    if (!checkRate(ip)) return NextResponse.json({ ok: false, error: 'too many requests' }, { status: 429 })

    const d = await req.json()
    if (!d.nume || !d.telefon) return NextResponse.json({ ok: false, error: 'missing contact' }, { status: 400 })

    const clip = (v: any, n: number) => String(v || '').slice(0, n)
    const nume = clip(d.nume, 100)
    const telefon = clip(d.telefon, 30)
    const email = clip(d.email, 120)
    const oras = clip(d.oras, 100)
    const locatie = clip(d.locatie, 200)
    const tipEveniment = clip(d.tipEveniment, 60)
    const data = clip(d.data, 40)
    const artisti = Array.isArray(d.artisti) ? d.artisti.map((x: any) => clip(x, 120)).join(', ') : clip(d.artisti, 400)
    const seturi = Array.isArray(d.seturi) ? d.seturi.map((x: any) => clip(x, 60)).join(', ') : clip(d.seturi, 200)

    const rand = (et: string, val: string, bold = false) =>
      `<tr><td style="color:#78716c; width:160px;">${et}</td><td style="${bold ? 'font-weight:700;' : ''}">${val || '-'}</td></tr>`

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1c1917;">
        <div style="background:#101014; padding:20px; border-radius:12px 12px 0 0;">
          <div style="color:white; font-size:20px; font-weight:800;">GIG<span style="color:#059669;">x</span> · Cerere nouă de la client</div>
        </div>
        <div style="border:1px solid #e7e5e4; border-top:none; padding:24px; border-radius:0 0 12px 12px;">
          <h2 style="font-size:18px; margin:0 0 16px;">${tipEveniment || 'Eveniment'} — ${oras || ''}</h2>
          <table style="width:100%; font-size:14px; line-height:1.8;">
            ${rand('Data', data, true)}
            ${rand('Oraș', oras)}
            ${rand('Locație', locatie)}
            ${rand('Participanți', d.participanti ? String(d.participanti) : '')}
            ${rand('Buget', d.buget ? String(d.buget) + ' EUR' : '')}
          </table>
          <hr style="border:none; border-top:1px solid #e7e5e4; margin:20px 0;">
          <table style="width:100%; font-size:14px; line-height:1.8;">
            <tr><td style="color:#78716c; width:160px;">Artiști doriți</td><td style="font-weight:700; color:#059669;">${artisti || '-'}</td></tr>
            ${rand('Seturi', seturi)}
          </table>
          <hr style="border:none; border-top:1px solid #e7e5e4; margin:20px 0;">
          <table style="width:100%; font-size:14px; line-height:1.8;">
            ${rand('Nume contact', nume, true)}
            ${rand('Telefon', telefon, true)}
            ${rand('Email', email)}
          </table>
        </div>
      </div>
    `

    const trimite = () => resend.emails.send({
      from: 'GIGx <oferte@gigx.ro>',
      to: TO,
      bcc: BCC,
      replyTo: email || undefined,
      subject: `Cerere client: ${tipEveniment || 'eveniment'} — ${oras || ''} (${nume})`,
      html,
    })
    const { error } = await trimite()
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'failed' }, { status: 500 })
  }
}
