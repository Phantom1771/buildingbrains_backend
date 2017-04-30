const mongoose = require('mongoose')

const groupSchema = new mongoose.Schema({
  name: String,
  devices: [{type: mongoose.Schema.Types.ObjectId, ref: 'Device'}],
  hub: String,
  type: String
}, { timestamps: true })

module.exports = mongoose.model('Group', groupSchema)
