var assert = require("assert");
var helper = require('./spec_helper');
var killHelper = null;
var requester = null;

// todo - remove killHelper?

before(function(done){
  helper(function(r, k){
    requester = r;
    killHelper = k;
    done();
  });
});

describe('Array', function(){
  describe('#indexOf()', function(){
    it('should return -1 when the value is not present', function(){
      assert.equal(-1, [1,2,3].indexOf(5));
      assert.equal(-1, [1,2,3].indexOf(0));
    })
  })
})

describe("Index route", function(){
  it ("responds successfully", function(done){
    requester.get("/", function(err, res, body){
      assert.equal(200, res.statusCode);;
      assert.equal(true, JSON.parse(res.body).success);
      done();
    });
  });
});

after(function(){
  killHelper();
});

