import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'استمارة التسجيل - Registration Form',
  description: 'Admission form registration with download as PDF',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  )
}
