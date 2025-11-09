/**
 * 🔌 CONEXIÓN A BASE DE DATOS MYSQL
 * Pool de conexiones usando la configuración principal
 */

const mysql = require('mysql2/promise');
const dbConfig = require('./database');

// Crear el pool de conexiones
const pool = mysql.createPool(dbConfig);

const verificarConexion = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a MySQL establecida correctamente');
    await connection.execute('SELECT 1');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error.message);
    return false;
  }
};

const ejecutarConsulta = async (sql, params = []) => {
  try {
    const [resultados] = await pool.execute(sql, params);
    return resultados;
  } catch (error) {
    console.error('❌ Error en consulta SQL:', error.message);
    console.error('📋 Consulta:', sql);
    console.error('🔧 Parámetros:', params);
    throw error;
  }
};

const obtenerConexion = async () => {
  return await pool.getConnection();
};

// Verificar conexión al iniciar
if (process.env.NODE_ENV !== 'test') {
  verificarConexion().then(exitoso => {
    if (exitoso) {
      console.log('🗄️ Base de datos municipalidad conectada y lista');
    }
  });
}

module.exports = {
  pool,
  verificarConexion,
  ejecutarConsulta,
  obtenerConexion
};