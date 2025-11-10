/**
 * 📰 CONTROLADOR INSTITUCIONAL DE NOTICIAS
 * - CRUD completo con trazabilidad y contador de vistas
 * - Protegido por roles (empleado/admin)
 */

const express = require('express');
const router = express.Router();
const { verificarToken, autorizarRoles } = require('../middleware/authMiddleware');
const { asyncHandler, ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { ejecutarConsulta } = require('../config/databaseConnection');

// ➕ Crear noticia
router.post('/', verificarToken, autorizarRoles('empleado', 'admin'), asyncHandler(async (req, res) => {
  const { titulo, contenido, imagen_url, categoria = 'general', fecha_publicacion, fecha_expiracion, destacada = false } = req.body;
  const autor_id = req.user.id;

  if (!titulo || !contenido || !fecha_publicacion) {
    throw new ValidationError('Título, contenido y fecha de publicación son obligatorios');
  }

  const sql = `
    INSERT INTO noticias (titulo, contenido, imagen_url, autor_id, categoria, fecha_publicacion, fecha_expiracion, destacada)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [titulo, contenido, imagen_url, autor_id, categoria, fecha_publicacion, fecha_expiracion, destacada];
  const resultado = await ejecutarConsulta(sql, params);

  res.status(201).json({
    success: true,
    message: 'Noticia creada exitosamente',
    data: { noticiaId: resultado.insertId }
  });
}));

// 📋 Obtener todas las noticias activas
router.get('/', verificarToken, asyncHandler(async (req, res) => {
  const noticias = await ejecutarConsulta('SELECT * FROM noticias WHERE activa = TRUE ORDER BY fecha_publicacion DESC');
  res.json({
    success: true,
    data: { noticias },
    metadata: { total: noticias.length }
  });
}));

// 👁️ Obtener noticia por ID y sumar vista
router.get('/:id', verificarToken, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const resultado = await ejecutarConsulta('SELECT * FROM noticias WHERE id = ? AND activa = TRUE', [id]);

  if (resultado.length === 0) throw new NotFoundError(`Noticia con ID ${id} no encontrada`);

  await ejecutarConsulta('UPDATE noticias SET vistas = vistas + 1 WHERE id = ?', [id]);

  res.json({
    success: true,
    data: { noticia: resultado[0] }
  });
}));

// ✏️ Actualizar noticia
router.put('/:id', verificarToken, autorizarRoles('empleado', 'admin'), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const campos = req.body;

  const resultado = await ejecutarConsulta('UPDATE noticias SET ? WHERE id = ?', [campos, id]);
  if (resultado.affectedRows === 0) throw new NotFoundError(`Noticia con ID ${id} no encontrada`);

  res.json({
    success: true,
    message: 'Noticia actualizada correctamente',
    data: { noticiaId: id }
  });
}));

// ❌ Desactivar noticia (soft delete)
router.delete('/:id', verificarToken, autorizarRoles('admin'), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const resultado = await ejecutarConsulta('UPDATE noticias SET activa = FALSE WHERE id = ?', [id]);

  if (resultado.affectedRows === 0) throw new NotFoundError(`Noticia con ID ${id} no encontrada`);

  res.json({
    success: true,
    message: 'Noticia desactivada correctamente',
    data: { noticiaId: id }
  });
}));

module.exports = router;
