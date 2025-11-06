import db from '../models/db.js';

// 🔍 Obtener todos los trámites
export const getTramites = (req, res) => {
  const sql = 'SELECT * FROM tramites ORDER BY fecha_inicio DESC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// 🆕 Crear nuevo trámite
export const createTramite = (req, res) => {
  const { vecino_id, tipo, descripcion } = req.body;

  if (!vecino_id || !tipo || !descripcion) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const sql = `
    INSERT INTO tramites (vecino_id, tipo, descripcion, fecha_inicio, estado)
    VALUES (?, ?, ?, CURDATE(), 'pendiente')
  `;

  db.query(sql, [vecino_id, tipo, descripcion], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    const nuevoTramite = {
      id: result.insertId,
      vecino_id,
      tipo,
      descripcion,
      fecha_inicio: new Date().toISOString().split('T')[0],
      estado: 'pendiente',
      fecha_resolucion: null,
      resultado: null
    };
    res.status(201).json(nuevoTramite);
  });
};

// ✏️ Actualizar trámite (estado, resultado, resolución)
export const updateTramite = (req, res) => {
  const { id } = req.params;
  const { estado, resultado } = req.body;

  if (!estado) {
    return res.status(400).json({ error: 'El campo estado es obligatorio' });
  }

  const sql = `
    UPDATE tramites
    SET estado = ?, resultado = ?, fecha_resolucion = ?
    WHERE id = ?
  `;

  const fecha_resolucion = estado === 'resuelto' ? new Date() : null;

  db.query(sql, [estado, resultado || null, fecha_resolucion, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Trámite no encontrado' });

    res.json({ success: true });
  });
};

// 🗑️ Eliminar trámite
export const deleteTramite = (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM tramites WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Trámite no encontrado' });

    res.json({ success: true });
  });
};
