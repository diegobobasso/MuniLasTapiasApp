const express = require('express');
const router = express.Router();
const { verificarToken, autorizarRoles } = require('../middleware/authMiddleware');

// ✅ RUTAS PROTEGIDAS - Solo usuarios autenticados pueden ver trámites
router.get('/', verificarToken, (req, res) => {
  console.log('📋 GET /api/tramites - Usuario:', req.user.email);
  
  res.json({ 
    mensaje: 'Trámites municipales disponibles',
    usuario: req.user.email,
    tramites: [
      { 
        id: 1, 
        nombre: 'Licencia de conducir', 
        descripcion: 'Trámite para obtención y renovación de licencia de conducir',
        categoria: 'Transporte',
        duracionEstimada: '15 días',
        costo: '$500',
        requisitos: ['DNI', 'Foto 4x4', 'Certificado médico']
      },
      { 
        id: 2, 
        nombre: 'Permiso de construcción', 
        descripcion: 'Autorización para obras de construcción y remodelación',
        categoria: 'Urbanismo',
        duracionEstimada: '30 días',
        costo: 'Según metros cuadrados',
        requisitos: ['Planos', 'Título de propiedad', 'Cédula catastral']
      },
      { 
        id: 3, 
        nombre: 'Alta de comercio', 
        descripcion: 'Inscripción de nuevo comercio en el registro municipal',
        categoria: 'Comercio',
        duracionEstimada: '10 días',
        costo: '$1000',
        requisitos: ['Constancia de CUIT', 'Contrato de alquiler', 'Habiltación bromatológica']
      }
    ] 
  });
});

// ✅ TRÁMITE ESPECÍFICO - También protegido
router.get('/:id', verificarToken, (req, res) => {
  const tramiteId = req.params.id;
  console.log(`📋 GET /api/tramites/${tramiteId} - Usuario:`, req.user.email);
  
  const tramite = {
    id: tramiteId,
    nombre: 'Trámite detallado - ' + tramiteId,
    descripcion: 'Descripción completa del trámite con todos los requisitos y procedimientos...',
    categoria: 'General',
    horarioAtencion: 'Lunes a Viernes 8:00-14:00',
    telefonoContacto: '351-1234567',
    encargado: 'Departamento de Trámites'
  };
  
  res.json({ 
    mensaje: 'Trámite obtenido',
    tramite,
    usuario: req.user.email
  });
});

// ✅ CREAR TRÁMITE - Solo administradores
router.post('/', verificarToken, autorizarRoles('admin'), (req, res) => {
  console.log('📋 POST /api/tramites - Datos:', req.body);
  
  const nuevoTramite = {
    id: Date.now(),
    ...req.body,
    fechaCreacion: new Date().toISOString(),
    creadoPor: req.user.email,
    estado: 'activo'
  };
  
  res.status(201).json({
    mensaje: 'Trámite creado exitosamente',
    tramite: nuevoTramite,
    usuario: req.user.email
  });
});

// ✅ SOLICITAR TRÁMITE - Vecinos y empleados
router.post('/:id/solicitar', verificarToken, (req, res) => {
  const tramiteId = req.params.id;
  console.log(`📋 POST /api/tramites/${tramiteId}/solicitar - Usuario:`, req.user.email);
  
  const solicitud = {
    idSolicitud: Date.now(),
    tramiteId: tramiteId,
    solicitante: req.user.email,
    fechaSolicitud: new Date().toISOString(),
    estado: 'pendiente',
    datos: req.body
  };
  
  res.status(201).json({
    mensaje: 'Solicitud de trámite creada exitosamente',
    solicitud: solicitud,
    numeroSeguimiento: 'TR-' + Date.now()
  });
});

module.exports = router;