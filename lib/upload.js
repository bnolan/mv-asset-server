var spawn = require('child_process').spawn;
var Model = require("../models/model");
var path = require("path");

function Upload(file, user, response){
  this.file = file;
  this.user = user;
  this.response = response;
}

Upload.prototype.error = function(message){
  this.response.status(400).send(JSON.stringify({ success : false, error : message }));
}

Upload.prototype.getOutputPath = function(){
  return path.join(process.cwd(), "public" , "models", "#{@model.id}";
}

Upload.prototype.process = function(){
  var self = this;

  this.model = Model.build({
    sourceFile : path.basename(this.file)
  });

  this.model.setUser(this.user);

  this.model.save().complete(function(){
    var json = null;

    console.log("/scripts/process.rb", self.file.path, self.getOutputPath());
    
    handle = spawn(path.join(process.cwd(), "scripts", "process.rb"), [@file.path, @getOutputPath()])

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



module.exports = Upload