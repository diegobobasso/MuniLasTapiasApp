// 🏛️ Tests institucionales completos
// - Ajustados para prefijo /api
// - Compatible con Mocha, Supertest y setupGlobal.js

import { expect, getToken, expectLogMatch } from './setupGlobal.js';
import request from 'supertest';
import app from '../app.js';

describe('🏛️ Tests institucionales completos', () => {
  let token;

  // 🔐 Login institucional antes de todos los tests
  before(async () => {
    const rawToken = await getToken(); // admin por defecto
    token = `Bearer ${rawToken}`;
  });

  // ----------------------------
  // 🔐 Middleware de autenticación
  // ----------------------------
  describe('🔐 Middleware de autenticación institucional', () => {
    it('🚫 rechaza peticiones sin token', async () => {
      const res = await request(app).get('/api/empleados');
      expect(res.status).to.equal(401);
    });

    it('🚫 rechaza peticiones con token inválido', async () => {
      const res = await request(app)
        .get('/api/empleados')
        .set('Authorization', 'Bearer token-falso');
      expect(res.status).to.equal(403);
    });

    it('✅ permite peticiones con token válido', async () => {
      const res = await request(app)
        .get('/api/empleados')
        .set('Authorization', token);
      expect(res.status).to.not.equal(401);
      expect(res.status).to.not.equal(403);
      expect(res.status).to.be.oneOf([200, 201]);
    });
  });

  // ----------------------------
  // 👨‍💼 Empleados institucionales
  // ----------------------------
  describe('👨‍💼 Empleados institucionales', () => {
    it('✅ crea un empleado (solo admin)', async () => {
      const res = await request(app)
        .post('/api/empleados')
        .set('Authorization', token)
        .send({
          nombre: 'Diego',
          email: 'diego@muni.gob.ar',
          password: 'segura123',
          rol: 'empleado'
        });
      expect(res.status).to.equal(201);
      expect(res.body.nombre).to.equal('Diego');
    });

    it('🔁 restaura contraseña de empleado', async () => {
      const id = 1; // Asegurarse que el empleado exista
      const res = await request(app)
        .put(`/api/empleados/restaurar-clave/${id}`)
        .set('Authorization', token)
        .send({ nuevaClave: 'nueva123' });
      expect(res.status).to.equal(200);
      expect(res.body.mensaje).to.match(/Contraseña restaurada/i);
    });

    it('🧾 registra trazabilidad en accesos.log', () => {
      expectLogMatch(/admin accedió a \/api\/empleados/);
    });
  });

  // ----------------------------
  // 👥 Vecinos institucionales
  // ----------------------------
  describe('👥 Vecinos institucionales', () => {
    it('✅ crea un vecino (solo empleados)', async () => {
      const res = await request(app)
        .post('/api/vecinos')
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

    it('🔁 restaura contraseña de vecino', async () => {
      const id = 1;
      const res = await request(app)
        .put(`/api/vecinos/restaurar-clave/${id}`)
        .set('Authorization', token)
        .send({ nuevaClave: 'nueva456' });
      expect(res.status).to.equal(200);
      expect(res.body.mensaje).to.match(/Contraseña restaurada/i);
    });

    it('🧾 registra trazabilidad en accesos.log', () => {
      expectLogMatch(/empleado accedió a \/api\/vecinos/);
    });
  });

  // ----------------------------
  // 🛡️ Flujo superadmin inicial
  // ----------------------------
  describe('🛡️ Flujo institucional de superadmin inicial', () => {
    const username = 'admin';
    const passwordTemporal = 'admin123';
    const nuevaPassword = 'adminDefinitiva456';

    it('🚫 bloquea login si requiere cambio de contraseña', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username, password: passwordTemporal });
      expect(res.status).to.equal(403);
      expect(res.body.error).to.match(/Debe cambiar la contraseña/i);
    });

    it('✅ permite cambiar la contraseña inicial', async () => {
      const res = await request(app)
        .post('/api/auth/cambiar-password-inicial')
        .send({ username, nuevaPassword });
      expect(res.status).to.equal(200);
      expect(res.body.mensaje).to.match(/Contraseña actualizada/i);
    });

    it('✅ permite login después del cambio', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username, password: nuevaPassword });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('token');
    });

    it('🧾 registra trazabilidad en accesos.log', () => {
      expectLogMatch(/admin inició sesión correctamente/);
      expectLogMatch(/admin actualizó su contraseña inicial/);
    });
  });

  // ----------------------------
  // 📊 Trazabilidad general de acciones
  // ----------------------------
  describe('📊 Trazabilidad institucional de acciones', () => {
    it('🧾 debe registrar logs de acceso', async () => {
      // Simula acceso protegido para generar trazabilidad
      await request(app)
        .get('/api/empleados')
        .set('Authorization', token);
      expectLogMatch(/admin accedió a \/api\/empleados/);
    });
  });
});
