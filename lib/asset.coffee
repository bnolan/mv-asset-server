module.exports = (db) ->
  db.define "assets", {
    id : Number,
    name : String,
    url : String,
    description : String,
    created_at : Date,
    triangles : Number,
    faces : Number,
    user_id : Number,
  } , {
    methods: {
      fullName: ->
        @name + ' ' + @surname
    }
  }