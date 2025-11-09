/**
 * 📰 CONTROLADOR DE NOTICIAS MUNICIPALES - CRUD COMPLETO
 * 
 * Maneja todas las operaciones CRUD para noticias del municipio
 * incluyendo creación, lectura, actualización y desactivación.
 * 
 * Endpoints disponibles:
 * - GET    /api/noticias              - Listar noticias activas
 * - GET    /api/noticias/:id          - Obtener noticia específica
 * - POST   /api/noticias              - Crear nueva noticia (solo admin)
 * - PUT    /api/noticias/:id          - Actualizar noticia (solo admin)
 * - DELETE /api/noticias/:id          - Desactivar noticia (solo admin)
 * - GET    /api/noticias/categoria/:categoria - Filtrar por categoría
 * 
 * Seguridad implementada:
 * - Autenticación JWT requerida en todas las rutas
 * - Autorización por roles (solo admin para crear/actualizar/eliminar)
 * - Validación robusta de datos de entrada
 */

const express = require('express');
const router = express.Router();
const { verificarToken, autorizarRoles } = require('../middleware/authMiddleware');
const { asyncHandler, ValidationError, NotFoundError } = require('../middleware/errorHandler');

// 📊 DATOS DEMO DE NOTICIAS (TEMPORAL)
let noticiasDemo = [
  { 
    id: 1, 
    titulo: 'Inauguración del nuevo centro municipal', 
    contenido: 'Se inauguró el nuevo centro municipal con modernas instalaciones para mejor atención al vecino. Las nuevas oficinas cuentan con tecnología de última generación y espacios más amplios para comodidad de todos.',
    imagen_url: '/uploads/inauguracion-centro.jpg',
    autor_id: 1,
    autor_nombre: 'Admin Sistema',
    categoria: 'infraestructura',
    fecha_publicacion: '2024-01-15',
    fecha_expiracion: '2024-02-15',
    destacada: true,
    activa: true,
    vistas: 150,
    fecha_creacion: '2024-01-15T10:00:00Z',
    fecha_actualizacion: '2024-01-15T10:00:00Z'
  },
  { 
    id: 2, 
    titulo: 'Mejoras en el sistema de recolección de residuos', 
    contenido: 'Se implementaron mejoras en el sistema de recolección de residuos urbanos. Nuevos horarios y frecuencias para optimizar el servicio en toda la ciudad.',
    imagen_url: '/uploads/recoleccion-residuos.jpg',
    autor_id: 1,
    autor_nombre: 'Admin Sistema',
    categoria: 'servicios',
    fecha_publicacion: '2024-01-10',
    fecha_expiracion: null,
    destacada: false,
    activa: true,
    vistas: 89,
    fecha_creacion: '2024-01-10T08:30:00Z',
    fecha_actualizacion: '2024-01-10T08:30:00Z'
  },
  { 
    id: 3, 
    titulo: 'Nuevos programas sociales disponibles', 
    contenido: 'El municipio anuncia nuevos programas de apoyo social para vecinos en situación vulnerable. Incluye asistencia alimentaria, subsidios y capacitaciones laborales.',
    imagen_url: '/uploads/programas-sociales.jpg',
    autor_id: 1,
    autor_nombre: 'Admin Sistema',
    categoria: 'social',
    fecha_publicacion: '2024-01-05',
    fecha_expiracion: '2024-06-05',
    destacada: true,
    activa: true,
    vistas: 203,
    fecha_creacion: '2024-01-05T14:20:00Z',
    fecha_actualizacion: '2024-01-05T14:20:00Z'
  }
];

// 📋 CATEGORÍAS PERMITIDAS PARA NOTICIAS
const categoriasPermitidas = ['general', 'infraestructura', 'servicios', 'social', 'emergencia'];

/**
 * ✅ MIDDLEWARE DE VALIDACIÓN PARA NOTICIAS
 */
