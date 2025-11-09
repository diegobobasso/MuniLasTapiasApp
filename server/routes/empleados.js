/**
 * 👥 CONTROLADOR DE EMPLEADOS - VERSIÓN DATOS DEMO (ESTABLE)
 * 
 * Maneja todas las operaciones CRUD para empleados municipales
 * utilizando datos en memoria para desarrollo rápido.
 * 
 * Endpoints disponibles:
 * - GET    /api/empleados           - Listar todos los empleados
 * - GET    /api/empleados/:id       - Obtener empleado específico
 * - POST   /api/empleados           - Crear nuevo empleado
 * - PUT    /api/empleados/:id       - Actualizar empleado
 * - PUT    /api/empleados/:id/restaurar-clave - Restaurar contraseña
 * 
 * Seguridad implementada:
 * - Autenticación JWT requerida en todas las rutas
 * - Autorización por roles (solo admin para crear/actualizar)
 * - Validación robusta de datos de entrada
 */

const express = require('express');
const router = express.Router();
const { verificarToken, autorizarRoles } = require('../middleware/authMiddleware');
const { asyncHandler, ValidationError, NotFoundError } = require('../middleware/errorHandler');

// 📊 DATOS DEMO EN MEMORIA (TEMPORAL)
let empleadosDemo = [
  { 
    id: 1, 
    nombre: 'Admin', 
    apellido: 'Sistema',
    email: 'admin@municipalidad.com', 
    rol: 'admin', 
    activo: true,
    fechaCreacion: '2024-01-01',
    fechaActualizacion: '2024-01-01'
  },
  { 
    id: 2, 
    nombre: 'Empleado', 
    apellido: 'Ejemplo',
    email: 'empleado@municipalidad.com', 
    rol: 'empleado', 
    activo: true,
    fechaCreacion: '2024-01-01',
    fechaActualizacion: '2024-01-01'
  }
];

/**
 * ✅ MIDDLEWARE DE VALIDACIÓN PARA DATOS DE EMPLEADO
 */
const validarEmpleado = (req, res, next) => {
  const { nombre, apellido, email, password, rol } = req.body;
  const errores = [];

  if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2) {
    errores.push('El nombre debe tener al menos 2 caracteres');
  }

  if (!apellido || typeof apellido !== 'string' || apellido.trim().length < 2) {
    errores.push('El apellido debe tener al menos 2 caracteres');
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
  req.body.apellido = apellido.trim();
  req.body.email = email.toLowerCase().trim();
  
  next();
};

/**
 * ✅ MIDDLEWARE DE VALIDACIÓN PARA CAMBIO DE CONTRASEÑA
 */
const validarCambioPassword = (req, res, next) => {
  const { nuevaClave } = req.body;

  if (!nuevaClave || nuevaClave.length < 8) {
    throw new ValidationError('La nueva contraseña debe tener al menos 8 caracteres');
  }

  next();
};

/**
 * 📋 ENDPOINT: LISTAR TODOS LOS EMPLEADOS
 */
router.get('/', verificarToken, asyncHandler(async (req, res) => {
  console.log('✅ GET /api/empleados - Usuario:', req.user.email);
  
  // Simular pequeña demora
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

/**
 * 👤 ENDPOINT: OBTENER EMPLEADO ESPECÍFICO
 */
router.get('/:id', verificarToken, asyncHandler(async (req, res) => {
  const empleadoId = parseInt(req.params.id);
  console.log(`✅ GET /api/empleados/${empleadoId} - Usuario:`, req.user.email);

  if (isNaN(empleadoId)) {
    throw new ValidationError('ID de empleado inválido');
  }

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

/**
 * ➕ ENDPOINT: CREAR NUEVO EMPLEADO
 */
router.post('/', verificarToken, autorizarRoles('admin'), validarEmpleado, asyncHandler(async (req, res) => {
  console.log('✅ POST /api/empleados - Datos validados:', req.body);
  
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const nuevoEmpleado = {
    id: Date.now(),
    ...req.body,
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString(),
    activo: true
  };

  // Remover password del response por seguridad
  const { password, ...empleadoSinPassword } = nuevoEmpleado;
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

/**
 * 🔄 ENDPOINT: RESTAURAR CONTRASEÑA DE EMPLEADO
 */
router.put('/:id/restaurar-clave', verificarToken, autorizarRoles('admin'), validarCambioPassword, asyncHandler(async (req, res) => {
  const empleadoId = parseInt(req.params.id);
  console.log('✅ PUT /api/empleados/restaurar-clave - ID:', empleadoId);
  
  if (isNaN(empleadoId)) {
    throw new ValidationError('ID de empleado inválido');
  }

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

/**
 * ✏️ ENDPOINT: ACTUALIZAR EMPLEADO
 */
router.put('/:id', verificarToken, autorizarRoles('admin'), validarEmpleado, asyncHandler(async (req, res) => {
  const empleadoId = parseInt(req.params.id);
  console.log(`✅ PUT /api/empleados/${empleadoId} - Datos:`, req.body);

  if (isNaN(empleadoId)) {
    throw new ValidationError('ID de empleado inválido');
  }

  await new Promise(resolve => setTimeout(resolve, 80));
  const empleadoIndex = empleadosDemo.findIndex(e => e.id === empleadoId);

  if (empleadoIndex === -1) {
    throw new NotFoundError(`Empleado con ID ${empleadoId} no encontrado`);
  }

  const empleadoActualizado = {
    ...empleadosDemo[empleadoIndex],
    ...req.body,
    fechaActualizacion: new Date().toISOString()
  };

  empleadosDemo[empleadoIndex] = empleadoActualizado;

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