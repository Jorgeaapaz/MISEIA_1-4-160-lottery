'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useGlobal } from '@/context/GlobalContext'
import { TicketPublic } from '@/lib/types'

function fmtCents(cents: number) {
  return (cents / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
}

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function DashboardPage() {
  const { user, token } = useGlobal()
  const router = useRouter()
  const [tickets, setTickets] = useState<TicketPublic[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { router.push('/login'); return }

    fetch('/api/users/tickets', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => { setTickets(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [user, token, router])

  if (!user) return null

  return (
    <div className="page-container">
      <div className="animate-fade-up">
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', marginBottom: '0.25rem' }}>
              Mis Boletos
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>Historial de participaciones</p>
          </div>
          <Link href="/lotteries" className="btn btn-gold">
            Comprar boleto
          </Link>
        </div>

        {/* Quick stats */}
        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Total boletos', value: tickets.length },
              { label: 'Ganados', value: tickets.filter((t) => t.status === 'won').length },
              { label: 'En curso', value: tickets.filter((t) => t.status === 'purchased').length },
            ].map((s) => (
              <div key={s.label} className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--accent-hi)' }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Cargando...</div>
        ) : tickets.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎫</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              Aún no tienes boletos
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Participa en un sorteo y pon a prueba tu suerte.
            </p>
            <Link href="/lotteries" className="btn btn-primary">Ver sorteos activos</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {tickets.map((t) => (
              <div key={t.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: t.status === 'won' ? 'rgba(201,168,76,0.15)' : t.status === 'purchased' ? 'rgba(124,58,237,0.12)' : 'rgba(100,100,120,0.15)',
                  border: `1px solid ${t.status === 'won' ? 'rgba(201,168,76,0.35)' : t.status === 'purchased' ? 'rgba(124,58,237,0.3)' : 'rgba(100,100,120,0.2)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  fontSize: '1.2rem',
                }}>
                  {t.status === 'won' ? '🏆' : t.status === 'purchased' ? '🎫' : '❌'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, marginBottom: '0.2rem' }}>{t.lotteryName}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    Números: {t.numbers.join(', ')} · {fmtDate(t.purchaseDate)}
                  </div>
                </div>
                <span className={`badge badge-${t.status}`}>
                  {t.status === 'purchased' ? 'En curso' : t.status === 'won' ? 'Ganado' : 'Perdido'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
