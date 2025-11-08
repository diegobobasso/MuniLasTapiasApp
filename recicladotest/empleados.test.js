// 🧪 Test institucional robusto para módulo de empleados
// - Crea empleado, restaura contraseña y valida trazabilidad

import { expect, getToken, expectLogMatch } from '../test/setupGlobal.js';
import request from 'supertest';
import app from '../app.js';

describe('👨‍💼 Empleados institucionales (robusto)', () => {
  let token;
  let empleadoId;

  // 🔐 Login institucional antes de los tests
  before(async () => {
    const rawToken = await getToken(); // admin por defecto
    token = `Bearer ${rawToken}`;
  });

  // ✅ Crea un empleado dinámicamente
  it('✅ crea un empleado (solo admin)', async () => {
    const res = await request(app)
      .post('/empleados')
      .set('Authorization', token)
      .send({
        nombre: 'Diego',
        email: `diego${Date.now()}@muni.gob.ar`, // correo dinámico para evitar colisiones
        password: 'segura123',
        rol: 'empleado'
      });

    expect(res.status).to.equal(201);
    expect(res.body.nombre).to.equal('Diego');

    // Guardamos ID para el siguiente test
    empleadoId = res.body.id;
    expect(empleadoId).to.be.a('number');
  });

  // 🔁 Restaura contraseña usando ID dinámico
  it('🔁 restaura contraseña de empleado', async () => {
    expect(empleadoId).to.be.a('number'); // Validación previa

    const res = await request(app)
      .put(`/empleados/restaurar-clave/${empleadoId}`)
      .set('Authorization', token)
      .send({ nuevaClave: 'nueva123' });

    expect(res.status).to.equal(200);
    expect(res.body.mensaje).to.match(/Contraseña restaurada/i);
  });

  // 🧾 Verifica trazabilidad en accesos.log
  it('🧾 registra trazabilidad en accesos.log', () => {
    expectLogMatch(/admin accedió a \/empleados/);
  });
});
