// controllers/empleadosController.js
import db from '../models/db.js';
import bcrypt from 'bcrypt';

/**
 * 📄 Listar empleados activos
 * Solo muestra empleados con estado activo para panel institucional
 */
export const getEmpleados = (req, res) => {
  db.query(
    'SELECT id, nombre, email, rol, fecha_alta FROM empleados WHERE activo = TRUE',
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
};

/**
 * ➕ Crear empleado (solo admin)
 * Valida rol, hashea contraseña y registra alta institucional
 */
export const createEmpleado = async (req, res) => {
  const { nombre, email, password, rol } = req.body;

  // Validación de rol institucional
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
      fecha_alta: new Date(),
      activo: true
    };

    db.query('INSERT INTO empleados SET ?', nuevo, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: result.insertId, ...nuevo });
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al procesar la contraseña' });
  }
};

/**
 * 📴 Baja lógica de empleado
 * Desactiva el acceso sin eliminar el registro
 */
export const desactivarEmpleado = (req, res) => {
  db.query(
    'UPDATE empleados SET activo = FALSE WHERE id = ?',
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ mensaje: 'Empleado desactivado' });
    }
  );
};

/**
 * 🔄 Restaurar contraseña institucional (solo admin)
 * Reestablece la contraseña de un empleado a una nueva segura
 */
export const restaurarClaveEmpleado = async (req, res) => {
  const { id } = req.params;
  const { nuevaClave } = req.body;

  // Validación de rol institucional
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
        res.json({ mensaje: 'Contraseña restaurada correctamente' });
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'Error al procesar la nueva contraseña' });
  }
};
