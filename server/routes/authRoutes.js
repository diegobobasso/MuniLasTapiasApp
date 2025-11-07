// routes/authRoutes.js
import express from 'express';
import { loginEmpleado } from '../controllers/authController.js';

const router = express.Router();

/**
 * 🔐 Login institucional de empleados
 * POST /auth/login
 */
router.post('/login', loginEmpleado);

export default router;
