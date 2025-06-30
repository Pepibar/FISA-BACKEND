import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,      
  port: process.env.SMTP_PORT,       
  secure: false,                     
  auth: {
    user: process.env.SMTP_USER,    
    pass: process.env.SMTP_PASS,    
  },
});

async function enviarMail({ to, subject, text, html }) {
  const mailOptions = {
    from: `"FISA App" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email enviado:", info.messageId);
  } catch (error) {
    console.error("Error enviando email:", error);
  }
}

export default enviarMail;
