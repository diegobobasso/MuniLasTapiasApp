import express from 'express';
import {
  getVecinos,
  createVecino,
  getVecinoById,
  updateVecino,
  deleteVecino,
  restaurarClaveVecino,
  cambiarClavePropiaVecino
} from '../controllers/vecinosController.js';

const router = express.Router();

/**
 * 📄 Lista vecinos registrados
 */
router.get('/', getVecinos);

/**
 * 📄 Obtiene vecino por ID
 */
router.get('/:id', getVecinoById);

/**
 * ➕ Crea nuevo vecino (solo empleados)
 */
router.post('/', createVecino);

/**
 * ✏️ Actualiza datos de vecino
 */
router.put('/:id', updateVecino);

/**
 * 🗑️ Elimina vecino
 */
router.delete('/:id', deleteVecino);

/**
 * 🔄 Restaura contraseña de vecino (solo empleados)
 */
router.put('/restaurar-clave/:id', restaurarClaveVecino);

/**
 * 🔐 Cambia su propia contraseña (autenticado)
 */
router.put('/cambiar-clave', cambiarClavePropiaVecino);

export default router;
