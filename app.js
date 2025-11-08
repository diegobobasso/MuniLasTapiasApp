// app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { logAcceso } from './server/utils/logger.js';

// 📦 Cargar variables de entorno
dotenv.config();

// 📁 Resolver __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🚀 Inicializar app
const app = express();

// 🧩 Middlewares globales
app.use(cors());
app.use(express.json());

// 🧾 Trazabilidad de arranque
logAcceso('🟢 Servidor institucional iniciado');

// 🔐 Rutas protegidas
import empleadosRoutes from './server/routes/empleados.js';
import vecinosRoutes from './server/routes/vecinos.js';

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
export default app;
