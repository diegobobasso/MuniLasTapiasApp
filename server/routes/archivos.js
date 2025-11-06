// 📁 routes/archivos.js
import express from 'express';
import {
  upload,            // middleware de multer para manejar el archivo físico
  uploadArchivo,     // lógica de validación e inserción en la base de datos
  getArchivos,       // listado completo para auditoría
  deleteArchivo      // eliminación física + lógica por ID
} from '../controllers/archivosController.js';

const router = express.Router();

// 📤 Subida de archivo institucional
// Requiere: entidad_origen, origen_id, archivo (PDF)
router.post('/', upload, uploadArchivo);

// 📄 Listado completo de archivos
router.get('/', getArchivos);

// 🗑️ Eliminación manual por ID
router.delete('/:id', deleteArchivo);

export default router;
