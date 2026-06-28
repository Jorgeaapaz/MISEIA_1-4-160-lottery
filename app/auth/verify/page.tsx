'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useGlobal } from '@/context/GlobalContext'
import { Suspense } from 'react'

function VerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useGlobal()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [message, setMessage] = useState('')
  const hasVerified = useRef(false)

  useEffect(() => {
    // Prevent double-invocation from React 18 Strict Mode
    if (hasVerified.current) return
    hasVerified.current = true

    const token = searchParams.get('token')
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus('error')
      setMessage('Token no encontrado en la URL.')
      return
    }

    async function verify() {
      const res = await fetch('/api/auth/verify-magiclink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
        setMessage(data.error || 'El enlace es inválido o ha expirado.')
        return
      }

      login(data.jwt, data.user)
      setStatus('success')

      setTimeout(() => {
        if (!data.user.bankAccount) {
          router.push('/profile')
        } else {
          router.push('/dashboard')
        }
      }, 1200)
    }

    verify()
  }, [searchParams, login, router])

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
    }}>
      <div className="card animate-fade-up" style={{ maxWidth: 420, width: '100%', textAlign: 'center', padding: '3rem 2rem' }}>
        {status === 'verifying' && (
          <>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              border: '3px solid var(--accent)',
              borderTopColor: 'transparent',
              margin: '0 auto 1.5rem',
              animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem' }}>Verificando enlace...</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Un momento por favor</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(34, 197, 94, 0.12)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem', fontSize: '1.5rem',
            }}>
              ✓
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem' }}>¡Bienvenido!</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Redirigiendo...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem', fontSize: '1.5rem',
            }}>
              ✕
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem' }}>Enlace inválido</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>{message}</p>
            <a href="/login" className="btn btn-primary" style={{ display: 'inline-block' }}>
              Solicitar nuevo enlace
            </a>
          </>
        )}
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  )
}
