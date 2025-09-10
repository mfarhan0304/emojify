import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Emojify - Transform Photos into Emojis',
  description: 'Upload a photo and watch it transform into a cute emoji with a playful description. Join the real-time feed and discover emojis through semantic search!',
  keywords: ['emoji', 'photo', 'AI', 'generator', 'fun', 'social'],
  authors: [{ name: 'Farhan' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
