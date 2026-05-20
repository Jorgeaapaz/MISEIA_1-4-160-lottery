'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGlobal } from '@/context/GlobalContext'

export default function ProfilePage() {
  const { user, token, login } = useGlobal()
  const router = useRouter()

  const [name, setName] = useState('')
  const [iban, setIban] = useState('')
  const [accountHolder, setAccountHolder] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [bankCode, setBankCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    setName(user.name)
    if (user.bankAccount) {
      setIban(user.bankAccount.iban)
      setAccountHolder(user.bankAccount.accountHolder)
      setAccountNumber(user.bankAccount.accountNumber)
      setBankCode(user.bankAccount.bankCode)
    }
  }, [user, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    setSuccess(false)

    const res = await fetch('/api/users/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, bankAccount: { accountHolder, accountNumber, bankCode, iban } }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setError(data.error || 'Error al guardar'); return }

    login(token!, data.user)
    setSuccess(true)
  }

  if (!user) return null

  return (
    <div className="page-container" style={{ maxWidth: 640 }}>
      <div className="animate-fade-up">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', marginBottom: '0.5rem' }}>
          Mi Perfil
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Completa tu cuenta bancaria para poder recibir premios.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Personal */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '1.25rem' }}>
              Datos personales
            </h2>
            <div>
              <label className="label" htmlFor="name">Nombre completo</label>
              <input
                id="name"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <label className="label">Correo electrónico</label>
              <input className="input" value={user.email} disabled style={{ opacity: 0.5 }} />
            </div>
          </div>

          {/* Bank account */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '1.25rem' }}>
              Cuenta bancaria
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Necesaria para recibir el premio en caso de ganar.
            </p>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label className="label" htmlFor="holder">Titular de la cuenta</label>
                <input id="holder" className="input" value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)} required placeholder="Nombre y apellidos" />
              </div>
              <div>
                <label className="label" htmlFor="iban">IBAN</label>
                <input id="iban" className="input" value={iban}
                  onChange={(e) => setIban(e.target.value)} required placeholder="ES00 0000 0000 0000 0000 0000" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="label" htmlFor="accnum">Número de cuenta</label>
                  <input id="accnum" className="input" value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)} required placeholder="0000000000" />
                </div>
                <div>
                  <label className="label" htmlFor="bankcode">Código de banco</label>
                  <input id="bankcode" className="input" value={bankCode}
                    onChange={(e) => setBankCode(e.target.value)} required placeholder="0000" />
                </div>
              </div>
            </div>
          </div>

          {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}
          {success && <p style={{ color: 'var(--success)', fontSize: '0.85rem', marginBottom: '1rem' }}>Perfil actualizado correctamente.</p>}

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  )
}
