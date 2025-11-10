const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { logAcceso } = require('./server/utils/logger');

// 📦 Cargar variables de entorno
dotenv.config();

// 📁 Resolver __dirname
const __dirname = path.resolve();

// 🚀 Inicializar app
const app = express();

// 🧩 Middlewares globales
app.use(cors());
app.use(express.json());

// 🧾 Trazabilidad de arranque
logAcceso('🟢 Servidor institucional iniciado');

// 🔐 Rutas protegidas
const empleadosRoutes = require('./server/routes/empleados');
const vecinosRoutes = require('./server/routes/vecinos');

app.use('/api/empleados', empleadosRoutes);
app.use('/api/vecinos', vecinosRoutes);

// 🧪 Ruta de prueba institucional
app.get('/api/ping', (req, res) => {
  res.json({ mensaje: 'Servidor municipal operativo' });
});

// 🛑 Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// 📦 Exportar app para test o server.js
module.exports = app;
