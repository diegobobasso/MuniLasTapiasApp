/**
 * 🧾 LOGGER INSTITUCIONAL
 * - Registra accesos y eventos en archivos separados
 * - Redirige a accesos.test.log si NODE_ENV === 'test'
 * - Compatible con trazabilidad y cierre en tests
 */

const fs = require('fs');
const path = require('path');

// 📁 Asegurar carpeta de logs
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// 🧪 Detectar entorno de test
const isTest = process.env.NODE_ENV === 'test';

// 📝 Streams configurados por entorno
const accesoStream = fs.createWriteStream(
  path.join(logsDir, isTest ? 'accesos.test.log' : 'accesos.log'),
  { flags: 'a' }
);

const testStream = fs.createWriteStream(
  path.join(logsDir, 'test.log'),
  { flags: 'a' }
);

// 🧾 Log de accesos institucionales
const logAcceso = (mensaje, usuario) => {
  const log = {
    timestamp: new Date().toISOString(),
    usuario,
    mensaje
  };
  accesoStream.write(JSON.stringify(log) + '\n');
};

// 🧪 Log de eventos de test
const logTest = (mensaje) => {
  const log = {
    timestamp: new Date().toISOString(),
    mensaje
  };
  testStream.write(JSON.stringify(log) + '\n');
};

module.exports = {
  logAcceso,
  logTest,
  accesoStream,
  testStream
};
