import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { formatDataRo } from '@/lib/format-data'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
)
const resend = new Resend(process.env.RESEND_API_KEY)

function fisaHTML(d: any): string {
  const rand = (et: string, val: string) => val ? `<tr><td style="padding:9px 14px;color:#78716c;font-weight:600;font-size:12px;letter-spacing:0.03em;white-space:nowrap;vertical-align:top;">${et}</td><td style="padding:9px 14px;color:#1c1917;font-size:14px;">${val}</td></tr>` : ''
  const sectiune = (titlu: string, randuri: string) => `
    <div style="margin:22px 0 6px;text-align:center;background:#f5f5f4;padding:9px;border-radius:6px;"><span style="font-size:14px;font-weight:800;letter-spacing:0.08em;color:#1c1917;">${titlu}</span></div>
    <table style="width:100%;border-collapse:collapse;border:1px solid #e7e5e4;border-radius:8px;overflow:hidden;">${randuri}</table>`
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;background:#fafaf9;font-family:Arial,Helvetica,sans-serif;padding:24px 12px;">
    <div style="max-width:620px;margin:0 auto;background:white;border-radius:12px;padding:26px 24px 30px;box-shadow:0 2px 12px rgba(0,0,0,0.05);">
      <table style="width:100%;border:1px solid #e7e5e4;border-collapse:collapse;margin-bottom:8px;"><tr>
        <td style="padding:12px 14px;background:#f5f5f4;font-size:12px;font-weight:800;letter-spacing:0.08em;color:#57534e;width:80px;vertical-align:top;">SUMAR</td>
        <td style="padding:12px 14px;"><div style="font-size:16px;font-weight:800;color:#1c1917;">${d.artist || ''}</div><div style="font-size:13px;color:#57534e;margin-top:3px;">${formatDataRo(d.data_eveniment)}${d.oras ? ', ' + d.oras.toUpperCase() : ''}</div><div style="font-size:13px;font-weight:700;color:#1c1917;margin-top:2px;">${(d.locatie || '').toUpperCase()}</div></td>
      </tr></table>
      ${sectiune('DETALII EVENIMENT', rand('DATA', formatDataRo(d.data_eveniment)) + rand('ORAȘ', (d.oras || '').toUpperCase()) + rand('LOCAȚIE', (d.locatie || '').toUpperCase()) + rand('OBSERVAȚII', d.obs_eveniment))}
      ${sectiune('TECHNICAL RIDER', rand('ORA SOUNDCHECK', d.ora_soundcheck) + rand('ORA PERFORMANCE', d.ora_performance) + rand('DURATĂ', d.durata) + rand('CONTACT LOCAȚIE', d.contact_locatie) + rand('CONTACT TEHNIC', d.contact_tehnic))}
      ${sectiune('ACCOMMODATION RIDER', rand('HOTEL', (d.hotel || '').toUpperCase()) + rand('CAMERE', d.camere) + rand('RESTAURANT', d.restaurant) + rand('OBSERVAȚII', d.obs_cazare))}
      <div style="margin-top:26px;padding-top:16px;border-top:1px solid #e7e5e4;font-size:11px;color:#a8a29e;text-align:center;">Forward Agency · Ghetarilor no 2, sector 1 · Bucuresti, PO 014106<div style="margin-top:6px;font-weight:700;color:#78716c;">powered by gig<span style="color:#059669;">x</span>.ro</div></div>
    </div>
  </body></html>`
}

export async function POST(req: Request) {
  try {
    const b = await req.json()

    if (b.actiune === 'salveaza_email_artist' && b.artist) {
      const { error } = await supabase.from('oferta_artisti').update({ email_productie: b.email_productie || null }).eq('nume', b.artist)
      return NextResponse.json({ ok: !error, error: error?.message })
    }

    if (b.actiune === 'salveaza_locatie' && b.locatie) {
      const { data: ex } = await supabase.from('locatii').select('id').eq('nume', b.locatie).maybeSingle()
      if (ex) await supabase.from('locatii').update({ oras: b.oras, contact_locatie: b.contact_locatie, contact_tehnic: b.contact_tehnic }).eq('id', ex.id)
      else await supabase.from('locatii').insert({ nume: b.locatie, oras: b.oras, contact_locatie: b.contact_locatie, contact_tehnic: b.contact_tehnic })
      return NextResponse.json({ ok: true })
    }

    if (b.actiune === 'preview') {
      return NextResponse.json({ ok: true, html: fisaHTML(b) })
    }

    if (b.actiune === 'test') {
      const html = fisaHTML(b)
      const { error } = await resend.emails.send({
        from: 'Forward Agency - Itinerary <booking@gigx.ro>',
        to: ['bogdan@forward.ro'],
        replyTo: 'alexandra.stefan@forward.ro',
        subject: `[TEST] Fișă eveniment · ${b.artist} · ${formatDataRo(b.data_eveniment)}${b.oras ? ', ' + b.oras : ''}`,
        html,
      })
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
      return NextResponse.json({ ok: true, trimisLa: ['bogdan@forward.ro (TEST)'] })
    }

    if (b.actiune === 'trimite') {
      const html = fisaHTML(b)
      const dest = [...String(b.email_productie || '').split(',').map((x: string) => x.trim()).filter(Boolean), ...(b.email_client ? [b.email_client.trim()] : [])]
      if (!dest.length) return NextResponse.json({ ok: false, error: 'Niciun destinatar' }, { status: 400 })
      const { error } = await resend.emails.send({
        from: 'Forward Agency - Itinerary <booking@gigx.ro>',
        to: dest,
        cc: ['bogdan@forward.ro'],
        replyTo: 'alexandra.stefan@forward.ro',
        subject: `Fișă eveniment · ${b.artist} · ${formatDataRo(b.data_eveniment)}${b.oras ? ', ' + b.oras : ''}`,
        html,
      })
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
      await supabase.from('fise_eveniment').insert({ artist: b.artist, data_eveniment: b.data_eveniment || null, oras: b.oras || null, locatie: b.locatie || null, payload: b, trimis_la: new Date().toISOString() })
      return NextResponse.json({ ok: true, trimisLa: dest })
    }

    return NextResponse.json({ ok: false, error: 'Actiune necunoscuta' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'failed' }, { status: 500 })
  }
}

export async function GET() {
  const { data: locatii } = await supabase.from('locatii').select('*').order('nume')
  const { data: art } = await supabase.from('oferta_artisti').select('nume, cazare, nr_persoane, diurna_fixa, set_type, email_productie, tip').order('nume')
  return NextResponse.json({ ok: true, locatii: locatii || [], artisti: art || [] })
}
