import express from 'express';
import {
  getInspecciones,       // Obtener todas las inspecciones
  createInspeccion,      // Crear nueva inspección
  getInspeccionById,     // Obtener inspección por ID
  updateInspeccion,      // Actualizar inspección existente
  deleteInspeccion       // Eliminar inspección
} from '../controllers/inspeccionesController.js';

import { verificarToken } from '../middleware/verificarToken.js';

const router = express.Router();

// 🔐 Todas las rutas protegidas por token JWT

// Obtener todas las inspecciones
router.get('/', verificarToken, getInspecciones);

// Crear nueva inspección
router.post('/', verificarToken, createInspeccion);

// Obtener inspección por ID
router.get('/:id', verificarToken, getInspeccionById);

// Actualizar inspección existente
router.put('/:id', verificarToken, updateInspeccion);

// Eliminar inspección
router.delete('/:id', verificarToken, deleteInspeccion);

export default router;
