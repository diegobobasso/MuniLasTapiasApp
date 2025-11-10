const fs = require('fs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { expect } = require('chai');
const { ejecutarConsulta, pool } = require('../server/config/databaseConnection'); // ✅ pool incluido

// ✅ CARGAR VARIABLES DE ENTORNO
try {
  require('dotenv').config({ path: './.env' });
} catch (error) {
  console.log('⚠️ No se pudo cargar .env principal');
}

if (!process.env.JWT_SECRET) {
  try {
    require('dotenv').config({ path: path.join(__dirname, '../.env.test') });
    console.log('✅ Cargado .env.test para testing');
  } catch (error) {
    console.log('⚠️ No se pudo cargar .env.test');
  }
}

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'tu_clave_secreta_jwt_muy_segura_aqui_2025' + Date.now();
  console.log('🔧 JWT_SECRET forzado para testing');
}

console.log('🔐 JWT_SECRET configurado:', process.env.JWT_SECRET ? '✅' : '❌');
console.log('🌍 NODE_ENV:', process.env.NODE_ENV);

// ✅ TOKENS INSTITUCIONALES
const generateAuthToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      rol: user.rol,
      requiereCambioPassword: user.requiereCambioPassword || false
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1h',
      algorithm: 'HS256'
    }
  );
};

const adminToken = generateAuthToken({
  id: 1,
  email: 'admin@municipalidad.com',
  rol: 'admin',
  requiereCambioPassword: false
});

const empleadoToken = generateAuthToken({
  id: 2,
  email: 'empleado@municipalidad.com',
  rol: 'empleado',
  requiereCambioPassword: false
});

const vecinoToken = generateAuthToken({
  id: 3,
  email: 'vecino@example.com',
  rol: 'vecino',
  requiereCambioPassword: false
});

const getToken = (rol) => {
  switch (rol) {
    case 'admin': return adminToken;
    case 'empleado': return empleadoToken;
    case 'vecino': return vecinoToken;
    default: return adminToken;
  }
};

// ✅ VALIDACIÓN DE TRAZABILIDAD
const expectLogMatch = (expectedPattern, logFile = 'accesos.test.log') => {
  const logPath = `./logs/${logFile}`;

  if (!fs.existsSync('./logs')) {
    fs.mkdirSync('./logs', { recursive: true });
  }

  if (!fs.existsSync(logPath)) {
    throw new Error(`Archivo de log no encontrado: ${logPath}`);
  }

  const logContent = fs.readFileSync(logPath, 'utf8');
  const lines = logContent.split('\n').filter(line => line.trim());

  const found = lines.some(line => {
    try {
      const logEntry = JSON.parse(line);
      return new RegExp(expectedPattern).test(logEntry.mensaje);
    } catch (e) {
      return line.includes(expectedPattern);
    }
  });

  if (!found) {
    throw new Error(`No se encontró trazabilidad esperada: ${expectedPattern}`);
  }
};

// 🧹 LIMPIEZA DE BASE DE DATOS TEST
before(async () => {
  const tablas = [
    'empleados', 'vecinos', 'sugerencias', 'noticias', 'tramites',
    'negocios', 'terrenos', 'eventos', 'denuncias', 'inspecciones',
    'archivos', 'conexiones', 'consultas_servicios', 'articulos', 'logs_acceso'
  ];

  for (const tabla of tablas) {
    await ejecutarConsulta(`DELETE FROM ${tabla}`);
  }

  console.log('🧹 Base municipalidad_test limpiada antes de tests');
});

// ✅ Cierre de recursos institucionales para finalizar Mocha
after(async () => {
  const { testStream, accesoStream } = require('../server/utils/logger');

  if (testStream && typeof testStream.end === 'function') {
    testStream.end();
  }

  if (accesoStream && typeof accesoStream.end === 'function') {
    accesoStream.end();
  }

  if (pool && typeof pool.end === 'function') {
    try {
      await pool.end();
      console.log('✅ Pool de MySQL cerrado correctamente');
    } catch (err) {
      console.error('❌ Error cerrando pool MySQL:', err.message);
    }
  }

  console.log('✅ Recursos cerrados correctamente. Fin de ejecución.');
});

module.exports = {
  expect,
  generateAuthToken,
  adminToken,
  empleadoToken,
  vecinoToken,
  getToken,
  expectLogMatch
};
