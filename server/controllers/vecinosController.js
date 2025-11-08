import db from '../models/db.js';
import bcrypt from 'bcrypt';
import { logAcceso } from '../utils/logger.js';

/**
 * 📄 Listar vecinos registrados
 */
export const getVecinos = (req, res) => {
  db.query(
    'SELECT id, nombre, apellido, dni, email, domicilio, telefono FROM vecinos WHERE activo = TRUE',
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      // Ajuste para trazabilidad uniforme
      logAcceso(`${req.empleado?.rol || req.vecino?.rol} accedió a /api/vecinos`);
      res.json(results);
    }
  );
};

/**
 * ➕ Crear vecino (solo empleados)
 */
export const createVecino = async (req, res) => {
  const { nombre, apellido, dni, domicilio, telefono, email, password } = req.body;

  if (!req.empleado) {
    return res.status(403).json({ error: 'Solo empleados pueden registrar vecinos' });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);
    const nuevo = { nombre, apellido, dni, domicilio, telefono, email, password_hash, activo: true };

    db.query('INSERT INTO vecinos SET ?', nuevo, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      logAcceso(`empleado accedió a /api/vecinos`);
      res.status(201).json({ id: result.insertId, ...nuevo });
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al procesar la contraseña' });
  }
};

/**
 * 📄 Obtener vecino por ID
 */
export const getVecinoById = (req, res) => {
  db.query('SELECT * FROM vecinos WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Vecino no encontrado' });
    logAcceso(`${req.empleado?.rol || req.vecino?.rol} accedió a /api/vecinos`);
    res.json(results[0]);
  });
};

/**
 * ✏️ Actualizar datos de vecino
 */
export const updateVecino = (req, res) => {
  db.query('UPDATE vecinos SET ? WHERE id = ?', [req.body, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    logAcceso(`${req.empleado?.rol || req.vecino?.rol} accedió a /api/vecinos`);
    res.json({ mensaje: 'Vecino actualizado correctamente' });
  });
};

/**
 * 🗑️ Eliminar vecino
 */
export const deleteVecino = (req, res) => {
  db.query('DELETE FROM vecinos WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    logAcceso(`${req.empleado?.rol || req.vecino?.rol} accedió a /api/vecinos`);
    res.json({ mensaje: 'Vecino eliminado correctamente' });
  });
};

/**
 * 🔄 Restaurar contraseña institucional (solo empleados)
 */
export const restaurarClaveVecino = async (req, res) => {
  const { id } = req.params;
  const { nuevaClave } = req.body;

  if (!req.empleado) {
    return res.status(403).json({ error: 'Solo empleados pueden restaurar claves de vecinos' });
  }

  try {
    const password_hash = await bcrypt.hash(nuevaClave, 10);
    db.query(
      'UPDATE vecinos SET password_hash = ?, intentos_login = 0 WHERE id = ?',
      [password_hash, id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        logAcceso(`${req.empleado?.rol || req.vecino?.rol} accedió a /api/vecinos`);
        res.json({ mensaje: 'Contraseña restaurada correctamente' });
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'Error al procesar la nueva contraseña' });
  }
};

/**
 * 🔐 Cambiar contraseña propia (autenticado)
 */
export const cambiarClavePropiaVecino = async (req, res) => {
  const { nuevaClave } = req.body;
  const vecino = req.vecino;

  if (!vecino || !vecino.id) {
    return res.status(401).json({ error: 'Vecino no autenticado' });
  }

  if (!nuevaClave || nuevaClave.length < 6) {
    return res.status(400).json({ error: 'La nueva clave debe tener al menos 6 caracteres' });
  }

  try {
    const password_hash = await bcrypt.hash(nuevaClave, 10);
    db.query(
      'UPDATE vecinos SET password_hash = ?, intentos_login = 0 WHERE id = ?',
      [password_hash, vecino.id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        logAcceso(`vecino accedió a /api/vecinos`);
        res.json({ mensaje: 'Contraseña actualizada correctamente' });
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'Error al procesar la nueva contraseña' });
  }
};
