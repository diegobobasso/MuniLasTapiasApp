import express from 'express';
import {
  getConexiones,
  createConexion,
  getConexionById,
  updateConexion,
  deleteConexion
} from '../controllers/conexionesController.js';

import { verificarToken } from '../middleware/verificarToken.js';

const router = express.Router();

// Rutas protegidas
router.get('/', verificarToken, getConexiones);
router.post('/', verificarToken, createConexion);
router.get('/:id', verificarToken, getConexionById);
router.put('/:id', verificarToken, updateConexion);
router.delete('/:id', verificarToken, deleteConexion);

export default router;
