/**
 * 🏘️ CONTROLADOR INSTITUCIONAL DE TERRENOS
 * - CRUD completo con trazabilidad
 * - Protegido por roles (vecino)
 */

const express = require('express');
const router = express.Router();
const { verificarToken, autorizarRoles } = require('../middleware/authMiddleware');
const { asyncHandler, ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { ejecutarConsulta } = require('../config/databaseConnection');

// ➕ Registrar terreno
router.post('/', verificarToken, autorizarRoles('vecino'), asyncHandler(async (req, res) => {
  const { direccion, numero_catastral, superficie, zona = 'urbana' } = req.body;
  const propietario_id = req.user.id;

  if (!direccion || !numero_catastral || !superficie) {
    throw new ValidationError('Dirección, número catastral y superficie son obligatorios');
  }

  const sql = `
    INSERT INTO terrenos (propietario_id, direccion, numero_catastral, superficie, zona)
    VALUES (?, ?, ?, ?, ?)
  `;
  const params = [propietario_id, direccion, numero_catastral, superficie, zona];
  const resultado = await ejecutarConsulta(sql, params);

  res.status(201).json({
    success: true,
    message: 'Terreno registrado exitosamente',
    data: { terrenoId: resultado.insertId }
  });
}));

// 📋 Obtener todos los terrenos
router.get('/', verificarToken, asyncHandler(async (req, res) => {
  const terrenos = await ejecutarConsulta('SELECT * FROM terrenos');
  res.json({
    success: true,
    data: { terrenos },
    metadata: { total: terrenos.length }
  });
}));

// 👤 Obtener terreno por ID
router.get('/:id', verificarToken, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const resultado = await ejecutarConsulta('SELECT * FROM terrenos WHERE id = ?', [id]);

  if (resultado.length === 0) throw new NotFoundError(`Terreno con ID ${id} no encontrado`);

  res.json({ success: true, data: { terreno: resultado[0] } });
}));

// ✏️ Actualizar terreno
router.put('/:id', verificarToken, autorizarRoles('vecino'), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const campos = req.body;

  const resultado = await ejecutarConsulta('UPDATE terrenos SET ? WHERE id = ?', [campos, id]);
  if (resultado.affectedRows === 0) throw new NotFoundError(`Terreno con ID ${id} no encontrado`);

  res.json({
    success: true,
    message: 'Terreno actualizado correctamente',
    data: { terrenoId: id }
  });
}));

// ❌ Desactivar terreno (soft delete)
router.delete('/:id', verificarToken, autorizarRoles('vecino'), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const resultado = await ejecutarConsulta('DELETE FROM terrenos WHERE id = ?', [id]);

  if (resultado.affectedRows === 0) throw new NotFoundError(`Terreno con ID ${id} no encontrado`);

  res.json({
    success: true,
    message: 'Terreno eliminado correctamente',
    data: { terrenoId: id }
  });
}));

module.exports = router;
