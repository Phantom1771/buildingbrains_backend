const mongoose = require('mongoose')

const TokenSchema   = new mongoose.Schema({
  value: {type: String, required: true},
  userID: {type: String, required: true},
  clientID: {type: String, required: true}
})

module.exports = mongoose.model('Token', TokenSchema)
