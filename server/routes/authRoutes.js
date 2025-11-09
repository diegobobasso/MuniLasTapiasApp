/**
 * 🔐 CONTROLADOR DE AUTENTICACIÓN - VERSIÓN MEJORADA
 * 
 * Maneja todo el flujo de autenticación para empleados y administradores
 * incluyendo login, cambio de contraseña inicial y renovación de tokens.
 * 
 * Endpoints disponibles:
 * - POST /api/auth/login                 - Login de empleados
 * - POST /api/auth/cambiar-password-inicial - Cambio de contraseña inicial
 * - POST /api/auth/renovar-token         - Renovar token JWT (FUTURO)
 * - POST /api/auth/verificar-token       - Verificar token vigente (FUTURO)
 * 
 * Flujos implementados:
 * - Login con verificación de cambio de contraseña requerido
 * - Cambio seguro de contraseña inicial
 * - Generación de tokens JWT seguros
 * - Validación robusta de credenciales
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { asyncHandler, ValidationError, UnauthorizedError } = require('../middleware/errorHandler');

// 📊 DATOS DEMO DE EMPLEADOS (TEMPORAL - COHERENTE CON EMPLEADOS.JS)
const empleadosDemo = [
  { 
    id: 1, 
    nombre: 'Admin', 
    apellido: 'Sistema',
    email: 'admin@municipalidad.com', 
    password: 'Admin123!', // En producción esto sería un hash
    rol: 'admin', 
    activo: true,
    requiereCambioPassword: true, // Para simular flujo inicial
    fechaCreacion: '2024-01-01'
  },
  { 
    id: 2, 
    nombre: 'Empleado', 
    apellido: 'Ejemplo',
    email: 'empleado@municipalidad.com', 
    password: 'Empleado123!',
    rol: 'empleado', 
    activo: true,
    requiereCambioPassword: false,
    fechaCreacion: '2024-01-01'
  }
];

/**
 * ✅ MIDDLEWARE DE VALIDACIÓN PARA LOGIN
 * 
 * Valida que las credenciales de login tengan formato correcto
 * antes de proceder con la autenticación.
 * 
 * @param {Object} req - Request object de Express
 * @param {Object} res - Response object de Express  
 * @param {Function} next - Next middleware function
 */
const validarLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errores = [];

  // Validación de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errores.push('El email debe tener un formato válido');
  }

  // Validación de password
  if (!password || password.length < 1) {
    errores.push('La contraseña es requerida');
  }

  if (errores.length > 0) {
    throw new ValidationError('Errores de validación en credenciales', errores);
  }

  // Normalizar email
  req.body.email = email.toLowerCase().trim();
  
  next();
};

/**
 * ✅ MIDDLEWARE DE VALIDACIÓN PARA CAMBIO DE CONTRASEÑA
 * 
 * Valida que la nueva contraseña cumpla con los requisitos de seguridad
 * antes de permitir el cambio en el sistema.
 * 
 * @param {Object} req - Request object de Express
 * @param {Object} res - Response object de Express
 * @param {Function} next - Next middleware function
 */
const validarCambioPassword = (req, res, next) => {
  const { email, nuevaPassword } = req.body;
  const errores = [];

  // Validación de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errores.push('El email debe tener un formato válido');
  }

  // Validación de nueva contraseña
  if (!nuevaPassword || nuevaPassword.length < 8) {
    errores.push('La nueva contraseña debe tener al menos 8 caracteres');
  }

  // Validaciones de fortaleza de contraseña
  if (!/(?=.*[a-z])/.test(nuevaPassword)) {
    errores.push('La contraseña debe contener al menos una letra minúscula');
  }

  if (!/(?=.*[A-Z])/.test(nuevaPassword)) {
    errores.push('La contraseña debe contener al menos una letra mayúscula');
  }

  if (!/(?=.*\d)/.test(nuevaPassword)) {
    errores.push('La contraseña debe contener al menos un número');
  }

  if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(nuevaPassword)) {
    errores.push('La contraseña debe contener al menos un carácter especial');
  }

  if (errores.length > 0) {
    throw new ValidationError('Errores de validación en cambio de contraseña', errores);
  }

  // Normalizar email
  req.body.email = email.toLowerCase().trim();
  
  next();
};

/**
 * 🔑 FUNCIÓN PARA GENERAR TOKEN JWT
 * 
 * Genera un token JWT seguro con la información del usuario
 * y tiempo de expiración configurado.
 * 
 * @param {Object} usuario - Objeto con datos del usuario
 * @returns {string} Token JWT firmado
 */
const generarToken = (usuario) => {
  const payload = {
    id: usuario.id,
    email: usuario.email,
    rol: usuario.rol,
    requiereCambioPassword: usuario.requiereCambioPassword || false
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '8h', // Token válido por 8 horas
    issuer: 'municipalidad-lastapias',
    subject: usuario.email.toString()
  });
};

/**
 * 🔐 ENDPOINT: LOGIN DE EMPLEADOS
 * 
 * Autentica a un empleado verificando sus credenciales y estado.
 * Implementa flujo de cambio de contraseña inicial requerido.
 * 
 * @route POST /api/auth/login
 * @access Público
 */
