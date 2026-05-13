import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.EMAIL_FROM || 'Matin Sanitary <noreply@matinsanitary.com>'

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[DEV] Password reset link for ${email}: ${resetUrl}`)
    return
  }

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Reset your password — Matin Sanitary',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="font-size:20px;font-weight:700;color:#111;margin-bottom:8px">Reset your password</h2>
        <p style="color:#555;font-size:14px;line-height:1.6;margin-bottom:24px">
          We received a request to reset the password for your Matin Sanitary account.
          Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
        </p>
        <a href="${resetUrl}" style="display:inline-block;background:#f97316;color:#fff;font-weight:600;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none">
          Reset Password
        </a>
        <p style="color:#999;font-size:12px;margin-top:24px">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  })
}
