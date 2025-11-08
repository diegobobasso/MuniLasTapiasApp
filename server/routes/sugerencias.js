const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/authMiddleware');

router.get('/', verificarToken, (req, res) => {
  res.json({ mensaje: 'Sugerencias', sugerencias: [] });
});

router.post('/', verificarToken, (req, res) => {
  res.status(201).json({ mensaje: 'Sugerencia creada', sugerencia: req.body });
});

module.exports = router;