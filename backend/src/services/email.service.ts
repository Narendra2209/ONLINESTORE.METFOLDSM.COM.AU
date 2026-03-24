import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST || 'smtp.gmail.com',
  port: env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

const fromEmail = env.EMAIL_FROM || 'no-reply@metfold.com.au';
const storeName = 'Metfold Industries';

export const emailService = {
  async sendEmail(to: string, subject: string, html: string) {
    try {
      await transporter.sendMail({
        from: `${storeName} <${fromEmail}>`,
        to,
        subject,
        html,
      });
      logger.info(`Email sent to ${to}: ${subject}`);
    } catch (err) {
      logger.error(`Failed to send email to ${to}: ${err}`);
    }
  },

  async sendOrderConfirmation(email: string, order: any) {
    const itemsHtml = order.items
      .map(
        (item: any) =>
          `<tr>
            <td style="padding:8px;border-bottom:1px solid #eee;">${item.name}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">$${item.lineTotal.toFixed(2)}</td>
          </tr>`
      )
      .join('');

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#1a1a2e;color:white;padding:20px;text-align:center;">
          <h1 style="margin:0;font-size:24px;">METFOLD</h1>
        </div>
        <div style="padding:30px;">
          <h2 style="color:#333;">Order Confirmation</h2>
          <p>Thank you for your order! Your order number is <strong>${order.orderNumber}</strong>.</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0;">
            <thead>
              <tr style="background:#f5f5f5;">
                <th style="padding:8px;text-align:left;">Item</th>
                <th style="padding:8px;text-align:center;">Qty</th>
                <th style="padding:8px;text-align:right;">Total</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div style="text-align:right;margin-top:10px;">
            <p>Subtotal: <strong>$${order.subtotal.toFixed(2)}</strong></p>
            <p>GST: <strong>$${order.taxAmount.toFixed(2)}</strong></p>
            ${order.shippingCost > 0 ? `<p>Shipping: <strong>$${order.shippingCost.toFixed(2)}</strong></p>` : ''}
            <p style="font-size:18px;">Total: <strong>$${order.total.toFixed(2)}</strong></p>
          </div>
          <p style="color:#666;margin-top:20px;">We'll send you another email when your order ships.</p>
        </div>
        <div style="background:#f5f5f5;padding:15px;text-align:center;font-size:12px;color:#888;">
          <p>${storeName} | sales@metfold.com.au</p>
        </div>
      </div>
    `;

    await this.sendEmail(email, `Order Confirmed - ${order.orderNumber}`, html);
  },

  async sendOrderStatusUpdate(email: string, orderNumber: string, status: string) {
    const statusMessages: Record<string, string> = {
      confirmed: 'Your order has been confirmed and is being prepared.',
      processing: 'Your order is now being processed.',
      shipped: 'Great news! Your order has been shipped.',
      delivered: 'Your order has been delivered.',
      cancelled: 'Your order has been cancelled.',
    };

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#1a1a2e;color:white;padding:20px;text-align:center;">
          <h1 style="margin:0;font-size:24px;">METFOLD</h1>
        </div>
        <div style="padding:30px;">
          <h2 style="color:#333;">Order Update</h2>
          <p>Your order <strong>${orderNumber}</strong> status has been updated to: <strong style="text-transform:capitalize;">${status}</strong></p>
          <p>${statusMessages[status] || ''}</p>
          <p style="color:#666;margin-top:20px;">If you have any questions, please contact us at sales@metfold.com.au</p>
        </div>
        <div style="background:#f5f5f5;padding:15px;text-align:center;font-size:12px;color:#888;">
          <p>${storeName}</p>
        </div>
      </div>
    `;

    await this.sendEmail(email, `Order ${orderNumber} - Status Update: ${status}`, html);
  },

  async sendWelcomeEmail(email: string, firstName: string) {
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#1a1a2e;color:white;padding:20px;text-align:center;">
          <h1 style="margin:0;font-size:24px;">METFOLD</h1>
        </div>
        <div style="padding:30px;">
          <h2 style="color:#333;">Welcome to Metfold Industries!</h2>
          <p>Hi ${firstName},</p>
          <p>Thank you for creating an account with us. We're Australia's trusted supplier of quality sheet metal and roofing products.</p>
          <p>Browse our range of Colorbond roofing, cladding, guttering, and accessories — all cut to your specifications.</p>
          <a href="${env.CORS_ORIGIN}/products" style="display:inline-block;background:#dc2626;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;margin:20px 0;">Shop Now</a>
        </div>
        <div style="background:#f5f5f5;padding:15px;text-align:center;font-size:12px;color:#888;">
          <p>${storeName} | sales@metfold.com.au</p>
        </div>
      </div>
    `;

    await this.sendEmail(email, `Welcome to ${storeName}!`, html);
  },

  async sendPasswordResetEmail(email: string, resetToken: string) {
    const resetUrl = `${env.CORS_ORIGIN}/reset-password?token=${resetToken}`;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#1a1a2e;color:white;padding:20px;text-align:center;">
          <h1 style="margin:0;font-size:24px;">METFOLD</h1>
        </div>
        <div style="padding:30px;">
          <h2 style="color:#333;">Reset Your Password</h2>
          <p>You requested a password reset. Click the button below to set a new password:</p>
          <a href="${resetUrl}" style="display:inline-block;background:#dc2626;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;margin:20px 0;">Reset Password</a>
          <p style="color:#666;font-size:14px;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
        </div>
        <div style="background:#f5f5f5;padding:15px;text-align:center;font-size:12px;color:#888;">
          <p>${storeName}</p>
        </div>
      </div>
    `;

    await this.sendEmail(email, 'Password Reset Request', html);
  },

  async sendOtpEmail(email: string, otp: string, firstName: string) {
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#1a1a2e;color:white;padding:20px;text-align:center;">
          <h1 style="margin:0;font-size:24px;">METFOLD</h1>
        </div>
        <div style="padding:30px;text-align:center;">
          <h2 style="color:#333;">Verify Your Email</h2>
          <p>Hi ${firstName},</p>
          <p>Use the following code to verify your email address and complete your registration:</p>
          <div style="margin:30px 0;">
            <span style="font-size:36px;font-weight:bold;letter-spacing:8px;background:#f5f5f5;padding:16px 32px;border-radius:12px;color:#1a1a2e;">${otp}</span>
          </div>
          <p style="color:#666;font-size:14px;">This code expires in <strong>10 minutes</strong>.</p>
          <p style="color:#666;font-size:14px;">If you didn't request this, please ignore this email.</p>
        </div>
        <div style="background:#f5f5f5;padding:15px;text-align:center;font-size:12px;color:#888;">
          <p>${storeName} | sales@metfold.com.au</p>
        </div>
      </div>
    `;

    await this.sendEmail(email, `${otp} - Your Metfold Verification Code`, html);
  },

  async sendTradeAccountApproved(email: string, firstName: string) {
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#1a1a2e;color:white;padding:20px;text-align:center;">
          <h1 style="margin:0;font-size:24px;">METFOLD</h1>
        </div>
        <div style="padding:30px;">
          <h2 style="color:#333;">Trade Account Approved!</h2>
          <p>Hi ${firstName},</p>
          <p>Your trade account has been approved. You now have access to trade pricing and exclusive products.</p>
          <a href="${env.CORS_ORIGIN}/products" style="display:inline-block;background:#dc2626;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;margin:20px 0;">Shop with Trade Pricing</a>
        </div>
        <div style="background:#f5f5f5;padding:15px;text-align:center;font-size:12px;color:#888;">
          <p>${storeName}</p>
        </div>
      </div>
    `;

    await this.sendEmail(email, 'Trade Account Approved', html);
  },
};
