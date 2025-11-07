// db.js
import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

/**
 * 🔌 Conexión institucional a la base de datos MySQL
 * Usa variables de entorno para configuración segura
 */
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

export default db;
