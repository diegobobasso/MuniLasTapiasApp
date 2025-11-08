// 🧾 Test institucional de trazabilidad de acciones
// - Verifica que los accesos protegidos se registren en logs/accesos.log
// - Usa setupGlobal.js para token, expect y validación de trazabilidad

import { expect, getToken, expectLogMatch } from '../test/setupGlobal.js';
import request from 'supertest';
import app from '../app.js';

describe('📊 Trazabilidad institucional de acciones', () => {
  let token;

  /**
   * 🔐 Login institucional antes del test
   * - Usa credenciales de empleado
   * - Expone token válido con prefijo Bearer
   */
  before(async () => {
    const rawToken = await getToken(); // admin por defecto
    token = `Bearer ${rawToken}`;

    // 🧪 Simula acceso protegido para generar trazabilidad
    await request(app)
      .get('/usuarios')
      .set('Authorization', token);
  });

  /**
   * 🧾 Verifica que el acceso quede registrado en accesos.log
   * - Busca entrada institucional de acceso
   */
  it('🧾 debe registrar logs de acceso', () => {
    expectLogMatch(/admin accedió a \/usuarios/);
  });
});
