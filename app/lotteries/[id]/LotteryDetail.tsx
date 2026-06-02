'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGlobal } from '@/context/GlobalContext'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!)

interface LotteryData {
  id: string
  name: string
  endDate: string
  prizeAmount: number
  prizeFormatted: string
  ticketPrice: number
  ticketPriceFormatted: string
  numberOfNumbers: number
  status: string
  totalTicketsSold: number
  winningNumber: number | null
  endDateFormatted: string
  soldNumbers: number[]
}

function CheckoutForm({ lotteryId, selectedNumber, amount, onSuccess }: {
  lotteryId: string
  selectedNumber: number
  amount: number
  onSuccess: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const { token } = useGlobal()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handlePay(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setError('')

    const res = await fetch(`/api/lotteries/${lotteryId}/tickets/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ numbers: [selectedNumber] }),
    })

    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }

    const cardEl = elements.getElement(CardElement)
    if (!cardEl) return

    const { error: stripeErr, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
      payment_method: { card: cardEl },
    })

    if (stripeErr) {
      setError(stripeErr.message || 'Error en el pago')
      setLoading(false)
      return
    }

    if (paymentIntent?.status === 'succeeded') {
      onSuccess()
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handlePay}>
      <div style={{ marginBottom: '1.25rem' }}>
        <label className="label">Datos de tarjeta</label>
        <div style={{
          padding: '0.75rem 0.9rem',
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
        }}>
          <CardElement options={{
            style: {
              base: { color: '#e8e4f0', fontSize: '15px', '::placeholder': { color: '#8a849e' } },
              invalid: { color: '#ef4444' },
            }
          }} />
        </div>
      </div>
      {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}
      <button type="submit" disabled={loading || !stripe} className="btn btn-gold" style={{ width: '100%', padding: '0.75rem' }}>
        {loading ? 'Procesando...' : `Pagar ${(amount / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}`}
      </button>
    </form>
  )
}

export default function LotteryDetail({ lottery }: { lottery: LotteryData }) {
  const soldSet = new Set(lottery.soldNumbers)
  const { user, token } = useGlobal()
  const router = useRouter()
  const [selected, setSelected] = useState<number | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [paid, setPaid] = useState(false)

  const tenMinBefore = new Date(lottery.endDate).getTime() - 10 * 60 * 1000
  const isClosed = lottery.status !== 'active' || Date.now() >= tenMinBefore

  function handleBuy() {
    if (!user) { router.push('/login'); return }
    if (!user.bankAccount) { router.push('/profile'); return }
    setShowPayment(true)
  }

  if (paid) {
    return (
      <div className="page-container" style={{ maxWidth: 560, textAlign: 'center' }}>
        <div className="card animate-fade-up" style={{ padding: '3rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '0.75rem' }}>
            ¡Boleto comprado!
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Número elegido: <strong style={{ color: 'var(--accent-hi)', fontSize: '1.2rem' }}>{selected}</strong>
          </p>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
            El sorteo se realizará el <strong>{lottery.endDateFormatted}</strong>.
            Te notificaremos por email si eres el ganador.
          </p>
          <a href="/dashboard" className="btn btn-primary" style={{ display: 'inline-block' }}>Ver mis boletos</a>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        {/* Left: info */}
        <div className="animate-fade-up">
          <a href="/lotteries" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'inline-flex', gap: '0.35rem', marginBottom: '1.5rem' }}>
            ← Volver a sorteos
          </a>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', marginBottom: '0.75rem' }}>
            {lottery.name}
          </h1>

          {/* Prize */}
          <div style={{
            background: 'rgba(201,168,76,0.06)',
            border: '1px solid rgba(201,168,76,0.22)',
            borderRadius: 'var(--radius)',
            padding: '1.5rem',
            textAlign: 'center',
            marginBottom: '1.5rem',
          }}>
            <div style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.5rem' }}>Premio único</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', fontWeight: 700, color: 'var(--gold-hi)' }}>
              {lottery.prizeFormatted}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[
              { label: 'Precio boleto', value: lottery.ticketPriceFormatted },
              { label: 'Rango números', value: `0 – ${lottery.numberOfNumbers - 1}` },
              { label: 'Boletos vendidos', value: lottery.totalTicketsSold },
              { label: 'Fecha sorteo', value: lottery.endDateFormatted },
            ].map((d) => (
              <div key={d.label} className="card" style={{ padding: '0.875rem' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                  {d.label}
                </div>
                <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>{d.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: ticket purchase */}
        <div className="animate-fade-up-delay-1">
          {isClosed ? (
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>Este sorteo ya no acepta boletos.</p>
            </div>
          ) : showPayment && selected !== null ? (
            <div className="card">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>
                Confirmar pago
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Número seleccionado: <strong style={{ color: 'var(--accent-hi)' }}>{selected}</strong>
              </p>
              <Elements stripe={stripePromise}>
                <CheckoutForm
                  lotteryId={lottery.id}
                  selectedNumber={selected}
                  amount={lottery.ticketPrice}
                  onSuccess={() => setPaid(true)}
                />
              </Elements>
              <button onClick={() => setShowPayment(false)} className="btn btn-secondary" style={{ width: '100%', marginTop: '0.75rem' }}>
                Cambiar número
              </button>
            </div>
          ) : (
            <div className="card">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>
                Elige tu número
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                Selecciona un número entre 0 y {lottery.numberOfNumbers - 1}
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(44px, 1fr))',
                gap: '0.5rem',
                maxHeight: 280,
                overflowY: 'auto',
                marginBottom: '1.25rem',
              }}>
                {Array.from({ length: lottery.numberOfNumbers }, (_, i) => {
                  const isSold = soldSet.has(i)
                  const isSelected = selected === i
                  return (
                    <button
                      key={i}
                      onClick={() => !isSold && setSelected(i)}
                      disabled={isSold}
                      title={isSold ? 'Número ya vendido' : undefined}
                      style={{
                        aspectRatio: '1',
                        borderRadius: '8px',
                        border: isSelected
                          ? '2px solid var(--accent)'
                          : isSold
                          ? '1px solid rgba(100,100,120,0.2)'
                          : '1px solid var(--border)',
                        background: isSelected
                          ? 'rgba(124,58,237,0.2)'
                          : isSold
                          ? 'rgba(60,60,80,0.25)'
                          : 'var(--surface-2)',
                        color: isSelected
                          ? 'var(--accent-hi)'
                          : isSold
                          ? 'rgba(140,132,158,0.4)'
                          : 'var(--text)',
                        fontSize: '0.82rem',
                        fontWeight: isSelected ? 700 : 400,
                        cursor: isSold ? 'not-allowed' : 'pointer',
                        transition: 'all 0.12s ease',
                        textDecoration: isSold ? 'line-through' : 'none',
                      }}
                    >
                      {i}
                    </button>
                  )
                })}
              </div>

              {selected !== null && (
                <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Número elegido: <strong style={{ color: 'var(--accent-hi)', fontSize: '1rem' }}>{selected}</strong>
                </p>
              )}

              <button
                onClick={handleBuy}
                disabled={selected === null}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem', opacity: selected === null ? 0.5 : 1 }}
              >
                {user ? 'Continuar con el pago' : 'Inicia sesión para comprar'}
              </button>

              {!user?.bankAccount && user && (
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.75rem' }}>
                  Necesitas agregar tu <a href="/profile" style={{ color: 'var(--accent-hi)' }}>cuenta bancaria</a> primero.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
