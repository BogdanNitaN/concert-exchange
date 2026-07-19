import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    if (!code) return NextResponse.json({ ok: false, error: 'Lipsă cod' }, { status: 400 })

    const oauth2 = new google.auth.OAuth2(
      process.env.GOOGLE_CALENDAR_CLIENT_ID,
      process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
      process.env.GOOGLE_CALENDAR_REDIRECT_URI
    )
    const { tokens } = await oauth2.getToken(code)

    // refresh_token e cheia care ne da acces permanent
    if (!tokens.refresh_token) {
      return new NextResponse('<h2>Nu s-a primit refresh token. Revocă accesul aplicației din myaccount.google.com/permissions și încearcă din nou.</h2>', { headers: { 'Content-Type': 'text/html' } })
    }

    // afisez refresh token-ul ca sa-l punem in env (o singura data)
    return new NextResponse(
      '<div style="font-family:sans-serif;padding:40px;max-width:700px;margin:0 auto">' +
      '<h2>✅ Conectat cu succes!</h2>' +
      '<p>Copiază acest refresh token și pune-l în .env.local ca <b>GOOGLE_CALENDAR_REFRESH_TOKEN</b>:</p>' +
      '<textarea style="width:100%;height:80px;padding:12px;font-family:monospace;font-size:12px" readonly>' + tokens.refresh_token + '</textarea>' +
      '<p style="color:#666;font-size:13px">După ce l-ai salvat în env, repornește serverul. Această pagină nu se mai afișează.</p>' +
      '</div>',
      { headers: { 'Content-Type': 'text/html' } }
    )
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
