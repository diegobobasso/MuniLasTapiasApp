// 🧼 Script institucional para limpiar archivos huérfanos y duplicados con trazabilidad
import db from '../server/models/db.js';
import fs from 'fs';
import path from 'path';

const logPath = path.join('logs', 'limpieza.log'); // 🧾 Ruta del archivo de log

// 📝 Registrar mensaje en archivo físico de log
function registrarLog(mensaje) {
  const linea = `[${new Date().toISOString()}] ${mensaje}\n`;
  fs.appendFileSync(logPath, linea);
}

// 🧾 Registrar eliminación en tabla de trazabilidad
async function registrarEnBase(archivo, motivo) {
  await db.query('INSERT INTO archivos_eliminados SET ?', {
    archivo_id: archivo.id,
    entidad_origen: archivo.entidad_origen,
    origen_id: archivo.origen_id,
    nombre_archivo: archivo.nombre_archivo,
    ruta_archivo: archivo.ruta_archivo,
    motivo
  });
}

// 🧹 Eliminar archivos huérfanos (sin entidad válida en la base)
async function limpiarHuerfanos() {
  const entidades = ['inspeccion', 'tramite', 'sugerencia', 'negocio', 'terreno', 'vecino'];

  for (const entidad of entidades) {
    const tabla = entidad === 'vecino' ? 'vecinos' : `${entidad}s`;

    const [huérfanos] = await db.query(`
      SELECT a.* FROM archivos a
      LEFT JOIN ${tabla} e ON a.origen_id = e.id
      WHERE a.entidad_origen = ? AND e.id IS NULL
    `, [entidad]);

    for (const archivo of huérfanos) {
      await registrarEnBase(archivo, 'huérfano'); // 🧾 Registrar en base
      await db.query('DELETE FROM archivos WHERE id = ?', [archivo.id]); // 🗑️ Eliminar
      registrarLog(`Huérfano eliminado: ID ${archivo.id} (${entidad})`);
    }
  }
}

// 🧹 Eliminar archivos duplicados (mismo nombre por entidad e ID)
async function limpiarDuplicados() {
  const [duplicados] = await db.query(`
    SELECT a.* FROM archivos a
    JOIN (
      SELECT entidad_origen, origen_id, nombre_archivo, MIN(id) AS id_min
      FROM archivos
      GROUP BY entidad_origen, origen_id, nombre_archivo
      HAVING COUNT(*) > 1
    ) d ON a.entidad_origen = d.entidad_origen AND a.origen_id = d.origen_id AND a.nombre_archivo = d.nombre_archivo
    WHERE a.id > d.id_min
  `);

  for (const archivo of duplicados) {
    await registrarEnBase(archivo, 'duplicado'); // 🧾 Registrar en base
    await db.query('DELETE FROM archivos WHERE id = ?', [archivo.id]); // 🗑️ Eliminar
    registrarLog(`Duplicado eliminado: ID ${archivo.id}`);
  }
}

// 🚀 Ejecutar limpieza completa
async function ejecutarLimpieza() {
  registrarLog('🔍 Inicio de limpieza institucional');
  await limpiarHuerfanos();
  await limpiarDuplicados();
  registrarLog('✅ Limpieza completada');
}

ejecutarLimpieza();
