'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useGlobal } from '@/context/GlobalContext'

interface Transfer {
  id: string
  userId: string
  lotteryId: string
  amount: number
  status: string
  bankTransferId: string
  transactionDate: string | null
  createdAt: string
}

function fmtCents(c: number) {
  return (c / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
}
function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminPaymentsPage() {
  const { user, token, isLoading: authLoading } = useGlobal()
  const router = useRouter()
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const fetchTransfers = useCallback(async () => {
    const res = await fetch('/api/payments/transfer', { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setTransfers(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [token])

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }
    if (user.role !== 'admin') { router.push('/'); return }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTransfers()
  }, [user, router, fetchTransfers, authLoading])

  async function handleTransfer(id: string) {
    if (!confirm('¿Confirmar la transferencia bancaria?')) return
    setProcessingId(id)

    const res = await fetch('/api/payments/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ transferId: id }),
    })

    const data = await res.json()
    setProcessingId(null)

    if (!res.ok) { alert(data.error); return }
    fetchTransfers()
  }

  if (!user || user.role !== 'admin') return null

  const pending = transfers.filter((t) => t.status === 'pending')
  const completed = transfers.filter((t) => t.status === 'completed')

  return (
    <div className="page-container">
      <div className="animate-fade-up">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', marginBottom: '0.25rem' }}>
              Transferencias de Premio
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>Gestiona los pagos a ganadores</p>
          </div>
          <a href="/admin/lotteries" className="btn btn-secondary">← Sorteos</a>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Pendientes', value: pending.length, color: 'var(--gold-hi)' },
            { label: 'Completadas', value: completed.length, color: 'var(--success)' },
            { label: 'Total', value: transfers.length, color: 'var(--accent-hi)' },
          ].map((s) => (
            <div key={s.label} className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: s.color }}>
                {s.value}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Cargando...</div>
        ) : transfers.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>No hay transferencias aún.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Ganador (userId)', 'Lotería (id)', 'Monto', 'Estado', 'Fecha', 'Ref. Bancaria', 'Acción'].map((h) => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transfers.map((t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid rgba(124,58,237,0.08)' }}>
                    <td style={{ padding: '0.875rem 1rem', fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {t.userId.slice(-8)}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {t.lotteryId.slice(-8)}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: 'var(--gold-hi)', fontWeight: 600 }}>
                      {fmtCents(t.amount)}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span className={`badge ${t.status === 'completed' ? 'badge-active' : 'badge-pending'}`}>
                        {t.status === 'completed' ? 'Completada' : 'Pendiente'}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {fmtDate(t.transactionDate)}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {t.bankTransferId || '—'}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      {t.status === 'pending' && (
                        <button
                          onClick={() => handleTransfer(t.id)}
                          disabled={processingId === t.id}
                          className="btn btn-gold"
                          style={{ padding: '0.3rem 0.85rem', fontSize: '0.8rem' }}
                        >
                          {processingId === t.id ? '...' : 'Transferir'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
