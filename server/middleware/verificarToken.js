const jwt = require('jsonwebtoken');

/**
 * 🔐 Middleware institucional para verificar token JWT
 * - Permite acceso libre a /admin/bootstrap si no hay token
 * - Valida formato "Bearer <token>" en el resto
 * - Decodifica y verifica firma con JWT_SECRET
 * - Guarda datos del empleado en req.empleado y req.user
 */
const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 🔓 Excepción: permitir acceso libre a /admin/bootstrap
  if (req.method === 'POST' && req.path === '/bootstrap' && req.baseUrl === '/admin') {
    return next();
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn(`[${new Date().toISOString()}] Token no proporcionado`);
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id || !decoded.rol || !decoded.email) {
      console.warn(`[${new Date().toISOString()}] Token incompleto o mal formado`);
      return res.status(403).json({ error: 'Token inválido o incompleto' });
    }

    console.info(`[${new Date().toISOString()}] Token verificado para: ${decoded.email} (rol: ${decoded.rol})`);

    req.empleado = decoded;
    req.user = decoded; // ✅ Compatibilidad con controladores existentes
    next();
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error al verificar token:', err);
    } else {
      console.warn(`[${new Date().toISOString()}] Token inválido: ${err.message}`);
    }

    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};

module.exports = { verificarToken };
