import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// rate limiting simplu: max 5 cereri per IP la 10 minute
const rateLimit = new Map<string, { count: number; reset: number }>()
function checkRate(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimit.get(ip)
  if (!entry || now > entry.reset) {
    rateLimit.set(ip, { count: 1, reset: now + 10 * 60 * 1000 })
    return true
  }
  if (entry.count >= 15) return false
  entry.count++
  return true
}

// destinatarul cererilor. Cu cont Resend neverificat, trebuie sa fie
// adresa ta de inregistrare. Dupa ce verifici domeniul gigx.ro, schimba in bogdan@gigx.ro
const TO = 'bogdanitan@gmail.com'

export async function POST(req: Request) {
  try {
    // rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    if (!checkRate(ip)) {
      return NextResponse.json({ ok: false, error: 'too many requests' }, { status: 429 })
    }

    const d = await req.json()

    // validare pe server (nu doar in browser)
    if (!d.institution_name || !d.city || !d.organizer_name || !d.organizer_phone) {
      return NextResponse.json({ ok: false, error: 'missing fields' }, { status: 400 })
    }
    // limite de lungime (previn abuz)
    const clip = (v: any, n: number) => String(v || '').slice(0, n)
    d.institution_name = clip(d.institution_name, 200)
    d.city = clip(d.city, 100)
    d.organizer_name = clip(d.organizer_name, 100)
    d.organizer_phone = clip(d.organizer_phone, 30)
    d.message = clip(d.message, 1000)
    const artists = Array.isArray(d.artists_wanted) ? d.artists_wanted.join(', ') : (d.artists_wanted || 'nespecificat')

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1c1917;">
        <div style="background:#1c1917; padding:20px; border-radius:12px 12px 0 0;">
          <div style="color:white; font-size:20px; font-weight:800;">GIG<span style="color:#059669;">x</span> · Cerere bal nou</div>
        </div>
        <div style="border:1px solid #e7e5e4; border-top:none; padding:24px; border-radius:0 0 12px 12px;">
          <h2 style="font-size:18px; margin:0 0 16px;">${d.institution_name || ''} — ${d.city || ''}</h2>
          <table style="width:100%; font-size:14px; line-height:1.8;">
            <tr><td style="color:#78716c; width:160px;">Tip organizator</td><td style="font-weight:600;">${d.organizer_type || '-'}</td></tr>
            <tr><td style="color:#78716c;">Data balului</td><td style="font-weight:600;">${d.event_date || '-'}</td></tr>
            <tr><td style="color:#78716c;">Data alternativa</td><td>${d.event_date_alternative || '-'}</td></tr>
            <tr><td style="color:#78716c;">Buget estimat</td><td style="font-weight:600;">${d.budget_range || '-'}</td></tr>
            <tr><td style="color:#78716c;">Artisti doriti</td><td style="font-weight:700; color:#059669;">${artists}</td></tr>
          </table>
          <hr style="border:none; border-top:1px solid #e7e5e4; margin:20px 0;">
          <table style="width:100%; font-size:14px; line-height:1.8;">
            <tr><td style="color:#78716c; width:160px;">Nume contact</td><td style="font-weight:600;">${d.organizer_name || '-'}</td></tr>
            <tr><td style="color:#78716c;">Telefon</td><td style="font-weight:700;">${d.organizer_phone || '-'}</td></tr>
            <tr><td style="color:#78716c;">Email</td><td>${d.organizer_email || '-'}</td></tr>
            ${d.is_minor ? `<tr><td style="color:#dc2626;">MINOR — contact adult</td><td style="font-weight:600;">${d.parent_contact || '-'}</td></tr>` : ''}
          </table>
          ${d.message ? `<hr style="border:none; border-top:1px solid #e7e5e4; margin:20px 0;"><div style="color:#78716c; font-size:12px; margin-bottom:4px;">MESAJ</div><div style="font-size:14px;">${d.message}</div>` : ''}
        </div>
      </div>
    `

    const { error } = await resend.emails.send({
      from: 'GIGx Prom <onboarding@resend.dev>',
      to: TO,
      replyTo: d.organizer_email || undefined,
      subject: `Cerere bal: ${d.institution_name || 'nou'} — ${d.city || ''}`,
      html,
    })

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'failed' }, { status: 500 })
  }
}
