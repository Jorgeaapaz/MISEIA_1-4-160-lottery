'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useGlobal } from '@/context/GlobalContext'
import { LotteryPublic } from '@/lib/types'

function fmtCents(c: number) {
  return (c / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
}
function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function AdminLotteriesPage() {
  const { user, token } = useGlobal()
  const router = useRouter()
  const [lotteries, setLotteries] = useState<LotteryPublic[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [drawLoading, setDrawLoading] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [endDate, setEndDate] = useState('')
  const [prizeAmount, setPrizeAmount] = useState('')
  const [ticketPrice, setTicketPrice] = useState('')
  const [numberOfNumbers, setNumberOfNumbers] = useState('')
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  const fetchLotteries = useCallback(async () => {
    const res = await fetch('/api/lotteries')
    const data = await res.json()
    // Also get completed ones
    setLotteries(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    if (user.role !== 'admin') { router.push('/'); return }
    fetchLotteries()
  }, [user, router, fetchLotteries])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    setFormLoading(true)

    const res = await fetch('/api/lotteries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name,
        endDate,
        prizeAmount: Math.round(parseFloat(prizeAmount) * 100),
        ticketPrice: Math.round(parseFloat(ticketPrice) * 100),
        numberOfNumbers: parseInt(numberOfNumbers),
      }),
    })

    const data = await res.json()
    setFormLoading(false)

    if (!res.ok) { setFormError(data.error); return }

    setShowForm(false)
    setName(''); setEndDate(''); setPrizeAmount(''); setTicketPrice(''); setNumberOfNumbers('')
    fetchLotteries()
  }

  async function handleDraw(id: string) {
    if (!confirm('¿Confirmar la ejecución del sorteo? Esta acción es irreversible.')) return
    setDrawLoading(id)
    const res = await fetch(`/api/lotteries/${id}/draw`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    setDrawLoading(null)
    if (!res.ok) { alert(data.error); return }
    alert(`Sorteo realizado. Número ganador: ${data.winningNumber}. Ganadores: ${data.winners.length}`)
    fetchLotteries()
  }

  if (!user || user.role !== 'admin') return null

  return (
    <div className="page-container">
      <div className="animate-fade-up">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', marginBottom: '0.25rem' }}>
              Gestión de Sorteos
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>Panel de administración</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <a href="/admin/payments" className="btn btn-secondary">Transferencias</a>
            <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
              {showForm ? 'Cancelar' : '+ Nuevo sorteo'}
            </button>
          </div>
        </div>

        {/* Create form */}
        {showForm && (
          <div className="card animate-fade-up" style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: '1.5rem' }}>
              Crear nuevo sorteo
            </h2>
            <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="label">Nombre del sorteo</label>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Gran Sorteo de Primavera" />
              </div>
              <div>
                <label className="label">Fecha y hora del sorteo</label>
                <input className="input" type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
              </div>
              <div>
                <label className="label">Premio (€)</label>
                <input className="input" type="number" step="0.01" min="0.01" value={prizeAmount} onChange={(e) => setPrizeAmount(e.target.value)} required placeholder="500.00" />
              </div>
              <div>
                <label className="label">Precio boleto (€)</label>
                <input className="input" type="number" step="0.01" min="0.01" value={ticketPrice} onChange={(e) => setTicketPrice(e.target.value)} required placeholder="5.00" />
              </div>
              <div>
                <label className="label">Cantidad de números</label>
                <input className="input" type="number" min="2" max="1000" value={numberOfNumbers} onChange={(e) => setNumberOfNumbers(e.target.value)} required placeholder="50" />
              </div>

              {formError && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{formError}</p>
                </div>
              )}
              <div style={{ gridColumn: '1 / -1' }}>
                <button type="submit" disabled={formLoading} className="btn btn-primary">
                  {formLoading ? 'Creando...' : 'Crear sorteo'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lottery list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Cargando...</div>
        ) : lotteries.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>No hay sorteos. Crea el primero.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Nombre', 'Premio', 'Boleto', 'Números', 'Vendidos', 'Fecha', 'Estado', 'Acción'].map((h) => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lotteries.map((l) => (
                  <tr key={l.id} style={{ borderBottom: '1px solid rgba(124,58,237,0.08)' }}>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 500 }}>{l.name}</td>
                    <td style={{ padding: '0.875rem 1rem', color: 'var(--gold-hi)' }}>{fmtCents(l.prizeAmount)}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>{fmtCents(l.ticketPrice)}</td>
                    <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)' }}>0–{l.numberOfNumbers - 1}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>{l.totalTicketsSold}</td>
                    <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>{fmtDate(l.endDate)}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span className={`badge badge-${l.status}`}>
                        {l.status === 'active' ? 'Activo' : l.status === 'pending' ? 'Pendiente' : l.status === 'completed' ? 'Completado' : l.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      {l.status === 'active' && (
                        <button
                          onClick={() => handleDraw(l.id)}
                          disabled={drawLoading === l.id}
                          className="btn btn-gold"
                          style={{ padding: '0.3rem 0.85rem', fontSize: '0.8rem' }}
                        >
                          {drawLoading === l.id ? '...' : 'Sortear'}
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
