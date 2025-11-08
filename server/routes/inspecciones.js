const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/authMiddleware');

router.get('/', verificarToken, (req, res) => {
  res.json({ mensaje: 'Inspecciones', inspecciones: [] });
});

module.exports = router;