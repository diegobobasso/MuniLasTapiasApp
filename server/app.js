import express from 'express';
import cors from 'cors';

import { verificarToken } from './middleware/verificarToken.js';

// 📦 Importar rutas institucionales
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

const app = express();

app.use(cors()); // 🌐 Permitir CORS
app.use(express.json()); // 📦 Parsear JSON

// 🔐 Rutas protegidas con autenticación
app.use('/api/articulos', verificarToken, articulosRouter);
app.use('/api/vecinos', verificarToken, vecinosRouter);
app.use('/api/terrenos', verificarToken, terrenosRouter);
app.use('/api/inspecciones', verificarToken, inspeccionesRouter);
app.use('/api/tramites', verificarToken, tramitesRouter);
app.use('/api/denuncias', verificarToken, denunciasRouter);
app.use('/api/eventos', verificarToken, eventosRouter);
app.use('/api/conexiones', verificarToken, conexionesRouter);
app.use('/api/archivos', verificarToken, archivosRouter);

// 📁 Servir archivos subidos desde carpeta pública
app.use('/uploads', express.static('./public/uploads'));

// 🌐 Rutas públicas sin autenticación
app.use('/api/sugerencias', sugerenciasRouter);
app.use('/api/consultas/servicios', consultasServiciosRouter);

export default app;
