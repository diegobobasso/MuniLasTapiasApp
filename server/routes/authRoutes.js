// routes/authRoutes.js
import express from 'express';
import { loginEmpleado } from '../controllers/authController.js';

const router = express.Router();

/**
 * Ruta institucional de login.
 * POST /api/login
 */
router.post('/login', loginEmpleado);

export default router;
