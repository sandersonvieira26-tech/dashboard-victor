import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dashboard de Agendamentos',
  description: 'Gerenciamento de agendamentos para profissional de saúde',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-[#0f172a] antialiased">{children}</body>
    </html>
  )
}
