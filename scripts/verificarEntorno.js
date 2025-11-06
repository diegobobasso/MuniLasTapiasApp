// 🧼 Script institucional para verificar y crear carpetas críticas del entorno
import fs from 'fs';
import path from 'path';

// 📁 Carpetas requeridas para trazabilidad y almacenamiento
const carpetas = [
  'public/uploads', // 🗂️ Archivos subidos por entidad
  'logs'            // 🧾 Registro de limpieza institucional
];

// 🔍 Verificar cada carpeta y crearla si no existe
for (const carpeta of carpetas) {
  if (!fs.existsSync(carpeta)) {
    fs.mkdirSync(carpeta, { recursive: true }); // 🛠️ Crear carpeta
    console.log(`📁 Carpeta creada: ${carpeta}`);
  } else {
    console.log(`✅ Carpeta existente: ${carpeta}`);
  }
}
