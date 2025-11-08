require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ VERIFICAR CONFIGURACIÓN
console.log('🔐 JWT_SECRET configurado:', process.env.JWT_SECRET ? 'SÍ' : 'NO');

// ✅ CARGAR MIDDLEWARE
const { verificarToken } = require('./middleware/authMiddleware');

// ✅ CARGAR TODAS LAS RUTAS EN ORDEN
app.use('/api/auth', require('./routes/authRoutes'));           // Auth empleados/admin
app.use('/api/auth-vecino', require('./routes/authVecino'));    // Auth vecinos

// ✅ RUTAS PROTEGIDAS
app.use('/api/articulos', verificarToken, require('./routes/articulos'));
app.use('/api/sugerencias', verificarToken, require('./routes/sugerencias'));
app.use('/api/vecinos', verificarToken, require('./routes/vecinos'));
app.use('/api/terrenos', verificarToken, require('./routes/terrenos'));
app.use('/api/inspecciones', verificarToken, require('./routes/inspecciones'));
app.use('/api/archivos', verificarToken, require('./routes/archivos'));
app.use('/api/tramites', verificarToken, require('./routes/tramites'));
app.use('/api/denuncias', verificarToken, require('./routes/denuncias'));
app.use('/api/eventos', verificarToken, require('./routes/eventos'));
app.use('/api/conexiones', verificarToken, require('./routes/conexiones'));
app.use('/api/consultas-servicios', verificarToken, require('./routes/consultasServicios'));
app.use('/api/empleados', verificarToken, require('./routes/empleados'));
app.use('/api/negocios', verificarToken, require('./routes/negocios')); // ✅ AGREGADO

// ✅ RUTAS PÚBLICAS
app.use('/api/noticias', require('./routes/noticias')); // ✅ ACTUALIZADO

// ✅ HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor funcionando',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ✅ MANEJO DE RUTAS NO ENCONTRADAS
app.use('/api/*', (req, res) => {
  console.log(`❌ Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Endpoint no encontrado',
    path: req.originalUrl,
    method: req.method
  });
});

// ✅ MANEJADOR DE ERRORES
app.use((error, req, res, next) => {
  console.error('💥 Error global:', error);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'production' ? 'Contacte al administrador' : error.message
  });
});

// ✅ INICIAR SERVIDOR
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
    console.log(`📊 Rutas cargadas: ${Object.keys(require('./routes')).length} módulos`);
  });
}

module.exports = app;