import { Resend } from 'resend';

import type { SendMailOptions } from 'nodemailer';

type ResendEmailPayload = Parameters<Resend['emails']['send']>[0];

// Validate configuration early and log warnings
const requiredEnv = ['RESEND_API_KEY', 'EMAIL_FROM'];
const missing = requiredEnv.filter((k) => !process.env[k]);
if (missing.length) {
  console.warn('[mailer] Missing environment variables:', missing.join(', '));
}

const resend = new Resend(process.env.RESEND_API_KEY || '');

const normalizeTo = (to: SendMailOptions['to']): string[] => {
  if (!to) {
    return [];
  }

  if (Array.isArray(to)) {
    return to.map(String);
  }

  if (typeof to === 'string') {
    return to
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  // Nodemailer also allows address objects; convert to formatted string when possible
  if (typeof to === 'object' && 'address' in to) {
    const name = 'name' in to && to.name ? `${to.name} ` : '';
    return [`${name ? `${name}<${to.address}>` : to.address}`.trim()];
  }

  return [];
};

export const sendMail = async (options: SendMailOptions) => {
  try {
    const from = options.from?.toString() || process.env.EMAIL_FROM;
    const to = normalizeTo(options.to);

    if (!from) {
      throw new Error('Missing "from" address for email.');
    }

    if (!to.length) {
      throw new Error('Missing "to" recipients for email.');
    }

    const hasHtml = typeof options.html === 'string';
    const hasText = typeof options.text === 'string';

    if (!hasHtml && !hasText) {
      throw new Error('Missing email body: provide html or text content.');
    }

    let payload: ResendEmailPayload;

    if (hasHtml) {
      payload = {
        from,
        to,
        subject: options.subject || '(no subject)',
        html: options.html as string,
      };
    } else {
      payload = {
        from,
        to,
        subject: options.subject || '(no subject)',
        text: options.text as string,
      };
    }

    if (hasHtml && hasText) {
      payload.text = options.text as string;
    }

    if (options.replyTo) {
      payload.replyTo = options.replyTo as string | string[];
    }

    const { data, error } = await resend.emails.send(payload);

    if (error) {
      throw error;
    }

    return data;
  } catch (err) {
    console.error('[mailer] Failed to send email', err);
    throw err;
  }
};

export const getTransporter = () => resend;
