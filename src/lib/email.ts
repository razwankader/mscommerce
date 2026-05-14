import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.EMAIL_FROM || 'Matin Sanitary <onboarding@resend.dev>'

function wrapper(content: string) {
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#111">
      <div style="margin-bottom:24px">
        <span style="font-size:20px;font-weight:800;color:#f97316">Matin Sanitary</span>
      </div>
      ${content}
      <div style="margin-top:32px;padding-top:16px;border-top:1px solid #eee;font-size:11px;color:#999">
        Matin Sanitary · Dhaka, Bangladesh
      </div>
    </div>
  `
}

async function send(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[DEV] Email to ${to} | ${subject}`)
    return
  }
  await resend.emails.send({ from: FROM, to, subject, html: wrapper(html) })
}

export async function sendOtpEmail(email: string, otp: string) {
  await send(email, `${otp} is your Matin Sanitary verification code`, `
    <h2 style="font-size:18px;font-weight:700;margin-bottom:8px">Verify your email</h2>
    <p style="color:#555;font-size:14px;line-height:1.6;margin-bottom:24px">
      Use the code below to verify your email address. It expires in <strong>10 minutes</strong>.
    </p>
    <div style="background:#f9f9f9;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;letter-spacing:8px;font-size:32px;font-weight:800;color:#f97316">
      ${otp}
    </div>
    <p style="color:#999;font-size:12px">If you didn't request this, ignore this email.</p>
  `)
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  await send(email, 'Reset your password — Matin Sanitary', `
    <h2 style="font-size:18px;font-weight:700;margin-bottom:8px">Reset your password</h2>
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
  `)
}

interface OrderItem {
  productName: string
  quantity: number
  price: number
}

interface OrderEmailData {
  orderNumber: string
  firstName: string
  email: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
  address: string
  city: string
}

function formatPrice(n: number) {
  return '৳' + n.toLocaleString('en-BD')
}

function itemsTable(items: OrderItem[]) {
  return items.map(i => `
    <tr>
      <td style="padding:8px 0;font-size:13px;color:#333;border-bottom:1px solid #f3f3f3">${i.productName}</td>
      <td style="padding:8px 0;font-size:13px;color:#555;text-align:center;border-bottom:1px solid #f3f3f3">${i.quantity}</td>
      <td style="padding:8px 0;font-size:13px;color:#111;text-align:right;border-bottom:1px solid #f3f3f3;font-weight:600">${formatPrice(i.price * i.quantity)}</td>
    </tr>
  `).join('')
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  await send(data.email, `Order Confirmed #${data.orderNumber} — Matin Sanitary`, `
    <h2 style="font-size:18px;font-weight:700;margin-bottom:4px">Thank you, ${data.firstName}!</h2>
    <p style="color:#555;font-size:14px;margin-bottom:24px">Your order <strong>#${data.orderNumber}</strong> has been placed and is being processed.</p>

    <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
      <thead>
        <tr>
          <th style="text-align:left;font-size:11px;color:#999;padding-bottom:8px;border-bottom:2px solid #f3f3f3">ITEM</th>
          <th style="text-align:center;font-size:11px;color:#999;padding-bottom:8px;border-bottom:2px solid #f3f3f3">QTY</th>
          <th style="text-align:right;font-size:11px;color:#999;padding-bottom:8px;border-bottom:2px solid #f3f3f3">PRICE</th>
        </tr>
      </thead>
      <tbody>${itemsTable(data.items)}</tbody>
    </table>

    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      <tr>
        <td style="font-size:13px;color:#555;padding:4px 0">Subtotal</td>
        <td style="font-size:13px;color:#111;text-align:right;padding:4px 0">${formatPrice(data.subtotal)}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#555;padding:4px 0">Delivery</td>
        <td style="font-size:13px;color:#111;text-align:right;padding:4px 0">${data.shipping === 0 ? 'Free' : formatPrice(data.shipping)}</td>
      </tr>
      <tr>
        <td style="font-size:15px;font-weight:700;color:#111;padding-top:8px;border-top:2px solid #f3f3f3">Total</td>
        <td style="font-size:15px;font-weight:700;color:#f97316;text-align:right;padding-top:8px;border-top:2px solid #f3f3f3">${formatPrice(data.total)}</td>
      </tr>
    </table>

    <div style="background:#f9f9f9;border-radius:8px;padding:16px;font-size:13px;color:#555;margin-bottom:24px">
      <strong style="color:#111;display:block;margin-bottom:4px">Delivery Address</strong>
      ${data.address}, ${data.city}
    </div>

    <p style="font-size:13px;color:#555">Payment method: <strong>Cash on Delivery</strong></p>
  `)
}

const STATUS_COPY: Record<string, { subject: string; heading: string; body: string; color: string }> = {
  DELIVERED: {
    subject: 'Your order has been delivered',
    heading: 'Order Delivered!',
    body: 'Your order has been delivered successfully. We hope you love your purchase. Thank you for shopping with Matin Sanitary!',
    color: '#16a34a',
  },
  CANCELLED: {
    subject: 'Your order has been cancelled',
    heading: 'Order Cancelled',
    body: 'Your order has been cancelled. If you have any questions or did not request this cancellation, please contact us.',
    color: '#dc2626',
  },
  REFUNDED: {
    subject: 'Your order has been refunded',
    heading: 'Order Refunded',
    body: 'Your order has been refunded. The refund will reflect within 3–7 business days depending on your payment method.',
    color: '#6b7280',
  },
}

export async function sendOrderStatusEmail(email: string, firstName: string, orderNumber: string, status: string) {
  const copy = STATUS_COPY[status]
  if (!copy) return

  await send(email, `${copy.subject} — #${orderNumber}`, `
    <h2 style="font-size:18px;font-weight:700;color:${copy.color};margin-bottom:4px">${copy.heading}</h2>
    <p style="color:#555;font-size:14px;margin-bottom:16px">Hi ${firstName}, your order <strong>#${orderNumber}</strong> status has been updated.</p>
    <p style="font-size:14px;color:#333;line-height:1.6">${copy.body}</p>
  `)
}
