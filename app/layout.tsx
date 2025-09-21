import './globals.css'

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
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
