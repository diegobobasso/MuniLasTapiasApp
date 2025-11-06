import db from '../models/db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// 📁 Configuración de almacenamiento físico para archivos subidos
const storage = multer.diskStorage({
  // 📂 Determina la carpeta de destino según la entidad
  destination: (req, file, cb) => {
    const entidad = req.body.entidad_origen || 'otros';
    const ruta = `public/uploads/${entidad}`;
    fs.mkdirSync(ruta, { recursive: true }); // 🛠️ Crea carpeta si no existe
    cb(null, ruta);
  },
  // 📝 Genera nombre único para el archivo
  filename: (req, file, cb) => {
    const nombre = `${Date.now()}_${file.originalname}`;
    cb(null, nombre);
  }
});

// 🧩 Middleware de subida de archivo
export const upload = multer({ storage }).single('archivo');

// 📄 Obtener todos los archivos registrados
export const getArchivos = (req, res) => {
  db.query('SELECT * FROM archivos ORDER BY fecha_subida DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// 📤 Subir archivo institucional con validación de duplicados
export const uploadArchivo = (req, res) => {
  const { entidad_origen, origen_id } = req.body;

  // ⚠️ Validación de campos obligatorios
  if (!req.file || !entidad_origen || !origen_id) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  // 🔍 Verificar si ya existe un archivo duplicado
  const sqlDuplicado = `
    SELECT * FROM archivos
    WHERE entidad_origen = ? AND origen_id = ? AND nombre_archivo = ?
  `;
  db.query(sqlDuplicado, [entidad_origen, origen_id, req.file.originalname], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length > 0) {
      return res.status(400).json({ error: 'Ya existe un archivo con ese nombre para esta entidad.' });
    }

    // 📝 Registrar nuevo archivo
    const nuevo = {
      entidad_origen,
      origen_id,
      nombre_archivo: req.file.originalname,
      ruta_archivo: `/uploads/${entidad_origen}/${req.file.filename}`,
      tipo_mime: req.file.mimetype,
      fecha_subida: new Date()
    };

    db.query('INSERT INTO archivos SET ?', nuevo, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: result.insertId, ...nuevo });
    });
  });
};

// 🗑️ Eliminar archivo manualmente con trazabilidad
export const deleteArchivo = (req, res) => {
  const { id } = req.params;

  // 🔍 Buscar archivo por ID
  db.query('SELECT * FROM archivos WHERE id = ?', [id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    const archivo = results[0];
    const rutaFisica = `public${archivo.ruta_archivo}`;

    // 🧾 Registrar eliminación en tabla de trazabilidad
    const eliminado = {
      archivo_id: archivo.id,
      entidad_origen: archivo.entidad_origen,
      origen_id: archivo.origen_id,
      nombre_archivo: archivo.nombre_archivo,
      ruta_archivo: archivo.ruta_archivo,
      motivo: 'manual'
    };

    db.query('INSERT INTO archivos_eliminados SET ?', eliminado, (err) => {
      if (err) console.warn('No se pudo registrar eliminación:', err.message);
    });

    // 🧹 Eliminar archivo físico si existe
    if (fs.existsSync(rutaFisica)) {
      fs.unlink(rutaFisica, (err) => {
        if (err) console.warn('No se pudo borrar archivo físico:', rutaFisica);
      });
    }

    // 🧼 Eliminar registro en base
    db.query('DELETE FROM archivos WHERE id = ?', [id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ mensaje: 'Archivo eliminado correctamente' });
    });
  });
};
