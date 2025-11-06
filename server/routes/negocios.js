import express from 'express';
import {
  getNegocios,
  createNegocio,
  getNegocioById,
  updateNegocio,
  deleteNegocio
} from '../controllers/negociosController.js';

import { verificarToken } from '../middleware/verificarToken.js';

const router = express.Router();

// Rutas protegidas
router.get('/', verificarToken, getNegocios);
router.post('/', verificarToken, createNegocio);
router.get('/:id', verificarToken, getNegocioById);
router.put('/:id', verificarToken, updateNegocio);
router.delete('/:id', verificarToken, deleteNegocio);

export default router;
