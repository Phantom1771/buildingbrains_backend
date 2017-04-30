const mongoose = require('mongoose')

const deviceSchema = new mongoose.Schema({
  link: { type: String, unique: true },
  name: String,
  hub: {type: mongoose.Schema.Types.ObjectId, ref: 'Hub'},
  state: String,
  type: String,
  groups: [{type: mongoose.Schema.Types.ObjectId, ref: 'Group'}],
  params: [String],
  registered: Boolean
}, { timestamps: true })

module.exports = mongoose.model('Device', deviceSchema)
