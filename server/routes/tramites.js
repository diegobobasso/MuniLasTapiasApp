/**
 * 📋 CONTROLADOR DE TRÁMITES MUNICIPALES - CRUD COMPLETO
 * 
 * Maneja todas las operaciones CRUD para trámites del municipio
 * incluyendo gestión de trámites y solicitudes de vecinos.
 * 
 * Endpoints disponibles:
 * - GET    /api/tramites              - Listar trámites activos
 * - GET    /api/tramites/:id          - Obtener trámite específico
 * - POST   /api/tramites              - Crear nuevo trámite (solo admin)
 * - PUT    /api/tramites/:id          - Actualizar trámite (solo admin)
 * - DELETE /api/tramites/:id          - Desactivar trámite (solo admin)
 * - POST   /api/tramites/:id/solicitar - Solicitar trámite (vecinos/empleados)
 * - GET    /api/tramites/categoria/:categoria - Filtrar por categoría
 * 
 * Seguridad implementada:
 * - Autenticación JWT requerida en todas las rutas
 * - Autorización por roles diferenciada
 * - Validación robusta de datos de entrada
 */

const express = require('express');
const router = express.Router();
const { verificarToken, autorizarRoles } = require('../middleware/authMiddleware');
const { asyncHandler, ValidationError, NotFoundError } = require('../middleware/errorHandler');

// 📊 DATOS DEMO DE TRÁMITES (TEMPORAL)
let tramitesDemo = [
  { 
    id: 1, 
    nombre: 'Licencia de conducir', 
    descripcion: 'Trámite para obtención y renovación de licencia de conducir para todo tipo de vehículos',
    categoria: 'Transporte',
    duracion_estimada: '15 días hábiles',
    costo: 500.00,
    requisitos: ['DNI original y copia', 'Foto 4x4 color', 'Certificado médico oficial', 'Pago de tasa municipal'],
    horario_atencion: 'Lunes a Viernes 8:00-14:00',
    telefono_contacto: '351-1234567',
    encargado_id: 1,
    encargado_nombre: 'Departamento de Tránsito',
    activo: true,
    fecha_creacion: '2024-01-01T09:00:00Z',
    fecha_actualizacion: '2024-01-01T09:00:00Z'
  },
  { 
    id: 2, 
    nombre: 'Permiso de construcción', 
    descripcion: 'Autorización para obras de construcción y remodelación en propiedades urbanas',
    categoria: 'Urbanismo',
    duracion_estimada: '30 días hábiles',
    costo: 1200.00,
    requisitos: ['Planos arquitectónicos', 'Título de propiedad', 'Cédula catastral', 'Memoria descriptiva'],
    horario_atencion: 'Lunes a Viernes 9:00-15:00',
    telefono_contacto: '351-7654321',
    encargado_id: 1,
    encargado_nombre: 'Dirección de Obras Privadas',
    activo: true,
    fecha_creacion: '2024-01-01T09:00:00Z',
    fecha_actualizacion: '2024-01-01T09:00:00Z'
  },
  { 
    id: 3, 
    nombre: 'Alta de comercio', 
    descripcion: 'Inscripción de nuevo comercio en el registro municipal de actividades económicas',
    categoria: 'Comercio',
    duracion_estimada: '10 días hábiles',
    costo: 1000.00,
    requisitos: ['Constancia de CUIT', 'Contrato de alquiler', 'Habiltación bromatológica', 'Seguro de responsabilidad civil'],
    horario_atencion: 'Lunes a Viernes 8:30-13:30',
    telefono_contacto: '351-5555555',
    encargado_id: 1,
    encargado_nombre: 'Dirección de Comercio',
    activo: true,
    fecha_creacion: '2024-01-01T09:00:00Z',
    fecha_actualizacion: '2024-01-01T09:00:00Z'
  }
];

// 📊 DATOS DEMO DE SOLICITUDES DE TRÁMITES
let solicitudesTramitesDemo = [];

// 📋 CATEGORÍAS PERMITIDAS PARA TRÁMITES
const categoriasPermitidas = ['Transporte', 'Urbanismo', 'Comercio', 'Salud', 'Educación', 'Servicios', 'Impuestos'];

