const express = require('express');
const router = express.Router();
const { verificarToken, autorizarRoles } = require('../middleware/authMiddleware');

// ✅ RUTA GET /api/empleados
router.get('/', verificarToken, (req, res) => {
  console.log('✅ GET /api/empleados - Usuario:', req.user);
  res.json({ 
    mensaje: 'Lista de empleados',
    empleados: [
      { id: 1, nombre: 'Admin', email: 'admin@municipalidad.com', rol: 'admin' },
      { id: 2, nombre: 'Empleado', email: 'empleado@municipalidad.com', rol: 'empleado' }
    ]
  });
});

// ✅ RUTA POST /api/empleados
router.post('/', verificarToken, autorizarRoles('admin'), (req, res) => {
  console.log('✅ POST /api/empleados - Datos:', req.body);
  res.status(201).json({
    mensaje: 'Empleado creado exitosamente',
    empleado: {
      id: Date.now(),
      ...req.body,
      fechaCreacion: new Date().toISOString()
    }
  });
});

// ✅ RUTA PUT /api/empleados/:id/restaurar-clave
router.put('/:id/restaurar-clave', verificarToken, autorizarRoles('admin'), (req, res) => {
  console.log('✅ PUT /api/empleados/restaurar-clave - ID:', req.params.id);
  res.json({
    mensaje: 'Contraseña restaurada exitosamente',
    empleadoId: req.params.id,
    fechaActualizacion: new Date().toISOString()
  });
});

module.exports = router;