var bcrypt = require('bcrypt');

module.exports = function(sequelize, DataTypes) {

  var User = sequelize.define('user', {
       login: DataTypes.STRING,
       password: DataTypes.STRING,
       bio: DataTypes.STRING
     }, {
      underscored : true,
      classMethods: {
        associate: function(models) {
          User.hasMany(models.Model);
        }
      },
      instanceMethods: {
        validPassword: function(password){
          return bcrypt.compareSync(password, this.password);
        },
        setPassword: function(password){
          // fixme - should we use 10 here?
          var salt = bcrypt.genSaltSync(5);
          this.password = bcrypt.hashSync(password, salt);
        }
      }
    }
  );

  return User;
};
