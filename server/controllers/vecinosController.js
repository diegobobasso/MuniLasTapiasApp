// controllers/vecinosController.js
import db from '../models/db.js';
import bcrypt from 'bcrypt';

/**
 * 📄 Obtener todos los vecinos
 * Ordenados por apellido y nombre para panel institucional
 */
export const getVecinos = (req, res) => {
  db.query('SELECT * FROM vecinos ORDER BY apellido, nombre', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

/**
 * ➕ Crear un nuevo vecino (solo empleados)
 * Valida rol institucional y registra alta
 */
export const createVecino = (req, res) => {
  const { nombre, apellido, dni, cuil_cuit, domicilio, telefono, email, password } = req.body;

  // Validación de rol institucional
  if (req.empleado.rol !== 'empleado') {
    return res.status(403).json({ error: 'Solo empleados pueden dar de alta vecinos' });
  }

  // Hashea contraseña si se provee
  let password_hash = null;
  if (password) {
    password_hash = bcrypt.hashSync(password, 10);
  }

  const nuevoVecino = {
    nombre,
    apellido,
    dni,
    cuil_cuit,
    domicilio,
    telefono,
    email,
    password_hash,
    fecha_alta: new Date(),
    activo: true
  };

  db.query('INSERT INTO vecinos SET ?', nuevoVecino, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: result.insertId, ...nuevoVecino });
  });
};

/**
 * 🔄 Restaurar contraseña de vecino (solo empleados)
 * Reestablece la contraseña a una nueva segura
 */
export const restaurarClaveVecino = async (req, res) => {
  const { id } = req.params;
  const { nuevaClave } = req.body;

  // Validación de rol institucional
  if (req.empleado.rol !== 'empleado') {
    return res.status(403).json({ error: 'Solo empleados pueden restaurar claves de vecinos' });
  }

  try {
    const password_hash = await bcrypt.hash(nuevaClave, 10);
    db.query(
      'UPDATE vecinos SET password_hash = ? WHERE id = ?',
      [password_hash, id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: 'Contraseña restaurada correctamente' });
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'Error al procesar la nueva contraseña' });
  }
};

/**
 * 📄 Obtener un vecino por ID
 */
export const getVecinoById = (req, res) => {
  const { id } = req.params;

  db.query('SELECT * FROM vecinos WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Vecino no encontrado' });
    res.json(results[0]);
  });
};

/**
 * ✏️ Actualizar un vecino existente
 */
export const updateVecino = (req, res) => {
  const { id } = req.params;

  db.query('UPDATE vecinos SET ? WHERE id = ?', [req.body, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: 'Vecino actualizado correctamente' });
  });
};

/**
 * 🗑️ Eliminar un vecino
 */
export const deleteVecino = (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM vecinos WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: 'Vecino eliminado correctamente' });
  });
};
