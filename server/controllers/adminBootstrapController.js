// controllers/adminBootstrapController.js
import db from '../models/db.js';
import bcrypt from 'bcrypt';

/**
 * 🛠 Crear el primer superadministrador
 * - Solo si no hay administradores activos
 */
export const bootstrapAdmin = async (req, res) => {
  const { username, nuevaPassword } = req.body;

  if (!username || !nuevaPassword) {
    return res.status(400).json({ error: 'Se requieren username y nuevaPassword' });
  }

  try {
    const [admins] = await db.promise().query(
      "SELECT id FROM empleados WHERE rol = 'admin' AND activo = TRUE"
    );

    if (admins.length > 0) {
      console.warn(`[${new Date().toISOString()}] Bootstrap bloqueado: ya existe un administrador activo`);
      return res.status(403).json({ error: 'Ya existe un administrador activo. Bootstrap deshabilitado.' });
    }

    const passwordHash = await bcrypt.hash(nuevaPassword, 12);

    await db.promise().query(
      `INSERT INTO empleados (nombre, email, dni, username, password_hash, rol, activo, fecha_alta)
       VALUES (?, ?, ?, ?, ?, 'admin', TRUE, CURRENT_TIMESTAMP)`,
      ['Superadministrador', 'admin@municipalidad.gob.ar', '00000000', username, passwordHash]
    );

    console.info(`[${new Date().toISOString()}] Superadministrador creado: ${username}`);
    return res.status(201).json({ mensaje: 'Superadministrador creado correctamente.' });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error en bootstrapAdmin: ${error.message}`);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * 🔍 Verificar si el sistema está virgen
 * - Devuelve true si no hay administradores activos
 */
export const verificarEstadoBootstrap = async (req, res) => {
  try {
    const [admins] = await db.promise().query(
      "SELECT id FROM empleados WHERE rol = 'admin' AND activo = TRUE"
    );

    const sistemaVirgen = admins.length === 0;
    console.info(`[${new Date().toISOString()}] Estado del sistema: ${sistemaVirgen ? 'VIRGEN' : 'OPERATIVO'}`);
    res.json({ sistemaVirgen });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error al verificar estado del sistema: ${error.message}`);
    res.status(500).json({ error: 'Error interno al verificar estado del sistema.' });
  }
};
