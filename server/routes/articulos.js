// routes/articulos.js
import express from 'express';

const router = express.Router();

// 🧩 Almacenamiento temporal en memoria
let articulos = [];

/**
 * 📄 Obtener los últimos 3 artículos
 * - Acceso público
 */
router.get('/', (req, res) => {
  res.json(articulos.slice(-3));
});

/**
 * ➕ Crear nuevo artículo
 * - Genera ID único por timestamp
 */
router.post('/', (req, res) => {
  const nuevo = { ...req.body, id: Date.now() };
  articulos.push(nuevo);
  res.status(201).json(nuevo);
});

/**
 * 📦 Exportación institucional
 */
export default router;
