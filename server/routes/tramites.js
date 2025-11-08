const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ 
    mensaje: 'Trámites', 
    tramites: [
      { id: 1, nombre: 'Licencia de conducir', descripcion: 'Trámite para licencia' },
      { id: 2, nombre: 'Permiso de construcción', descripcion: 'Trámite para construcción' }
    ] 
  });
});

module.exports = router;