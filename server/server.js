require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// ✅ IMPORTAR NUEVO MANEJADOR DE ERRORES
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ VERIFICAR CONFIGURACIÓN
console.log('🔐 JWT_SECRET configurado:', process.env.JWT_SECRET ? 'SÍ' : 'NO');
console.log('🌍 NODE_ENV:', process.env.NODE_ENV);

// ✅ CARGAR MIDDLEWARE
const { verificarToken } = require('./middleware/authMiddleware');

// ✅ CARGAR TODAS LAS RUTAS EN ORDEN
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/auth-vecino', require('./routes/authVecino'));

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
app.use('/api/negocios', verificarToken, require('./routes/negocios'));

// ✅ RUTAS PÚBLICAS
app.use('/api/noticias', require('./routes/noticias'));

// ✅ HEALTH CHECK MEJORADO
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'Servidor funcionando correctamente',
    data: {
      status: 'OK',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    }
  });
});

// ✅ MANEJO DE RUTAS NO ENCONTRADAS (MEJORADO)
app.use('/api/*', (req, res) => {
  console.log(`❌ Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado',
    error: 'ENDPOINT_NO_ENCONTRADO',
    details: `La ruta ${req.method} ${req.originalUrl} no existe`,
    availableEndpoints: [
      '/api/auth/*',
      '/api/empleados/*',
      '/api/vecinos/*',
      '/api/noticias/*',
      '/api/tramites/*'
    ]
  });
});

// ✅ RUTA RAIZ
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Municipalidad Las Tapias',
    data: {
      version: '1.0.0',
      status: 'activo',
      documentation: '/api/health'
    }
  });
});

// ✅ USAR EL MANEJADOR DE ERRORES CENTRALIZADO (DEBE SER EL ÚLTIMO MIDDLEWARE)
app.use(errorHandler);



// INICIAR SERVIDOR SOLO SI NO ESTÁ EN TEST Y NO ES IMPORTADO
if (process.env.NODE_ENV !== 'test' && require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;
