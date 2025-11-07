// authMiddleware.js
import jwt from 'jsonwebtoken';

/**
 * 🔐 Middleware institucional para verificar token JWT
 * - Valida formato "Bearer <token>"
 * - Decodifica y verifica firma con JWT_SECRET
 * - Guarda datos del usuario en req.empleado o req.vecino
 */
export const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn(`[${new Date().toISOString()}] Token no proporcionado`);
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id || !decoded.rol) {
      console.warn(`[${new Date().toISOString()}] Token incompleto o mal formado`);
      return res.status(403).json({ error: 'Token inválido o incompleto' });
    }

    if (decoded.rol === 'vecino') {
      req.vecino = decoded;
    } else {
      req.empleado = decoded;
    }

    console.info(`[${new Date().toISOString()}] Token verificado para: ${decoded.email || decoded.dni} (rol: ${decoded.rol})`);
    next();
  } catch (err) {
    const mensaje = `[${new Date().toISOString()}] Token inválido: ${err.message}`;
    process.env.NODE_ENV === 'development' ? console.error(mensaje) : console.warn(mensaje);
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};
