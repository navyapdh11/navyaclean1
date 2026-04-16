import nodemailer from 'nodemailer';
import { env } from '../config/env';
import logger from '../middleware/logger';

interface EmailTemplate {
  subject: string;
  html: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    if (env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: parseInt(env.SMTP_PORT),
        secure: env.SMTP_PORT === '465',
        auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
      });
    }
  }

  private getTemplate(template: string, data: Record<string, string>): EmailTemplate {
    const templates: Record<string, EmailTemplate> = {
      welcome: {
        subject: 'Welcome to CleanPro Enterprise!',
        html: `<h1>Welcome ${data.firstName}!</h1><p>Thank you for joining CleanPro Enterprise. We're excited to serve you.</p>`,
      },
      booking_confirmation: {
        subject: 'Your CleanPro booking confirmed for ' + (data.date || 'your service'),
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a73e8;">Booking Confirmed ✓</h1>
            <p>Hi ${data.firstName || 'there'},</p>
            <p>Your <strong>${data.service || 'cleaning service'}</strong> is confirmed for:</p>
            <table style="background: #f0f7ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <tr><td><strong>Date:</strong></td><td>${data.date || 'TBC'}</td></tr>
              <tr><td><strong>Time:</strong></td><td>${data.time || 'TBC'}</td></tr>
              <tr><td><strong>Suburb:</strong></td><td>${data.suburb || ''}</td></tr>
              <tr><td><strong>Cleaner:</strong></td><td>${data.cleanerName || 'TBA'}</td></tr>
            </table>
            <p><strong>Price: ${data.price || ''}</strong></p>
            <p style="color: #666; font-size: 12px;">All prices include GST. Australian Consumer Law guarantees apply.</p>
            <hr style="border: 1px solid #eee; margin: 24px 0;" />
            <p style="color: #999; font-size: 11px;">
              CleanPro Enterprise | ABN 12 345 678 901<br />
              This is a transactional email. No unsubscribe required.
            </p>
          </div>
        `,
      },
      booking_reminder: {
        subject: 'Reminder: Your CleanPro service is tomorrow at ' + (data.time || 'your scheduled time'),
        html: `<h1>Reminder</h1><p>Your cleaning service is scheduled for ${data.date} at ${data.time}.</p><p>Reply to this email or call us if you need to reschedule.</p>`,
      },
      booking_reminder_short: {
        subject: 'Your cleaner arrives in 1 hour',
        html: `<h1>1 Hour Reminder</h1><p>Your CleanPro cleaner will arrive at approximately ${data.time}.</p><p>Please ensure access to your property. See you soon!</p>`,
      },
      payment_receipt: {
        subject: 'Payment receipt - $' + (data.amount || '0') + ' AUD',
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a73e8;">Payment Receipt</h1>
            <p>Thank you for your payment of <strong>$${data.amount} AUD</strong>.</p>
            <p>This receipt confirms your payment. All prices include GST.</p>
            <hr style="border: 1px solid #eee; margin: 24px 0;" />
            <p style="color: #999; font-size: 11px;">
              CleanPro Enterprise | ABN 12 345 678 901<br />
              This is a transactional email. No unsubscribe required.
            </p>
          </div>
        `,
      },
      review_request: {
        subject: 'How did we do, ' + (data.name || 'there') + '? Share your experience',
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a73e8;">How was your ${data.suburb || ''} clean?</h1>
            <p>Hi ${data.name || 'there'},</p>
            <p>We'd love your feedback on your recent ${data.service || 'cleaning'} service. Your review helps us improve and helps other Australians find great cleaners.</p>
            <p style="text-align: center; margin: 24px 0;">
              <a href="${data.reviewLink || '#'}" style="background: #1a73e8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Leave a Review</a>
            </p>
            <p style="color: #666; font-size: 12px;">${data.disclaimer || 'Reviews are voluntary. No incentives offered for positive feedback.'}</p>
            <hr style="border: 1px solid #eee; margin: 24px 0;" />
            <p style="color: #999; font-size: 11px;">
              CleanPro Enterprise | ABN 12 345 678 901<br />
              <a href="${data.unsubscribeLink || '#'}" style="color: #999;">Unsubscribe</a>
            </p>
          </div>
        `,
      },
      password_reset: {
        subject: 'Password Reset Request',
        html: `<h1>Reset Password</h1><p>Click the link to reset your password: ${data.link}</p><p>This link expires in 1 hour.</p>`,
      },
      welcome_series_1: {
        subject: 'Welcome to CleanPro, ' + (data.name || 'there') + '! Here is 10% off your first clean',
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a73e8;">Welcome to CleanPro! 🧹</h1>
            <p>Hi ${data.name || 'there'},</p>
            <p>Thanks for joining CleanPro. Here's <strong>10% off your first clean</strong> — just use code <strong>WELCOME10</strong> at checkout.</p>
            <p style="text-align: center; margin: 24px 0;">
              <a href="${data.bookLink || '/book'}" style="background: #1a73e8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Book Your Clean Now</a>
            </p>
            <hr style="border: 1px solid #eee; margin: 24px 0;" />
            <p style="color: #999; font-size: 11px;">
              CleanPro Enterprise | ABN 12 345 678 901<br />
              <a href="${data.unsubscribeLink || '#'}" style="color: #999;">Unsubscribe</a>
            </p>
          </div>
        `,
      },
      winback_30: {
        subject: 'We miss keeping ' + (data.suburb || 'your area') + ' sparkling!',
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a73e8;">We miss you, ${data.name || 'there'}!</h1>
            <p>It's been a while since your last clean. Here's <strong>10% off your next service</strong> to welcome you back.</p>
            <p style="text-align: center; margin: 24px 0;">
              <a href="${data.bookLink || '/book'}" style="background: #1a73e8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Book Your Next Clean</a>
            </p>
            <hr style="border: 1px solid #eee; margin: 24px 0;" />
            <p style="color: #999; font-size: 11px;">
              CleanPro Enterprise | ABN 12 345 678 901<br />
              <a href="${data.unsubscribeLink || '#'}" style="color: #999;">Unsubscribe</a>
            </p>
          </div>
        `,
      },
      winback_90: {
        subject: 'Your 15% welcome-back offer is expiring soon',
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a73e8;">Last chance, ${data.name || 'there'}!</h1>
            <p>Your <strong>15% discount</strong> expires soon. Don't miss out on a fresh clean.</p>
            <p style="text-align: center; margin: 24px 0;">
              <a href="${data.bookLink || '/book'}" style="background: #1a73e8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Claim Your 15% Off</a>
            </p>
            <hr style="border: 1px solid #eee; margin: 24px 0;" />
            <p style="color: #999; font-size: 11px;">
              CleanPro Enterprise | ABN 12 345 678 901<br />
              <a href="${data.unsubscribeLink || '#'}" style="color: #999;">Unsubscribe</a>
            </p>
          </div>
        `,
      },
      education_bond_checklist: {
        subject: 'Bond-Back Checklist: What your agent really looks for',
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a73e8;">Bond-Back Checklist ✓</h1>
            <p>Hi ${data.name || 'there'},</p>
            <p>Here's the definitive checklist your property manager uses:</p>
            <ul>
              <li>Kitchen: Oven interior, rangehood filters, benchtops, sink</li>
              <li>Bathrooms: Grout, shower screens, taps, mirrors, toilets</li>
              <li>Bedrooms: Built-in wardrobes (interior), windows, skirting</li>
              <li>Living: Carpets (steam cleaned), windowsills, light fixtures</li>
              <li>Laundry: Trough, taps, cupboard interiors</li>
              <li>General: All floors, windows (interior), garage sweep</li>
            </ul>
            <p>Our end-of-lease clean covers every item above with our bond-back guarantee.</p>
            <p style="text-align: center; margin: 24px 0;">
              <a href="${data.bookLink || '/book'}" style="background: #1a73e8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Book End of Lease Clean</a>
            </p>
            <hr style="border: 1px solid #eee; margin: 24px 0;" />
            <p style="color: #999; font-size: 11px;">
              CleanPro Enterprise | ABN 12 345 678 901<br />
              <a href="${data.unsubscribeLink || '#'}" style="color: #999;">Unsubscribe</a>
            </p>
          </div>
        `,
      },
      education_eco: {
        subject: 'The eco-friendly products we use (and why they work better)',
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a73e8;">Why We Go Green 🌿</h1>
            <p>Hi ${data.name || 'there'},</p>
            <p>Our cleaning products are plant-based, biodegradable, and safe around kids and pets. Here's why that matters:</p>
            <ul>
              <li><strong>Equine-based formulas:</strong> Break down naturally without chemical residue</li>
              <li><strong>No synthetic fragrances:</strong> Better for asthma and allergy sufferers</li>
              <li><strong>Concentrated formulas:</strong> Less plastic waste, lower transport emissions</li>
            </ul>
            <p>Same clean. Better for you and the environment.</p>
            <hr style="border: 1px solid #eee; margin: 24px 0;" />
            <p style="color: #999; font-size: 11px;">
              CleanPro Enterprise | ABN 12 345 678 901<br />
              <a href="${data.unsubscribeLink || '#'}" style="color: #999;">Unsubscribe</a>
            </p>
          </div>
        `,
      },
    };
    return templates[template] || { subject: 'CleanPro Enterprise', html: data.message || '' };
  }

  async sendEmail(to: string, template: string, data: Record<string, string>): Promise<boolean> {
    if (!this.transporter) {
      logger.info(`Email would be sent to ${to}: ${template}`);
      return true;
    }

    try {
      const { subject, html } = this.getTemplate(template, data);
      await this.transporter.sendMail({
        from: env.SMTP_FROM || 'noreply@cleanpro.com',
        to,
        subject,
        html,
      });
      logger.info(`Email sent to ${to}: ${template}`);
      return true;
    } catch (error) {
      logger.error(`Email failed to ${to}: ${error}`);
      return false;
    }
  }

  async sendWelcomeEmail(email: string, firstName: string) {
    return this.sendEmail(email, 'welcome', { firstName });
  }

  async sendBookingConfirmation(email: string, service: string, date: string) {
    return this.sendEmail(email, 'booking_confirmation', { service, date });
  }

  async sendPaymentReceipt(email: string, amount: string) {
    return this.sendEmail(email, 'payment_receipt', { amount });
  }
}

export const emailService = new EmailService();
