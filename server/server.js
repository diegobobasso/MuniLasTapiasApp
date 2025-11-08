require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ MIDDLEWARES ESENCIALES
app.use(cors({
  origin: ['http://localhost:3001', 'exp://localhost:19000'], // Para Expo y React Native
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ SERVIR ARCHIVOS ESTÁTICOS
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ CONEXIÓN A BD MEJORADA
const createDbConnection = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'municipalidad',
      port: process.env.DB_PORT || 3306,
      charset: 'utf8mb4'
    });

    console.log('✅ Conexión a MySQL establecida (municipalidad)');
    return connection;
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error.message);
    // En test, no salir del proceso
    if (process.env.NODE_ENV !== 'test') {
      throw error;
    }
    return null;
  }
};

// ✅ VERIFICAR JWT_SECRET ANTES DE CARGAR RUTAS
console.log('🔐 JWT_SECRET configurado:', process.env.JWT_SECRET ? 'SÍ' : 'NO');

// ✅ CARGAR RUTAS CON MANEJO DE ERRORES
try {
  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/empleados', require('./routes/empleadosRoutes'));
  app.use('/api/vecinos', require('./routes/vecinosRoutes'));
  app.use('/api/noticias', require('./routes/noticiasRoutes'));
  app.use('/api/tramites', require('./routes/tramitesRoutes'));
  console.log('✅ Todas las rutas cargadas correctamente');
} catch (error) {
  console.error('❌ Error cargando rutas:', error.message);
}

// ✅ RUTA HEALTH CHECK MEJORADA PARA TESTS
app.get('/api/health', async (req, res) => {
  try {
    const connection = await createDbConnection();
    if (connection) {
      await connection.execute('SELECT 1');
      await connection.end();
    }
    
    res.json({ 
      status: 'OK', 
      message: 'Servidor funcionando',
      database: connection ? 'Conectada' : 'No conectada (modo test)',
      jwt: process.env.JWT_SECRET ? 'Configurado' : 'Faltante',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Error en servidor',
      error: error.message 
    });
  }
});

// ✅ RUTA DE FALLBACK PARA API
app.use('/api/*', (req, res) => {
  console.log(`❌ Ruta API no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Endpoint API no encontrado',
    path: req.originalUrl,
    method: req.method,
    available: ['/api/auth', '/api/empleados', '/api/vecinos', '/api/noticias', '/api/tramites']
  });
});

// ✅ MANEJADOR DE ERRORES GLOBAL
app.use((error, req, res, next) => {
  console.error('💥 Error global:', error);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'production' ? 'Contacte al administrador' : error.message
  });
});

// ✅ INICIAR SERVIDOR SOLO SI NO ESTÁ EN TEST
if (process.env.NODE_ENV !== 'test') {
  const startServer = async () => {
    try {
      await createDbConnection();
      
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
        console.log(`📊 Health: http://localhost:${PORT}/api/health`);
      });
    } catch (error) {
      console.error('❌ No se pudo iniciar el servidor:', error.message);
      process.exit(1);
    }
  };

  startServer();
}

module.exports = app; // Para testing