# fs = require 'fs'
# mkdirp = require('mkdirp')

spawn = require('child_process').spawn
Model = require("../models/model")

class Upload
  constructor: (@file, @user, @res) ->
    # ...

  process: ->
    @model = Model.build({
      sourceFile : @file.path.replace(/.+\//,'')
    })

    @model.setUser(@user)

    @model.save().complete =>
      json = null

      console.log "/scripts/process.rb", @file.path, @getOutputPath()
      
      handle = spawn(process.cwd() + "/scripts/process.rb", [@file.path, @getOutputPath()])

      handle.stdout.on 'data', (data) ->
        console.log('stdout: ' + data)
        json = JSON.parse(data)

      handle.stderr.on 'data', (data) ->
        console.log('stderr:' + data)

      handle.on 'close', (code) =>
        console.log('closed process')
        
        # @res.send json

        if !json
          @error "Unable to process model file for some reason"
        else if json.error
          @error json.error
        else
          console.log JSON.stringify(json)

          @model.set {
            vertices : json.vertices
            polygons : json.polygons
            edges : json.edges
            files : json.files
            minimum : [json.minimum.x, json.minimum.y, json.minimum.z]
            maximum : [json.maximum.x, json.maximum.y, json.maximum.z]
          }

          # debugger;

          @model.save().complete =>
            @res.send @model.toJSON()


  error: (message) ->
    @res.status(400).send JSON.stringify({ success : false, error : message })

  getOutputPath: () ->
    process.cwd() + "/public/models/#{@model.id}/"

module.exports = Upload