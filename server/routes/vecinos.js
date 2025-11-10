/**
 * 👥 CONTROLADOR INSTITUCIONAL DE VECINOS
 * - CRUD completo con base de datos real
 * - Protección por roles
 * - Compatible con logs_acceso
 */

const express = require('express');
const router = express.Router();
const { verificarToken, autorizarRoles } = require('../middleware/authMiddleware');
const { asyncHandler, ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { ejecutarConsulta } = require('../config/databaseConnection');
const bcrypt = require('bcrypt');

// 📋 Obtener todos los vecinos
router.get('/', verificarToken, asyncHandler(async (req, res) => {
  const vecinos = await ejecutarConsulta('SELECT * FROM vecinos WHERE activo = TRUE');
  res.json({
    success: true,
    message: 'Lista de vecinos obtenida exitosamente',
    data: { vecinos },
    metadata: { total: vecinos.length, timestamp: new Date().toISOString() }
  });
}));

// 👤 Obtener vecino por ID
router.get('/:id', verificarToken, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) throw new ValidationError('ID inválido');

  const resultado = await ejecutarConsulta('SELECT * FROM vecinos WHERE id = ? AND activo = TRUE', [id]);
  if (resultado.length === 0) throw new NotFoundError(`Vecino con ID ${id} no encontrado`);

  res.json({ success: true, data: { vecino: resultado[0] } });
}));

// ➕ Crear nuevo vecino
router.post('/', verificarToken, autorizarRoles('empleado'), asyncHandler(async (req, res) => {
  const { nombre, apellido, dni, email, telefono, domicilio, password, fecha_registro } = req.body;

  if (!nombre || !apellido || !email || !password || !dni || !domicilio || !fecha_registro) {
    throw new ValidationError('Faltan campos obligatorios');
  }

  const password_hash = await bcrypt.hash(password, 10);
  const sql = `
    INSERT INTO vecinos (nombre, apellido, dni, email, telefono, domicilio, password_hash, fecha_registro)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [nombre, apellido, dni, email, telefono, domicilio, password_hash, fecha_registro];
  const resultado = await ejecutarConsulta(sql, params);

  res.status(201).json({
    success: true,
    message: 'Vecino creado exitosamente',
    data: { vecino: { id: resultado.insertId, nombre, email } }
  });
}));

// ✏️ Actualizar vecino
router.put('/:id', verificarToken, autorizarRoles('empleado'), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) throw new ValidationError('ID inválido');

  const campos = req.body;
  const resultado = await ejecutarConsulta('UPDATE vecinos SET ? WHERE id = ?', [campos, id]);

  if (resultado.affectedRows === 0) throw new NotFoundError(`Vecino con ID ${id} no encontrado`);

  res.json({
    success: true,
    message: 'Vecino actualizado exitosamente',
    data: { id, ...campos }
  });
}));

// 🔄 Restaurar contraseña
router.put('/:id/restaurar-clave', verificarToken, autorizarRoles('empleado'), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const { nuevaClave } = req.body;
  if (!nuevaClave || nuevaClave.length < 8) throw new ValidationError('Contraseña inválida');

  const password_hash = await bcrypt.hash(nuevaClave, 10);
  const resultado = await ejecutarConsulta(
    'UPDATE vecinos SET password_hash = ? WHERE id = ?',
    [password_hash, id]
  );

  if (resultado.affectedRows === 0) throw new NotFoundError(`Vecino con ID ${id} no encontrado`);

  res.json({
    success: true,
    message: 'Contraseña restaurada exitosamente',
    data: { vecinoId: id }
  });
}));

// ❌ Desactivar vecino (soft delete)
router.delete('/:id', verificarToken, autorizarRoles('empleado'), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const resultado = await ejecutarConsulta('UPDATE vecinos SET activo = FALSE WHERE id = ?', [id]);

  if (resultado.affectedRows === 0) throw new NotFoundError(`Vecino con ID ${id} no encontrado`);

  res.json({
    success: true,
    message: 'Vecino desactivado correctamente',
    data: { vecinoId: id }
  });
}));

module.exports = router;
