import db from '../models/db.js';

// Obtener todos los eventos
export const getEventos = (req, res) => {
  db.query('SELECT * FROM eventos ORDER BY fecha DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Crear un nuevo evento
export const createEvento = (req, res) => {
  const { titulo, descripcion, fecha, lugar, tipo, publico_objetivo } = req.body;

  const nuevo = {
    titulo,
    descripcion,
    fecha,
    lugar,
    tipo,
    publico_objetivo
  };

  db.query('INSERT INTO eventos SET ?', nuevo, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: result.insertId, ...nuevo });
  });
};

// Actualizar evento
export const updateEvento = (req, res) => {
  const { id } = req.params;

  db.query('UPDATE eventos SET ? WHERE id = ?', [req.body, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: 'Evento actualizado correctamente' });
  });
};

// Eliminar evento
export const deleteEvento = (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM eventos WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: 'Evento eliminado correctamente' });
  });
};
