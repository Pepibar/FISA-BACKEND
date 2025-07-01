import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function enviarMail(to, subject, html) {
  if (!to) throw new Error("No se especificó destinatario");

  const mailOptions = {
    from: `"FISA" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  };

  return transporter.sendMail(mailOptions);
}

export default enviarMail;
