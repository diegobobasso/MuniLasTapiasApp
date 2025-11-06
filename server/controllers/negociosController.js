import db from '../models/db.js';

// Obtener todos los negocios
export const getNegocios = (req, res) => {
  db.query('SELECT * FROM negocios ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Crear nuevo negocio
export const createNegocio = (req, res) => {
  const data = req.body;
  if (!data.nombre || !data.rubro || !data.direccion) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  db.query('INSERT INTO negocios SET ?', data, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: result.insertId, ...data });
  });
};

// Obtener negocio por ID
export const getNegocioById = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM negocios WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Negocio no encontrado' });
    res.json(results[0]);
  });
};

// Actualizar negocio
export const updateNegocio = (req, res) => {
  const { id } = req.params;
  db.query('UPDATE negocios SET ? WHERE id = ?', [req.body, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: parseInt(id), ...req.body });
  });
};

// Eliminar negocio
export const deleteNegocio = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM negocios WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: 'Negocio eliminado correctamente' });
  });
};

