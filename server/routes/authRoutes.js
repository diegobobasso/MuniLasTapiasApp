import express from 'express';
import { login, cambiarPasswordInicial } from '../controllers/authController.js';

const router = express.Router();

/**
 * 🔐 Login institucional
 */
router.post('/login', login);

/**
 * 🔐 Cambio de contraseña inicial
 */
router.post('/cambiar-password-inicial', cambiarPasswordInicial);

export default router;
