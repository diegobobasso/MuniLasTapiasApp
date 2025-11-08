const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/authMiddleware');

router.get('/', verificarToken, (req, res) => {
  res.json({ 
    mensaje: 'Negocios', 
    negocios: [
      { id: 1, nombre: 'Negocio 1', rubro: 'Alimentos' },
      { id: 2, nombre: 'Negocio 2', rubro: 'Servicios' }
    ] 
  });
});

router.post('/', verificarToken, (req, res) => {
  res.status(201).json({ 
    mensaje: 'Negocio creado', 
    negocio: { id: Date.now(), ...req.body }
  });
});

module.exports = router;