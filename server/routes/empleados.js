const express = require('express');
const router = express.Router();
const { verificarToken, autorizarRoles } = require('../middleware/authMiddleware');

// ✅ FUNCIÓN DE VALIDACIÓN CENTRALIZADA
const validarEmpleado = (req, res, next) => {
  const { nombre, email, password, rol } = req.body;
  const errores = [];

  // Validar nombre
  if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2) {
    errores.push('El nombre debe tener al menos 2 caracteres');
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errores.push('El email debe tener un formato válido');
  }

  // Validar password
  if (!password || password.length < 8) {
    errores.push('La contraseña debe tener al menos 8 caracteres');
  }

  // Validar rol
  const rolesPermitidos = ['admin', 'empleado'];
  if (!rol || !rolesPermitidos.includes(rol)) {
    errores.push(`El rol debe ser uno de: ${rolesPermitidos.join(', ')}`);
  }

  // Si hay errores, retornarlos
  if (errores.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errores: errores
    });
  }

  // Limpiar datos
  req.body.nombre = nombre.trim();
  req.body.email = email.toLowerCase().trim();
  
  next();
};

// ✅ VALIDACIÓN PARA ACTUALIZACIÓN DE CONTRASEÑA
const validarCambioPassword = (req, res, next) => {
  const { nuevaClave } = req.body;
  const errores = [];

  if (!nuevaClave || nuevaClave.length < 8) {
    errores.push('La nueva contraseña debe tener al menos 8 caracteres');
  }

  if (errores.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errores: errores
    });
  }

  next();
};

// ✅ RUTA GET /api/empleados
router.get('/', verificarToken, (req, res) => {
  console.log('✅ GET /api/empleados - Usuario:', req.user.email);
  
  res.json({ 
    success: true,
    message: 'Lista de empleados obtenida exitosamente',
    data: {
      empleados: [
        { id: 1, nombre: 'Admin', email: 'admin@municipalidad.com', rol: 'admin' },
        { id: 2, nombre: 'Empleado', email: 'empleado@municipalidad.com', rol: 'empleado' }
      ]
    },
    metadata: {
      total: 2,
      timestamp: new Date().toISOString()
    }
  });
});

// ✅ RUTA POST /api/empleados - CON VALIDACIÓN
router.post('/', verificarToken, autorizarRoles('admin'), validarEmpleado, (req, res) => {
  console.log('✅ POST /api/empleados - Datos validados:', req.body);
  
  const nuevoEmpleado = {
    id: Date.now(),
    ...req.body,
    fechaCreacion: new Date().toISOString(),
    activo: true,
    creadoPor: req.user.email
  };

  // Remover password del response por seguridad
  const { password, ...empleadoSinPassword } = nuevoEmpleado;

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
});

// ✅ RUTA PUT /api/empleados/:id/restaurar-clave - CON VALIDACIÓN
router.put('/:id/restaurar-clave', verificarToken, autorizarRoles('admin'), validarCambioPassword, (req, res) => {
  const empleadoId = req.params.id;
  console.log('✅ PUT /api/empleados/restaurar-clave - ID:', empleadoId);
  
  // Validar que el ID sea numérico
  if (isNaN(empleadoId)) {
    return res.status(400).json({
      success: false,
      message: 'ID de empleado inválido'
    });
  }

  res.json({
    success: true,
    message: 'Contraseña restaurada exitosamente',
    data: {
      empleadoId: parseInt(empleadoId),
      fechaActualizacion: new Date().toISOString(),
      actualizadoPor: req.user.email
    }
  });
});

// ✅ NUEVA RUTA: Actualizar empleado
router.put('/:id', verificarToken, autorizarRoles('admin'), validarEmpleado, (req, res) => {
  const empleadoId = req.params.id;
  console.log(`✅ PUT /api/empleados/${empleadoId} - Datos:`, req.body);

  if (isNaN(empleadoId)) {
    return res.status(400).json({
      success: false,
      message: 'ID de empleado inválido'
    });
  }

  res.json({
    success: true,
    message: 'Empleado actualizado exitosamente',
    data: {
      empleadoId: parseInt(empleadoId),
      actualizaciones: req.body,
      fechaActualizacion: new Date().toISOString(),
      actualizadoPor: req.user.email
    }
  });
});

// ✅ NUEVA RUTA: Obtener empleado específico
router.get('/:id', verificarToken, (req, res) => {
  const empleadoId = req.params.id;
  console.log(`✅ GET /api/empleados/${empleadoId} - Usuario:`, req.user.email);

  if (isNaN(empleadoId)) {
    return res.status(400).json({
      success: false,
      message: 'ID de empleado inválido'
    });
  }

  const empleado = {
    id: parseInt(empleadoId),
    nombre: 'Empleado Ejemplo',
    email: 'ejemplo@municipalidad.com',
    rol: 'empleado',
    fechaCreacion: '2024-01-01',
    activo: true
  };

  res.json({
    success: true,
    message: 'Empleado obtenido exitosamente',
    data: {
      empleado: empleado
    }
  });
});

module.exports = router;