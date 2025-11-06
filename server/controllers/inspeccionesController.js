import db from '../models/db.js';

// 🔍 Obtener todas las inspecciones
export const getInspecciones = (req, res) => {
  const sql = 'SELECT * FROM inspecciones ORDER BY fecha_solicitud DESC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// 🆕 Crear nueva inspección
export const createInspeccion = (req, res) => {
  const {
    solicitante,
    institucion_ejecutora,
    inspector,
    tipo,
    terreno_id,
    negocio_id,
    incluye_conexion_agua,
    resultado
  } = req.body;

  // Validación mínima
  if (!solicitante || !institucion_ejecutora || !inspector || !tipo) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const sql = `
    INSERT INTO inspecciones (
      fecha_solicitud, estado, solicitante, institucion_ejecutora,
      inspector, tipo, terreno_id, negocio_id, incluye_conexion_agua, resultado
    ) VALUES (CURDATE(), 'pendiente', ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      solicitante,
      institucion_ejecutora,
      inspector,
      tipo,
      terreno_id || null,
      negocio_id || null,
      incluye_conexion_agua ? 1 : 0,
      resultado || null
    ],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      res.status(201).json({
        id: result.insertId,
        fecha_solicitud: new Date().toISOString().split('T')[0],
        fecha_realizacion: null,
        estado: 'pendiente',
        solicitante,
        institucion_ejecutora,
        inspector,
        tipo,
        terreno_id,
        negocio_id,
        incluye_conexion_agua,
        resultado
      });
    }
  );
};

// 🔍 Obtener inspección por ID
export const getInspeccionById = (req, res) => {
  const { id } = req.params;

  db.query('SELECT * FROM inspecciones WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Inspección no encontrada' });
    res.json(results[0]);
  });
};

// ✏️ Actualizar inspección existente
export const updateInspeccion = (req, res) => {
  const { id } = req.params;

  db.query('UPDATE inspecciones SET ? WHERE id = ?', [req.body, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Inspección no encontrada' });
    res.json({ mensaje: 'Inspección actualizada correctamente' });
  });
};

// 🗑️ Eliminar inspección
export const deleteInspeccion = (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM inspecciones WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Inspección no encontrada' });
    res.json({ mensaje: 'Inspección eliminada correctamente' });
  });
};


