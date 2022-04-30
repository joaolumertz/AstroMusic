const { Schema, model } = require('mongoose')

let userSchema = new Schema({
  _idU: {
    type: String,
    required: true
  },
  coins: {
		type: Number,
		default: 0
	},
  dailys: {
    type: Number,
    default: 0
  },
  daily: {
    type: Number,
    default: 0
  },
  banco: {
		type: Number,
		default: 0
	},
  xp: {
    type: Number,
    default: 0
  },
  backgrounds: { has: { type: Array, default: [] }, active: { type: Number, default: 0 }, },
})

module.exports = model('Users', userSchema)