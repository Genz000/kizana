import type { Metadata } from 'next'
import { GeistMono } from 'geist/font/mono'
import { Martian_Mono } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import './globals.css'

const martianMono = Martian_Mono({
  subsets: ['latin'],
  weight: ['400', '800'],
  variable: '--font-martian-mono',
})

export const metadata: Metadata = {
  title: 'Kizana',
  description: 'Secure client-side vault and chat',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistMono.className} ${martianMono.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
