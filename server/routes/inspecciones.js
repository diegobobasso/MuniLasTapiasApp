/**
 * 🔍 CONTROLADOR INSTITUCIONAL DE INSPECCIONES
 * - CRUD completo con trazabilidad
 * - Protegido por roles (empleado)
 */

const express = require('express');
const router = express.Router();
const { verificarToken, autorizarRoles } = require('../middleware/authMiddleware');
const { asyncHandler, ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { ejecutarConsulta } = require('../config/databaseConnection');

// ➕ Registrar inspección
router.post('/', verificarToken, autorizarRoles('empleado'), asyncHandler(async (req, res) => {
  const {
    negocio_id, fecha_inspeccion, tipo = 'rutinaria',
    resultado = 'favorable', observaciones
  } = req.body;
  const inspector_id = req.user.id;

  if (!negocio_id || !fecha_inspeccion) {
    throw new ValidationError('Negocio y fecha de inspección son obligatorios');
  }

  const sql = `
    INSERT INTO inspecciones (
      inspector_id, negocio_id, fecha_inspeccion, tipo, resultado, observaciones
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;
  const params = [inspector_id, negocio_id, fecha_inspeccion, tipo, resultado, observaciones];
  const resultadoInsert = await ejecutarConsulta(sql, params);

  res.status(201).json({
    success: true,
    message: 'Inspección registrada exitosamente',
    data: { inspeccionId: resultadoInsert.insertId }
  });
}));

// 📋 Obtener todas las inspecciones
router.get('/', verificarToken, autorizarRoles('empleado'), asyncHandler(async (req, res) => {
  const inspecciones = await ejecutarConsulta(`
    SELECT i.*, e.nombre AS inspector_nombre, n.nombre AS negocio_nombre
    FROM inspecciones i
    JOIN empleados e ON i.inspector_id = e.id
    JOIN negocios n ON i.negocio_id = n.id
    ORDER BY fecha_inspeccion DESC
  `);

  res.json({
    success: true,
    data: { inspecciones },
    metadata: { total: inspecciones.length }
  });
}));

// 👤 Obtener inspección por ID
router.get('/:id', verificarToken, autorizarRoles('empleado'), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const resultado = await ejecutarConsulta('SELECT * FROM inspecciones WHERE id = ?', [id]);

  if (resultado.length === 0) throw new NotFoundError(`Inspección con ID ${id} no encontrada`);

  res.json({ success: true, data: { inspeccion: resultado[0] } });
}));

// ✏️ Actualizar inspección
router.put('/:id', verificarToken, autorizarRoles('empleado'), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const campos = req.body;

  const resultado = await ejecutarConsulta('UPDATE inspecciones SET ? WHERE id = ?', [campos, id]);
  if (resultado.affectedRows === 0) throw new NotFoundError(`Inspección con ID ${id} no encontrada`);

  res.json({
    success: true,
    message: 'Inspección actualizada correctamente',
    data: { inspeccionId: id }
  });
}));

// ❌ Eliminar inspección (si aplica)
router.delete('/:id', verificarToken, autorizarRoles('empleado'), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const resultado = await ejecutarConsulta('DELETE FROM inspecciones WHERE id = ?', [id]);

  if (resultado.affectedRows === 0) throw new NotFoundError(`Inspección con ID ${id} no encontrada`);

  res.json({
    success: true,
    message: 'Inspección eliminada correctamente',
    data: { inspeccionId: id }
  });
}));

module.exports = router;
