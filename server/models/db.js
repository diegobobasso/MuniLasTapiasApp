import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config(); // 📦 Carga variables desde .env

/**
 * 🔌 Conexión institucional a la base de datos MySQL
 * - Usa variables de entorno para configuración segura
 * - Compatible con entornos test/dev/prod
 * - Lanza error si faltan variables críticas
 */

// 🛡️ Validación de entorno
const requiredVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missing = requiredVars.filter((v) => !process.env[v]);

if (missing.length > 0) {
  console.error(`[${new Date().toISOString()}] ❌ Faltan variables en .env: ${missing.join(', ')}`);
  process.exit(1); // Detiene la app si falta configuración crítica
}

// 🧩 Configuración de conexión
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

console.info(`[${new Date().toISOString()}] ✅ Conexión a MySQL establecida (${process.env.DB_NAME})`);

export default db;