/**
 * ✅ MIDDLEWARE DE VALIDACIÓN PARA TRÁMITES
 */
const validarTramite = (req, res, next) => {
  const { nombre, descripcion, categoria, duracion_estimada, costo, requisitos, horario_atencion, telefono_contacto } = req.body;
  const errores = [];

  // Validación de nombre
  if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 5) {
    errores.push('El nombre debe tener al menos 5 caracteres');
  }

  // Validación de descripción
  if (!descripcion || typeof descripcion !== 'string' || descripcion.trim().length < 10) {
    errores.push('La descripción debe tener al menos 10 caracteres');
  }

  // Validación de categoría
  if (!categoria || !categoriasPermitidas.includes(categoria)) {
    errores.push(`La categoría debe ser una de: ${categoriasPermitidas.join(', ')}`);
  }

  // Validación de duración estimada
  if (!duracion_estimada || typeof duracion_estimada !== 'string' || duracion_estimada.trim().length < 3) {
    errores.push('La duración estimada es requerida');
  }

  // Validación de costo (debe ser número positivo)
  if (costo === undefined || isNaN(parseFloat(costo)) || parseFloat(costo) < 0) {
    errores.push('El costo debe ser un número positivo');
  }

  // Validación de requisitos (debe ser array)
  if (!requisitos || !Array.isArray(requisitos) || requisitos.length === 0) {
    errores.push('Los requisitos deben ser un array con al menos un elemento');
  }

  // Validación de horario de atención
  if (!horario_atencion || typeof horario_atencion !== 'string' || horario_atencion.trim().length < 5) {
    errores.push('El horario de atención es requerido');
  }

  // Validación de teléfono de contacto
  if (telefono_contacto && !/^[\d\s\-()+]+$/.test(telefono_contacto)) {
    errores.push('El teléfono de contacto tiene un formato inválido');
  }

  if (errores.length > 0) {
    throw new ValidationError('Errores de validación en trámite', errores);
  }

  // Limpiar y normalizar datos
  req.body.nombre = nombre.trim();
  req.body.descripcion = descripcion.trim();
  req.body.categoria = categoria;
  req.body.duracion_estimada = duracion_estimada.trim();
  req.body.costo = parseFloat(costo);
  req.body.horario_atencion = horario_atencion.trim();
  req.body.telefono_contacto = telefono_contacto ? telefono_contacto.trim() : null;
  
  next();
};

/**
 * ✅ MIDDLEWARE DE VALIDACIÓN PARA SOLICITUD DE TRÁMITE
 */
const validarSolicitudTramite = (req, res, next) => {
  const { datos_adicionales } = req.body;
  const errores = [];

  // Validación de datos adicionales (objeto opcional)
  if (datos_adicionales && typeof datos_adicionales !== 'object') {
    errores.push('Los datos adicionales deben ser un objeto');
  }

  if (errores.length > 0) {
    throw new ValidationError('Errores de validación en solicitud de trámite', errores);
  }

  next();
};

/**
 * 📋 ENDPOINT: LISTAR TRÁMITES ACTIVOS
 */
router.get('/', verificarToken, asyncHandler(async (req, res) => {
  console.log('📋 GET /api/tramites - Usuario:', req.user.email);
  
  await new Promise(resolve => setTimeout(resolve, 50));
  
  // Filtrar solo trámites activos
  const tramitesActivos = tramitesDemo.filter(tramite => tramite.activo);
  
  res.json({ 
    success: true,
    message: 'Lista de trámites obtenida exitosamente',
    data: {
      tramites: tramitesActivos
    },
    metadata: {
      total: tramitesActivos.length,
      categorias: [...new Set(tramitesActivos.map(t => t.categoria))],
      timestamp: new Date().toISOString()
    }
  });
}));

/**
 * 👁️ ENDPOINT: OBTENER TRÁMITE ESPECÍFICO
 */
