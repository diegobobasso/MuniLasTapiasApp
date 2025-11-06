import db from '../models/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const loginEmpleado = (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM empleados WHERE email = ?', [email], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
    }

    const empleado = results[0];
    const match = await bcrypt.compare(password, empleado.password_hash);

    if (!match) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: empleado.id, rol: empleado.rol },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ success: true, token });
  });
};
