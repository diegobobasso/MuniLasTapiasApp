const request = require('supertest');
const app = require('../server/server'); // ✅ Instancia institucional
const { ejecutarConsulta } = require('../server/config/databaseConnection');
const { expect, adminToken } = require('./setupGlobal'); // ✅ Token válido generado

let tokenAdmin = adminToken;
let empleadoId;

before(async () => {
  // 🧹 Limpiar por email para evitar duplicados
  await ejecutarConsulta("DELETE FROM empleados WHERE email = 'admin@test.com'");

  // 🛠️ Crear empleado admin activo
  const res = await request(app).post('/api/empleados')
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .send({
      nombre: 'Admin',
      apellido: 'Test',
      dni: '99999999',
      email: 'admin@test.com',
      telefono: '123456789',
      domicilio: 'Calle Falsa 123',
      password: 'admin1234',
      rol: 'admin',
      fecha_ingreso: '2025-01-01',
      activo: true // ✅ necesario para login
    });

  if (!res.body.success || !res.body.data?.empleado) {
    console.log('❌ Respuesta al crear empleado:', res.body);
    throw new Error('Falló la creación del empleado admin');
  }

  empleadoId = res.body.data.empleado.id;
});

describe('👨‍💼 Empleados - CRUD institucional', () => {
  it('✅ Crear empleado nuevo', async () => {
    const res = await request(app).post('/api/empleados')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nombre: 'Juan',
        apellido: 'Pérez',
        dni: '12345678',
        email: 'juan@test.com',
        telefono: '987654321',
        domicilio: 'Av. Siempre Viva 742',
        password: 'clave1234',
        rol: 'empleado',
        fecha_ingreso: '2025-02-01',
        activo: true
      });

    expect(res.statusCode).to.equal(201);
    expect(res.body.success).to.be.true;
    expect(res.body.data.empleado.email).to.equal('juan@test.com');
  });

  it('📋 Listar empleados', async () => {
    const res = await request(app).get('/api/empleados')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).to.equal(200);
    expect(Array.isArray(res.body.data.empleados)).to.be.true;
  });

  it('✏️ Actualizar teléfono del empleado', async () => {
    const res = await request(app).put(`/api/empleados/${empleadoId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ telefono: '111222333' });

    expect(res.statusCode).to.equal(200);
    expect(res.body.data.telefono).to.equal('111222333');
  });

  it('🔐 Restaurar clave del empleado', async () => {
    const res = await request(app).put(`/api/empleados/${empleadoId}/restaurar-clave`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ nuevaClave: 'nuevaClave123' });

    expect(res.statusCode).to.equal(200);
    expect(res.body.data.empleadoId).to.equal(empleadoId);
  });

  it('🗑️ Eliminar empleado (soft delete)', async () => {
    const res = await request(app).delete(`/api/empleados/${empleadoId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).to.equal(200);
    expect(res.body.data.empleadoId).to.equal(empleadoId);
  });
});
