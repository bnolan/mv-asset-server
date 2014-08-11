var assert = require("assert");
var helper = require('./spec_helper');
var requester = null;

// todo - remove killHelper?

before(function(done){
  helper(function(r){
    requester = r;
    done();
  });
});

describe("Index", function(){
  it ("returns hello world", function(done){
    requester.get("/", function(err, res){
      assert.equal(200, res.statusCode);;
      assert.equal(true, JSON.parse(res.body).success);
      done();
    });
  });

});

describe("Stats", function(){
  it ("is successful", function(done){
    requester.get("/stats", function(err, res){
      assert.equal(200, res.statusCode);
      assert.equal(true, JSON.parse(res.body).success);
      done();
    });
  });

  it ("has a userCount", function(done){
    requester.get("/stats", function(err, res){
      assert.equal(1, JSON.parse(res.body).userCount);
      done();
    });
  });

  it ("has a modelCount", function(done){
    requester.get("/stats", function(err, res){
      assert.equal(0, JSON.parse(res.body).modelCount);
      done();
    });
  });
});

describe("Register", function(){
   it ("is successful", function(done){
    requester.post("/register", {  login : 'goat', password : 'foobar' }, function(err, res){
      assert.equal(200, res.statusCode);
      assert.equal(true, JSON.parse(res.body).success);
      assert.equal('goat', JSON.parse(res.body).login);
      assert.equal(0, JSON.parse(res.body).models.length);
      done();
    });
  });

   it ("fails", function(done){
    requester.post("/register", {  login : 'ben' }, function(err, res){
      assert.equal(400, res.statusCode);
      done();
    });
  });
});

describe("Authentication", function(){
   it ("requires basic auth", function(done){
    requester.get("/info", function(err, res){
      assert.equal(401, res.statusCode);
      done();
    });
  });

   it ("requires valid password", function(done){
    requester.getAuth("ben", "blah", "/info", function(err, res){
      assert.equal(401, res.statusCode);
      done();
    });
  });

   it ("requires valid username", function(done){
    requester.getAuth("", "", "/info", function(err, res){
      assert.equal(401, res.statusCode);
      done();
    });
  });
});

describe("Info", function(){
   it ("is successful", function(done){
    requester.getAuth("ben", "foobar", "/info", function(err, res){
      assert.equal(200, res.statusCode);
      assert.equal(true, JSON.parse(res.body).success);
      assert.equal('ben', JSON.parse(res.body).login);
      assert.equal(0, JSON.parse(res.body).models.length);
      done();
    });
  });

 });