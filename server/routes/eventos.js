import express from 'express';
import {
  getEventos,
  createEvento,
  updateEvento,
  deleteEvento
} from '../controllers/eventosController.js';

const router = express.Router();

// Obtener todos los eventos
router.get('/', getEventos);

// Crear nuevo evento
router.post('/', createEvento);

// Actualizar evento
router.put('/:id', updateEvento);

// Eliminar evento
router.delete('/:id', deleteEvento);

export default router;
