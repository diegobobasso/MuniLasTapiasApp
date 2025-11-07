// routes/adminBootstrap.js
import express from 'express';
import { bootstrapAdmin, verificarEstadoBootstrap } from '../controllers/adminBootstrapController.js';

const router = express.Router();

/**
 * 🛠 Crear superadministrador (solo si el sistema está virgen)
 * POST /admin/bootstrap
 */
router.post('/bootstrap', bootstrapAdmin);

/**
 * 🔍 Verificar si el sistema está virgen
 * GET /admin/bootstrap/estado
 */
router.get('/estado', verificarEstadoBootstrap);

export default router;
