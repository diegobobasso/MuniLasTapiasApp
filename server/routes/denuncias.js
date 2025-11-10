/**
 * 🚨 CONTROLADOR INSTITUCIONAL DE DENUNCIAS
 * - CRUD completo con trazabilidad
 * - Protegido por roles (vecino para crear, empleado para actualizar)
 */

const express = require('express');
const router = express.Router();
const { verificarToken, autorizarRoles } = require('../middleware/authMiddleware');
const { asyncHandler, ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { ejecutarConsulta } = require('../config/databaseConnection');

// ➕ Enviar denuncia
router.post('/', verificarToken, autorizarRoles('vecino'), asyncHandler(async (req, res) => {
  const { titulo, descripcion, categoria = 'otros', direccion, fecha_incidente } = req.body;
  const vecino_id = req.user.id;

  if (!titulo || !descripcion || !direccion) {
    throw new ValidationError('Título, descripción y dirección son obligatorios');
  }

  const sql = `
    INSERT INTO denuncias (vecino_id, titulo, descripcion, categoria, direccion, fecha_incidente)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const params = [vecino_id, titulo, descripcion, categoria, direccion, fecha_incidente];
  const resultado = await ejecutarConsulta(sql, params);

  res.status(201).json({
    success: true,
    message: 'Denuncia registrada exitosamente',
    data: { denunciaId: resultado.insertId }
  });
}));

// 📋 Obtener todas las denuncias
router.get('/', verificarToken, asyncHandler(async (req, res) => {
  const denuncias = await ejecutarConsulta('SELECT * FROM denuncias ORDER BY fecha_creacion DESC');
  res.json({
    success: true,
    data: { denuncias },
    metadata: { total: denuncias.length }
  });
}));

// 👤 Obtener denuncia por ID
router.get('/:id', verificarToken, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const resultado = await ejecutarConsulta('SELECT * FROM denuncias WHERE id = ?', [id]);

  if (resultado.length === 0) throw new NotFoundError(`Denuncia con ID ${id} no encontrada`);

  res.json({ success: true, data: { denuncia: resultado[0] } });
}));

// ✏️ Actualizar estado de denuncia
router.put('/:id', verificarToken, autorizarRoles('empleado'), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const { estado } = req.body;

  const estadosPermitidos = ['pendiente', 'en_proceso', 'resuelta', 'archivada'];
  if (!estado || !estadosPermitidos.includes(estado)) {
    throw new ValidationError(`Estado inválido. Permitidos: ${estadosPermitidos.join(', ')}`);
  }

  const resultado = await ejecutarConsulta('UPDATE denuncias SET estado = ? WHERE id = ?', [estado, id]);
  if (resultado.affectedRows === 0) throw new NotFoundError(`Denuncia con ID ${id} no encontrada`);

  res.json({
    success: true,
    message: 'Estado actualizado correctamente',
    data: { denunciaId: id, nuevoEstado: estado }
  });
}));

// ❌ Archivar denuncia (soft delete)
router.delete('/:id', verificarToken, autorizarRoles('empleado'), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const resultado = await ejecutarConsulta('UPDATE denuncias SET estado = "archivada" WHERE id = ?', [id]);

  if (resultado.affectedRows === 0) throw new NotFoundError(`Denuncia con ID ${id} no encontrada`);

  res.json({
    success: true,
    message: 'Denuncia archivada correctamente',
    data: { denunciaId: id }
  });
}));

module.exports = router;
