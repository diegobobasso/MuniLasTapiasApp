/**
 * 👨‍👩‍👧‍👦 CONTROLADOR DE VECINOS - VERSIÓN DATOS DEMO (ESTABLE)
 * 
 * Maneja todas las operaciones CRUD para vecinos del municipio
 * utilizando datos en memoria para desarrollo rápido.
 * 
 * Endpoints disponibles:
 * - GET    /api/vecinos              - Listar todos los vecinos
 * - GET    /api/vecinos/:id          - Obtener vecino específico  
 * - POST   /api/vecinos              - Crear nuevo vecino
 * - PUT    /api/vecinos/:id          - Actualizar vecino
 * - PUT    /api/vecinos/:id/restaurar-clave - Restaurar contraseña
 * 
 * Seguridad implementada:
 * - Autenticación JWT requerida en todas las rutas
 * - Autorización por roles (admin y empleados pueden crear)
 * - Validación robusta de datos de entrada
 */

const express = require('express');
const router = express.Router();
const { verificarToken, autorizarRoles } = require('../middleware/authMiddleware');
const { asyncHandler, ValidationError, NotFoundError } = require('../middleware/errorHandler');

// 📊 DATOS DEMO EN MEMORIA (TEMPORAL)
let vecinosDemo = [
  { 
    id: 1, 
    nombre: 'Juan', 
    apellido: 'Pérez', 
    dni: '12345678', 
    email: 'juan@correo.com',
    telefono: '3511234567',
    domicilio: 'Calle Falsa 123',
    fechaRegistro: '2024-01-01',
    activo: true,
    fechaCreacion: '2024-01-01',
    fechaActualizacion: '2024-01-01'
  }
];

/**
 * ✅ MIDDLEWARE DE VALIDACIÓN PARA DATOS DE VECINO
 */
const validarVecino = (req, res, next) => {
  const { nombre, apellido, dni, domicilio, telefono, email, password } = req.body;
  const errores = [];

  if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2) {
    errores.push('El nombre debe tener al menos 2 caracteres');
  }

  if (!apellido || typeof apellido !== 'string' || apellido.trim().length < 2) {
    errores.push('El apellido debe tener al menos 2 caracteres');
  }

  const dniRegex = /^\d{7,8}$/;
  if (!dni || !dniRegex.test(dni.toString())) {
    errores.push('El DNI debe tener 7 u 8 dígitos numéricos');
  }

  if (!domicilio || typeof domicilio !== 'string' || domicilio.trim().length < 5) {
    errores.push('El domicilio debe tener al menos 5 caracteres');
  }

  const telefonoRegex = /^\d{10,15}$/;
  if (!telefono || !telefonoRegex.test(telefono.toString().replace(/\D/g, ''))) {
    errores.push('El teléfono debe tener entre 10 y 15 dígitos');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errores.push('El email debe tener un formato válido');
  }

  if (!password || password.length < 8) {
    errores.push('La contraseña debe tener al menos 8 caracteres');
  }

  if (errores.length > 0) {
    throw new ValidationError('Errores de validación en vecino', errores);
  }

  req.body.nombre = nombre.trim();
  req.body.apellido = apellido.trim();
  req.body.domicilio = domicilio.trim();
  req.body.email = email.toLowerCase().trim();
  req.body.telefono = telefono.toString().replace(/\D/g, '');

  next();
};

/**
 * ✅ MIDDLEWARE DE VALIDACIÓN PARA CAMBIO DE CONTRASEÑA
 */
const validarCambioPasswordVecino = (req, res, next) => {
  const { nuevaClave } = req.body;

  if (!nuevaClave || nuevaClave.length < 8) {
    throw new ValidationError('La nueva contraseña debe tener al menos 8 caracteres');
  }

  next();
};

/**
 * 📋 ENDPOINT: LISTAR TODOS LOS VECINOS
 */
router.get('/', verificarToken, asyncHandler(async (req, res) => {
  console.log('✅ GET /api/vecinos - Usuario:', req.user.email);
  
  await new Promise(resolve => setTimeout(resolve, 50));
  
  res.json({
    success: true,
    message: 'Lista de vecinos obtenida exitosamente',
    data: {
      vecinos: vecinosDemo
    },
    metadata: {
      total: vecinosDemo.length,
      timestamp: new Date().toISOString()
    }
  });
}));

