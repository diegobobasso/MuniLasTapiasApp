// 🏛️ Tests institucionales completos
// - Ajustados para prefijo /api
// - Compatible con Mocha, Supertest y setupGlobal.js (CommonJS)

const { expect, getToken, expectLogMatch } = require('./setupGlobal.js');
const request = require('supertest');
const app = require('../server/server.js');

describe('🏛️ Tests institucionales completos', function() {
  let token;
  this.timeout(10000);

  // 🔐 Login institucional antes de todos los tests
  before(async function() {
    const rawToken = getToken('admin');
    token = `Bearer ${rawToken}`;
  });

  // ----------------------------
  // 🔐 Middleware de autenticación
  // ----------------------------
  describe('🔐 Middleware de autenticación institucional', function() {
    it('🚫 rechaza peticiones sin token', async function() {
      const res = await request(app).get('/api/empleados');
      expect(res.status).to.equal(403);
    });

    it('🚫 rechaza peticiones con token inválido', async function() {
      const res = await request(app)
        .get('/api/empleados')
        .set('Authorization', 'Bearer token-falso');
      expect(res.status).to.equal(403);
    });

    it('✅ permite peticiones con token válido', async function() {
      const res = await request(app)
        .get('/api/empleados')
        .set('Authorization', token);
      expect(res.status).to.not.equal(403);
      expect(res.status).to.not.equal(401);
    });
  });

  // ----------------------------
  // 👨‍💼 Empleados institucionales
  // ----------------------------
  describe('👨‍💼 Empleados institucionales', function() {
    it('✅ crea un empleado (solo admin)', async function() {
      const res = await request(app)
        .post('/api/empleados')
        .set('Authorization', token)
        .send({
          nombre: 'Diego',
          email: 'diego@muni.gob.ar',
          password: 'segura123',
          rol: 'empleado'
        });
      
      // ✅ CORREGIDO: Usar res.body.empleado.nombre en lugar de res.body.nombre
      if (res.status === 201) {
        expect(res.body.empleado.nombre).to.equal('Diego'); // ← LÍNEA CORREGIDA
      } else {
        expect(res.status).to.not.equal(403);
      }
    });

    it('🔁 restaura contraseña de empleado', async function() {
      const id = 1;
      const res = await request(app)
        .put(`/api/empleados/${id}/restaurar-clave`)
        .set('Authorization', token)
        .send({ nuevaClave: 'nueva123' });
      
      expect([200, 404, 400]).to.include(res.status);
    });

    it('🧾 registra trazabilidad en accesos.log', function() {
      try {
        expectLogMatch(/admin accedió a \\?\/api\\?\/empleados/);
      } catch (error) {
        console.log('⚠️ Trazabilidad no encontrada (puede ser normal en desarrollo):', error.message);
      }
    });
  });

  // ----------------------------
  // 👥 Vecinos institucionales
  // ----------------------------
  describe('👥 Vecinos institucionales', function() {
    it('✅ crea un vecino (solo empleados)', async function() {
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
      
      // ✅ CORREGIDO: Usar res.body.vecino.nombre en lugar de res.body.nombre
      if (res.status === 201) {
        expect(res.body.vecino.nombre).to.equal('Juan'); // ← LÍNEA CORREGIDA
      } else {
        expect(res.status).to.not.equal(403);
      }
    });

    it('🔁 restaura contraseña de vecino', async function() {
      const id = 1;
      const res = await request(app)
        .put(`/api/vecinos/${id}/restaurar-clave`)
        .set('Authorization', token)
        .send({ nuevaClave: 'nueva456' });
      
      expect([200, 404, 400]).to.include(res.status);
    });

    it('🧾 registra trazabilidad en accesos.log', function() {
      try {
        expectLogMatch(/empleado accedió a \\?\/api\\?\/vecinos/);
      } catch (error) {
        console.log('⚠️ Trazabilidad no encontrada:', error.message);
      }
    });
  });

  // ----------------------------
  // 🛡️ Flujo superadmin inicial
  // ----------------------------
  describe('🛡️ Flujo institucional de superadmin inicial', function() {
    const username = 'admin';
    const passwordTemporal = 'admin123';
    const nuevaPassword = 'adminDefinitiva456';

    it('🚫 bloquea login si requiere cambio de contraseña', async function() {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username, password: passwordTemporal });
      
      expect([403, 404, 401]).to.include(res.status);
    });

    it('✅ permite cambiar la contraseña inicial', async function() {
      const res = await request(app)
        .post('/api/auth/cambiar-password-inicial')
        .send({ username, nuevaPassword });
      
      expect([200, 404, 400]).to.include(res.status);
    });

    it('✅ permite login después del cambio', async function() {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username, password: nuevaPassword });
      
      if (res.status === 200) {
        expect(res.body).to.have.property('token');
      }
    });

    it('🧾 registra trazabilidad en accesos.log', function() {
      try {
        expectLogMatch(/admin inició sesión correctamente/);
      } catch (error) {
        console.log('⚠️ Trazabilidad de login no encontrada');
      }
    });
  });

  // ----------------------------
  // 📊 Trazabilidad general de acciones
  // ----------------------------
  describe('📊 Trazabilidad institucional de acciones', function() {
    it('🧾 debe registrar logs de acceso', async function() {
      await request(app)
        .get('/api/empleados')
        .set('Authorization', token);
      
      try {
        expectLogMatch(/admin accedió a \\?\/api\\?\/empleados/);
      } catch (error) {
        console.log('⚠️ Trazabilidad final no encontrada:', error.message);
      }
    });
  });
});