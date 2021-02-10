'use strict';
const { Validator } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [3, 30],
          isNotEmail (value) {
            if (Validator.isEmail(value)) {
              throw new Error('Cannot be an email.');
            }
          }
        }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [3, 256]
        }
      },
      hashedPassword: {
        type: DataTypes.STRING.BINARY,
        allowNull: false,
        validate: {
          len: [60, 60]
        }
      },
      avatarId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      defaultLocale: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      defaultScope: {
        attributes: {
          exclude: ['defaultLocale', 'hashedPassword', 'email', 'createdAt', 'updatedAt']
        }
      },
      scopes: {
        currentUser: {
          attributes: { exclude: ['hashedPassword'] }
        },
        loginUser: {
          attributes: {}
        }
      }
    }
  );

  User.associate = function (models) {
    const attendeeMap = {
      as: 'AttendingEvents',
      through: models.Attendee,
      foreignKey: 'userId',
      otherKey: 'eventId'
    };
    const unreadMap = {
      as: 'UnreadConversations',
      through: models.Notification,
      foreignKey: 'userId',
      otherKey: 'conversationId'
    };
    const convoMap = {
      as: 'Chats',
      through: models.RosterEntry,
      foreignKey: 'userId',
      otherKey: 'conversationId'
    };

    User.hasMany(models.Attendee, { foreignKey: 'userId' });
    User.hasMany(models.Notification, { foreignKey: 'userId' });
    User.hasMany(models.Event, { as: 'HostedEvents', foreignKey: 'ownerId' });
    User.hasMany(models.Message, { as: 'SentMessages', foreignKey: 'senderId' });
    User.hasMany(models.EventPost, { as: 'PostComments', foreignKey: 'ownerId' });
    User.hasMany(models.Conversation, { as: 'OwnedConversations', foreignKey: 'createdBy' });
    User.belongsTo(models.Image, { as: 'Avatar', foreignKey: 'avatarId' });
    User.belongsToMany(models.Event, attendeeMap);
    User.belongsToMany(models.Conversation, unreadMap);
    User.belongsToMany(models.Conversation, convoMap);
  };

  User.prototype.toSafeObject = function () {
    const { id, firstName, email } = this;
    return { id, firstName, email };
  };

  User.prototype.validatePassword = function (password) {
    return bcrypt.compareSync(password, this.hashedPassword.toString());
  };

  User.getCurrentUserById = async function (id) {
    return await User.scope('currentUser').findByPk(id);
  };

  User.login = async function ({ identification, password }) {
    const user = await User.scope('loginUser').findOne({
      where: {
        email: identification
      }
    });
    if (user && user.validatePassword(password)) {
      return await User.scope('currentUser').findByPk(user.id);
    }
  };

  User.signup = async function ({ firstName, email, password }) {
    const hashedPassword = bcrypt.hashSync(password);
    const user = await User.create({
      firstName,
      email,
      hashedPassword
    });
    return await User.scope('currentUser').findByPk(user.id);
  };

  return User;
};
