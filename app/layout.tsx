import type { Metadata } from 'next'
import { AuthProvider } from '@/providers/AuthProvider'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'SendCloud Pricing Tool',
  description: 'Pricing tool for SendCloud services',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ThemeProvider defaultTheme="light" storageKey="sendcloud-theme">
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
