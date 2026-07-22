import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export type SendEmailOptions = {
  to: string | string[];
  subject: string;
  html: string;
};

async function sendEmailInternal({ to, subject, html, from }: SendEmailOptions & { from: string }) {
  if (!resend) {
    console.log(`[EMAIL MOCK] From: ${from} | To: Array/String | Subject: ${subject}`);
    return { id: `mock_${Date.now()}` };
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html
    });

    if (error) {
      console.warn("Resend API notice:", error.message);
      return { id: `fallback_${Date.now()}` };
    }

    return data || { id: `sent_${Date.now()}` };
  } catch (error: any) {
    console.warn(`Email dispatch fallback (from ${from}):`, error?.message || error);
    return { id: `fallback_${Date.now()}` };
  }
}

export async function sendTransactionalEmail(options: SendEmailOptions) {
  const fromEmail = process.env.EMAIL_FROM_TRANSACTIONAL || "pedidos@fajasab.com";
  const from = `Fajas AB <${fromEmail}>`;
  return sendEmailInternal({ ...options, from });
}

export async function sendMarketingEmail(options: SendEmailOptions) {
  const fromEmail = process.env.EMAIL_FROM_MARKETING || "hola@fajasab.com";
  const from = `Fajas AB <${fromEmail}>`;
  return sendEmailInternal({ ...options, from });
}

export async function sendSupportEmail(options: SendEmailOptions) {
  const fromEmail = process.env.EMAIL_FROM_SUPPORT || "soporte@fajasab.com";
  const from = `Fajas AB Soporte <${fromEmail}>`;
  return sendEmailInternal({ ...options, from });
}
