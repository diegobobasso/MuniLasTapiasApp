// 🔐 Prueba institucional del middleware de autenticación
// - Valida protección de rutas
// - Rechaza tokens inválidos
// - Permite acceso con token institucional

import { expect, getToken } from '../test/setupGlobal.js';
import request from 'supertest';
import app from '../app.js';

describe('🔐 Middleware de autenticación institucional', () => {
  let token;

  // 🔐 Login institucional antes de los tests
  before(async () => {
    const rawToken = await getToken(); // admin por defecto
    token = `Bearer ${rawToken}`;
  });

  // 🚫 Rechaza peticiones sin token
  it('🚫 rechaza peticiones sin token', async () => {
    const res = await request(app).get('/empleados'); // Ruta protegida existente
    expect(res.status).to.equal(401); // 🔒 No autorizado
  });

  // 🚫 Rechaza token inválido o mal formado
  it('🚫 rechaza peticiones con token inválido', async () => {
    const res = await request(app)
      .get('/empleados') // Ruta protegida existente
      .set('Authorization', 'Bearer token-falso');

    expect(res.status).to.equal(403); // ❌ Token inválido según middleware
  });

  // ✅ Permite peticiones con token válido
  it('✅ permite peticiones con token válido', async () => {
    const res = await request(app)
      .get('/empleados') // Ruta protegida existente
      .set('Authorization', token);

    expect(res.status).to.not.equal(401);
    expect(res.status).to.not.equal(403);
    expect(res.status).to.be.oneOf([200, 201]); // Ajusta según tu endpoint
  });
});
