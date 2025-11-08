const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/authMiddleware');

// ✅ RUTAS PROTEGIDAS - Solo usuarios autenticados pueden ver noticias
router.get('/', verificarToken, (req, res) => {
  console.log('📰 GET /api/noticias - Usuario:', req.user.email);
  
  res.json({ 
    mensaje: 'Noticias municipales',
    usuario: req.user.email,
    noticias: [
      { 
        id: 1, 
        titulo: 'Inauguración del nuevo centro municipal', 
        contenido: 'Se inauguró el nuevo centro municipal con modernas instalaciones...',
        fecha: '2024-01-15',
        categoria: 'Infraestructura'
      },
      { 
        id: 2, 
        titulo: 'Mejoras en el sistema de recolección', 
        contenido: 'Se implementaron mejoras en el sistema de recolección de residuos...',
        fecha: '2024-01-10',
        categoria: 'Servicios'
      },
      { 
        id: 3, 
        titulo: 'Nuevos programas sociales disponibles', 
        contenido: 'El municipio anuncia nuevos programas de apoyo social para vecinos...',
        fecha: '2024-01-05',
        categoria: 'Social'
      }
    ] 
  });
});

// ✅ NOTICIA ESPECÍFICA - También protegida
router.get('/:id', verificarToken, (req, res) => {
  const noticiaId = req.params.id;
  console.log(`📰 GET /api/noticias/${noticiaId} - Usuario:`, req.user.email);
  
  const noticia = {
    id: noticiaId,
    titulo: 'Noticia detallada - ' + noticiaId,
    contenido: 'Contenido completo de la noticia con todos los detalles importantes para la comunidad municipal...',
    fecha: '2024-01-01',
    categoria: 'General',
    autor: 'Departamento de Comunicaciones',
    vistas: 150
  };
  
  res.json({ 
    mensaje: 'Noticia obtenida',
    noticia,
    usuario: req.user.email
  });
});

// ✅ CREAR NOTICIA - Solo administradores
const { autorizarRoles } = require('../middleware/authMiddleware');
router.post('/', verificarToken, autorizarRoles('admin'), (req, res) => {
  console.log('📰 POST /api/noticias - Datos:', req.body);
  
  const nuevaNoticia = {
    id: Date.now(),
    ...req.body,
    fecha: new Date().toISOString().split('T')[0],
    autor: req.user.email,
    estado: 'publicada'
  };
  
  res.status(201).json({
    mensaje: 'Noticia creada exitosamente',
    noticia: nuevaNoticia,
    usuario: req.user.email
  });
});

// ✅ ACTUALIZAR NOTICIA - Solo administradores
router.put('/:id', verificarToken, autorizarRoles('admin'), (req, res) => {
  const noticiaId = req.params.id;
  console.log(`📰 PUT /api/noticias/${noticiaId} - Datos:`, req.body);
  
  res.json({
    mensaje: 'Noticia actualizada exitosamente',
    noticiaId: noticiaId,
    actualizaciones: req.body,
    usuario: req.user.email,
    fechaActualizacion: new Date().toISOString()
  });
});

module.exports = router;