'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useGlobal } from '@/context/GlobalContext'

export default function Navbar() {
  const { user, logout } = useGlobal()
  const pathname = usePathname()
  const router = useRouter()

  function handleLogout() {
    logout()
    router.push('/')
  }

  const navLinks = [
    { href: '/lotteries', label: 'Sorteos' },
    ...(user ? [{ href: '/dashboard', label: 'Mis Boletos' }] : []),
    ...(user?.role === 'admin' ? [{ href: '/admin/lotteries', label: 'Admin' }] : []),
  ]

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(7, 7, 15, 0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(124, 58, 237, 0.15)',
      }}
    >
      {/* Animated gradient line at bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, #7c3aed, #c9a84c, #7c3aed, transparent)',
          backgroundSize: '200% 100%',
          animation: 'nav-border-flow 4s linear infinite',
        }}
      />

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1.25rem',
          display: 'flex',
          alignItems: 'center',
          height: '64px',
          gap: '2rem',
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'baseline', gap: '2px', textDecoration: 'none' }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.6rem',
              fontWeight: 700,
              fontStyle: 'italic',
              background: 'linear-gradient(135deg, #c9a84c, #e6c97a, #c9a84c)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'shimmer 3.5s linear infinite',
              letterSpacing: '-0.02em',
            }}
          >
            Loteri
          </span>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.6rem',
              fontWeight: 700,
              color: '#a855f7',
              letterSpacing: '-0.02em',
            }}
          >
            App
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1 }}>
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: isActive ? '#a855f7' : 'var(--text-muted)',
                  background: isActive ? 'rgba(124, 58, 237, 0.12)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  border: isActive ? '1px solid rgba(124, 58, 237, 0.3)' : '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--text)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--text-muted)'
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user ? (
            <>
              <Link
                href="/profile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent), var(--accent-hi))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#fff',
                    flexShrink: 0,
                  }}
                >
                  {user.name.slice(0, 1).toUpperCase()}
                </span>
                <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ padding: '0.35rem 0.9rem', fontSize: '0.8rem' }}
              >
                Salir
              </button>
            </>
          ) : (
            <Link href="/login" className="btn btn-primary" style={{ padding: '0.4rem 1.1rem', fontSize: '0.85rem' }}>
              Acceder
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
