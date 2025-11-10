/**
 * 👨‍💼 CONTROLADOR INSTITUCIONAL DE EMPLEADOS
 * - CRUD completo con base de datos real
 * - Protección por roles
 * - Registro en logs_acceso
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const { verificarToken, autorizarRoles } = require('../middleware/authMiddleware');
const { asyncHandler, ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { ejecutarConsulta } = require('../config/databaseConnection');
const { logAcceso } = require('../utils/logger');

// 📋 Obtener todos los empleados activos
router.get('/', verificarToken, autorizarRoles('admin'), asyncHandler(async (req, res) => {
  const empleados = await ejecutarConsulta('SELECT * FROM empleados WHERE activo = TRUE');

  logAcceso('📋 Listado de empleados consultado', req.user?.email);

  res.json({
    success: true,
    message: 'Lista de empleados obtenida exitosamente',
    data: { empleados },
    metadata: { total: empleados.length, timestamp: new Date().toISOString() }
  });
}));

// 👤 Obtener empleado por ID
router.get('/:id', verificarToken, autorizarRoles('admin'), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) throw new ValidationError('ID inválido');

  const resultado = await ejecutarConsulta('SELECT * FROM empleados WHERE id = ? AND activo = TRUE', [id]);
  if (resultado.length === 0) throw new NotFoundError(`Empleado con ID ${id} no encontrado`);

  logAcceso(`👤 Consulta de empleado ID ${id}`, req.user?.email);

  res.json({ success: true, data: { empleado: resultado[0] } });
}));

// ➕ Crear nuevo empleado
router.post('/', verificarToken, autorizarRoles('admin'), asyncHandler(async (req, res) => {
  const { nombre, apellido, dni, email, telefono, domicilio, password, rol, fecha_ingreso } = req.body;

  if (!nombre || !apellido || !email || !password || !rol || !fecha_ingreso) {
    throw new ValidationError('Faltan campos obligatorios');
  }

  // 🔍 Validar duplicados
  const existentes = await ejecutarConsulta('SELECT id FROM empleados WHERE email = ? OR dni = ?', [email, dni]);
  if (existentes.length > 0) {
    throw new ValidationError('Ya existe un empleado con ese email o DNI');
  }

  const password_hash = await bcrypt.hash(password, 10);
  const sql = `
    INSERT INTO empleados (nombre, apellido, dni, email, telefono, domicilio, password_hash, rol, fecha_ingreso, activo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)
  `;
  const params = [nombre, apellido, dni, email, telefono, domicilio, password_hash, rol, fecha_ingreso];
  const resultado = await ejecutarConsulta(sql, params);

  logAcceso(`➕ Empleado creado: ${email}`, req.user?.email);

  res.status(201).json({
    success: true,
    message: 'Empleado creado exitosamente',
    data: { empleado: { id: resultado.insertId, nombre, email, rol } }
  });
}));

// ✏️ Actualizar empleado
router.put('/:id', verificarToken, autorizarRoles('admin'), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) throw new ValidationError('ID inválido');

  const campos = req.body;
  if (Object.keys(campos).length === 0) {
    throw new ValidationError('No se enviaron campos para actualizar');
  }

  // 🔧 Generar SET dinámico compatible con MySQL
  const keys = Object.keys(campos);
  const values = Object.values(campos);
  const setClause = keys.map(k => `${k} = ?`).join(', ');
  const sql = `UPDATE empleados SET ${setClause} WHERE id = ?`;

  const resultado = await ejecutarConsulta(sql, [...values, id]);
  if (resultado.affectedRows === 0) throw new NotFoundError(`Empleado con ID ${id} no encontrado`);

  logAcceso(`✏️ Empleado actualizado ID ${id}`, req.user?.email);

  res.json({
    success: true,
    message: 'Empleado actualizado exitosamente',
    data: { id, ...campos }
  });
}));

// 🔄 Restaurar contraseña
router.put('/:id/restaurar-clave', verificarToken, autorizarRoles('admin'), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const { nuevaClave } = req.body;

  if (!nuevaClave || nuevaClave.length < 8) {
    throw new ValidationError('Contraseña inválida');
  }

  const password_hash = await bcrypt.hash(nuevaClave, 10);
  const resultado = await ejecutarConsulta(
    'UPDATE empleados SET password_hash = ?, requiere_cambio_password = FALSE WHERE id = ?',
    [password_hash, id]
  );

  if (resultado.affectedRows === 0) throw new NotFoundError(`Empleado con ID ${id} no encontrado`);

  logAcceso(`🔄 Clave restaurada para empleado ID ${id}`, req.user?.email);

  res.json({
    success: true,
    message: 'Contraseña restaurada exitosamente',
    data: { empleadoId: id }
  });
}));

// ❌ Desactivar empleado (soft delete)
router.delete('/:id', verificarToken, autorizarRoles('admin'), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const resultado = await ejecutarConsulta('UPDATE empleados SET activo = FALSE WHERE id = ?', [id]);

  if (resultado.affectedRows === 0) throw new NotFoundError(`Empleado con ID ${id} no encontrado`);

  logAcceso(`❌ Empleado desactivado ID ${id}`, req.user?.email);

  res.json({
    success: true,
    message: 'Empleado desactivado correctamente',
    data: { empleadoId: id }
  });
}));

module.exports = router;
