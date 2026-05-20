'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/auth/request-magiclink', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Error al enviar el enlace')
      return
    }

    setSent(true)
  }

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.25rem',
        position: 'relative',
      }}
    >
      <div style={{
        position: 'absolute', top: '20%', right: '25%',
        width: 350, height: 350,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div
        className="animate-fade-up"
        style={{
          width: '100%',
          maxWidth: 420,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.5rem',
            fontWeight: 700,
            marginBottom: '0.5rem',
          }}>
            Accede a tu cuenta
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Recibirás un enlace mágico en tu correo
          </p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{
                width: 56, height: 56,
                borderRadius: '50%',
                background: 'rgba(34, 197, 94, 0.12)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.25rem',
                fontSize: '1.5rem',
              }}>
                ✉️
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '0.75rem' }}>
                ¡Revisa tu correo!
              </h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Hemos enviado un enlace de acceso a{' '}
                <strong style={{ color: 'var(--text)' }}>{email}</strong>.
                El enlace expira en 15 minutos.
              </p>
              <button
                onClick={() => { setSent(false); setEmail('') }}
                className="btn btn-secondary"
                style={{ marginTop: '1.5rem', width: '100%' }}
              >
                Usar otro correo
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="label" htmlFor="email">Correo electrónico</label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              {error && (
                <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem' }}
              >
                {loading ? 'Enviando...' : 'Enviar enlace mágico'}
              </button>
            </form>
          )}
        </div>

        <p style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
        }}>
          Sin contraseñas · Acceso seguro · Magic Link
        </p>
      </div>
    </div>
  )
}
