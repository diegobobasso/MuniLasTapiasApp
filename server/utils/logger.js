/**
 * 🧾 Logger institucional (CommonJS)
 * - Asegura existencia de carpeta logs/
 * - Escribe en logs/test.log y logs/accesos.log
 * - Compatible con entornos limpios, Mocha y CI
 */

const fs = require('fs');
const path = require('path');

// 📁 Ruta de logs institucionales
const logsDir = path.resolve('./logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// 🧪 Stream para logs de pruebas
const testStream = fs.createWriteStream(path.join(logsDir, 'test.log'), { flags: 'a' });

// 🔐 Stream para logs de accesos
const accesoStream = fs.createWriteStream(path.join(logsDir, 'accesos.log'), { flags: 'a' });

/**
 * 🧪 Log institucional para pruebas
 * @param {string} msg - Mensaje a registrar
 */
function logTest(msg) {
  const timestamp = new Date().toISOString();
  testStream.write(`[${timestamp}] ${msg}\n`);
}

/**
 * 🔐 Log institucional de accesos
 * @param {string} msg - Mensaje a registrar
 * @param {string} usuario - Email o identificador del usuario
 */
function logAcceso(msg, usuario = 'sistema') {
  const entrada = {
    timestamp: new Date().toISOString(),
    usuario,
    mensaje: msg
  };
  accesoStream.write(JSON.stringify(entrada) + '\n');
}

// ✅ Exportación institucional
module.exports = {
  logTest,
  logAcceso,
  log: logTest,
  testStream,
  accesoStream
};
