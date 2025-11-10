/**
 * 📄 TEST INSTITUCIONAL DE TRÁMITES
 * - Valida CRUD completo
 * - Verifica trazabilidad en logs
 * - Protege por rol
 */

const request = require('supertest');
const app = require('../server/server');
const { expect } = require('./setupGlobal');
const { getToken, expectLogMatch } = require('./setupGlobal');

describe('📄 Trámites - CRUD institucional', () => {
  let tramiteId;

  const headers = {
    Authorization: `Bearer ${getToken('empleado')}`
  };

  const nuevoTramite = {
    nombre: 'Solicitud de poda',
    descripcion: 'El vecino solicita poda de árbol frente a su domicilio',
    categoria: 'Servicios públicos',
    duracion_estimada: '3 días',
    costo: 0.00,
    requisitos: ['Foto del árbol', 'DNI del solicitante'],
    horario_atencion: 'Lunes a viernes de 8 a 13',
    telefono_contacto: '3511234567',
    encargado_id: null // ✅ evita error de FK si no hay empleados cargados
  };

  it('✅ Crear trámite nuevo', async () => {
    const res = await request(app)
      .post('/api/tramites')
      .set(headers)
      .send(nuevoTramite);

    expect(res.status).to.equal(201);
    expect(res.body.success).to.be.true;
    tramiteId = res.body.data.tramiteId;
    expect(tramiteId).to.be.a('number');

    expectLogMatch(`➕ Trámite creado: ${nuevoTramite.nombre}`);
  });

  it('📋 Listar trámites activos', async () => {
    const res = await request(app)
      .get('/api/tramites')
      .set(headers);

    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
    expect(res.body.data.tramites).to.be.an('array');
    expect(res.body.data.tramites.length).to.be.greaterThan(0);

    expectLogMatch('📋 Listado de trámites consultado');
  });

  it('👤 Obtener trámite por ID', async () => {
    const res = await request(app)
      .get(`/api/tramites/${tramiteId}`)
      .set(headers);

    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
    expect(res.body.data.tramite.id).to.equal(tramiteId);

    expectLogMatch(`👤 Consulta de trámite ID ${tramiteId}`);
  });

  it('✏️ Actualizar duración del trámite', async () => {
    const res = await request(app)
      .put(`/api/tramites/${tramiteId}`)
      .set(headers)
      .send({ duracion_estimada: '5 días' });

    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
    expect(res.body.data.tramiteId).to.equal(tramiteId);

    expectLogMatch(`✏️ Trámite actualizado ID ${tramiteId}`);
  });

  it('🗑️ Eliminar trámite (soft delete)', async () => {
    const res = await request(app)
      .delete(`/api/tramites/${tramiteId}`)
      .set(headers);

    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
    expect(res.body.data.tramiteId).to.equal(tramiteId);

    expectLogMatch(`❌ Trámite desactivado ID ${tramiteId}`);
  });
});
