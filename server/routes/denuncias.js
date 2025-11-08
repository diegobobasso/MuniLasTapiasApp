const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/authMiddleware');

router.get('/', verificarToken, (req, res) => {
  res.json({ mensaje: 'Denuncias', denuncias: [] });
});

router.post('/', verificarToken, (req, res) => {
  res.status(201).json({ mensaje: 'Denuncia creada', denuncia: req.body });
});

module.exports = router;