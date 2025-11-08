const express = require('express');
const router = express.Router();
const { verificarToken, autorizarRoles } = require('../middleware/authMiddleware');
const { asyncHandler, ValidationError, NotFoundError } = require('../middleware/errorHandler');

// ✅ FUNCIÓN DE VALIDACIÓN CENTRALIZADA (MEJORADA)
const validarEmpleado = (req, res, next) => {
  const { nombre, email, password, rol } = req.body;
  const errores = [];

  if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2) {
    errores.push('El nombre debe tener al menos 2 caracteres');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errores.push('El email debe tener un formato válido');
  }

  if (!password || password.length < 8) {
    errores.push('La contraseña debe tener al menos 8 caracteres');
  }

  const rolesPermitidos = ['admin', 'empleado'];
  if (!rol || !rolesPermitidos.includes(rol)) {
    errores.push(`El rol debe ser uno de: ${rolesPermitidos.join(', ')}`);
  }

  if (errores.length > 0) {
    throw new ValidationError('Errores de validación en empleado', errores);
  }

  req.body.nombre = nombre.trim();
  req.body.email = email.toLowerCase().trim();
  
  next();
};

// ✅ VALIDACIÓN PARA ACTUALIZACIÓN DE CONTRASEÑA
const validarCambioPassword = (req, res, next) => {
  const { nuevaClave } = req.body;

  if (!nuevaClave || nuevaClave.length < 8) {
    throw new ValidationError('La nueva contraseña debe tener al menos 8 caracteres');
  }

  next();
};

// ✅ SIMULACIÓN DE BASE DE DATOS (para demostración)
const empleadosDemo = [
  { id: 1, nombre: 'Admin', email: 'admin@municipalidad.com', rol: 'admin', activo: true },
  { id: 2, nombre: 'Empleado', email: 'empleado@municipalidad.com', rol: 'empleado', activo: true }
];

// ✅ RUTA GET /api/empleados - CON asyncHandler
router.get('/', verificarToken, asyncHandler(async (req, res) => {
  console.log('✅ GET /api/empleados - Usuario:', req.user.email);
  
  // Simular pequeña demora de BD
  await new Promise(resolve => setTimeout(resolve, 50));
  
  res.json({ 
    success: true,
    message: 'Lista de empleados obtenida exitosamente',
    data: {
      empleados: empleadosDemo
    },
    metadata: {
      total: empleadosDemo.length,
      timestamp: new Date().toISOString()
    }
  });
}));

// ✅ RUTA GET /api/empleados/:id - CON MANEJO DE ERRORES MEJORADO
router.get('/:id', verificarToken, asyncHandler(async (req, res) => {
  const empleadoId = parseInt(req.params.id);
  console.log(`✅ GET /api/empleados/${empleadoId} - Usuario:`, req.user.email);

  if (isNaN(empleadoId)) {
    throw new ValidationError('ID de empleado inválido');
  }

  // Simular búsqueda en BD
  await new Promise(resolve => setTimeout(resolve, 30));
  const empleado = empleadosDemo.find(e => e.id === empleadoId);

  if (!empleado) {
    throw new NotFoundError(`Empleado con ID ${empleadoId} no encontrado`);
  }

  res.json({
    success: true,
    message: 'Empleado obtenido exitosamente',
    data: {
      empleado: empleado
    }
  });
}));

// ✅ RUTA POST /api/empleados - OPTIMIZADA CON asyncHandler
router.post('/', verificarToken, autorizarRoles('admin'), validarEmpleado, asyncHandler(async (req, res) => {
  console.log('✅ POST /api/empleados - Datos validados:', req.body);
  
  // Simular guardado en BD
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const nuevoEmpleado = {
    id: Date.now(),
    ...req.body,
    fechaCreacion: new Date().toISOString(),
    activo: true,
    creadoPor: req.user.email
  };

  // Remover password del response por seguridad
  const { password, ...empleadoSinPassword } = nuevoEmpleado;

  // Agregar a "BD" simulada
  empleadosDemo.push(empleadoSinPassword);

  res.status(201).json({
    success: true,
    message: 'Empleado creado exitosamente',
    data: {
      empleado: empleadoSinPassword
    },
    metadata: {
      timestamp: new Date().toISOString()
    }
  });
}));

// ✅ RUTA PUT /api/empleados/:id/restaurar-clave - MEJORADA
router.put('/:id/restaurar-clave', verificarToken, autorizarRoles('admin'), validarCambioPassword, asyncHandler(async (req, res) => {
  const empleadoId = parseInt(req.params.id);
  console.log('✅ PUT /api/empleados/restaurar-clave - ID:', empleadoId);
  
  if (isNaN(empleadoId)) {
    throw new ValidationError('ID de empleado inválido');
  }

  // Simular verificación en BD
  await new Promise(resolve => setTimeout(resolve, 50));
  const empleado = empleadosDemo.find(e => e.id === empleadoId);

  if (!empleado) {
    throw new NotFoundError(`Empleado con ID ${empleadoId} no encontrado`);
  }

  res.json({
    success: true,
    message: 'Contraseña restaurada exitosamente',
    data: {
      empleadoId: empleadoId,
      fechaActualizacion: new Date().toISOString(),
      actualizadoPor: req.user.email
    }
  });
}));

// ✅ RUTA PUT /api/empleados/:id - NUEVA CON MANEJO DE ERRORES
router.put('/:id', verificarToken, autorizarRoles('admin'), validarEmpleado, asyncHandler(async (req, res) => {
  const empleadoId = parseInt(req.params.id);
  console.log(`✅ PUT /api/empleados/${empleadoId} - Datos:`, req.body);

  if (isNaN(empleadoId)) {
    throw new ValidationError('ID de empleado inválido');
  }

  // Simular actualización en BD
  await new Promise(resolve => setTimeout(resolve, 80));
  const empleadoIndex = empleadosDemo.findIndex(e => e.id === empleadoId);

  if (empleadoIndex === -1) {
    throw new NotFoundError(`Empleado con ID ${empleadoId} no encontrado`);
  }

  // Actualizar empleado (en realidad simulado)
  const empleadoActualizado = {
    ...empleadosDemo[empleadoIndex],
    ...req.body,
    fechaActualizacion: new Date().toISOString()
  };

  res.json({
    success: true,
    message: 'Empleado actualizado exitosamente',
    data: {
      empleado: empleadoActualizado,
      fechaActualizacion: new Date().toISOString(),
      actualizadoPor: req.user.email
    }
  });
}));

module.exports = router;