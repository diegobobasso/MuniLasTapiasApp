// controllers/authController.js
import db from '../models/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/**
 * 🔐 Login institucional para empleados
 */
export const loginEmpleado = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email/usuario y contraseña requeridos' });
  }

  db.query(
    'SELECT * FROM empleados WHERE email = ? OR username = ?',
    [email, email],
    async (err, results) => {
      if (err) return res.status(500).json({ success: false, error: 'Error interno del servidor' });
      if (results.length === 0) return res.status(401).json({ success: false, error: 'Credenciales inválidas' });

      const empleado = results[0];
      if (!empleado.activo) return res.status(403).json({ success: false, error: 'Usuario inactivo' });

      const match = await bcrypt.compare(password, empleado.password_hash);
      if (!match) {
        db.query('UPDATE empleados SET intentos_login = intentos_login + 1 WHERE id = ?', [empleado.id]);
        return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
      }

      db.query('UPDATE empleados SET intentos_login = 0, ultimo_login = CURRENT_TIMESTAMP WHERE id = ?', [empleado.id]);

      const token = jwt.sign(
        { id: empleado.id, rol: empleado.rol, email: empleado.email },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );

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
