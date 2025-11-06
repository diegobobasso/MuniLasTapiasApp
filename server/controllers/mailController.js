import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configuración del transporte SMTP
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,       // ej: 'smtp.gmail.com'
  port: process.env.MAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,     // ej: 'municipalidad@gmail.com'
    pass: process.env.MAIL_PASS      // ej: 'clave_app'
  }
});

// Función para enviar correo
export const enviarCorreo = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Municipalidad" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html
    });

    return { ok: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error al enviar correo:', error);
    return { ok: false, error: error.message };
  }
};
