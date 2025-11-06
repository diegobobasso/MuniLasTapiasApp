import db from '../models/db.js';

// 🔍 Obtener todas las sugerencias
export const getSugerencias = (req, res) => {
  const sql = 'SELECT * FROM sugerencias ORDER BY fecha DESC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// 🆕 Crear sugerencia (pública)
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

// ✏️ Actualizar estado y respuesta
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

    res.json({ success: true });
  });
};
