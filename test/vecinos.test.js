/**
 * 👥 TEST INSTITUCIONAL DE VECINOS
 * - Valida CRUD completo
 * - Verifica trazabilidad en logs
 * - Protege por rol
 */

const request = require('supertest');
const app = require('../server/server'); // ✅ Usa server.js directamente
const { expect } = require('./setupGlobal');
const { getToken, expectLogMatch } = require('./setupGlobal');

describe('👥 Vecinos - CRUD institucional', () => {
  let vecinoId;

  // 🔐 Token institucional con rol admin
  const headers = {
    Authorization: `Bearer ${getToken('admin')}`
  };

  // ➕ Datos de alta
  const nuevoVecino = {
    nombre: 'Juan',
    apellido: 'Pérez',
    dni: '12345678',
    email: 'juan.perez@example.com',
    telefono: '3511234567',
    domicilio: 'Calle Falsa 123',
    password: 'claveSegura2025',
    fecha_registro: '2025-11-10'
  };

  it('✅ Crear vecino nuevo', async () => {
    const res = await request(app)
      .post('/api/vecinos')
      .set(headers)
      .send(nuevoVecino);

    expect(res.status).to.equal(201);
    expect(res.body.success).to.be.true;
    expect(res.body.data.vecino.email).to.equal(nuevoVecino.email);

    vecinoId = res.body.data.vecino.id;
    expect(vecinoId).to.be.a('number');

    expectLogMatch(`➕ Vecino creado: ${nuevoVecino.email}`);
  });

  it('📋 Listar vecinos activos', async () => {
    const res = await request(app)
      .get('/api/vecinos')
      .set(headers);

    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
    expect(res.body.data.vecinos).to.be.an('array');
    expect(res.body.data.vecinos.length).to.be.greaterThan(0);

    expectLogMatch('📋 Listado de vecinos consultado');
  });

  it('👤 Obtener vecino por ID', async () => {
    const res = await request(app)
      .get(`/api/vecinos/${vecinoId}`)
      .set(headers);

    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
    expect(res.body.data.vecino.id).to.equal(vecinoId);

    expectLogMatch(`👤 Consulta de vecino ID ${vecinoId}`);
  });

  it('✏️ Actualizar teléfono del vecino', async () => {
    const res = await request(app)
      .put(`/api/vecinos/${vecinoId}`)
      .set(headers)
      .send({ telefono: '3517654321' });

    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
    expect(res.body.data.telefono).to.equal('3517654321');

    expectLogMatch(`✏️ Vecino actualizado ID ${vecinoId}`);
  });

  it('🗑️ Eliminar vecino (soft delete)', async () => {
    const res = await request(app)
      .delete(`/api/vecinos/${vecinoId}`)
      .set(headers);

    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
    expect(res.body.data.vecinoId).to.equal(vecinoId);

    expectLogMatch(`❌ Vecino desactivado ID ${vecinoId}`);
  });
});