router.get('/:id', verificarToken, asyncHandler(async (req, res) => {
  const tramiteId = parseInt(req.params.id);
  console.log(`📋 GET /api/tramites/${tramiteId} - Usuario:`, req.user.email);

  if (isNaN(tramiteId)) {
    throw new ValidationError('ID de trámite inválido');
  }

  await new Promise(resolve => setTimeout(resolve, 30));
  
  const tramite = tramitesDemo.find(t => t.id === tramiteId && t.activo);

  if (!tramite) {
    throw new NotFoundError(`Trámite con ID ${tramiteId} no encontrado`);
  }

  res.json({
    success: true,
    message: 'Trámite obtenido exitosamente',
    data: {
      tramite: tramite
    }
  });
}));

/**
 * 🆕 ENDPOINT: CREAR NUEVO TRÁMITE
 */
router.post('/', verificarToken, autorizarRoles('admin'), validarTramite, asyncHandler(async (req, res) => {
  console.log('📋 POST /api/tramites - Datos validados:', req.body);
  
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const { nombre, descripcion, categoria, duracion_estimada, costo, requisitos, horario_atencion, telefono_contacto } = req.body;
  
  const nuevoTramite = {
    id: Date.now(),
    nombre,
    descripcion,
    categoria,
    duracion_estimada,
    costo,
    requisitos,
    horario_atencion,
    telefono_contacto,
    encargado_id: req.user.id,
    encargado_nombre: req.user.email, // En producción sería el nombre real del departamento
    activo: true,
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString()
  };

  tramitesDemo.push(nuevoTramite);

  res.status(201).json({
    success: true,
    message: 'Trámite creado exitosamente',
    data: {
      tramite: nuevoTramite
    },
    metadata: {
      timestamp: new Date().toISOString(),
      tramiteId: nuevoTramite.id
    }
  });
}));

/**
 * ✏️ ENDPOINT: ACTUALIZAR TRÁMITE
 */
router.put('/:id', verificarToken, autorizarRoles('admin'), validarTramite, asyncHandler(async (req, res) => {
  const tramiteId = parseInt(req.params.id);
  console.log(`📋 PUT /api/tramites/${tramiteId} - Datos:`, req.body);

  if (isNaN(tramiteId)) {
    throw new ValidationError('ID de trámite inválido');
  }

  await new Promise(resolve => setTimeout(resolve, 80));
  
  const tramiteIndex = tramitesDemo.findIndex(t => t.id === tramiteId);

  if (tramiteIndex === -1) {
    throw new NotFoundError(`Trámite con ID ${tramiteId} no encontrado`);
  }

  const { nombre, descripcion, categoria, duracion_estimada, costo, requisitos, horario_atencion, telefono_contacto } = req.body;

  const tramiteActualizado = {
    ...tramitesDemo[tramiteIndex],
    nombre,
    descripcion,
    categoria,
    duracion_estimada,
    costo,
    requisitos,
    horario_atencion,
    telefono_contacto,
    fecha_actualizacion: new Date().toISOString()
  };

  tramitesDemo[tramiteIndex] = tramiteActualizado;

  res.json({
    success: true,
    message: 'Trámite actualizado exitosamente',
    data: {
      tramite: tramiteActualizado
    },
    metadata: {
      timestamp: new Date().toISOString(),
      actualizadoPor: req.user.email
    }
  });
}));

/**
 * 🗑️ ENDPOINT: DESACTIVAR TRÁMITE (DELETE LÓGICO)
 */
router.delete('/:id', verificarToken, autorizarRoles('admin'), asyncHandler(async (req, res) => {
  const tramiteId = parseInt(req.params.id);
  console.log(`📋 DELETE /api/tramites/${tramiteId} - Usuario:`, req.user.email);

  if (isNaN(tramiteId)) {
    throw new ValidationError('ID de trámite inválido');
  }

  await new Promise(resolve => setTimeout(resolve, 60));
  
  const tramiteIndex = tramitesDemo.findIndex(t => t.id === tramiteId);

  if (tramiteIndex === -1) {
    throw new NotFoundError(`Trámite con ID ${tramiteId} no encontrado`);
  }

  // Desactivar trámite (delete lógico)
  tramitesDemo[tramiteIndex].activo = false;
  tramitesDemo[tramiteIndex].fecha_actualizacion = new Date().toISOString();

  res.json({
    success: true,
    message: 'Trámite desactivado exitosamente',
    data: {
      tramiteId: tramiteId,
      activo: false,
      fechaActualizacion: new Date().toISOString()
    }
  });
}));

