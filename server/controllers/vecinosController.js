// Importamos la conexión a la base de datos
import db from '../models/db.js';

// Obtener todos los vecinos
export const getVecinos = (req, res) => {
  db.query('SELECT * FROM vecinos ORDER BY apellido, nombre', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Crear un nuevo vecino
export const createVecino = (req, res) => {
  const { nombre, apellido, dni, cuil_cuit, domicilio, telefono, email } = req.body;

  const nuevoVecino = {
    nombre,
    apellido,
    dni,
    cuil_cuit,
    domicilio,
    telefono,
    email
  };

  db.query('INSERT INTO vecinos SET ?', nuevoVecino, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: result.insertId, ...nuevoVecino });
  });
};

// Obtener un vecino por ID
export const getVecinoById = (req, res) => {
  const { id } = req.params;

  db.query('SELECT * FROM vecinos WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Vecino no encontrado' });
    res.json(results[0]);
  });
};

// Actualizar un vecino existente
export const updateVecino = (req, res) => {
  const { id } = req.params;

  db.query('UPDATE vecinos SET ? WHERE id = ?', [req.body, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: 'Vecino actualizado correctamente' });
  });
};

// Eliminar un vecino
export const deleteVecino = (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM vecinos WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: 'Vecino eliminado correctamente' });
  });
};


