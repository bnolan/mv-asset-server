# Blender seems to generate a lot of noise on stdout, so if you're parsing this output, look for the
# line starting with a { - that's your json. We should probably write the json to a seperate
# file.

import sys
import bpy, mathutils, math
from mathutils import Vector
from math import pi

import imp
import io_mesh_threejs.export_threejs

# Importers
import io_scene_obj.import_obj
import io_scene_3ds.import_3ds
import io_scene_fbx.import_fbx

import bmesh
import json
import os.path

args = list(reversed(sys.argv))
idx = args.index("--")
params = args[:idx][::-1]

print("// script params:", params)

FILENAME = params[0]
OUTFILE = params[1]

def getSceneInfo(scene):
  vertices = 0
  polygons = 0
  edges = 0

  for obj in scene.objects:
    if obj.type == 'MESH':
      vertices += len(obj.data.vertices.items())
      polygons += len(obj.data.polygons)
      edges += len(obj.data.edges)
  
  return {
    "vertices" : vertices,
    "polygons" : polygons,
    "edges" : edges
  }

def getBoundingBox(scene):
  minimum = Vector() 
  maximum = Vector()

  for obj in scene.objects:
    if obj.type == 'MESH':
      bbox_corners = [obj.matrix_world * Vector(corner) for corner in obj.bound_box]

      for v in bbox_corners:
        if v.x < minimum.x:
          minimum.x = v.x
        if v.y < minimum.y:
          minimum.y = v.y
        if v.z < minimum.z:
          minimum.z = v.z
        if v.x > maximum.x:
          maximum.x = v.x
        if v.y > maximum.y:
          maximum.y = v.y
        if v.z > maximum.z:
          maximum.z = v.z

  return  {
    "minimum" : { "x" : minimum.x, "y" : minimum.y, "z" : minimum.z },
    "maximum" : { "x" : maximum.x, "y" : maximum.y, "z" : maximum.z }
  }

def printError(message):
  payload = { "success" : False, "error" : message }
  print(json.dumps(payload))

def run():
  # Delete all old cameras and lamps
  scn = bpy.context.scene
  for ob in scn.objects:
    scn.objects.unlink(ob)

  fileName, fileExtension = os.path.splitext(FILENAME.lower())

  # Import the model
  if fileExtension == ".dae":
    print("// Importing .dae model")

    try:
      bpy.ops.wm.collada_import(filepath=FILENAME)
    except:
      printError("Unable to process this .dae file")
      exit()

  elif fileExtension == ".obj":
    print("// Importing .obj model")

    try:
      io_scene_obj.import_obj.load(bpy.context.active_operator, bpy.context, FILENAME)
    except:
      printError("Unable to process this .obj file")
      exit()

  elif fileExtension == ".3ds":
    print("// Importing .3ds model")

    try:
      io_scene_3ds.import_3ds.load(bpy.context.active_operator, bpy.context, FILENAME)
    except:
      printError("Unable to process this .3ds file")
      exit()

  elif fileExtension == ".fbx":
    print("// Importing .fbx model")

    try:
      io_scene_fbx.import_fbx.load(bpy.context.active_operator, bpy.context, FILENAME)
    except:
      printError("Unable to process this .fbx file")
      exit()

  else:
    printError(fileExtension + " is not a recognized file format")
    exit()

  # try:
  # except (RuntimeError):
  #   pass

  modelStats = {}
  modelStats.update(getBoundingBox(scn))
  modelStats.update(getSceneInfo(scn))

  print(json.dumps({ "success" : True, "model" : modelStats }))

  io_mesh_threejs.export_threejs.save(bpy.types.Operator, bpy.context, filepath=OUTFILE, option_copy_textures=True)

run()