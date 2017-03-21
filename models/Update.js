const mongoose = require('mongoose')

const updateSchema = new mongoose.Schema({
  hubCode: String,
  deviceLink: String,
  setting: String
}, { timestamps: true })

const Update = mongoose.model('Update', updateSchema)
module.exports = Update
