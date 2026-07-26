import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Catalog Artisti Forward · GIGx',
  description: 'Peste 50 de artisti Forward Agency: pop-dance, hip-hop, trap, DJs, balkanic pop, rock. Headlineri si artisti pentru orice eveniment. Cere oferta.',
  openGraph: {
    title: 'Catalog Artisti Forward · GIGx',
    description: 'Peste 50 de artisti Forward Agency. Headlineri si artisti pentru orice eveniment.',
    url: 'https://gigx.ro/roster',
    siteName: 'GIGx',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale: 'ro_RO',
    type: 'website',
  },
}

export default function RosterLayout({ children }: { children: React.ReactNode }) {
  return children
}
