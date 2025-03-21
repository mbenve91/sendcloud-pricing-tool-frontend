import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/providers/AuthProvider'
import { ToastProvider } from '@/components/ui/toast'
import { Toaster } from '@/components/ui/toaster'

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
          <ToastProvider>
            <div className="min-h-screen flex flex-col">
              <main className="flex-grow">
                {children}
              </main>
            </div>
            <Toaster />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
