const sequelize = require('./index');
const User = require('../models/User');

const init = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Banco de dados inicializado com sucesso.');
  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
  }
};