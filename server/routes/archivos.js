/**
 * 📁 CONTROLADOR INSTITUCIONAL DE ARCHIVOS
 * - CRUD parcial con trazabilidad
 * - Protegido por roles (empleado o vecino para subir, solo empleado para eliminar)
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verificarToken, autorizarRoles } = require('../middleware/authMiddleware');
const { asyncHandler, ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { ejecutarConsulta } = require('../config/databaseConnection');

// 📦 Configuración de almacenamiento local
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/archivos');
  },
  filename: (req, file, cb) => {
    const nombreGuardado = `${Date.now()}-${file.originalname}`;
    cb(null, nombreGuardado);
  }
});

const upload = multer({ storage });

// 📤 Subir archivo
router.post('/', verificarToken, upload.single('archivo'), asyncHandler(async (req, res) => {
  const { entidad_tipo, entidad_id } = req.body;
  const subido_por_id = req.user.id;

  if (!req.file) throw new ValidationError('Archivo no recibido');
  if (!entidad_tipo || !entidad_id) throw new ValidationError('Entidad tipo e ID son obligatorios');

  const sql = `
    INSERT INTO archivos (
      nombre_original, nombre_guardado, ruta, tipo, tamaño,
      subido_por_id, entidad_tipo, entidad_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    req.file.originalname,
    req.file.filename,
    path.join('uploads/archivos', req.file.filename),
    req.file.mimetype,
    req.file.size,
    subido_por_id,
    entidad_tipo,
    entidad_id
  ];
  const resultado = await ejecutarConsulta(sql, params);

  res.status(201).json({
    success: true,
    message: 'Archivo subido exitosamente',
    data: { archivoId: resultado.insertId }
  });
}));

// 📋 Obtener archivos por entidad
router.get('/', verificarToken, asyncHandler(async (req, res) => {
  const { entidad_tipo, entidad_id } = req.query;

  if (!entidad_tipo || !entidad_id) {
    throw new ValidationError('Entidad tipo e ID son obligatorios');
  }

  const archivos = await ejecutarConsulta(
    'SELECT * FROM archivos WHERE entidad_tipo = ? AND entidad_id = ?',
    [entidad_tipo, entidad_id]
  );

  res.json({
    success: true,
    data: { archivos },
    metadata: { total: archivos.length }
  });
}));

// 👤 Obtener archivo por ID
router.get('/:id', verificarToken, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const resultado = await ejecutarConsulta('SELECT * FROM archivos WHERE id = ?', [id]);

  if (resultado.length === 0) throw new NotFoundError(`Archivo con ID ${id} no encontrado`);

  res.json({ success: true, data: { archivo: resultado[0] } });
}));

// ❌ Eliminar archivo (solo empleados)
router.delete('/:id', verificarToken, autorizarRoles('empleado'), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const resultado = await ejecutarConsulta('SELECT * FROM archivos WHERE id = ?', [id]);

  if (resultado.length === 0) throw new NotFoundError(`Archivo con ID ${id} no encontrado`);

  const archivo = resultado[0];
  const ruta = archivo.ruta;

  // Eliminar físicamente
  try {
    fs.unlinkSync(ruta);
  } catch (err) {
    console.warn('⚠️ No se pudo eliminar físicamente:', err.message);
  }

  await ejecutarConsulta('DELETE FROM archivos WHERE id = ?', [id]);

  res.json({
    success: true,
    message: 'Archivo eliminado correctamente',
    data: { archivoId: id }
  });
}));

module.exports = router;
