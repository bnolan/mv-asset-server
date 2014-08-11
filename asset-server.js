/*

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');    // call express
var app        = express();         // define our app using express
var bodyParser = require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser());

var port = process.env.PORT || 8080;    // set our port

// ROUTES FOR OUR API
// =============================================================================
//var router = express.Router();        // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
app.get('/', function(req, res) {
  res.json({ message: 'hooray! welcome to our api!' }); 
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
//app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);

*/

// var connect = require('connect')
// var methodOverride = require("method-override");

var express = require('express');
var app = express();
var passport = require('passport')
var BasicStrategy = require('passport-http').BasicStrategy;
var cors = require('cors');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var db = require("./models");
var packageJson = require('./package.json');

app.use(express.static('public'));
app.use(passport.initialize());
app.use(cors());
//app.options('*', cors());

// Configure express
// app.use(connect.urlencoded());
// Allow all cross-origin requests
// app.use(connect.json());
// app.use(methodOverride());

passport.use(new BasicStrategy(
  function(username, password, done) {
    db.User
      .find({ where : {login: username } })
      .complete(function (err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        if (!user.validPassword(password)) { return done(null, false); }
        return done(null, user);
      });
  }
));

app.get('/', function(req, res) {
  res.json({ success : true, message: 'Welcome to the asset server', version : packageJson.version }); 
});

app.get('/details', passport.authenticate('basic', { session: false }), function(req, res){
  db.Model
    .findAll({ where : { user_id : req.user.id }})
    .complete(function(err, models){
      res.json({ success : true, user : req.user.login, models : models });
    });
});

app.post('/upload', multipartMiddleware, passport.authenticate('basic', { session: false }), function(req, res){
  if(!req.files.upload){
    debug("Invalid arguments");
    res.status(400).send(JSON.stringify({ success : false, error : "Invalid arguments" }));
    return
  }

  upload = new Upload(req.files.upload, req.user, res);
  upload.process()
});

  // unless file.originalFilename.match /dae$/i
  //   debug "File does not appear to be a .dae file"
  //   res.status(400).send "File does not appear to be a .dae file"
  //   return
  // if file.size > 5 * 1024 * 1024
  //   size = Math.floor(file.size / 1024)
  //   message = "File is too large (#{size}kB) maximum size is 5MB"
  //   debug message
  //   res.status(400).send message
  //   return
  // fs.readFile file.path, 'utf8', (err, data) ->
  //   unless data.match /<COLLADA/
  //     debug "File does not appear to be a <COLLADA file"
  //     res.status(400).send "File does not appear to be a <COLLADA file"
  //     return
  //   # Eww sync call
  //   mkdirp.sync(process.cwd() + "public/models/model-#{id}")
  //   outPath = process.cwd() + "/public/models/model-#{id}/model.js"
  //   blenderProcess file.path, outPath, ->
  //     res.send("//#{HOSTNAME}:8090/models/model-#{id}/model.js")
 
if (!module.parent) {
  db
    .sequelize
    .sync()
    .complete(function(err) {
      if (err) {
        throw err[0]
      } else {
        app.listen(8090)
        console.log('express running at http://localhost:%d', 8090);
        // http.createServer(app).listen(app.get('port'), function(){
        //   console.log('Express server listening on port ' + app.get('port'))
        // })
      }
    })
}else{
  // for the testing harness
  module.exports = app;
}