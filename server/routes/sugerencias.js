import express from 'express';
import {
  getSugerencias,
  createSugerencia,
  responderSugerencia,
  deleteSugerencia
} from '../controllers/sugerenciasController.js';

const router = express.Router();

// Obtener todas las sugerencias
router.get('/', getSugerencias);

// Crear una nueva sugerencia
router.post('/', createSugerencia);

// Responder una sugerencia
router.put('/:id/responder', responderSugerencia);

// Eliminar una sugerencia
router.delete('/:id', deleteSugerencia);

export default router;



/*********************************************************
 * 
 * version anterior de sugerencias.js
 * 
 

import express from 'express';
import nodemailer from 'nodemailer';
import mysql from 'mysql2/promise';

const router = express.Router();

// Configuración de MySQL
const db = await mysql.createConnection({
  host: 'localhost',
  user: 'Diego',
  password: '1234*',
  database: 'municipalidad'
});

// Configuración de nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'diego.marcospaz@gmail.com',
    pass: 'jitfxbioznhbmcju'
  }
});

router.post('/', async (req, res) => {
  const { nombre, email, mensaje, honeypot } = req.body;

  // Validación de SPAM
  if (honeypot) {
    console.warn('Intento de spam detectado');
    return res.status(400).json({ error: 'Detección de spam.' });
  }


  // Validación básica
  if (!nombre || !email || !mensaje) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  // Validación de longitud del mensaje
  if (mensaje.length < 20 || mensaje.length > 5000) {
    return res.status(400).json({
      error: 'El mensaje debe tener entre 20 y 5000 caracteres.'
    });
  }

  try {
    // Guardar en la base de datos
    await db.execute(
      'INSERT INTO sugerencias (nombre, email, mensaje) VALUES (?, ?, ?)',
      [nombre, email, mensaje]
    );

    // Enviar correo
    const mailOptions = {
      from: email,
      to: 'diego.marcospaz@gmail.com',
      subject: `Sugerencia de ${nombre}`,
      text: mensaje
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'Sugerencia enviada correctamente.' });
  } catch (error) {
    console.error('Error al procesar sugerencia:', error);
    res.status(500).json({ success: false, message: 'Error al procesar la sugerencia.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, nombre, email, mensaje, fecha FROM sugerencias ORDER BY fecha DESC'
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener sugerencias:', error);
    res.status(500).json({ error: 'Error al obtener sugerencias.' });
  }
});

export default router;
*/