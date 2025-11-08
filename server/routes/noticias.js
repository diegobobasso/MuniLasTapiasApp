const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ 
    mensaje: 'Noticias', 
    noticias: [
      { 
        id: 1, 
        titulo: 'Inauguración del nuevo centro municipal', 
        contenido: 'Se inauguró el nuevo centro municipal...',
        fecha: '2024-01-15'
      },
      { 
        id: 2, 
        titulo: 'Mejoras en el sistema de recolección', 
        contenido: 'Se implementaron mejoras en el sistema...',
        fecha: '2024-01-10'
      }
    ] 
  });
});

router.get('/:id', (req, res) => {
  const noticia = {
    id: req.params.id,
    titulo: 'Noticia detallada',
    contenido: 'Contenido completo de la noticia...',
    fecha: '2024-01-01'
  };
  res.json({ noticia });
});

module.exports = router;