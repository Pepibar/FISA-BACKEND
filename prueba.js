import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const testSMTP = async (req, res) => {
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
    const info = await transporter.sendMail({
      from: `"FISA App" <${process.env.SMTP_USER}>`,
      to: "felipebargros@gmail.com",  // Cambia por tu email si querés
      subject: "Prueba de SMTP FISA",
      html: `<h1>Funciona ✅</h1><p>Este es un email de prueba de FISA 🚀</p>`,
    });

    console.log("📧 Email enviado:", info.messageId);

    res.status(200).json({
      mensaje: "Email enviado correctamente",
      id: info.messageId,
    });

  } catch (error) {
    console.error("❌ Error enviando email:", error);
    res.status(500).json({ error: "Error enviando email", detalle: error.message });
  }
};

export default testSMTP;