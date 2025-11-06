import db from '../models/db.js';

// Obtener todas las conexiones
export const getConexiones = (req, res) => {
  db.query('SELECT * FROM conexiones_agua ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Crear nueva conexión
export const createConexion = (req, res) => {
  const data = req.body;
  if (!data.terreno_id || !data.estado) {
    return res.status(400).json({ error: 'Terreno y estado son obligatorios' });
  }

  db.query('INSERT INTO conexiones_agua SET ?', data, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: result.insertId, ...data });
  });
};

// Obtener conexión por ID
export const getConexionById = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM conexiones_agua WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Conexión no encontrada' });
    res.json(results[0]);
  });
};

// Actualizar conexión
export const updateConexion = (req, res) => {
  const { id } = req.params;
  db.query('UPDATE conexiones_agua SET ? WHERE id = ?', [req.body, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: parseInt(id), ...req.body });
  });
};

// Eliminar conexión
export const deleteConexion = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM conexiones_agua WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: 'Conexión eliminada correctamente' });
  });
};
