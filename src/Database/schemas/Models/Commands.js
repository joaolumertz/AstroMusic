const { Schema, model } = require('mongoose')

let commandSchema = new Schema({
  _idC: {
    type: String,
    required: true
  },
  commands: {
    type: Number,
    default: 0
  }
})

module.exports = model('Commands', commandSchema)