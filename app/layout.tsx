import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata = {
  title: 'Health Function Board',
  description: 'iOS-style health app prototype',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script src="https://kit.fontawesome.com/5f19e7c78d.js" crossOrigin="anonymous"></script>
      </head>
      <body className="font-inter">{children}</body>
    </html>
  )
}
