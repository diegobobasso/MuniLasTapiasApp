import db from '../models/db.js';

// Obtener todas las denuncias
export const getDenuncias = (req, res) => {
  db.query('SELECT * FROM denuncias ORDER BY fecha DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Crear una nueva denuncia
export const createDenuncia = (req, res) => {
  const {
    fecha,
    tipo,
    descripcion,
    denunciante,
    canal,
    terreno_id,
    negocio_id
  } = req.body;

  const nueva = {
    fecha,
    tipo,
    descripcion,
    denunciante,
    canal,
    estado: 'pendiente',
    terreno_id: terreno_id || null,
    negocio_id: negocio_id || null
  };

  db.query('INSERT INTO denuncias SET ?', nueva, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: result.insertId, ...nueva });
  });
};

// Actualizar estado de la denuncia
export const updateDenuncia = (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  db.query(
    'UPDATE denuncias SET estado = ? WHERE id = ?',
    [estado, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ mensaje: 'Estado de denuncia actualizado' });
    }
  );
};

// Eliminar denuncia
export const deleteDenuncia = (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM denuncias WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: 'Denuncia eliminada correctamente' });
  });
};
