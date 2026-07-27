import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'

const SITE = 'https://gigx.ro'

async function dateLink(token: string) {
  try {
    const supa = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    )
    const { data: link } = await supa.from('roster_links').select('scop, activ, expira_la').eq('token', token).maybeSingle()
    if (!link || !link.activ) return null
    if (link.scop === 'roster') return { tip: 'roster' as const }
    const { data: img } = await supa.from('artist_images').select('image_url').eq('name', link.scop).maybeSingle()
    return { tip: 'artist' as const, nume: link.scop as string, poza: img?.image_url || null }
  } catch { return null }
}

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params
  const d = await dateLink(token)
  const descriere = 'Prezentare, logistica si documente oficiale.'
  const titlu = d && d.tip === 'artist' ? d.nume + ' · Forward Agency' : 'Roster Forward Agency'
  const imagine = d && d.tip === 'artist' && d.poza ? d.poza : SITE + '/og-image.png'
  return {
    metadataBase: new URL(SITE),
    title: titlu,
    description: descriere,
    robots: { index: false, follow: false },
    openGraph: {
      title: titlu,
      description: descriere,
      url: SITE + '/r/' + token,
      siteName: 'GIGx',
      images: [{ url: imagine, width: 1200, height: 630 }],
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: titlu, description: descriere, images: [imagine] },
  }
}

export default function RLayout({ children }: { children: React.ReactNode }) {
  return children
}
