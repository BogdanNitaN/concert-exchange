import type { Metadata } from 'next'

const SITE = 'https://gigx.ro'

async function iaArtist(slug: string) {
  try {
    const r = await fetch(SITE + '/api/artist-public/' + encodeURIComponent(slug), { next: { revalidate: 3600 } })
    const d = await r.json()
    return d.ok ? d.artist : null
  } catch { return null }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const a = await iaArtist(slug)
  if (!a) return { title: 'Artist · Forward Agency' }
  const gen = (a.genuri || []).join(', ')
  const desc = a.nume + (gen ? ' · ' + gen : '') + '. Media kit, detalii de show si contact pentru evenimente. Booking prin Forward Agency.'
  return {
    metadataBase: new URL(SITE),
    title: a.nume + ' · Booking prin Forward Agency',
    description: desc,
    alternates: { canonical: SITE + '/a/' + a.slug },
    openGraph: {
      title: a.nume + ' · Forward Agency',
      description: desc,
      url: SITE + '/a/' + a.slug,
      siteName: 'GIGx',
      images: a.poza ? [{ url: a.poza, width: 1200, height: 630 }] : [{ url: SITE + '/og-roster.png' }],
      type: 'profile',
    },
    twitter: { card: 'summary_large_image', title: a.nume, description: desc, images: a.poza ? [a.poza] : undefined },
  }
}

export default function ALayout({ children }: { children: React.ReactNode }) {
  return children
}
