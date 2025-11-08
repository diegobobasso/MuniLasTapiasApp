// 🛡️ Test institucional del flujo de superadmin inicial
// - Verifica bloqueo por contraseña temporal
// - Permite cambio de contraseña inicial
// - Valida login posterior
// - Confirma trazabilidad en logs/accesos.log

import { expect, default as chai } from '../test/setupGlobal.js';
import request from 'supertest';
import app from '../app.js';

describe('🛡️ Flujo institucional de superadmin inicial', () => {
  const username = 'admin';
  const passwordTemporal = 'admin123';
  const nuevaPassword = 'adminDefinitiva456';

  /**
   * 🚫 Bloquea login si requiere cambio de contraseña
   * - Espera status 403
   * - Mensaje institucional de bloqueo
   */
  it('🚫 bloquea login si requiere cambio de contraseña', async () => {
    const res = await chai.request(app)
      .post('/auth/login')
      .send({ username, password: passwordTemporal });

    expect(res).to.have.status(403);
    expect(res.body.error).to.match(/Debe cambiar la contraseña/i);
  });

  /**
   * ✅ Permite cambiar la contraseña inicial
   * - Endpoint institucional de cambio inicial
   * - Espera status 200 y mensaje de éxito
   */
  it('✅ permite cambiar la contraseña inicial', async () => {
    const res = await chai.request(app)
      .post('/auth/cambiar-password-inicial')
      .send({ username, nuevaPassword });

    expect(res).to.have.status(200);
    expect(res.body.mensaje).to.match(/Contraseña actualizada/i);
  });

  /**
   * ✅ Permite login después del cambio
   * - Espera status 200 y token JWT
   */
  it('✅ permite login después del cambio', async () => {
    const res = await chai.request(app)
      .post('/auth/login')
      .send({ username, password: nuevaPassword });

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('token');
  });

  /**
   * 🧾 Registra trazabilidad en accesos.log
   * - Verifica que se hayan escrito las acciones clave
   */
  it('🧾 registra trazabilidad en accesos.log', () => {
    expectLogMatch(/admin inició sesión correctamente/);
    expectLogMatch(/admin actualizó su contraseña inicial/);
  });
});
