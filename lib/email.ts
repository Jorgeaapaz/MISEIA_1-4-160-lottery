import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.MAILHOG_HOST || 'localhost',
  port: Number(process.env.MAIL_PORT) || 1025,
  secure: false,
})

export async function sendMagicLink(email: string, token: string): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  const magicUrl = `${baseUrl}/auth/verify?token=${encodeURIComponent(token)}`

  await transporter.sendMail({
    from: '"Lotería" <noreply@lottery.local>',
    to: email,
    subject: 'Tu enlace de acceso a la Lotería',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Accede a tu cuenta</h2>
        <p>Haz clic en el siguiente enlace para iniciar sesión. El enlace expira en 15 minutos.</p>
        <a href="${magicUrl}" style="display: inline-block; padding: 12px 24px; background: #7c3aed; color: white; text-decoration: none; border-radius: 6px;">
          Iniciar sesión
        </a>
        <p style="margin-top: 16px; color: #666; font-size: 14px;">
          O copia este enlace: ${magicUrl}
        </p>
      </div>
    `,
  })
}

export async function sendWinnerNotification(
  email: string,
  lotteryName: string,
  prizeAmount: number
): Promise<void> {
  const prize = (prizeAmount / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })

  await transporter.sendMail({
    from: '"Lotería" <noreply@lottery.local>',
    to: email,
    subject: `¡Has ganado en ${lotteryName}!`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>¡Enhorabuena, eres el ganador!</h2>
        <p>Has ganado el sorteo <strong>${lotteryName}</strong>.</p>
        <p>El premio de <strong>${prize}</strong> será transferido a tu cuenta bancaria en los próximos días.</p>
      </div>
    `,
  })
}
