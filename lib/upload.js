var spawn = require('child_process').spawn;
var db = require("../models");
var path = require("path");
var mkdirp = require('mkdirp');

BLENDER_PATH = '/Applications/blender.app/Contents/MacOS/blender'
 
function Upload(file, user, response){
  this.file = file;
  this.user = user;
  this.response = response;
}

Upload.prototype.error = function(message){
  this.response.status(400).send(JSON.stringify({ success : false, error : message }));
}

Upload.prototype.getOutputPath = function(){
  return path.join(process.cwd(), "public" , "models", String(this.model.id));
}

Upload.prototype.process = function(){
  var self = this;

  this.model = db.Model.build({
    sourceFile : path.basename(this.file)
  });

  this.model.setUser(this.user);

  this.model.save().complete(function(){
    var json = null;

    // Todo remove sync call
    mkdirp.mkdirp.sync(self.getOutputPath());

    var handle = spawn(BLENDER_PATH, [
      "--background", "--python", "scripts/convert.py", "--", self.file.path, path.join(self.getOutputPath(), "model.js")
    ]);

    handle.stdout.on('data', function(data){
      data.toString().split("\n").forEach(function(line){
        // Blender outputs a bunch of noise, the json is all we're interested in
        if(line.match(/^{/)){
          json = JSON.parse(line)
        }
      });
    });

    handle.on('close', function(code){
      self.onComplete(json);
    });
  });
}

Upload.prototype.onComplete = function(json){
  var self = this;

  if(!json){
    this.error("Unable to process model file for some reason");
    return;
  }else if(!json.success){
    this.error(json.error);
    return;
  }

  this.model.set({
    vertices : json.model.vertices,
    polygons : json.model.polygons,
    edges : json.model.edges,
    minimum : [json.model.minimum.x, json.model.minimum.y, json.model.minimum.z],
    maximum : [json.model.maximum.x, json.model.maximum.y, json.model.maximum.z]
  });

  this.model.save().complete(function(){
    self.response.send(self.model.toJSON());
  })
}

module.exports = Upload