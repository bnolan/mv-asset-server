Sequelize = require('sequelize')
sequelize = new Sequelize 'metaverse-dev', 'ben', 'test', {
  dialect : 'postgres'
  protocol : 'postgres'
  define: {
    underscored: false
  }
}

module.exports = sequelize