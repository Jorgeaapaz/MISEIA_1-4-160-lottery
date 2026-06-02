'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useGlobal } from '@/context/GlobalContext'

interface TicketRow {
  id: string
  lotteryId: string
  lotteryName: string
  lotteryStatus: string
  lotteryEndDate: string | null
  lotteryPrizeAmount: number
  numbers: number[]
  purchaseDate: string
  status: 'purchased' | 'won' | 'lost'
}

interface LotteryGroup {
  lotteryId: string
  lotteryName: string
  lotteryStatus: string
  lotteryEndDate: string | null
  lotteryPrizeAmount: number
  tickets: TicketRow[]
}

function fmtCents(cents: number) {
  return (cents / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
}

function fmtDate(d: string | Date) {
  return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

const STATUS_LABEL: Record<string, string> = {
  purchased: 'En curso',
  won: 'Ganado',
  lost: 'Perdido',
}

const LOTTERY_STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  active: 'Activo',
  drawing: 'Sorteando',
  completed: 'Completado',
  cancelled: 'Cancelado',
}

function groupByLottery(tickets: TicketRow[]): LotteryGroup[] {
  const map = new Map<string, LotteryGroup>()
  for (const t of tickets) {
    if (!map.has(t.lotteryId)) {
      map.set(t.lotteryId, {
        lotteryId: t.lotteryId,
        lotteryName: t.lotteryName,
        lotteryStatus: t.lotteryStatus,
        lotteryEndDate: t.lotteryEndDate,
        lotteryPrizeAmount: t.lotteryPrizeAmount,
        tickets: [],
      })
    }
    map.get(t.lotteryId)!.tickets.push(t)
  }
  return Array.from(map.values())
}

export default function DashboardPage() {
  const { user, token, isLoading: authLoading } = useGlobal()
  const router = useRouter()
  const [tickets, setTickets] = useState<TicketRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }

    fetch('/api/users/tickets', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => { setTickets(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [user, token, router, authLoading])

  if (authLoading || !user) return null

  const groups = groupByLottery(tickets)

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
        ) : groups.length === 0 ? (
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
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {groups.map((group) => {
              const hasWinner = group.tickets.some((t) => t.status === 'won')
              const isCompleted = group.lotteryStatus === 'completed'
              return (
                <div key={group.lotteryId} className="card" style={{ padding: '1.5rem' }}>
                  {/* Lottery header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 600 }}>
                          {group.lotteryName}
                        </span>
                        <span style={{
                          fontSize: '0.68rem',
                          padding: '0.15rem 0.55rem',
                          borderRadius: '999px',
                          fontWeight: 600,
                          letterSpacing: '0.04em',
                          background: isCompleted ? 'rgba(100,100,120,0.18)' : 'rgba(124,58,237,0.14)',
                          color: isCompleted ? 'var(--text-muted)' : 'var(--accent-hi)',
                          border: `1px solid ${isCompleted ? 'rgba(100,100,120,0.2)' : 'rgba(124,58,237,0.25)'}`,
                        }}>
                          {LOTTERY_STATUS_LABEL[group.lotteryStatus] ?? group.lotteryStatus}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {group.lotteryEndDate && (
                          <span>Sorteo: {fmtDate(group.lotteryEndDate)}</span>
                        )}
                        <span>Premio: {fmtCents(group.lotteryPrizeAmount)}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {group.tickets.length} {group.tickets.length === 1 ? 'boleto' : 'boletos'}
                    </div>
                  </div>

                  {/* Tickets list */}
                  <div style={{ display: 'grid', gap: '0.6rem' }}>
                    {group.tickets.map((t) => (
                      <div key={t.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-sm)',
                        background: t.status === 'won'
                          ? 'rgba(201,168,76,0.07)'
                          : t.status === 'purchased'
                          ? 'rgba(124,58,237,0.06)'
                          : 'rgba(60,60,80,0.18)',
                        border: `1px solid ${t.status === 'won' ? 'rgba(201,168,76,0.2)' : t.status === 'purchased' ? 'rgba(124,58,237,0.18)' : 'rgba(100,100,120,0.15)'}`,
                        flexWrap: 'wrap',
                      }}>
                        <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>
                          {t.status === 'won' ? '🏆' : t.status === 'purchased' ? '🎫' : '❌'}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: '0.1rem' }}>
                            {t.numbers.length === 1
                              ? `Número ${t.numbers[0]}`
                              : `Números: ${t.numbers.join(', ')}`}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Comprado el {fmtDate(t.purchaseDate)}
                          </div>
                        </div>
                        <span className={`badge badge-${t.status}`} style={{ flexShrink: 0 }}>
                          {STATUS_LABEL[t.status]}
                        </span>
                      </div>
                    ))}
                  </div>

                  {hasWinner && (
                    <div style={{ marginTop: '1rem', padding: '0.65rem 1rem', borderRadius: 'var(--radius-sm)', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', fontSize: '0.82rem', color: 'var(--gold-hi)', fontWeight: 500 }}>
                      ¡Felicidades! Tienes un boleto ganador en este sorteo.
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