/**
 * 📝 ENDPOINT: SOLICITAR TRÁMITE
 */
router.post('/:id/solicitar', verificarToken, validarSolicitudTramite, asyncHandler(async (req, res) => {
  const tramiteId = parseInt(req.params.id);
  const { datos_adicionales } = req.body;
  
  console.log(`📝 POST /api/tramites/${tramiteId}/solicitar - Usuario:`, req.user.email);

  if (isNaN(tramiteId)) {
    throw new ValidationError('ID de trámite inválido');
  }

  await new Promise(resolve => setTimeout(resolve, 70));
  
  const tramite = tramitesDemo.find(t => t.id === tramiteId && t.activo);

  if (!tramite) {
    throw new NotFoundError(`Trámite con ID ${tramiteId} no encontrado o inactivo`);
  }

  const nuevaSolicitud = {
    id_solicitud: Date.now(),
    tramite_id: tramiteId,
    tramite_nombre: tramite.nombre,
    solicitante_id: req.user.id,
    solicitante_email: req.user.email,
    solicitante_tipo: req.user.rol === 'vecino' ? 'vecino' : 'empleado',
    fecha_solicitud: new Date().toISOString(),
    estado: 'pendiente',
    datos_adicionales: datos_adicionales || {},
    numero_seguimiento: `TR-${Date.now()}`
  };

  solicitudesTramitesDemo.push(nuevaSolicitud);

  res.status(201).json({
    success: true,
    message: 'Solicitud de trámite creada exitosamente',
    data: {
      solicitud: nuevaSolicitud
    },
    metadata: {
      timestamp: new Date().toISOString(),
      siguiente_paso: 'Presentar documentación en ventanilla'
    }
  });
}));

/**
 * 🏷️ ENDPOINT: FILTRAR TRÁMITES POR CATEGORÍA
 */
router.get('/categoria/:categoria', verificarToken, asyncHandler(async (req, res) => {
  const categoria = req.params.categoria;
  console.log(`📋 GET /api/tramites/categoria/${categoria} - Usuario:`, req.user.email);

  if (!categoriasPermitidas.includes(categoria)) {
    throw new ValidationError(`Categoría no válida. Permitidas: ${categoriasPermitidas.join(', ')}`);
  }

  await new Promise(resolve => setTimeout(resolve, 40));
  
  const tramitesFiltrados = tramitesDemo
    .filter(tramite => tramite.activo && tramite.categoria === categoria);

  res.json({
    success: true,
    message: `Trámites de categoría ${categoria} obtenidos exitosamente`,
    data: {
      tramites: tramitesFiltrados,
      categoria: categoria
    },
    metadata: {
      total: tramitesFiltrados.length,
      timestamp: new Date().toISOString()
    }
  });
}));

/**
 * 📊 ENDPOINT: OBTENER SOLICITUDES DE USUARIO
 */
router.get('/solicitudes/mis-solicitudes', verificarToken, asyncHandler(async (req, res) => {
  console.log('📋 GET /api/tramites/solicitudes/mis-solicitudes - Usuario:', req.user.email);
  
  await new Promise(resolve => setTimeout(resolve, 50));
  
  const solicitudesUsuario = solicitudesTramitesDemo
    .filter(solicitud => solicitud.solicitante_id === req.user.id)
    .sort((a, b) => new Date(b.fecha_solicitud) - new Date(a.fecha_solicitud));

  res.json({
    success: true,
    message: 'Solicitudes de trámites obtenidas exitosamente',
    data: {
      solicitudes: solicitudesUsuario
    },
    metadata: {
      total: solicitudesUsuario.length,
      pendientes: solicitudesUsuario.filter(s => s.estado === 'pendiente').length,
      timestamp: new Date().toISOString()
    }
  });
}));

module.exports = router;