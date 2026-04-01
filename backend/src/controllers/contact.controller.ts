import { Request, Response } from 'express';
import { emailService } from '../services/email.service';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { catchAsync } from '../utils/catchAsync';

// Branch email mapping
const BRANCH_EMAILS: Record<string, string> = {
  'METFOLD - SUNBURY': 'order@metfoldsm.com.au',
  'METFOLD - MELTON': 'melton@metfoldsm.com.au',
  'METFOLD - PAKENHAM': 'pakenham@metfoldsm.com.au',
  'METFOLD - MOAMA': 'moama@metfoldsm.com.au',
};

const DEFAULT_EMAIL = 'order@metfoldsm.com.au';

/**
 * POST /api/v1/contact
 * Send contact form to the selected branch email
 */
export const submitContactForm = catchAsync(async (req: Request, res: Response) => {
  const { name, email, phone, branch, message } = req.body;

  if (!name || !email || !phone || !branch || !message) {
    throw ApiError.badRequest('Name, email, phone, branch and message are required');
  }

  // Determine recipient email based on branch
  const recipientEmail = branch ? (BRANCH_EMAILS[branch] || DEFAULT_EMAIL) : DEFAULT_EMAIL;

  const subject = `Contact Form: ${name}${branch ? ` — ${branch}` : ''}`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #0074c5, #0c93e7); padding: 24px 32px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px;">New Contact Form Submission</h1>
      </div>
      <div style="padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; font-weight: 600; color: #374151; width: 120px; vertical-align: top;">Name:</td>
            <td style="padding: 10px 0; color: #1f2937;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-weight: 600; color: #374151; vertical-align: top;">Email:</td>
            <td style="padding: 10px 0;"><a href="mailto:${email}" style="color: #0074c5;">${email}</a></td>
          </tr>
          ${phone ? `<tr>
            <td style="padding: 10px 0; font-weight: 600; color: #374151; vertical-align: top;">Phone:</td>
            <td style="padding: 10px 0;"><a href="tel:${phone}" style="color: #0074c5;">${phone}</a></td>
          </tr>` : ''}
          ${branch ? `<tr>
            <td style="padding: 10px 0; font-weight: 600; color: #374151; vertical-align: top;">Branch:</td>
            <td style="padding: 10px 0; color: #1f2937;">${branch}</td>
          </tr>` : ''}
          <tr>
            <td style="padding: 10px 0; font-weight: 600; color: #374151; vertical-align: top;">Message:</td>
            <td style="padding: 10px 0; color: #1f2937; white-space: pre-wrap;">${message}</td>
          </tr>
        </table>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          Sent from Metfold Sheet Metal website contact form
        </p>
      </div>
    </div>
  `;

  await emailService.sendEmail(recipientEmail, subject, html);

  // Also send confirmation to the customer
  const confirmHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #0074c5, #0c93e7); padding: 24px 32px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px;">Thank You, ${name}!</h1>
      </div>
      <div style="padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="color: #374151; font-size: 15px; line-height: 1.6;">
          We have received your message and will get back to you within 24 hours.
        </p>
        ${branch ? `<p style="color: #6b7280; font-size: 14px;">Your enquiry has been sent to <strong>${branch}</strong>.</p>` : ''}
        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
          If urgent, please call us directly at the branch.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">Metfold Sheet Metal — metfoldsm.com.au</p>
      </div>
    </div>
  `;

  await emailService.sendEmail(email, 'Thank you for contacting Metfold Sheet Metal', confirmHtml);

  ApiResponse.success({ res, message: 'Message sent successfully' });
});
