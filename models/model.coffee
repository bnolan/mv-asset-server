Sequelize = require('sequelize')
sequelize = require('../lib/sequelize')

Model = sequelize.define 'model', {
  name : Sequelize.STRING,
  url : Sequelize.STRING,
  description : Sequelize.TEXT,

  vertices : Sequelize.INTEGER,
  polygons : Sequelize.INTEGER,
  edges : Sequelize.INTEGER,

  minimum : Sequelize.ARRAY(Sequelize.FLOAT),
  maximum : Sequelize.ARRAY(Sequelize.FLOAT),
  sourceFile : Sequelize.STRING,
  files : Sequelize.ARRAY(Sequelize.STRING)
}, {
  underscored : true
  instanceMethods: {
    getUrl: ->
      "http://localhost:8090/models/model-#{@id}.json"
  }
}

module.exports = Model