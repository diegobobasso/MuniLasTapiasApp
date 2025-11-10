/**
 * 📢 CONTROLADOR INSTITUCIONAL DE EVENTOS
 * - CRUD completo con trazabilidad
 * - Protegido por roles (empleado)
 */

const express = require('express');
const router = express.Router();
const { verificarToken, autorizarRoles } = require('../middleware/authMiddleware');
const { asyncHandler, ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { ejecutarConsulta } = require('../config/databaseConnection');

// ➕ Crear evento
router.post('/', verificarToken, autorizarRoles('empleado'), asyncHandler(async (req, res) => {
  const {
    titulo, descripcion, fecha_inicio, fecha_fin,
    lugar, categoria = 'cultural'
  } = req.body;
  const organizador_id = req.user.id;

  if (!titulo || !descripcion || !fecha_inicio) {
    throw new ValidationError('Título, descripción y fecha de inicio son obligatorios');
  }

  const sql = `
    INSERT INTO eventos (
      titulo, descripcion, fecha_inicio, fecha_fin,
      lugar, categoria, organizador_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [titulo, descripcion, fecha_inicio, fecha_fin, lugar, categoria, organizador_id];
  const resultado = await ejecutarConsulta(sql, params);

  res.status(201).json({
    success: true,
    message: 'Evento creado exitosamente',
    data: { eventoId: resultado.insertId }
  });
}));

// 📋 Obtener todos los eventos activos
router.get('/', verificarToken, asyncHandler(async (req, res) => {
  const eventos = await ejecutarConsulta('SELECT * FROM eventos WHERE activo = TRUE ORDER BY fecha_inicio DESC');
  res.json({
    success: true,
    data: { eventos },
    metadata: { total: eventos.length }
  });
}));

// 👤 Obtener evento por ID
router.get('/:id', verificarToken, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const resultado = await ejecutarConsulta('SELECT * FROM eventos WHERE id = ? AND activo = TRUE', [id]);

  if (resultado.length === 0) throw new NotFoundError(`Evento con ID ${id} no encontrado`);

  res.json({ success: true, data: { evento: resultado[0] } });
}));

// ✏️ Actualizar evento
router.put('/:id', verificarToken, autorizarRoles('empleado'), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const campos = req.body;

  const resultado = await ejecutarConsulta('UPDATE eventos SET ? WHERE id = ?', [campos, id]);
  if (resultado.affectedRows === 0) throw new NotFoundError(`Evento con ID ${id} no encontrado`);

  res.json({
    success: true,
    message: 'Evento actualizado correctamente',
    data: { eventoId: id }
  });
}));

// ❌ Desactivar evento (soft delete)
router.delete('/:id', verificarToken, autorizarRoles('empleado'), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const resultado = await ejecutarConsulta('UPDATE eventos SET activo = FALSE WHERE id = ?', [id]);

  if (resultado.affectedRows === 0) throw new NotFoundError(`Evento con ID ${id} no encontrado`);

  res.json({
    success: true,
    message: 'Evento desactivado correctamente',
    data: { eventoId: id }
  });
}));

module.exports = router;
