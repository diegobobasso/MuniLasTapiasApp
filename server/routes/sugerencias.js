/**
 * 📝 CONTROLADOR INSTITUCIONAL DE SUGERENCIAS
 * - CRUD completo con trazabilidad
 * - Protegido por roles (vecino para crear, empleado para actualizar)
 */

const express = require('express');
const router = express.Router();
const { verificarToken, autorizarRoles } = require('../middleware/authMiddleware');
const { asyncHandler, ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { ejecutarConsulta } = require('../config/databaseConnection');

// 📥 Crear sugerencia
router.post('/', verificarToken, autorizarRoles('vecino'), asyncHandler(async (req, res) => {
  const { titulo, descripcion, categoria = 'otros' } = req.body;
  const vecino_id = req.user.id;

  if (!titulo || !descripcion) {
    throw new ValidationError('Título y descripción son obligatorios');
  }

  const sql = `
    INSERT INTO sugerencias (vecino_id, titulo, descripcion, categoria)
    VALUES (?, ?, ?, ?)
  `;
  const resultado = await ejecutarConsulta(sql, [vecino_id, titulo, descripcion, categoria]);

  res.status(201).json({
    success: true,
    message: 'Sugerencia enviada exitosamente',
    data: { sugerenciaId: resultado.insertId }
  });
}));

// 📋 Obtener todas las sugerencias
router.get('/', verificarToken, asyncHandler(async (req, res) => {
  const sugerencias = await ejecutarConsulta('SELECT * FROM sugerencias');
  res.json({
    success: true,
    data: { sugerencias },
    metadata: { total: sugerencias.length }
  });
}));

// 👤 Obtener sugerencia por ID
router.get('/:id', verificarToken, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const resultado = await ejecutarConsulta('SELECT * FROM sugerencias WHERE id = ?', [id]);

  if (resultado.length === 0) throw new NotFoundError(`Sugerencia con ID ${id} no encontrada`);

  res.json({ success: true, data: { sugerencia: resultado[0] } });
}));

// ✏️ Actualizar estado de sugerencia
router.put('/:id', verificarToken, autorizarRoles('empleado'), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const { estado } = req.body;

  const estadosPermitidos = ['pendiente', 'en_revision', 'aprobada', 'rechazada', 'implementada'];
  if (!estado || !estadosPermitidos.includes(estado)) {
    throw new ValidationError(`Estado inválido. Permitidos: ${estadosPermitidos.join(', ')}`);
  }

  const resultado = await ejecutarConsulta('UPDATE sugerencias SET estado = ? WHERE id = ?', [estado, id]);

  if (resultado.affectedRows === 0) throw new NotFoundError(`Sugerencia con ID ${id} no encontrada`);

  res.json({
    success: true,
    message: 'Estado actualizado correctamente',
    data: { sugerenciaId: id, nuevoEstado: estado }
  });
}));

// ❌ Desactivar sugerencia (soft delete)
router.delete('/:id', verificarToken, autorizarRoles('empleado'), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const resultado = await ejecutarConsulta('UPDATE sugerencias SET estado = "rechazada" WHERE id = ?', [id]);

  if (resultado.affectedRows === 0) throw new NotFoundError(`Sugerencia con ID ${id} no encontrada`);

  res.json({
    success: true,
    message: 'Sugerencia rechazada correctamente',
    data: { sugerenciaId: id }
  });
}));

module.exports = router;
