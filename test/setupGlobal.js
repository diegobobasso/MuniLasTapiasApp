// 🧪 Setup institucional global para tests
// - Reemplaza setup.js, setupChai.js y testUtils.js
// - Compatible con ES Modules, Mocha, Supertest y Sequelize

import * as chaiImport from 'chai';
import chaiHttp from 'chai-http';
import request from 'supertest';
import app from '../app.js';
import db from '../models/index.js';
import fs from 'fs';

// 🧩 Adaptación segura para entorno ES Modules
const chai = chaiImport;
chai.use(chaiHttp);
export const expect = chai.expect;

/**
 * 🔐 Obtiene token JWT válido para usuario institucional
 * @param {string} username
 * @param {string} password
 * @returns {Promise<string>} token JWT
 */
export async function getToken(username = 'admin', password = 'adminDefinitiva456') {
  const res = await request(app)
    .post('/auth/login')
    .send({ username, password });

  return res.body.token;
}

/**
 * 🧾 Lee contenido actual del log de accesos
 * @returns {string} contenido del archivo
 */
export function leerLog() {
  return fs.readFileSync('./logs/accesos.log', 'utf8');
}

/**
 * ✅ Valida que el log contenga una expresión institucional
 * @param {string} regex expresión regular a buscar
 */
export function expectLogMatch(regex) {
  const contenido = leerLog();
  if (!new RegExp(regex).test(contenido)) {
    throw new Error(`No se encontró trazabilidad esperada: ${regex}`);
  }
}

/**
 * 🧹 Resetea la base de datos institucional
 * - Borra y recrea todas las tablas
 */
export async function resetDB() {
  await db.sequelize.sync({ force: true });
}

// 🔁 Limpieza antes de cada test
beforeEach(async () => {
  await resetDB();
  fs.writeFileSync('./logs/accesos.log', ''); // 🧾 Log limpio
});

// 🔐 Login institucional antes de todos los tests
before(async () => {
  const token = await getToken();
  global.testContext = { token };
});

// ✅ Cierre de conexión al finalizar
after(async () => {
  await db.sequelize.close();
});
