import express from 'express';
import {
  getTerrenos,
  createTerreno,
  getTerrenoById,
  updateTerreno
} from '../controllers/terrenosController.js';

import { verificarToken } from '../middleware/verificarToken.js';

const router = express.Router();

// 🔐 Todas las rutas protegidas por token JWT

// Obtener todos los terrenos
router.get('/', verificarToken, getTerrenos);

// Crear nuevo terreno
router.post('/', verificarToken, createTerreno);

// Obtener terreno por ID
router.get('/:id', verificarToken, getTerrenoById);

// Actualizar terreno existente
router.put('/:id', verificarToken, updateTerreno);

export default router;
