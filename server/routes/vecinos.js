import express from 'express';
import {
  getVecinos,
  createVecino,
  getVecinoById,
  updateVecino,
  deleteVecino,
  restaurarClaveVecino
} from '../controllers/vecinosController.js';
import { verificarToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas protegidas por token
router.get('/', verificarToken, getVecinos);
router.get('/:id', verificarToken, getVecinoById);
router.post('/', verificarToken, createVecino);
router.put('/:id', verificarToken, updateVecino);
router.delete('/:id', verificarToken, deleteVecino);
router.put('/restaurar-clave/:id', verificarToken, restaurarClaveVecino);

export default router;
