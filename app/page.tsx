import Link from 'next/link'

export default function HomePage() {
  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 1.25rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow orbs */}
      <div style={{
        position: 'absolute', top: '15%', left: '20%',
        width: 480, height: 480,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '15%',
        width: 320, height: 320,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ textAlign: 'center', maxWidth: 680, position: 'relative', zIndex: 1 }}>
        <p
          className="animate-fade-up"
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            marginBottom: '1.5rem',
          }}
        >
          Sorteos Exclusivos Online
        </p>

        <h1
          className="animate-fade-up-delay-1"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(3rem, 8vw, 5.5rem)',
            fontWeight: 700,
            lineHeight: 1.05,
            marginBottom: '1.5rem',
            color: 'var(--text)',
          }}
        >
          Tu suerte{' '}
          <span className="text-shimmer">comienza aquí</span>
        </h1>

        <p
          className="animate-fade-up-delay-2"
          style={{
            fontSize: '1.1rem',
            color: 'var(--text-muted)',
            lineHeight: 1.7,
            marginBottom: '3rem',
            maxWidth: 520,
            margin: '0 auto 3rem',
          }}
        >
          Participa en sorteos con un único número ganador.
          Compra tu boleto, elige tu número y espera el sorteo.
          El premio va directo a tu cuenta bancaria.
        </p>

        <div
          className="animate-fade-up-delay-3"
          style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <Link href="/lotteries" className="btn btn-gold" style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>
            Ver Sorteos Activos
          </Link>
          <Link href="/login" className="btn btn-secondary" style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>
            Iniciar Sesión
          </Link>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: 'flex',
            gap: '3rem',
            justifyContent: 'center',
            marginTop: '5rem',
            paddingTop: '3rem',
            borderTop: '1px solid var(--border)',
            flexWrap: 'wrap',
          }}
        >
          {[
            { value: '100%', label: 'Pago garantizado' },
            { value: '< 10m', label: 'Límite de compra' },
            { value: '1', label: 'Número ganador' },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.2rem',
                fontWeight: 700,
                color: 'var(--accent-hi)',
                lineHeight: 1,
                marginBottom: '0.35rem',
              }}>
                {s.value}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
