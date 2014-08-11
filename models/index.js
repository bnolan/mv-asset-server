// model loading from http://sequelizejs.com/articles/express

function getConfig(){
  return require("../config/database.json")[process.env.NODE_ENV];
}

var fs        = require('fs')
  , path      = require('path')
  , Sequelize = require('sequelize')
  , lodash    = require('lodash')
  , db        = {}
  , sequelize = new Sequelize(getConfig().database, getConfig().username, getConfig().password, {
    dialect : 'postgres',
    protocol : 'postgres',
    logging : false,
    define: {
      underscored: false
    }
  });
 
function capitalize(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
}

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js')
  })
  .forEach(function(file) {
    var model = sequelize.import(path.join(__dirname, file))
    db[capitalize(model.name)] = model
  })
 
Object.keys(db).forEach(function(modelName) {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db)
  }
})
 
module.exports = lodash.extend({
  sequelize: sequelize,
  Sequelize: Sequelize
}, db);