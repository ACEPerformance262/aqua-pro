import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AquaPro — Pool Maintenance Management',
  description: 'Professional pool maintenance, compliance, and water quality management.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
