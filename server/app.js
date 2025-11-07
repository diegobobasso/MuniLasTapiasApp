// app.js
import express from 'express';
import cors from 'cors';

import { verificarToken } from './middleware/authMiddleware.js';

// 🔐 Rutas públicas
import authRoutes from './routes/authRoutes.js';
import authVecinoRouter from './routes/authVecino.js';
import adminBootstrapRouter from './routes/adminBootstrap.js';

// 📦 Rutas protegidas
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
app.use(cors());
app.use(express.json());

// 🔐 Autenticación
app.use('/auth', authRoutes);
app.use('/auth-vecino', authVecinoRouter);
app.use('/admin', adminBootstrapRouter);

// 📦 Rutas protegidas por token
app.use('/articulos', verificarToken, articulosRouter);
app.use('/sugerencias', verificarToken, sugerenciasRouter);
app.use('/vecinos', verificarToken, vecinosRouter);
app.use('/terrenos', verificarToken, terrenosRouter);
app.use('/inspecciones', verificarToken, inspeccionesRouter);
app.use('/archivos', verificarToken, archivosRouter);
app.use('/tramites', verificarToken, tramitesRouter);
app.use('/denuncias', verificarToken, denunciasRouter);
app.use('/eventos', verificarToken, eventosRouter);
app.use('/conexiones', verificarToken, conexionesRouter);
app.use('/consultas-servicios', verificarToken, consultasServiciosRouter);
app.use('/empleados', verificarToken, empleadosRoutes);

export default app;
