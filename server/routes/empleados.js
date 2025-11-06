import express from 'express';
import {
  getEmpleados,
  createEmpleado,
  desactivarEmpleado,
  restaurarClaveEmpleado
} from '../controllers/empleadosController.js';
import { verificarToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas protegidas por token
router.get('/', verificarToken, getEmpleados);
router.post('/', verificarToken, createEmpleado);
router.put('/restaurar-clave/:id', verificarToken, restaurarClaveEmpleado);
router.put('/desactivar/:id', verificarToken, desactivarEmpleado);

export default router;