router.post('/login', validarLogin, asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log('🔐 POST /api/auth/login - Email:', email);
  
  // Simular procesamiento asíncrono
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Buscar empleado por email
  const empleado = empleadosDemo.find(emp => 
    emp.email === email && emp.activo === true
  );

  // Verificar si el empleado existe
  if (!empleado) {
    console.log('❌ Login fallido: Empleado no encontrado o inactivo');
    throw new UnauthorizedError('Credenciales incorrectas');
  }

  // Verificar contraseña (en producción esto sería comparación de hashes)
  if (empleado.password !== password) {
    console.log('❌ Login fallido: Contraseña incorrecta para:', email);
    throw new UnauthorizedError('Credenciales incorrectas');
  }

  // Verificar si requiere cambio de contraseña
  if (empleado.requiereCambioPassword) {
    console.log('🔄 Login bloqueado: Requiere cambio de contraseña para:', email);
    
    return res.status(403).json({
      success: false,
      message: 'Debe cambiar su contraseña inicial',
      error: 'CAMBIO_PASSWORD_REQUERIDO',
      data: {
        email: empleado.email,
        requiereCambioPassword: true
      }
    });
  }

  // Generar token JWT
  const token = generarToken(empleado);
  
  console.log('✅ Login exitoso para:', email);
  
  // Respuesta exitosa
  res.json({
    success: true,
    message: 'Login exitoso',
    data: {
      token: token,
      usuario: {
        id: empleado.id,
        nombre: empleado.nombre,
        apellido: empleado.apellido,
        email: empleado.email,
        rol: empleado.rol,
        requiereCambioPassword: empleado.requiereCambioPassword
      }
    },
    metadata: {
      timestamp: new Date().toISOString(),
      expiraEn: '8 horas'
    }
  });
}));

/**
 * 🔄 ENDPOINT: CAMBIO DE CONTRASEÑA INICIAL
 * 
 * Permite a un usuario cambiar su contraseña inicial
 * cuando el sistema lo requiere por seguridad.
 * 
 * @route POST /api/auth/cambiar-password-inicial
 * @access Público
 */
router.post('/cambiar-password-inicial', validarCambioPassword, asyncHandler(async (req, res) => {
  const { email, nuevaPassword } = req.body;
  console.log('🔄 POST /api/auth/cambiar-password-inicial - Email:', email);
  
  // Simular procesamiento asíncrono
  await new Promise(resolve => setTimeout(resolve, 150));
  
  // Buscar empleado por email
  const empleadoIndex = empleadosDemo.findIndex(emp => 
    emp.email === email && emp.activo === true
  );

  // Verificar si el empleado existe
  if (empleadoIndex === -1) {
    console.log('❌ Cambio password fallido: Empleado no encontrado');
    throw new UnauthorizedError('Empleado no encontrado');
  }

  // Verificar que realmente requiere cambio de password
  if (!empleadosDemo[empleadoIndex].requiereCambioPassword) {
    console.log('⚠️ Cambio password innecesario para:', email);
    throw new ValidationError('No se requiere cambio de contraseña para este usuario');
  }

  // Actualizar contraseña (en producción esto sería un hash)
  empleadosDemo[empleadoIndex].password = nuevaPassword;
  empleadosDemo[empleadoIndex].requiereCambioPassword = false;

  console.log('✅ Contraseña cambiada exitosamente para:', email);
  
  // Respuesta exitosa
  res.json({
    success: true,
    message: 'Contraseña actualizada exitosamente',
    data: {
      email: email,
      requiereCambioPassword: false,
      fechaActualizacion: new Date().toISOString()
    }
  });
}));

/**
 * 🔄 ENDPOINT: RENOVAR TOKEN (FUTURO)
 * 
 * Permite renovar un token JWT antes de que expire
 * sin necesidad de volver a hacer login.
 * 
 * @route POST /api/auth/renovar-token
 * @access Privado (Requiere token válido pero próximo a expirar)
 */
router.post('/renovar-token', asyncHandler(async (req, res) => {
  // Este endpoint será implementado cuando tengamos refresh tokens
  // Por ahora retornamos un mensaje informativo
  
  res.status(501).json({
    success: false,
    message: 'Funcionalidad en desarrollo',
    error: 'NO_IMPLEMENTADO',
    data: {
      feature: 'renovacion_tokens',
      status: 'planned'
    }
  });
}));

/**
 * 🔍 ENDPOINT: VERIFICAR TOKEN (FUTURO)
 * 
 * Permite verificar si un token JWT es válido y obtener
 * información básica del usuario sin hacer una operación completa.
 * 
 * @route POST /api/auth/verificar-token
 * @access Público
 */
router.post('/verificar-token', asyncHandler(async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    throw new ValidationError('Token es requerido');
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    res.json({
      success: true,
      message: 'Token válido',
      data: {
        valido: true,
        usuario: {
          id: decoded.id,
          email: decoded.email,
          rol: decoded.rol
        },
        expira: new Date(decoded.exp * 1000).toISOString()
      }
    });
  } catch (error) {
    throw new UnauthorizedError('Token inválido o expirado');
  }
}));

/**
 * 📊 ENDPOINT: INFORMACIÓN DE AUTENTICACIÓN
 * 
 * Proporciona información sobre el sistema de autenticación
 * y endpoints disponibles.
 * 
 * @route GET /api/auth/info
 * @access Público
 */
router.get('/info', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Sistema de autenticación Municipalidad Las Tapias',
    data: {
      version: '1.0.0',
      flujosSoportados: [
        'login_empleados',
        'cambio_password_inicial'
      ],
      seguridad: {
        jwt: true,
        expiracionTokens: '8 horas',
        requiereCambioPasswordInicial: true
      },
      endpoints: [
        'POST /api/auth/login',
        'POST /api/auth/cambiar-password-inicial',
        'POST /api/auth/verificar-token'
      ]
    }
  });
}));

module.exports = router;