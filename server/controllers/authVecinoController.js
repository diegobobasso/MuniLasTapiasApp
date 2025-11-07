// controllers/authVecinoController.js
import db from '../models/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/**
 * 🔐 Login institucional para vecinos
 */
export const loginVecino = (req, res) => {
  const { identificador, password } = req.body;

  if (!identificador || !password) {
    return res.status(400).json({ success: false, error: 'Email/DNI y contraseña requeridos' });
  }

  db.query(
    'SELECT * FROM vecinos WHERE email = ? OR dni = ?',
    [identificador, identificador],
    async (err, results) => {
      if (err) return res.status(500).json({ success: false, error: 'Error interno del servidor' });
      if (results.length === 0) return res.status(401).json({ success: false, error: 'Credenciales inválidas' });

      const vecino = results[0];
      const match = await bcrypt.compare(password, vecino.password_hash);
      if (!match) return res.status(401).json({ success: false, error: 'Credenciales inválidas' });

      const token = jwt.sign(
        { id: vecino.id, rol: 'vecino', email: vecino.email },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );

      res.json({
        success: true,
        token,
        vecino: {
          id: vecino.id,
          nombre: vecino.nombre,
          apellido: vecino.apellido,
          email: vecino.email,
          dni: vecino.dni
        }
      });
    }
  );
};
