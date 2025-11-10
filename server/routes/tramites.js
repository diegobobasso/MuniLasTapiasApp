/**
 * 📋 CONTROLADOR INSTITUCIONAL DE TRÁMITES
 * - CRUD completo con trazabilidad
 * - Protegido por roles (empleado)
 */

const express = require('express');
const router = express.Router();
const { verificarToken, autorizarRoles } = require('../middleware/authMiddleware');
const { asyncHandler, ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { ejecutarConsulta } = require('../config/databaseConnection');
const { logAcceso } = require('../utils/logger');

// ➕ Crear trámite
router.post('/', verificarToken, autorizarRoles('empleado'), asyncHandler(async (req, res) => {
  const {
    nombre, descripcion, categoria, duracion_estimada,
    costo = 0.00, requisitos, horario_atencion, telefono_contacto, encargado_id
  } = req.body;

  if (!nombre || !descripcion || !categoria) {
    throw new ValidationError('Nombre, descripción y categoría son obligatorios');
  }

  const sql = `
    INSERT INTO tramites (
      nombre, descripcion, categoria, duracion_estimada, costo,
      requisitos, horario_atencion, telefono_contacto, encargado_id, activo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)
  `;
  const params = [
    nombre,
    descripcion,
    categoria,
    duracion_estimada,
    costo,
    JSON.stringify(Array.isArray(requisitos) ? requisitos : []),
    horario_atencion,
    telefono_contacto,
    encargado_id ?? null
  ];

  const resultado = await ejecutarConsulta(sql, params);

  logAcceso(`➕ Trámite creado: ${nombre}`, req.user?.email);

  res.status(201).json({
    success: true,
    message: 'Trámite creado exitosamente',
    data: { tramiteId: resultado.insertId }
  });
}));

// 📋 Obtener todos los trámites
router.get('/', verificarToken, asyncHandler(async (req, res) => {
  const tramites = await ejecutarConsulta('SELECT * FROM tramites WHERE activo = TRUE');

  logAcceso('📋 Listado de trámites consultado', req.user?.email);

  res.json({
    success: true,
    data: { tramites },
    metadata: { total: tramites.length }
  });
}));

// 👤 Obtener trámite por ID
router.get('/:id', verificarToken, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const resultado = await ejecutarConsulta('SELECT * FROM tramites WHERE id = ? AND activo = TRUE', [id]);

  if (resultado.length === 0) throw new NotFoundError(`Trámite con ID ${id} no encontrado`);

  logAcceso(`👤 Consulta de trámite ID ${id}`, req.user?.email);

  res.json({ success: true, data: { tramite: resultado[0] } });
}));

// ✏️ Actualizar trámite
router.put('/:id', verificarToken, autorizarRoles('empleado'), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const campos = req.body;

  if (campos.requisitos) {
    campos.requisitos = JSON.stringify(campos.requisitos);
  }

  const keys = Object.keys(campos);
  const values = Object.values(campos);
  const setClause = keys.map(k => `${k} = ?`).join(', ');
  const sql = `UPDATE tramites SET ${setClause} WHERE id = ?`;

  const resultado = await ejecutarConsulta(sql, [...values, id]);
  if (resultado.affectedRows === 0) throw new NotFoundError(`Trámite con ID ${id} no encontrado`);

  logAcceso(`✏️ Trámite actualizado ID ${id}`, req.user?.email);

  res.json({
    success: true,
    message: 'Trámite actualizado correctamente',
    data: { tramiteId: id }
  });
}));

// ❌ Desactivar trámite (soft delete)
router.delete('/:id', verificarToken, autorizarRoles('empleado'), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const resultado = await ejecutarConsulta('UPDATE tramites SET activo = FALSE WHERE id = ?', [id]);

  if (resultado.affectedRows === 0) throw new NotFoundError(`Trámite con ID ${id} no encontrado`);

  logAcceso(`❌ Trámite desactivado ID ${id}`, req.user?.email);

  res.json({
    success: true,
    message: 'Trámite desactivado correctamente',
    data: { tramiteId: id }
  });
}));

module.exports = router;
