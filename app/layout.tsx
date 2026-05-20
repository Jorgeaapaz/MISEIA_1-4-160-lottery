import type { Metadata } from 'next'
import './globals.css'
import { GlobalProvider } from '@/context/GlobalContext'
import Navbar from './components/Navbar'

export const metadata: Metadata = {
  title: 'LoteriApp — Sorteos Online',
  description: 'Participa en sorteos exclusivos y gana increíbles premios.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" style={{ height: '100%' }}>
      <body style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
        <GlobalProvider>
          <Navbar />
          <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
            {children}
          </main>
          <footer
            style={{
              borderTop: '1px solid var(--border)',
              padding: '1.5rem 1.25rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              fontFamily: 'var(--font-body)',
              position: 'relative',
              zIndex: 1,
            }}
          >
            © {new Date().getFullYear()} LoteriApp · Todos los derechos reservados
          </footer>
        </GlobalProvider>
      </body>
    </html>
  )
}
