import fs from 'fs';
import path from 'path';

/**
 * 🧾 Logger institucional
 * - Asegura existencia de carpeta logs/
 * - Escribe en logs/test.log y logs/accesos.log
 * - Compatible con entornos limpios y CI
 */

const logsDir = path.resolve('./logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// 🧪 Log de pruebas
const testStream = fs.createWriteStream(path.join(logsDir, 'test.log'), { flags: 'a' });

// 🔐 Log de accesos
const accesoStream = fs.createWriteStream(path.join(logsDir, 'accesos.log'), { flags: 'a' });

/**
 * 🧪 Log institucional para pruebas
 */
export function logTest(msg) {
  const timestamp = new Date().toISOString();
  testStream.write(`[${timestamp}] ${msg}\n`);
}

/**
 * 🔐 Log institucional de accesos
 */
export function logAcceso(msg) {
  const timestamp = new Date().toISOString();
  accesoStream.write(`[${timestamp}] ${msg}\n`);
}

export const log = logTest;