const validarNoticia = (req, res, next) => {
  const { titulo, contenido, categoria, fecha_publicacion, fecha_expiracion, destacada } = req.body;
  const errores = [];

  // Validación de título
  if (!titulo || typeof titulo !== 'string' || titulo.trim().length < 5) {
    errores.push('El título debe tener al menos 5 caracteres');
  }

  // Validación de contenido
  if (!contenido || typeof contenido !== 'string' || contenido.trim().length < 20) {
    errores.push('El contenido debe tener al menos 20 caracteres');
  }

  // Validación de categoría
  if (!categoria || !categoriasPermitidas.includes(categoria)) {
    errores.push(`La categoría debe ser una de: ${categoriasPermitidas.join(', ')}`);
  }

  // Validación de fecha de publicación
  if (!fecha_publicacion || !isValidDate(fecha_publicacion)) {
    errores.push('La fecha de publicación debe tener un formato válido (YYYY-MM-DD)');
  }

  // Validación de fecha de expiración (opcional)
  if (fecha_expiracion && !isValidDate(fecha_expiracion)) {
    errores.push('La fecha de expiración debe tener un formato válido (YYYY-MM-DD)');
  }

  // Validación de destacada (booleano)
  if (destacada !== undefined && typeof destacada !== 'boolean') {
    errores.push('El campo destacada debe ser verdadero o falso');
  }

  if (errores.length > 0) {
    throw new ValidationError('Errores de validación en noticia', errores);
  }

  // Limpiar y normalizar datos
  req.body.titulo = titulo.trim();
  req.body.contenido = contenido.trim();
  req.body.categoria = categoria;
  
  next();
};

/**
 * 🔧 FUNCIÓN AUXILIAR: VALIDAR FECHA
 */
const isValidDate = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateString.match(regex)) return false;
  
  const date = new Date(dateString);
  const timestamp = date.getTime();
  
  return typeof timestamp === 'number' && !isNaN(timestamp);
};

/**
 * 📋 ENDPOINT: LISTAR NOTICIAS ACTIVAS
 */
router.get('/', verificarToken, asyncHandler(async (req, res) => {
  console.log('📰 GET /api/noticias - Usuario:', req.user.email);
  
  await new Promise(resolve => setTimeout(resolve, 50));
  
  // Filtrar solo noticias activas y ordenar por fecha de publicación (más recientes primero)
  const noticiasActivas = noticiasDemo
    .filter(noticia => noticia.activa)
    .sort((a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion));
  
  res.json({ 
    success: true,
    message: 'Lista de noticias obtenida exitosamente',
    data: {
      noticias: noticiasActivas
    },
    metadata: {
      total: noticiasActivas.length,
      destacadas: noticiasActivas.filter(n => n.destacada).length,
      timestamp: new Date().toISOString()
    }
  });
}));

/**
 * 👁️ ENDPOINT: OBTENER NOTICIA ESPECÍFICA
 */
router.get('/:id', verificarToken, asyncHandler(async (req, res) => {
  const noticiaId = parseInt(req.params.id);
  console.log(`📰 GET /api/noticias/${noticiaId} - Usuario:`, req.user.email);

  if (isNaN(noticiaId)) {
    throw new ValidationError('ID de noticia inválido');
  }

  await new Promise(resolve => setTimeout(resolve, 30));
  
  const noticia = noticiasDemo.find(n => n.id === noticiaId && n.activa);

  if (!noticia) {
    throw new NotFoundError(`Noticia con ID ${noticiaId} no encontrada`);
  }

  // Incrementar contador de vistas (simulado)
  noticia.vistas += 1;

  res.json({
    success: true,
    message: 'Noticia obtenida exitosamente',
    data: {
      noticia: noticia
    }
  });
}));

/**
 * 🆕 ENDPOINT: CREAR NUEVA NOTICIA
 */
router.post('/', verificarToken, autorizarRoles('admin'), validarNoticia, asyncHandler(async (req, res) => {
  console.log('📰 POST /api/noticias - Datos validados:', req.body);
  
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const { titulo, contenido, categoria, fecha_publicacion, fecha_expiracion, destacada, imagen_url } = req.body;
  
  const nuevaNoticia = {
    id: Date.now(),
    titulo,
    contenido,
    imagen_url: imagen_url || null,
    autor_id: req.user.id,
    autor_nombre: req.user.email, // En producción sería el nombre real
    categoria,
    fecha_publicacion,
    fecha_expiracion: fecha_expiracion || null,
    destacada: destacada || false,
    activa: true,
    vistas: 0,
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString()
  };

  noticiasDemo.push(nuevaNoticia);

  res.status(201).json({
    success: true,
    message: 'Noticia creada exitosamente',
    data: {
      noticia: nuevaNoticia
    },
    metadata: {
      timestamp: new Date().toISOString(),
      noticiaId: nuevaNoticia.id
    }
  });
}));

/**
 * ✏️ ENDPOINT: ACTUALIZAR NOTICIA
 */
