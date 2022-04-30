const { Schema, model } = require('mongoose')

let guildSchema = new Schema({
  _idG: {
    type: String,
    required: true
  },
  settings: {
    lang: {
      type: String,
      default: "pt-BR"
    },
    djRole: {
      type: String,
    }
  },
})

module.exports = model('Guilds', guildSchema)