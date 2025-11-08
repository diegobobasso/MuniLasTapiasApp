import app from './app.js';

/**
 * Lista de rutas y métodos que usan tus tests
 */
const rutasEsperadas = [
  { path: '/empleados', method: 'GET', protegido: true },
  { path: '/empleados', method: 'POST', protegido: true },
  { path: '/empleados/restaurar-clave/:id', method: 'PUT', protegido: true },
  { path: '/vecinos', method: 'GET', protegido: true },
  { path: '/vecinos', method: 'POST', protegido: true },
  { path: '/vecinos/restaurar-clave/:id', method: 'PUT', protegido: true },
  { path: '/auth/login', method: 'POST', protegido: false },
  { path: '/auth/cambiar-password-inicial', method: 'POST', protegido: false },
];

/**
 * Función que normaliza rutas con parámetros (:id)
 */
function normalizePath(path) {
  return path.replace(/:([a-zA-Z0-9_]+)/g, ':param');
}

/**
 * Recorrer todas las rutas registradas en Express
 */
function getAppRoutes(app) {
  const routes = [];

  function traverse(stack, prefix = '', middlewares = []) {
    for (const layer of stack) {
      if (layer.route) {
        const path = prefix + layer.route.path;
        const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase());
        routes.push({ path: normalizePath(path), methods, middlewares });
      } else if (layer.name === 'router' && layer.handle.stack) {
        const newPrefix = layer.regexp.source
          .replace('\\/?', '')
          .replace('(?=\\/|$)', '')
          .replace('^', '')
          .replace('$', '');
        traverse(layer.handle.stack, prefix + (newPrefix || ''), [...middlewares, layer.name]);
      } else if (layer.name) {
        middlewares.push(layer.name);
      }
    }
  }

  traverse(app._router.stack);
  return routes;
}

/**
 * Detectar si una ruta usa el middleware verificarToken
 */
function rutaProtegida(route) {
  return route.middlewares.some(name => name === 'verificarToken' || name.includes('verificarToken'));
}

/**
 * Verificar rutas esperadas y protección
 */
function verifyRoutes() {
  const existentes = getAppRoutes(app);

  console.log('Rutas registradas en Express:');
  existentes.forEach(r => {
    console.log(
      `${r.methods.join(', ')} ${r.path} | middlewares: ${r.middlewares.join(', ')}`
    );
  });

  console.log('\nVerificando rutas esperadas:');
  for (const ruta of rutasEsperadas) {
    const encontrada = existentes.find(r =>
      r.path === normalizePath(ruta.path) && r.methods.includes(ruta.method)
    );

    if (encontrada) {
      const protegido = rutaProtegida(encontrada);
      if (ruta.protegido && !protegido) {
        console.log(`⚠️  RUTA EXISTE pero NO está protegida con verificarToken: ${ruta.method} ${ruta.path}`);
      } else {
        console.log(`✅ OK: ${ruta.method} ${ruta.path} ${protegido ? '[PROTEGIDA]' : '[PÚBLICA]'}`);
      }
    } else {
      console.log(`❌ FALTA: ${ruta.method} ${ruta.path}`);
    }
  }
}

verifyRoutes();
