import db from '../models/db.js';
import { logAcceso } from '../utils/logger.js';

/**
 * 🔍 Obtener todas las sugerencias
 * - Ordenadas por fecha descendente
 * - Acceso público o institucional
 */
export const getSugerencias = (req, res) => {
  const sql = 'SELECT * FROM sugerencias ORDER BY fecha DESC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    logAcceso(`${req.empleado?.rol || req.vecino?.rol || 'anonimo'} accedió a listado de sugerencias`);
    res.json(results);
  });
};

/**
 * 🆕 Crear sugerencia (pública)
 * - Requiere vecino_id, asunto y mensaje
 * - Canal por defecto: 'web'
 * - Estado inicial: 'nueva'
 */
export const createSugerencia = (req, res) => {
  const { vecino_id, asunto, mensaje, tipo, canal } = req.body;

  if (!vecino_id || !asunto || !mensaje) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const sql = `
    INSERT INTO sugerencias (fecha, asunto, mensaje, tipo, canal, estado, vecino_id)
    VALUES (CURDATE(), ?, ?, ?, ?, 'nueva', ?)
  `;
  db.query(sql, [asunto, mensaje, tipo || null, canal || 'web', vecino_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    logAcceso(`vecino ID ${vecino_id} creó sugerencia: ${asunto}`);
    res.status(201).json({
      id: result.insertId,
      fecha: new Date().toISOString().split('T')[0],
      asunto,
      mensaje,
      tipo,
      canal,
      estado: 'nueva',
      vecino_id,
      respuesta: null,
      fecha_respuesta: null
    });
  });
};

/**
 * ✏️ Actualizar estado y respuesta
 * - Requiere campo 'estado'
 * - Si estado es 'respondida', se registra fecha_respuesta
 */
export const updateSugerencia = (req, res) => {
  const { id } = req.params;
  const { estado, respuesta } = req.body;

  if (!estado) {
    return res.status(400).json({ error: 'El campo estado es obligatorio' });
  }

  const fecha_respuesta = estado === 'respondida' ? new Date() : null;

  const sql = `
    UPDATE sugerencias
    SET estado = ?, respuesta = ?, fecha_respuesta = ?
    WHERE id = ?
  `;
  db.query(sql, [estado, respuesta || null, fecha_respuesta, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Sugerencia no encontrada' });

    logAcceso(`empleado actualizó sugerencia ID ${id} a estado: ${estado}`);
    res.json({ success: true });
  });
};

/**
 * 🗑️ Eliminar sugerencia por ID
 * - Requiere autenticación institucional
 * - Verifica existencia antes de eliminar
 */
export const deleteSugerencia = (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM sugerencias WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Sugerencia no encontrada' });

    logAcceso(`${req.empleado?.rol || req.vecino?.rol || 'anonimo'} eliminó sugerencia ID ${id}`);
    res.json({ mensaje: 'Sugerencia eliminada correctamente' });
  });
};

/**
 * 📩 Responder sugerencia (alias de updateSugerencia)
 * - Permite responder y cambiar estado a 'respondida'
 * - Compatible con rutas específicas como /sugerencias/:id/responder
 */
export const responderSugerencia = (req, res) => {
  const { id } = req.params;
  const { respuesta } = req.body;

  if (!respuesta || respuesta.trim() === '') {
    return res.status(400).json({ error: 'La respuesta no puede estar vacía' });
  }

  const sql = `
    UPDATE sugerencias
    SET estado = 'respondida', respuesta = ?, fecha_respuesta = NOW()
    WHERE id = ?
  `;

  db.query(sql, [respuesta, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Sugerencia no encontrada' });

    logAcceso(`empleado respondió sugerencia ID ${id}`);
    res.json({ mensaje: 'Sugerencia respondida correctamente' });
  });
};

/**
 * 📦 Exportaciones institucionales
 *
export {
  getSugerencias,
  createSugerencia,
  updateSugerencia,
  deleteSugerencia
};*/
