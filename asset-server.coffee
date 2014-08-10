express = require 'express'
connect = require 'connect'
multipart = require 'connect-multiparty'

cors = require './lib/cors'
Asset = require("./lib/asset")
User = require("./models/user")
Model = require("./models/model")
Upload = require("./lib/upload")
sequelize = require("./lib/sequelize")

BLENDER_PATH = '/Applications/Blender/blender.app/Contents/MacOS/blender'
HOSTNAME = "localhost"

debug = (message) ->
  console.log message


# orm.connect "postgres://ben@localhost/asset-server-dev", (err, db) ->
#   if err
#     debug "Something is wrong with the database connection", err
#   else
#     debug "Connected to the database"

#   db.sync ->
#     debug "Database is created..."

#   Asset = Asset(db)
#   User = User(db)

exports.app = app = express()
multipartMiddleware = multipart()

app.configure ->
    app.use(express.methodOverride())
    app.use(connect.urlencoded())
    app.use(connect.json())
    app.use(cors)
    app.use(app.router)
    app.use(express.static('public'))

# app.use orm.express("postgres://ben@localhost/asset-server-dev", {
#   define : (db, models) ->
#     models.asset = require("./lib/asset")(db)
#     models.user = require("./lib/user")(db)
# })

app.configure 'development', ->
  app.use(express.static(__dirname + '/public'))
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))

app.configure 'production', ->
  app.use(express.static(__dirname + '/public'))
  app.use(express.errorHandler())

sequelize.sync().success ->
  User.create({
    login: 'bnolan',
  }).success (u)->
    console.log(u.values)

app.get '/asset/id', (req, res) ->
  id = 1

  Asset.get id, (err, asset) ->
    if err
      res.status(404).send "Asset not found"

    res.send asset


app.post '/upload', multipartMiddleware, (req, res) ->
  if !req.files.upload
    debug "Invalid arguments"
    res.status(400).send JSON.stringify({ success : false, error : "Invalid arguments" })
    return

  # file = req.files.upload
  # debug file

  User.find(1).success (user) ->
    upload = new Upload(req.files.upload, user, res)
    upload.process()

  # unless file.originalFilename.match /dae$/i
  #   debug "File does not appear to be a .dae file"
  #   res.status(400).send "File does not appear to be a .dae file"
  #   return

  # if file.size > 5 * 1024 * 1024
  #   size = Math.floor(file.size / 1024)
  #   message = "File is too large (#{size}kB) maximum size is 5MB"

  #   debug message
  #   res.status(400).send message
  #   return

  # fs.readFile file.path, 'utf8', (err, data) ->
  #   unless data.match /<COLLADA/
  #     debug "File does not appear to be a <COLLADA file"
  #     res.status(400).send "File does not appear to be a <COLLADA file"
  #     return

  #   # Eww sync call
  #   mkdirp.sync(process.cwd() + "public/models/model-#{id}")

  #   outPath = process.cwd() + "/public/models/model-#{id}/model.js"

  #   blenderProcess file.path, outPath, ->
  #     res.send("//#{HOSTNAME}:8090/models/model-#{id}/model.js")
 
if __filename == process.argv[1]
  app.listen(8090)
  console.log('express running at http://localhost:%d', 8090);
