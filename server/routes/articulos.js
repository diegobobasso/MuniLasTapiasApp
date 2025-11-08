const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/authMiddleware');

router.get('/', verificarToken, (req, res) => {
  res.json({ mensaje: 'Lista de artículos', articulos: [] });
});

router.post('/', verificarToken, (req, res) => {
  res.status(201).json({ mensaje: 'Artículo creado', articulo: req.body });
});

module.exports = router;