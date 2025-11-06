import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

// Creamos el pool de conexión
const db = mysql.createPool({
  host: process.env.DB_HOST,         // ej: 'localhost'
  user: process.env.DB_USER,         // ej: 'root'
  password: process.env.DB_PASSWORD, // ej: 'tu_clave'
  database: process.env.DB_NAME      // ej: 'municipalidad'
});

export default db;
