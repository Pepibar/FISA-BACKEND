import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

async function testSMTP() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    let info = await transporter.sendMail({
      from: `"Test FISA" <${process.env.SMTP_USER}>`,
      to: "felipebargros@gmail.com", // pon tu mail aquí para probar
      subject: "Prueba de SMTP FISA",
      text: "Este es un email de prueba para verificar la configuración SMTP",
    });
    console.log("Email enviado correctamente:", info.messageId);
  } catch (error) {
    console.error("Error enviando email:", error);
  }
}

testSMTP();