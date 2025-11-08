const fs = require('fs');
const jwt = require('jsonwebtoken');
const { expect } = require('chai');
const path = require('path');

// ✅ CARGAR VARIABLES DE ENTORNO INTELIGENTEMENTE
try {
  // Intentar cargar .env principal
  require('dotenv').config({ path: './.env' });
} catch (error) {
  console.log('⚠️ No se pudo cargar .env principal');
}

// Si aún no hay JWT_SECRET, cargar .env.test
if (!process.env.JWT_SECRET) {
  try {
    const envTestPath = path.join(__dirname, '.env.test');
    require('dotenv').config({ path: envTestPath });
    console.log('✅ Cargado .env.test para testing');
  } catch (error) {
    console.log('⚠️ No se pudo cargar .env.test');
  }
}

// ✅ GARANTIZAR QUE HAY JWT_SECRET
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'jwt_secret_para_testing_muni_las_tapias_2025_' + Date.now();
  console.log('🔧 JWT_SECRET forzado para testing');
}

console.log('🔐 JWT_SECRET configurado:', process.env.JWT_SECRET ? '✅' : '❌');
console.log('🌍 NODE_ENV:', process.env.NODE_ENV);

// ✅ GENERACIÓN DE TOKENS (ahora segura)
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

// ... resto del código sin cambios ...
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
  switch(rol) {
    case 'admin': return adminToken;
    case 'empleado': return empleadoToken;
    case 'vecino': return vecinoToken;
    default: return adminToken;
  }
};

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

module.exports = {
  expect,
  generateAuthToken,
  adminToken,
  empleadoToken,
  vecinoToken,
  getToken,
  expectLogMatch
};