// routes/authVecino.js
import express from 'express';
import { loginVecino } from '../controllers/authVecinoController.js';

const router = express.Router();

/**
 * 🔐 Login institucional de vecinos
 * POST /auth-vecino/login
 */
router.post('/login', loginVecino);

export default router;
