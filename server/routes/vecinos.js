import express from 'express';
import {
  getVecinos,
  createVecino,
  getVecinoById,
  updateVecino,
  deleteVecino
} from '../controllers/vecinosController.js';

import { verificarToken } from '../middleware/verificarToken.js';

const router = express.Router();

// Rutas protegidas para gestión de vecinos
router.get('/', verificarToken, getVecinos);
router.post('/', verificarToken, createVecino);
router.get('/:id', verificarToken, getVecinoById);
router.put('/:id', verificarToken, updateVecino);
router.delete('/:id', verificarToken, deleteVecino);

export default router;
