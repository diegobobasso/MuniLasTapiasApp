// controllers/authController.js
import db from '../models/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/**
 * Controlador institucional para login de empleados.
 * Verifica credenciales, controla acceso, registra trazabilidad y genera token JWT.
 */
export const loginEmpleado = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    console.warn(`[${new Date().toISOString()}] Login fallido: campos incompletos`);
    return res.status(400).json({ success: false, error: 'Email/usuario y contraseña requeridos' });
  }

  // Consulta por email o username
  db.query(
    'SELECT * FROM empleados WHERE email = ? OR username = ?',
    [email, email],
    async (err, results) => {
      if (err) {
        console.error(`[${new Date().toISOString()}] Error de DB en login: ${err.message}`);
        return res.status(500).json({ success: false, error: 'Error interno del servidor' });
      }

      if (results.length === 0) {
        console.warn(`[${new Date().toISOString()}] Login fallido: usuario no encontrado (${email})`);
        return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
      }

      const empleado = results[0];

      // Verifica si el usuario está activo
      if (!empleado.activo) {
        console.warn(`[${new Date().toISOString()}] Usuario inactivo: ${email}`);
        return res.status(403).json({ success: false, error: 'Usuario inactivo' });
      }

      // Verifica contraseña
      const match = await bcrypt.compare(password, empleado.password_hash);
      if (!match) {
        // Incrementa intentos fallidos
        db.query(
          'UPDATE empleados SET intentos_login = intentos_login + 1 WHERE id = ?',
          [empleado.id]
        );
        console.warn(`[${new Date().toISOString()}] Contraseña incorrecta: ${email}`);
        return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
      }

      // Resetea intentos y actualiza último login
      db.query(
        'UPDATE empleados SET intentos_login = 0, ultimo_login = CURRENT_TIMESTAMP WHERE id = ?',
        [empleado.id]
      );

      // Genera token JWT
      const token = jwt.sign(
        { id: empleado.id, rol: empleado.rol, email: empleado.email },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );

      console.info(`[${new Date().toISOString()}] Login exitoso: ${email} (rol: ${empleado.rol})`);

      res.json({
        success: true,
        token,
        usuario: {
          id: empleado.id,
          nombre: empleado.nombre,
          rol: empleado.rol,
          email: empleado.email,
          ultimo_login: empleado.ultimo_login
        }
      });
    }
  );
};
