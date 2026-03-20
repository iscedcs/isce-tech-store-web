import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMail({
  to,
  subject,
  html,
  text,
  from = process.env.FROM_EMAIL_ADDRESS,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}) {
  return resend.emails.send({
    from: from!,
    to,
    subject,
    html,
    text,
  });
}
