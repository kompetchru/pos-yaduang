import type { Metadata, Viewport } from 'next'
import { Noto_Sans_Thai } from 'next/font/google'
import './globals.css'
import AppLayout from '@/components/layout/AppLayout'
import PwaRegister from '@/components/PwaRegister'

const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-noto-thai',
})

export const metadata: Metadata = {
  title: 'ร้านชำยายด้วง — POS',
  description: 'ระบบขายหน้าร้าน สำหรับร้านชำยายด้วง',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ยายด้วง POS',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#F97316',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body className={`${notoSansThai.variable} font-sans antialiased bg-gray-50 text-gray-800`}>
        <AppLayout>{children}</AppLayout>
        <PwaRegister />
      </body>
    </html>
  )
}
