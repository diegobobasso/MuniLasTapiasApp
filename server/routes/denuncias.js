import express from 'express';
import {
  getDenuncias,
  createDenuncia,
  updateDenuncia,
  deleteDenuncia
} from '../controllers/denunciasController.js';

const router = express.Router();

// Obtener todas las denuncias
router.get('/', getDenuncias);

// Crear nueva denuncia
router.post('/', createDenuncia);

// Actualizar estado
router.put('/:id', updateDenuncia);

// Eliminar denuncia
router.delete('/:id', deleteDenuncia);

export default router;
