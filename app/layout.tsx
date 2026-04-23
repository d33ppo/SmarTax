import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: '#2563eb',
}

export const metadata: Metadata = {
  title: 'SmarTax — Find Every Ringgit You\'re Owed',
  description: 'Malaysia\'s AI-powered tax relief finder. Upload your EA Form, answer 8 questions, discover missed reliefs worth thousands.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SmarTax',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