/**
 * 👤 ENDPOINT: OBTENER VECINO ESPECÍFICO
 */
router.get('/:id', verificarToken, asyncHandler(async (req, res) => {
  const vecinoId = parseInt(req.params.id);
  console.log(`✅ GET /api/vecinos/${vecinoId} - Usuario:`, req.user.email);

  if (isNaN(vecinoId)) {
    throw new ValidationError('ID de vecino inválido');
  }

  await new Promise(resolve => setTimeout(resolve, 30));
  const vecino = vecinosDemo.find(v => v.id === vecinoId);

  if (!vecino) {
    throw new NotFoundError(`Vecino con ID ${vecinoId} no encontrado`);
  }

  res.json({
    success: true,
    message: 'Vecino obtenido exitosamente',
    data: {
      vecino: vecino
    }
  });
}));

/**
 * ➕ ENDPOINT: CREAR NUEVO VECINO
 */
router.post('/', verificarToken, autorizarRoles('admin', 'empleado'), validarVecino, asyncHandler(async (req, res) => {
  console.log('✅ POST /api/vecinos - Datos validados:', req.body);
  
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const nuevoVecino = {
    id: Date.now(),
    ...req.body,
    fechaRegistro: new Date().toISOString(),
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString(),
    activo: true,
    rol: 'vecino'
  };

  const { password, ...vecinoSinPassword } = nuevoVecino;
  vecinosDemo.push(vecinoSinPassword);

  res.status(201).json({
    success: true,
    message: 'Vecino creado exitosamente',
    data: {
      vecino: vecinoSinPassword
    },
    metadata: {
      timestamp: new Date().toISOString()
    }
  });
}));

/**
 * 🔄 ENDPOINT: RESTAURAR CONTRASEÑA DE VECINO
 */
router.put('/:id/restaurar-clave', verificarToken, autorizarRoles('admin', 'empleado'), validarCambioPasswordVecino, asyncHandler(async (req, res) => {
  const vecinoId = parseInt(req.params.id);
  console.log('✅ PUT /api/vecinos/restaurar-clave - ID:', vecinoId);
  
  if (isNaN(vecinoId)) {
    throw new ValidationError('ID de vecino inválido');
  }

  await new Promise(resolve => setTimeout(resolve, 50));
  const vecino = vecinosDemo.find(v => v.id === vecinoId);

  if (!vecino) {
    throw new NotFoundError(`Vecino con ID ${vecinoId} no encontrado`);
  }

  res.json({
    success: true,
    message: 'Contraseña de vecino restaurada exitosamente',
    data: {
      vecinoId: vecinoId,
      fechaActualizacion: new Date().toISOString(),
      actualizadoPor: req.user.email
    }
  });
}));

/**
 * ✏️ ENDPOINT: ACTUALIZAR VECINO
 */
router.put('/:id', verificarToken, autorizarRoles('admin', 'empleado'), validarVecino, asyncHandler(async (req, res) => {
  const vecinoId = parseInt(req.params.id);
  console.log(`✅ PUT /api/vecinos/${vecinoId} - Datos:`, req.body);

  if (isNaN(vecinoId)) {
    throw new ValidationError('ID de vecino inválido');
  }

  await new Promise(resolve => setTimeout(resolve, 80));
  const vecinoIndex = vecinosDemo.findIndex(v => v.id === vecinoId);

  if (vecinoIndex === -1) {
    throw new NotFoundError(`Vecino con ID ${vecinoId} no encontrado`);
  }

  const vecinoActualizado = {
    ...vecinosDemo[vecinoIndex],
    ...req.body,
    fechaActualizacion: new Date().toISOString()
  };

  vecinosDemo[vecinoIndex] = vecinoActualizado;

  res.json({
    success: true,
    message: 'Vecino actualizado exitosamente',
    data: {
      vecino: vecinoActualizado,
      fechaActualizacion: new Date().toISOString(),
      actualizadoPor: req.user.email
    }
  });
}));

module.exports = router;