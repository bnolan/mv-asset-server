var db = require("../models");
var request = require("request")
var port = 3069;

function Requester(){
}

Requester.prototype.get = function(path, callback){
  request("http://localhost:" + port + path, callback)
}

Requester.prototype.post = function(path, body, callback){
  request.post({url: "http://localhost:" + port + path, body: body}, callback)
}

module.exports = function(callback){
  var app = require("../asset-server"),
    server = null;

  stopServer = function(){
    server.close();
  }

  server = app.listen(port, function(){
    db
      .sequelize
      .sync({ force: true })
      .success(function(){
        callback(new Requester, stopServer);
      });
  });
};
