module.exports = (db) ->
  db.define "user", {
    id : Number,
    nickname : String
  } , {
    methods : {
      fullName: ->
        @name + ' ' + @surname
    }
  }