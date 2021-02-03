'use strict';
const faker = require('faker');
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [
      {
        email: 'admin@dtf.io',
        username: 'Admin',
        avatarId: 1,
        hashedPassword: '$2a$10$u7QLeGRHwQjjoQyLEyO3rO4tMZj5R2./S8/4tK76ef1jJ8Pb5K3um'
      },
      {
        email: 'demo@user.io',
        username: 'Demo-lition',
        avatarId: 2,
        hashedPassword: bcrypt.hashSync('password')
      },
      {
        email: faker.internet.email(),
        username: 'FakeUser1',
        avatarId: 3,
        hashedPassword: bcrypt.hashSync(faker.internet.password())
      },
      {
        email: faker.internet.email(),
        username: 'FakeUser2',
        avatarId: 4,
        hashedPassword: bcrypt.hashSync(faker.internet.password())
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete('Users', {
      username: { [Op.in]: ['Demo-lition', 'FakeUser1', 'FakeUser2'] }
    }, {});
  }
};
