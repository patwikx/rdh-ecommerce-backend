

import { Inter } from 'next/font/google'

import { ModalProvider } from '@/providers/modal-provider'
import { ToastProvider } from '@/providers/toast-provider'
import { ThemeProvider } from '@/providers/theme-provider'

import './globals.css'
import SessionWrapper from '@/components/session-provider'
import { IdleTimer } from '@/components/idle-timer'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'RDHFSI E-Commerce System',
  description: 'E-Commerce',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
<SessionWrapper>
      <html lang="en">
        <body className={inter.className}>
          <ThemeProvider 
            attribute="class" 
            defaultTheme="system" 
            enableSystem
          >
            <ToastProvider />
            <ModalProvider />
            {children}
            <Toaster />
            <IdleTimer />
          </ThemeProvider>
        </body>
      </html>
      </SessionWrapper>
  )
}
