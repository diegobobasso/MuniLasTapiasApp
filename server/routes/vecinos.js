const express = require('express');
const router = express.Router();
const { verificarToken, autorizarRoles } = require('../middleware/authMiddleware');

// ✅ RUTA GET /api/vecinos
router.get('/', verificarToken, (req, res) => {
  console.log('✅ GET /api/vecinos - Usuario:', req.user);
  res.json({
    mensaje: 'Lista de vecinos',
    vecinos: [
      { id: 1, nombre: 'Juan', apellido: 'Pérez', dni: '12345678', email: 'juan@correo.com' },
      { id: 2, nombre: 'María', apellido: 'Gómez', dni: '87654321', email: 'maria@correo.com' }
    ]
  });
});

// ✅ RUTA POST /api/vecinos
router.post('/', verificarToken, autorizarRoles('admin', 'empleado'), (req, res) => {
  console.log('✅ POST /api/vecinos - Datos:', req.body);
  res.status(201).json({
    mensaje: 'Vecino creado exitosamente',
    vecino: {
      id: Date.now(),
      ...req.body,
      fechaRegistro: new Date().toISOString()
    }
  });
});

// ✅ RUTA PUT /api/vecinos/:id/restaurar-clave
router.put('/:id/restaurar-clave', verificarToken, autorizarRoles('admin', 'empleado'), (req, res) => {
  console.log('✅ PUT /api/vecinos/restaurar-clave - ID:', req.params.id);
  res.json({
    mensaje: 'Contraseña de vecino restaurada exitosamente',
    vecinoId: req.params.id,
    fechaActualizacion: new Date().toISOString()
  });
});

module.exports = router;