
var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require("method-override");
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
app.use(bodyParser());
app.use(methodOverride());
//app.options('*', cors());

// Configure express
// Allow all cross-origin requests
// app.use(connect.json());

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

app.get('/stats', function(req, res) {
  db.User.findAll().complete(function(err, users){
    db.Model.findAll().complete(function(err, models){
      res.json({ success : true, userCount : users.length, modelCount : models.length }); 
    })
  })
});

app.post('/register', multipartMiddleware, function(req, res) {
  db.User.create({
    login: req.body.login
  }).complete(function(err, u){
    if(err){
      res.status(400).json( { success : false });
      return;
    }

    u.setPassword(req.body.password);
    u.save().complete(function(err){
      res.json({ success : true, login : u.login, models : [] });
    });
  });
});

app.get('/info', passport.authenticate('basic', { session: false }), function(req, res){
  db.Model
    .findAll({ where : { user_id : req.user.id }})
    .complete(function(err, models){
      res.json({ success : true, login : req.user.login, models : models });
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