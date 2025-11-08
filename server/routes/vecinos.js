const express = require('express');
const router = express.Router();
const { verificarToken, autorizarRoles } = require('../middleware/authMiddleware');

// ✅ FUNCIÓN DE VALIDACIÓN CENTRALIZADA PARA VECINOS
const validarVecino = (req, res, next) => {
  const { nombre, apellido, dni, domicilio, telefono, email, password } = req.body;
  const errores = [];

  // Validar nombre
  if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2) {
    errores.push('El nombre debe tener al menos 2 caracteres');
  }

  // Validar apellido
  if (!apellido || typeof apellido !== 'string' || apellido.trim().length < 2) {
    errores.push('El apellido debe tener al menos 2 caracteres');
  }

  // Validar DNI
  const dniRegex = /^\d{7,8}$/;
  if (!dni || !dniRegex.test(dni.toString())) {
    errores.push('El DNI debe tener 7 u 8 dígitos numéricos');
  }

  // Validar domicilio
  if (!domicilio || typeof domicilio !== 'string' || domicilio.trim().length < 5) {
    errores.push('El domicilio debe tener al menos 5 caracteres');
  }

  // Validar teléfono
  const telefonoRegex = /^\d{10,15}$/;
  if (!telefono || !telefonoRegex.test(telefono.toString().replace(/\D/g, ''))) {
    errores.push('El teléfono debe tener entre 10 y 15 dígitos');
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

  // Si hay errores, retornarlos
  if (errores.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errores: errores
    });
  }

  // Limpiar y normalizar datos
  req.body.nombre = nombre.trim();
  req.body.apellido = apellido.trim();
  req.body.domicilio = domicilio.trim();
  req.body.email = email.toLowerCase().trim();
  req.body.telefono = telefono.toString().replace(/\D/g, '');

  next();
};

// ✅ VALIDACIÓN PARA ACTUALIZACIÓN DE CONTRASEÑA DE VECINO
const validarCambioPasswordVecino = (req, res, next) => {
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

// ✅ RUTA GET /api/vecinos
router.get('/', verificarToken, (req, res) => {
  console.log('✅ GET /api/vecinos - Usuario:', req.user.email);
  
  res.json({
    success: true,
    message: 'Lista de vecinos obtenida exitosamente',
    data: {
      vecinos: [
        { 
          id: 1, 
          nombre: 'Juan', 
          apellido: 'Pérez', 
          dni: '12345678', 
          email: 'juan@correo.com',
          telefono: '3511234567',
          domicilio: 'Calle Falsa 123'
        },
        { 
          id: 2, 
          nombre: 'María', 
          apellido: 'Gómez', 
          dni: '87654321', 
          email: 'maria@correo.com',
          telefono: '3517654321',
          domicilio: 'Avenida Siempre Viva 456'
        }
      ]
    },
    metadata: {
      total: 2,
      timestamp: new Date().toISOString()
    }
  });
});

// ✅ RUTA POST /api/vecinos - CON VALIDACIÓN
router.post('/', verificarToken, autorizarRoles('admin', 'empleado'), validarVecino, (req, res) => {
  console.log('✅ POST /api/vecinos - Datos validados:', req.body);
  
  const nuevoVecino = {
    id: Date.now(),
    ...req.body,
    fechaRegistro: new Date().toISOString(),
    activo: true,
    registradoPor: req.user.email,
    rol: 'vecino'
  };

  // Remover password del response por seguridad
  const { password, ...vecinoSinPassword } = nuevoVecino;

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
});

// ✅ RUTA PUT /api/vecinos/:id/restaurar-clave - CON VALIDACIÓN
router.put('/:id/restaurar-clave', verificarToken, autorizarRoles('admin', 'empleado'), validarCambioPasswordVecino, (req, res) => {
  const vecinoId = req.params.id;
  console.log('✅ PUT /api/vecinos/restaurar-clave - ID:', vecinoId);
  
  if (isNaN(vecinoId)) {
    return res.status(400).json({
      success: false,
      message: 'ID de vecino inválido'
    });
  }

  res.json({
    success: true,
    message: 'Contraseña de vecino restaurada exitosamente',
    data: {
      vecinoId: parseInt(vecinoId),
      fechaActualizacion: new Date().toISOString(),
      actualizadoPor: req.user.email
    }
  });
});

// ✅ NUEVA RUTA: Actualizar vecino
router.put('/:id', verificarToken, autorizarRoles('admin', 'empleado'), validarVecino, (req, res) => {
  const vecinoId = req.params.id;
  console.log(`✅ PUT /api/vecinos/${vecinoId} - Datos:`, req.body);

  if (isNaN(vecinoId)) {
    return res.status(400).json({
      success: false,
      message: 'ID de vecino inválido'
    });
  }

  res.json({
    success: true,
    message: 'Vecino actualizado exitosamente',
    data: {
      vecinoId: parseInt(vecinoId),
      actualizaciones: req.body,
      fechaActualizacion: new Date().toISOString(),
      actualizadoPor: req.user.email
    }
  });
});

// ✅ NUEVA RUTA: Obtener vecino específico
router.get('/:id', verificarToken, (req, res) => {
  const vecinoId = req.params.id;
  console.log(`✅ GET /api/vecinos/${vecinoId} - Usuario:`, req.user.email);

  if (isNaN(vecinoId)) {
    return res.status(400).json({
      success: false,
      message: 'ID de vecino inválido'
    });
  }

  const vecino = {
    id: parseInt(vecinoId),
    nombre: 'Vecino',
    apellido: 'Ejemplo',
    dni: '12345678',
    email: 'vecino@ejemplo.com',
    telefono: '3511234567',
    domicilio: 'Calle Ejemplo 123',
    fechaRegistro: '2024-01-01',
    activo: true
  };

  res.json({
    success: true,
    message: 'Vecino obtenido exitosamente',
    data: {
      vecino: vecino
    }
  });
});

module.exports = router;