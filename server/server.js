// server.js
import app from './app.js'; // ✅ Importación ES Modules

// 🌐 Puerto institucional configurable
const PORT = process.env.PORT || 3000;

/**
 * 🚀 Inicio del servidor backend
 * - Compatible con entorno institucional
 * - Muestra URL local en consola
 */
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
