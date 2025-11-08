import db from '../models/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { logAcceso } from '../utils/logger.js';

/**
 * 🔐 POST /auth/login
 * Login institucional con verificación de contraseña inicial
 */
export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Faltan credenciales' });
  }

  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM empleados WHERE username = ? AND activo = TRUE',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado o inactivo' });
    }

    const empleado = rows[0];

    const passwordValida = await bcrypt.compare(password, empleado.password_hash);
    if (!passwordValida) {
      return res.status(403).json({ error: 'Contraseña incorrecta' });
    }

    if (empleado.requiere_cambio_password) {
      return res.status(403).json({ error: 'Debe cambiar la contraseña inicial antes de continuar' });
    }

    const token = jwt.sign(
      { id: empleado.id, rol: empleado.rol, email: empleado.email },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    logAcceso(`admin inició sesión correctamente`);
    res.json({ token });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error en login: ${error.message}`);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * 🔐 POST /auth/cambiar-password-inicial
 * Cambia la contraseña del superadmin por defecto
 * - Requiere: { username, nuevaPassword }
 * - Solo si requiere_cambio_password = TRUE
 */
export const cambiarPasswordInicial = async (req, res) => {
  const { username, nuevaPassword } = req.body;

  if (!username || !nuevaPassword) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM empleados WHERE username = ? AND activo = TRUE',
      [username]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const empleado = rows[0];

    if (!empleado.requiere_cambio_password) {
      return res.status(403).json({ error: 'Este usuario ya tiene contraseña definitiva' });
    }

    const nuevoHash = await bcrypt.hash(nuevaPassword, 12);

    await db.promise().query(
      'UPDATE empleados SET password_hash = ?, requiere_cambio_password = FALSE WHERE id = ?',
      [nuevoHash, empleado.id]
    );

    logAcceso(`admin actualizó su contraseña inicial`);
    res.json({ mensaje: 'Contraseña actualizada correctamente. Ya puede iniciar sesión.' });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error al cambiar contraseña inicial: ${error.message}`);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
