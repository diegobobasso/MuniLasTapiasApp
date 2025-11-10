/**
 * 📞 CONTROLADOR INSTITUCIONAL DE CONSULTAS DE SERVICIOS
 * - CRUD completo con trazabilidad
 * - Protegido por roles (vecino para crear, empleado para responder)
 */

const express = require('express');
const router = express.Router();
const { verificarToken, autorizarRoles } = require('../middleware/authMiddleware');
const { asyncHandler, ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { ejecutarConsulta } = require('../config/databaseConnection');

// ➕ Enviar consulta
router.post('/', verificarToken, autorizarRoles('vecino'), asyncHandler(async (req, res) => {
  const { servicio, mensaje, fecha_consulta } = req.body;
  const vecino_id = req.user.id;

  if (!servicio || !mensaje || !fecha_consulta) {
    throw new ValidationError('Servicio, mensaje y fecha de consulta son obligatorios');
  }

  const sql = `
    INSERT INTO consultas_servicios (vecino_id, servicio, mensaje, fecha_consulta)
    VALUES (?, ?, ?, ?)
  `;
  const params = [vecino_id, servicio, mensaje, fecha_consulta];
  const resultado = await ejecutarConsulta(sql, params);

  res.status(201).json({
    success: true,
    message: 'Consulta enviada exitosamente',
    data: { consultaId: resultado.insertId }
  });
}));

// 📋 Obtener todas las consultas
router.get('/', verificarToken, autorizarRoles('empleado'), asyncHandler(async (req, res) => {
  const consultas = await ejecutarConsulta(`
    SELECT c.*, v.nombre AS vecino_nombre, v.apellido AS vecino_apellido
    FROM consultas_servicios c
    JOIN vecinos v ON c.vecino_id = v.id
    ORDER BY fecha_consulta DESC
  `);

  res.json({
    success: true,
    data: { consultas },
    metadata: { total: consultas.length }
  });
}));

// 👤 Obtener consulta por ID
router.get('/:id', verificarToken, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const resultado = await ejecutarConsulta('SELECT * FROM consultas_servicios WHERE id = ?', [id]);

  if (resultado.length === 0) throw new NotFoundError(`Consulta con ID ${id} no encontrada`);

  res.json({ success: true, data: { consulta: resultado[0] } });
}));

// ✏️ Responder consulta
router.put('/:id', verificarToken, autorizarRoles('empleado'), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const { respuesta, estado = 'respondida', fecha_respuesta } = req.body;

  if (!respuesta || !fecha_respuesta) {
    throw new ValidationError('Respuesta y fecha de respuesta son obligatorias');
  }

  const resultado = await ejecutarConsulta(
    'UPDATE consultas_servicios SET respuesta = ?, estado = ?, fecha_respuesta = ? WHERE id = ?',
    [respuesta, estado, fecha_respuesta, id]
  );

  if (resultado.affectedRows === 0) throw new NotFoundError(`Consulta con ID ${id} no encontrada`);

  res.json({
    success: true,
    message: 'Consulta respondida correctamente',
    data: { consultaId: id }
  });
}));

// ❌ Archivar consulta
router.delete('/:id', verificarToken, autorizarRoles('empleado'), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const resultado = await ejecutarConsulta('UPDATE consultas_servicios SET estado = "archivada" WHERE id = ?', [id]);

  if (resultado.affectedRows === 0) throw new NotFoundError(`Consulta con ID ${id} no encontrada`);

  res.json({
    success: true,
    message: 'Consulta archivada correctamente',
    data: { consultaId: id }
  });
}));

module.exports = router;
