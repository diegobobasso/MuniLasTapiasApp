import jwt from 'jsonwebtoken';

/**
 * 🔐 Middleware institucional para verificar token JWT
 * - Valida formato "Bearer <token>"
 * - Decodifica y verifica firma con JWT_SECRET
 * - Guarda datos del empleado en req.empleado
 * - Rechaza accesos no autenticados o tokens inválidos
 */
export const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Verifica que el header exista y tenga formato correcto
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn(`[${new Date().toISOString()}] Token no proporcionado`);
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validación estructural del token decodificado
    if (!decoded || !decoded.id || !decoded.rol || !decoded.email) {
      console.warn(`[${new Date().toISOString()}] Token incompleto o mal formado`);
      return res.status(403).json({ error: 'Token inválido o incompleto' });
    }

    // Trazabilidad institucional del acceso
    console.info(`[${new Date().toISOString()}] Token verificado para: ${decoded.email} (rol: ${decoded.rol})`);

    req.empleado = decoded; // Guarda datos del empleado en la request
    next();
  } catch (err) {
    // Logging controlado según entorno
    if (process.env.NODE_ENV === 'development') {
      console.error('Error al verificar token:', err);
    } else {
      console.warn(`[${new Date().toISOString()}] Token inválido: ${err.message}`);
    }

    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};
