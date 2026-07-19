import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GIGx',
  description: 'Platforma de booking pentru industria muzicală',
  metadataBase: new URL('https://gigx.ro'),
  openGraph: {
    title: 'GIGx',
    description: 'Platforma de booking pentru industria muzicală',
    url: 'https://gigx.ro',
    siteName: 'GIGx',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale: 'ro_RO',
    type: 'website',
  },
  appleWebApp: { capable: true, title: 'GIGx', statusBarStyle: 'black-translucent' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ro">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}