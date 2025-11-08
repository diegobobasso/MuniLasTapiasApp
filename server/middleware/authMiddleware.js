import jwt from 'jsonwebtoken';

// ✅ CORREGIDO: Exportación nombrada correcta
export const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('🔐 Verificando token...');
  console.log('🔐 Header Authorization:', req.headers['authorization']);
  console.log('🔐 Token extraído:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');

  if (!token) {
    console.log('❌ Token no proporcionado');
    return res.status(403).json({ error: 'Token no proporcionado' });
  }

  try {
    // ✅ VERIFICAR QUE JWT_SECRET EXISTA
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET no configurado en variables de entorno');
      return res.status(500).json({ error: 'Error de configuración del servidor' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // ✅ VALIDAR ESTRUCTURA DEL TOKEN
    if (!decoded.id || !decoded.rol) {
      console.log('❌ Token con estructura inválida:', decoded);
      return res.status(403).json({ error: 'Token con estructura inválida' });
    }
    
    req.user = decoded;
    console.log(`✅ Token válido para usuario: ${decoded.email}, rol: ${decoded.rol}`);
    next();
  } catch (error) {
    console.error('❌ Error verificando token:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Token inválido: jwt malformed' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expirado' });
    } else {
      return res.status(403).json({ error: `Error de autenticación: ${error.message}` });
    }
  }
};

// ✅ CORREGIDO: Exportación nombrada para autorización de roles
export const autorizarRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ error: 'Usuario no autenticado' });
    }

    if (!roles.includes(req.user.rol)) {
      console.log(`❌ Acceso denegado. Rol ${req.user.rol} no autorizado. Requerido: ${roles}`);
      return res.status(403).json({ 
        error: 'Acceso denegado: permisos insuficientes' 
      });
    }

    console.log(`✅ Acceso autorizado para rol: ${req.user.rol}`);
    next();
  };
};

// ✅ OPCIÓN ALTERNATIVA: Si prefieres exportación por defecto
// export default { verificarToken, autorizarRoles };