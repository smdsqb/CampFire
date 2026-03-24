import type { Metadata } from 'next'
import { Roboto_Condensed, Outfit } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'

const robotoCondensed = Roboto_Condensed({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-heading',
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'CampFire — Gather Around',
  description: 'Every great conversation starts with a spark.',
  icons: { icon: '/favicon.svg' },
  verification: {
    google: 'S8xwMMjB-B5LIkkGjDEXCx3LsZkYE9RUBpm51QlMc8c',
    other: {
      'google-adsense-account': 'ca-pub-3645158319821683',
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${robotoCondensed.variable} ${outfit.variable}`}>
      <body style={{ margin: 0 }}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
