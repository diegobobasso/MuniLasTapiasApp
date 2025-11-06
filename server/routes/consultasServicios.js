import express from 'express';
import {
  consultarServicios,
  consultarServicioPorId
} from '../controllers/consultasServiciosController.js';

const router = express.Router();

router.get('/', consultarServicios);
router.get('/:id', consultarServicioPorId);

export default router;
