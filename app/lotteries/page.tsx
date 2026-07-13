import Link from 'next/link'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/db'
import { Lottery, Ticket } from '@/lib/types'

function fmtCents(cents: number) {
  return (cents / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
}

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function timeLeft(endDate: Date): string {
  const diff = new Date(endDate).getTime() - Date.now()
  if (diff <= 0) return 'Sorteo realizado'
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

export default async function LotteriesPage() {
  const db = await getDb()
  const lotteries = await db
    .collection<Lottery>('lotteries')
    .find({ status: { $in: ['pending', 'active'] } })
    .sort({ endDate: 1 })
    .toArray()

  const soldCounts = await db
    .collection<Ticket>('tickets')
    .aggregate<{ _id: ObjectId; count: number }>([
      { $match: { lotteryId: { $in: lotteries.map((l) => l._id!) } } },
      { $group: { _id: '$lotteryId', count: { $sum: 1 } } },
    ])
    .toArray()

  const soldByLottery = new Map(soldCounts.map((s) => [s._id.toString(), s.count]))

  return (
    <div className="page-container">
      <div className="animate-fade-up">
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            Sorteos Activos
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Selecciona un sorteo y compra tu boleto antes de que cierre.
          </p>
        </div>

        {lotteries.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎲</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              No hay sorteos activos
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>Vuelve pronto para participar en los próximos sorteos.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {lotteries.map((l) => (
              <Link
                key={l._id!.toString()}
                href={`/lotteries/${l._id!.toString()}`}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <div className="card" style={{ height: '100%', cursor: 'pointer' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                    <span className={`badge badge-${l.status}`}>
                      {l.status === 'active' ? 'Activo' : 'Próximo'}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {timeLeft(l.endDate)} restantes
                    </span>
                  </div>

                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text)' }}>
                    {l.name}
                  </h2>

                  {/* Prize */}
                  <div style={{
                    background: 'rgba(201,168,76,0.06)',
                    border: '1px solid rgba(201,168,76,0.2)',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '1.25rem',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.25rem' }}>Premio</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--gold-hi)' }}>
                      {fmtCents(l.prizeAmount)}
                    </div>
                  </div>

                  {/* Details */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    {[
                      { label: 'Precio boleto', value: fmtCents(l.ticketPrice) },
                      { label: 'Números', value: `0 – ${l.numberOfNumbers - 1}` },
                      { label: 'Boletos vendidos', value: soldByLottery.get(l._id!.toString()) ?? 0 },
                      { label: 'Sorteo', value: fmtDate(l.endDate) },
                    ].map((d) => (
                      <div key={d.label}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.15rem' }}>
                          {d.label}
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{d.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="btn btn-primary" style={{ width: '100%', textAlign: 'center', padding: '0.6rem' }}>
                    Comprar boleto →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
