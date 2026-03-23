import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'

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
    <html lang="en">
      <body style={{ margin: 0 }}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
