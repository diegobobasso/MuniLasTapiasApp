import express from 'express';
import {
  getEmpleados,
  createEmpleado,
  desactivarEmpleado,
  restaurarClaveEmpleado,
  cambiarClavePropiaEmpleado
} from '../controllers/empleadosController.js';
import { verificarToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * 📄 Lista empleados activos
 */
router.get('/', verificarToken, getEmpleados);

/**
 * ➕ Crea nuevo empleado (solo admin)
 */
router.post('/', verificarToken, createEmpleado);

/**
 * 🔄 Restaura contraseña de otro empleado (solo admin)
 */
router.put('/restaurar-clave/:id', verificarToken, restaurarClaveEmpleado);

/**
 * 🔐 Cambia su propia contraseña (autenticado)
 */
router.put('/cambiar-clave', verificarToken, cambiarClavePropiaEmpleado);

/**
 * 📴 Baja lógica de empleado (solo admin)
 */
router.put('/desactivar/:id', verificarToken, desactivarEmpleado);

export default router;
