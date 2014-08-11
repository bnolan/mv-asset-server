var db = require("../models");
var request = require("request")
var port = 3069;

function Requester(){
}

Requester.prototype.get = function(path, callback){
  request("http://localhost:" + port + path, callback)
}

Requester.prototype.getAuth = function(user, pass, path, callback){
  request({
    url : "http://localhost:" + port + path,
    auth : { user : user, pass : pass, sendImmediately : true }
  }, callback)
}

Requester.prototype.post = function(path, body, callback){
  request.post({url: "http://localhost:" + port + path, form: body}, callback)
}

module.exports = function(callback){
  var app = require("../asset-server"),
    server = null;

  server = app.listen(port, function(){
    db
      .sequelize
      .sync({ force: true })
      .success(function(){

        db.User.create({
          login: 'ben'
        }).success(function(u){
          u.setPassword("foobar");
          u.save().success(function(){
            callback(new Requester);
          });
        });

      });
  });
};
