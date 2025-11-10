/**
 * 🔌 CONTROLADOR INSTITUCIONAL DE CONEXIONES
 * - CRUD completo con trazabilidad
 * - Protegido por roles (vecino para solicitar, empleado para actualizar)
 */

const express = require('express');
const router = express.Router();
const { verificarToken, autorizarRoles } = require('../middleware/authMiddleware');
const { asyncHandler, ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { ejecutarConsulta } = require('../config/databaseConnection');

// ➕ Solicitar conexión
router.post('/', verificarToken, autorizarRoles('vecino'), asyncHandler(async (req, res) => {
  const { tipo, direccion, fecha_solicitud, observaciones } = req.body;
  const solicitante_id = req.user.id;

  if (!tipo || !direccion || !fecha_solicitud) {
    throw new ValidationError('Tipo, dirección y fecha de solicitud son obligatorios');
  }

  const sql = `
    INSERT INTO conexiones (tipo, solicitante_id, direccion, fecha_solicitud, observaciones)
    VALUES (?, ?, ?, ?, ?)
  `;
  const params = [tipo, solicitante_id, direccion, fecha_solicitud, observaciones];
  const resultado = await ejecutarConsulta(sql, params);

  res.status(201).json({
    success: true,
    message: 'Conexión solicitada exitosamente',
    data: { conexionId: resultado.insertId }
  });
}));

// 📋 Obtener todas las conexiones
router.get('/', verificarToken, autorizarRoles('empleado'), asyncHandler(async (req, res) => {
  const conexiones = await ejecutarConsulta(`
    SELECT c.*, v.nombre AS solicitante_nombre, v.apellido AS solicitante_apellido
    FROM conexiones c
    JOIN vecinos v ON c.solicitante_id = v.id
    ORDER BY fecha_solicitud DESC
  `);

  res.json({
    success: true,
    data: { conexiones },
    metadata: { total: conexiones.length }
  });
}));

// 👤 Obtener conexión por ID
router.get('/:id', verificarToken, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const resultado = await ejecutarConsulta('SELECT * FROM conexiones WHERE id = ?', [id]);

  if (resultado.length === 0) throw new NotFoundError(`Conexión con ID ${id} no encontrada`);

  res.json({ success: true, data: { conexion: resultado[0] } });
}));

// ✏️ Actualizar estado de conexión
router.put('/:id', verificarToken, autorizarRoles('empleado'), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const { estado, fecha_conexion, observaciones } = req.body;

  const estadosPermitidos = ['solicitada', 'en_proceso', 'conectada', 'rechazada'];
  if (!estado || !estadosPermitidos.includes(estado)) {
    throw new ValidationError(`Estado inválido. Permitidos: ${estadosPermitidos.join(', ')}`);
  }

  const resultado = await ejecutarConsulta(
    'UPDATE conexiones SET estado = ?, fecha_conexion = ?, observaciones = ? WHERE id = ?',
    [estado, fecha_conexion, observaciones, id]
  );

  if (resultado.affectedRows === 0) throw new NotFoundError(`Conexión con ID ${id} no encontrada`);

  res.json({
    success: true,
    message: 'Estado de conexión actualizado correctamente',
    data: { conexionId: id, nuevoEstado: estado }
  });
}));

// ❌ Rechazar conexión (soft delete)
router.delete('/:id', verificarToken, autorizarRoles('empleado'), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const resultado = await ejecutarConsulta('UPDATE conexiones SET estado = "rechazada" WHERE id = ?', [id]);

  if (resultado.affectedRows === 0) throw new NotFoundError(`Conexión con ID ${id} no encontrada`);

  res.json({
    success: true,
    message: 'Conexión rechazada correctamente',
    data: { conexionId: id }
  });
}));

module.exports = router;
