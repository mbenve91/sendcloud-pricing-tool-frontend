import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/providers/AuthProvider'

export const metadata: Metadata = {
  title: 'SendCloud Pricing Tool',
  description: 'Pricing tool for SendCloud services',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <main className="flex-grow">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
