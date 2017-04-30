const mongoose = require('mongoose')

const updateSchema = new mongoose.Schema({
  hubCode: String,
  deviceLink: String,
  setting: String
}, { timestamps: true })

module.exports = mongoose.model('Update', updateSchema)
