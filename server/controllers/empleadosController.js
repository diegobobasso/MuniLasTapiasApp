import db from '../models/db.js';
import bcrypt from 'bcrypt';
import { logAcceso } from '../utils/logger.js';

/**
 * 📄 Listar empleados activos
 */
export const getEmpleados = (req, res) => {
  db.query(
    'SELECT id, nombre, email, rol, creado_en FROM empleados WHERE activo = TRUE',
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      logAcceso(`${req.empleado.rol} accedió a listado de empleados`);
      res.json(results);
    }
  );
};

/**
 * ➕ Crear empleado (solo admin)
 */
export const createEmpleado = async (req, res) => {
  const { nombre, email, password, rol } = req.body;

  if (req.empleado.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso restringido al rol administrador' });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);
    const nuevo = {
      nombre,
      email,
      password_hash,
      rol,
      activo: true
    };

    db.query('INSERT INTO empleados SET ?', nuevo, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      logAcceso(`admin creó empleado: ${nombre}`);
      res.status(201).json({ id: result.insertId, ...nuevo });
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al procesar la contraseña' });
  }
};

/**
 * 📴 Baja lógica de empleado
 */
export const desactivarEmpleado = (req, res) => {
  db.query(
    'UPDATE empleados SET activo = FALSE WHERE id = ?',
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      logAcceso(`admin desactivó empleado ID ${req.params.id}`);
      res.json({ mensaje: 'Empleado desactivado' });
    }
  );
};

/**
 * 🔄 Restaurar contraseña institucional (solo admin)
 */
export const restaurarClaveEmpleado = async (req, res) => {
  const { id } = req.params;
  const { nuevaClave } = req.body;

  if (req.empleado.rol !== 'admin') {
    return res.status(403).json({ error: 'Solo el administrador puede restaurar claves de empleados' });
  }

  try {
    const password_hash = await bcrypt.hash(nuevaClave, 10);
    db.query(
      'UPDATE empleados SET password_hash = ?, intentos_login = 0 WHERE id = ?',
      [password_hash, id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        logAcceso(`admin restauró contraseña de empleado ID ${id}`);
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
export const cambiarClavePropiaEmpleado = async (req, res) => {
  const { nuevaClave } = req.body;
  const empleado = req.empleado;

  if (!empleado || !empleado.id) {
    return res.status(401).json({ error: 'Empleado no autenticado' });
  }

  if (!nuevaClave || nuevaClave.length < 6) {
    return res.status(400).json({ error: 'La nueva clave debe tener al menos 6 caracteres' });
  }

  try {
    const password_hash = await bcrypt.hash(nuevaClave, 10);
    db.query(
      'UPDATE empleados SET password_hash = ?, intentos_login = 0 WHERE id = ?',
      [password_hash, empleado.id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        logAcceso(`empleado ID ${empleado.id} cambió su propia contraseña`);
        res.json({ mensaje: 'Contraseña actualizada correctamente' });
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'Error al procesar la nueva contraseña' });
  }
};