router.put('/:id', verificarToken, autorizarRoles('admin'), validarNoticia, asyncHandler(async (req, res) => {
  const noticiaId = parseInt(req.params.id);
  console.log(`📰 PUT /api/noticias/${noticiaId} - Datos:`, req.body);

  if (isNaN(noticiaId)) {
    throw new ValidationError('ID de noticia inválido');
  }

  await new Promise(resolve => setTimeout(resolve, 80));
  
  const noticiaIndex = noticiasDemo.findIndex(n => n.id === noticiaId);

  if (noticiaIndex === -1) {
    throw new NotFoundError(`Noticia con ID ${noticiaId} no encontrada`);
  }

  const { titulo, contenido, categoria, fecha_publicacion, fecha_expiracion, destacada, imagen_url } = req.body;

  const noticiaActualizada = {
    ...noticiasDemo[noticiaIndex],
    titulo,
    contenido,
    imagen_url: imagen_url || noticiasDemo[noticiaIndex].imagen_url,
    categoria,
    fecha_publicacion,
    fecha_expiracion: fecha_expiracion || null,
    destacada: destacada || false,
    fecha_actualizacion: new Date().toISOString()
  };

  noticiasDemo[noticiaIndex] = noticiaActualizada;

  res.json({
    success: true,
    message: 'Noticia actualizada exitosamente',
    data: {
      noticia: noticiaActualizada
    },
    metadata: {
      timestamp: new Date().toISOString(),
      actualizadoPor: req.user.email
    }
  });
}));

/**
 * 🗑️ ENDPOINT: DESACTIVAR NOTICIA (DELETE LÓGICO)
 */
router.delete('/:id', verificarToken, autorizarRoles('admin'), asyncHandler(async (req, res) => {
  const noticiaId = parseInt(req.params.id);
  console.log(`📰 DELETE /api/noticias/${noticiaId} - Usuario:`, req.user.email);

  if (isNaN(noticiaId)) {
    throw new ValidationError('ID de noticia inválido');
  }

  await new Promise(resolve => setTimeout(resolve, 60));
  
  const noticiaIndex = noticiasDemo.findIndex(n => n.id === noticiaId);

  if (noticiaIndex === -1) {
    throw new NotFoundError(`Noticia con ID ${noticiaId} no encontrada`);
  }

  // Desactivar noticia (delete lógico)
  noticiasDemo[noticiaIndex].activa = false;
  noticiasDemo[noticiaIndex].fecha_actualizacion = new Date().toISOString();

  res.json({
    success: true,
    message: 'Noticia desactivada exitosamente',
    data: {
      noticiaId: noticiaId,
      activa: false,
      fechaActualizacion: new Date().toISOString()
    }
  });
}));

/**
 * 🏷️ ENDPOINT: FILTRAR NOTICIAS POR CATEGORÍA
 */
router.get('/categoria/:categoria', verificarToken, asyncHandler(async (req, res) => {
  const categoria = req.params.categoria.toLowerCase();
  console.log(`📰 GET /api/noticias/categoria/${categoria} - Usuario:`, req.user.email);

  if (!categoriasPermitidas.includes(categoria)) {
    throw new ValidationError(`Categoría no válida. Permitidas: ${categoriasPermitidas.join(', ')}`);
  }

  await new Promise(resolve => setTimeout(resolve, 40));
  
  const noticiasFiltradas = noticiasDemo
    .filter(noticia => noticia.activa && noticia.categoria === categoria)
    .sort((a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion));

  res.json({
    success: true,
    message: `Noticias de categoría ${categoria} obtenidas exitosamente`,
    data: {
      noticias: noticiasFiltradas,
      categoria: categoria
    },
    metadata: {
      total: noticiasFiltradas.length,
      timestamp: new Date().toISOString()
    }
  });
}));

/**
 * ⭐ ENDPOINT: OBTENER NOTICIAS DESTACADAS
 */
router.get('/destacadas/todas', verificarToken, asyncHandler(async (req, res) => {
  console.log('📰 GET /api/noticias/destacadas/todas - Usuario:', req.user.email);
  
  await new Promise(resolve => setTimeout(resolve, 40));
  
  const noticiasDestacadas = noticiasDemo
    .filter(noticia => noticia.activa && noticia.destacada)
    .sort((a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion));

  res.json({
    success: true,
    message: 'Noticias destacadas obtenidas exitosamente',
    data: {
      noticias: noticiasDestacadas
    },
    metadata: {
      total: noticiasDestacadas.length,
      timestamp: new Date().toISOString()
    }
  });
}));

module.exports = router;