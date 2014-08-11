module.exports = function(sequelize, DataTypes) {

  var Model = sequelize.define('model', {
      name : DataTypes.STRING,
      url : DataTypes.STRING,
      description : DataTypes.TEXT,
      vertices : DataTypes.INTEGER,
      polygons : DataTypes.INTEGER,
      edges : DataTypes.INTEGER,
      minimum : DataTypes.ARRAY(DataTypes.FLOAT),
      maximum : DataTypes.ARRAY(DataTypes.FLOAT),
      sourceFile : DataTypes.STRING,
      files : DataTypes.ARRAY(DataTypes.STRING)
    }, {
      underscored : true,
      classMethods: {
        associate: function(models) {
          Model.belongsTo(models.User)
        }
      },
      instanceMethods: {
        getUrl: function(){
          return "http://localhost:8090/models/model-" + this.id + ".json"
        }
      }
    }
  );

  return Model;
}
