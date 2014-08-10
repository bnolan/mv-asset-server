Sequelize = require('sequelize')
sequelize = require('../lib/sequelize')
Model = require("./model")

User = sequelize.define 'user', {
  login: Sequelize.STRING,
  password: Sequelize.STRING,
  bio: Sequelize.STRING
}, {
  underscored : true
  instanceMethods: {
    getLogin: ->
      @login
  }
}

User.hasMany(Model)
Model.belongsTo(User)

module.exports = User