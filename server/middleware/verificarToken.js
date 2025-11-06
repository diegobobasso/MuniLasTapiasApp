import jwt from 'jsonwebtoken';

// Middleware para verificar token JWT
export const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Verifica que el header exista y tenga formato "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.empleado = decoded; // Guarda datos del empleado en la request
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};
