import jwt from 'jsonwebtoken';
import { logAcceso } from '../utils/logger.js';

/**
 * 🔐 Middleware institucional para verificar token JWT
 * - Valida formato "Bearer <token>"
 * - Decodifica y verifica firma con JWT_SECRET
 * - Guarda datos del usuario en req.empleado o req.vecino
 * - Registra trazabilidad en logs/accesos.log
 */
export const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 🚫 Token ausente o mal formado
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn(`[${new Date().toISOString()}] Token no proporcionado`);
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  // 🔍 Extraer token
  const token = authHeader.split(' ')[1];

  try {
    // ✅ Verificar firma y decodificar
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🚫 Token sin campos mínimos requeridos
    if (!decoded || !decoded.id || !decoded.rol) {
      console.warn(`[${new Date().toISOString()}] Token incompleto o mal formado`);
      return res.status(403).json({ error: 'Token inválido o incompleto' });
    }

    // 🧍‍♂️ Asignar usuario según rol
    if (decoded.rol === 'vecino') {
      req.vecino = decoded;
    } else {
      req.empleado = decoded;
    }

    // 🧾 Registrar trazabilidad
    logAcceso(`${decoded.rol} accedió a ${req.originalUrl}`);
    console.info(`[${new Date().toISOString()}] Token verificado para: ${decoded.email || decoded.dni} (rol: ${decoded.rol})`);

    next(); // ✅ Continuar con la ruta protegida
  } catch (err) {
    // 🚫 Token inválido o expirado
    const mensaje = `[${new Date().toISOString()}] Token inválido: ${err.message}`;
    process.env.NODE_ENV === 'development' ? console.error(mensaje) : console.warn(mensaje);
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};
