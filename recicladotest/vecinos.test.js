// 🧪 Test institucional para módulo de vecinos
// - Valida creación protegida
// - Verifica restauración de contraseña
// - Confirma trazabilidad en logs

import { expect, getToken, expectLogMatch } from '../test/setupGlobal.js';
import request from 'supertest';
import app from '../app.js';

describe('👥 Vecinos institucionales', () => {
  let token;

  /**
   * 🔐 Login institucional antes de los tests
   * - Usa credenciales de empleado
   * - Expone token válido con prefijo Bearer
   */
  before(async () => {
    const rawToken = await getToken(); // admin por defecto
    token = `Bearer ${rawToken}`;
  });

  /**
   * ✅ Crea un vecino (solo empleados)
   * - Requiere token válido
   * - Espera status 201 y datos correctos
   */
  it('✅ crea un vecino (solo empleados)', async () => {
    const res = await request(app)
      .post('/vecinos')
      .set('Authorization', token)
      .send({
        nombre: 'Juan',
        apellido: 'Pérez',
        dni: '12345678',
        domicilio: 'Calle Falsa 123',
        telefono: '3511234567',
        email: 'juan@correo.com',
        password: 'clave123'
      });

    expect(res.status).to.equal(201);
    expect(res.body.nombre).to.equal('Juan');
  });

  /**
   * 🔁 Restaura contraseña de vecino
   * - Requiere token válido
   * - Espera status 200 y mensaje institucional
   */
  it('🔁 restaura contraseña de vecino', async () => {
    const id = 1; // ⚠️ Asegurate que el vecino exista
    const res = await request(app)
      .put(`/vecinos/restaurar-clave/${id}`)
      .set('Authorization', token)
      .send({ nuevaClave: 'nueva456' });

    expect(res.status).to.equal(200);
    expect(res.body.mensaje).to.match(/Contraseña restaurada/i);
  });

  /**
   * 🧾 Verifica trazabilidad en accesos.log
   * - Busca entrada institucional de acceso
   */
  it('🧾 registra trazabilidad en accesos.log', () => {
    expectLogMatch(/empleado accedió a \/vecinos/);
  });
});
