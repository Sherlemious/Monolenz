import { Logger } from '../../utils/logger';

const logger = new Logger('Mailer');

export async function sendAuthEmail(to: string, subject: string, text: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.AUTH_FROM_EMAIL || 'Monolenz <noreply@monolenz.sherlemious.com>';

  if (!apiKey) {
    logger.warn('RESEND_API_KEY is not set; skipping email send', { to, subject });
    return false;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: [to], subject, text }),
  });

  if (!res.ok) {
    const body = await res.text();
    logger.error('Failed to send email', { error: new Error(body) });
    return false;
  }

  return true;
}
