import express from 'express';
import {
  getTramites,       // Obtener todos los trámites
  createTramite,     // Crear nuevo trámite
  updateTramite,     // Actualizar estado o contenido
  deleteTramite      // Eliminar trámite
} from '../controllers/tramitesController.js';

import { verificarToken } from '../middleware/verificarToken.js';

const router = express.Router();

// 🔐 Todas las rutas están protegidas por token JWT

// Obtener lista de trámites
router.get('/', verificarToken, getTramites);

// Crear nuevo trámite
router.post('/', verificarToken, createTramite);

// Actualizar trámite existente
router.put('/:id', verificarToken, updateTramite);

// Eliminar trámite
router.delete('/:id', verificarToken, deleteTramite);

export default router;
