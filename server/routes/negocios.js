/**
 * 🏪 CONTROLADOR INSTITUCIONAL DE NEGOCIOS
 * - CRUD completo con trazabilidad
 * - Protegido por roles (vecino para registrar, empleado para habilitar)
 */

const express = require('express');
const router = express.Router();
const { verificarToken, autorizarRoles } = require('../middleware/authMiddleware');
const { asyncHandler, ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { ejecutarConsulta } = require('../config/databaseConnection');

// ➕ Registrar negocio
router.post('/', verificarToken, autorizarRoles('vecino'), asyncHandler(async (req, res) => {
  const { nombre, rubro, direccion, telefono, email, fecha_inscripcion } = req.body;
  const propietario_id = req.user.id;

  if (!nombre || !rubro || !direccion || !fecha_inscripcion) {
    throw new ValidationError('Nombre, rubro, dirección y fecha de inscripción son obligatorios');
  }

  const sql = `
    INSERT INTO negocios (nombre, propietario_id, rubro, direccion, telefono, email, fecha_inscripcion)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [nombre, propietario_id, rubro, direccion, telefono, email, fecha_inscripcion];
  const resultado = await ejecutarConsulta(sql, params);

  res.status(201).json({
    success: true,
    message: 'Negocio registrado exitosamente',
    data: { negocioId: resultado.insertId }
  });
}));

// 📋 Obtener todos los negocios
router.get('/', verificarToken, asyncHandler(async (req, res) => {
  const negocios = await ejecutarConsulta('SELECT * FROM negocios');
  res.json({
    success: true,
    data: { negocios },
    metadata: { total: negocios.length }
  });
}));

// 👤 Obtener negocio por ID
router.get('/:id', verificarToken, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const resultado = await ejecutarConsulta('SELECT * FROM negocios WHERE id = ?', [id]);

  if (resultado.length === 0) throw new NotFoundError(`Negocio con ID ${id} no encontrado`);

  res.json({ success: true, data: { negocio: resultado[0] } });
}));

// ✏️ Actualizar negocio
router.put('/:id', verificarToken, autorizarRoles('vecino'), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const campos = req.body;

  const resultado = await ejecutarConsulta('UPDATE negocios SET ? WHERE id = ?', [campos, id]);
  if (resultado.affectedRows === 0) throw new NotFoundError(`Negocio con ID ${id} no encontrado`);

  res.json({
    success: true,
    message: 'Negocio actualizado correctamente',
    data: { negocioId: id }
  });
}));

// ✅ Habilitar negocio (solo empleados)
router.put('/:id/habilitar', verificarToken, autorizarRoles('empleado'), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const resultado = await ejecutarConsulta('UPDATE negocios SET habilitado = TRUE WHERE id = ?', [id]);

  if (resultado.affectedRows === 0) throw new NotFoundError(`Negocio con ID ${id} no encontrado`);

  res.json({
    success: true,
    message: 'Negocio habilitado correctamente',
    data: { negocioId: id }
  });
}));

// ❌ Desactivar negocio (soft delete)
router.delete('/:id', verificarToken, autorizarRoles('vecino'), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const resultado = await ejecutarConsulta('UPDATE negocios SET habilitado = FALSE WHERE id = ?', [id]);

  if (resultado.affectedRows === 0) throw new NotFoundError(`Negocio con ID ${id} no encontrado`);

  res.json({
    success: true,
    message: 'Negocio desactivado correctamente',
    data: { negocioId: id }
  });
}));

module.exports = router;
