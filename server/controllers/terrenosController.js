import db from '../models/db.js';

// Obtener todos los terrenos
export const getTerrenos = (req, res) => {
  db.query('SELECT * FROM terrenos ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Crear nuevo terreno
export const createTerreno = (req, res) => {
  const data = req.body;
  if (!data.partida || !data.direccion) {
    return res.status(400).json({ error: 'Partida y dirección son obligatorias' });
  }

  db.query('INSERT INTO terrenos SET ?', data, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: result.insertId, ...data });
  });
};

// Obtener terreno por ID
export const getTerrenoById = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM terrenos WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Terreno no encontrado' });
    res.json(results[0]);
  });
};

// Actualizar terreno
export const updateTerreno = (req, res) => {
  const { id } = req.params;
  db.query('UPDATE terrenos SET ? WHERE id = ?', [req.body, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: parseInt(id), ...req.body });
  });
};
