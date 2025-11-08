// 🛡️ Middleware de manejo centralizado de errores
// - Captura todos los errores de forma consistente
// - Logs estructurados para debugging
// - Respuestas de error normalizadas

const errorHandler = (error, req, res, next) => {
  console.error('💥 ERROR HANDLER - Capturando error:', {
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    user: req.user ? req.user.email : 'No autenticado',
    errorName: error.name,
    errorMessage: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });

  // ✅ ERRORES DE VALIDACIÓN JWT
  if (error.name === 'JsonWebTokenError') {
    return res.status(403).json({
      success: false,
      message: 'Token de autenticación inválido',
      error: 'TOKEN_INVALIDO',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(403).json({
      success: false,
      message: 'Token de autenticación expirado',
      error: 'TOKEN_EXPIRADO',
      details: 'El token ha caducado, por favor inicie sesión nuevamente'
    });
  }

  // ✅ ERRORES DE VALIDACIÓN DE DATOS
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación en los datos',
      error: 'VALIDACION_FALLIDA',
      details: error.message,
      campos: error.errors || []
    });
  }

  // ✅ ERRORES DE BASE DE DATOS
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'El registro ya existe',
      error: 'REGISTRO_DUPLICADO',
      details: 'Ya existe un registro con estos datos'
    });
  }

  if (error.code === 'ER_NO_REFERENCED_ROW') {
    return res.status(404).json({
      success: false,
      message: 'Recurso referenciado no encontrado',
      error: 'REFERENCIA_INVALIDA',
      details: 'El recurso al que intenta acceder no existe'
    });
  }

  // ✅ ERRORES DE AUTENTICACIÓN/AUTORIZACIÓN
  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'No autorizado',
      error: 'NO_AUTORIZADO',
      details: 'Credenciales de autenticación inválidas'
    });
  }

  if (error.name === 'ForbiddenError') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado',
      error: 'ACCESO_DENEGADO',
      details: 'No tiene permisos para realizar esta acción'
    });
  }

  // ✅ ERROR 404 - RECURSO NO ENCONTRADO
  if (error.name === 'NotFoundError') {
    return res.status(404).json({
      success: false,
      message: 'Recurso no encontrado',
      error: 'NO_ENCONTRADO',
      details: error.message || 'El recurso solicitado no existe'
    });
  }

  // ✅ ERROR DE SYNTAX EN JSON
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'JSON inválido en el cuerpo de la petición',
      error: 'JSON_INVALIDO',
      details: 'El formato JSON del request es incorrecto'
    });
  }

  // ✅ ERROR GENERAL DEL SERVIDOR
  console.error('❌ ERROR NO MANEJADO:', error);
  
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: 'ERROR_INTERNO',
    details: process.env.NODE_ENV === 'development' ? error.message : 'Por favor contacte al administrador del sistema',
    timestamp: new Date().toISOString(),
    referenceId: `ERR-${Date.now()}`
  });
};

// ✅ CLASES DE ERROR PERSONALIZADAS
class ValidationError extends Error {
  constructor(message, errors = []) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
    this.statusCode = 400;
  }
}

class NotFoundError extends Error {
  constructor(message = 'Recurso no encontrado') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

class UnauthorizedError extends Error {
  constructor(message = 'No autorizado') {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = 401;
  }
}

class ForbiddenError extends Error {
  constructor(message = 'Acceso denegado') {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = 403;
  }
}

// ✅ FUNCIÓN DE MANEJO DE ERRORES ASÍNCRONOS
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  asyncHandler,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError
};