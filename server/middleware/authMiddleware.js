// authMiddleware.js
import jwt from 'jsonwebtoken';

/**
 * Middleware institucional para verificar el token JWT.
 * Protege rutas sensibles y registra trazabilidad básica.
 */
export const verificarToken = (req, res, next) => {
  // Extrae el token del encabezado Authorization: Bearer <token>
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    console.warn(`[${new Date().toISOString()}] Token faltante en solicitud a ${req.originalUrl}`);
    return res.status(401).json({ error: 'Token faltante' });
  }

  try {
    // Verifica y decodifica el token usando la clave secreta institucional
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Asocia los datos del usuario autenticado al objeto de solicitud
    req.empleado = decoded;

    // Registra trazabilidad básica del acceso
    console.info(`[${new Date().toISOString()}] Acceso autorizado: ${decoded.email || decoded.username} → ${req.originalUrl}`);

    next();
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Token inválido: ${err.message}`);
    res.status(403).json({ error: 'Token inválido o expirado' });
  }
};
