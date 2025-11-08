// Inicializa Sequelize y define el modelo Usuario
import { Sequelize, DataTypes } from 'sequelize';
import config from '../config/database.test.js';

const sequelize = new Sequelize(config);

const Usuario = sequelize.define('Usuario', {
  nombre: DataTypes.STRING,
  rol: DataTypes.STRING,
});

export default { sequelize, Usuario };
