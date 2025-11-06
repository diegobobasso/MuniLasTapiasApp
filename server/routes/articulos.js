// routes/articulos.js

const express = require('express');
const router = express.Router();

let articulos = [];

router.get('/', (req, res) => {
  res.json(articulos.slice(-3));
});

router.post('/', (req, res) => {
  const nuevo = { ...req.body, id: Date.now() };
  articulos.push(nuevo);
  res.status(201).json(nuevo);
});

module.exports = router;