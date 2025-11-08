import express from 'express';
import cors from 'cors';
import { verificarToken } from './middleware/authMiddleware.js';

// 🔐 Rutas públicas (sin token)
import authRoutes from './routes/authRoutes.js';
import authVecinoRouter from './routes/authVecino.js';

// 📦 Rutas protegidas (requieren token válido)
import articulosRouter from './routes/articulos.js';
import sugerenciasRouter from './routes/sugerencias.js';
import vecinosRouter from './routes/vecinos.js';
import terrenosRouter from './routes/terrenos.js';
import inspeccionesRouter from './routes/inspecciones.js';
import archivosRouter from './routes/archivos.js';
import tramitesRouter from './routes/tramites.js';
import denunciasRouter from './routes/denuncias.js';
import eventosRouter from './routes/eventos.js';
import conexionesRouter from './routes/conexiones.js';
import consultasServiciosRouter from './routes/consultasServicios.js';
import empleadosRoutes from './routes/empleados.js';

const app = express();

// 🌐 Middleware global
app.use(cors()); // Permite CORS para frontend externo
app.use(express.json()); // Habilita JSON en body de requests

// 🔐 Rutas de autenticación públicas
app.use('/api/auth', authRoutes);             // Admins y empleados
app.use('/api/auth-vecino', authVecinoRouter); // Vecinos

// 📦 Rutas protegidas por token institucional
app.use('/api/articulos', verificarToken, articulosRouter);
app.use('/api/sugerencias', verificarToken, sugerenciasRouter);
app.use('/api/vecinos', verificarToken, vecinosRouter);
app.use('/api/terrenos', verificarToken, terrenosRouter);
app.use('/api/inspecciones', verificarToken, inspeccionesRouter);
app.use('/api/archivos', verificarToken, archivosRouter);
app.use('/api/tramites', verificarToken, tramitesRouter);
app.use('/api/denuncias', verificarToken, denunciasRouter);
app.use('/api/eventos', verificarToken, eventosRouter);
app.use('/api/conexiones', verificarToken, conexionesRouter);
app.use('/api/consultas-servicios', verificarToken, consultasServiciosRouter);
app.use('/api/empleados', verificarToken, empleadosRoutes);

// 📦 Exportación institucional
export default app;

