/**
 * 🗄️ CONFIGURACIÓN PRINCIPAL DE BASE DE DATOS
 * Configuración única para toda la aplicación usando variables de entorno
 */

require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'Diego',
  password: process.env.DB_PASSWORD || '1234*',
  database: process.env.DB_NAME || 'municipalidad',
  port: process.env.DB_PORT || 3306,
  
  // Configuración del pool
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  
  // Configuración de caracteres
  charset: 'utf8mb4',
  timezone: 'local'
};

module.exports = dbConfig;