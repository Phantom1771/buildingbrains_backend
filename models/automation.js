const mongoose = require('mongoose')

const automationSchema = new mongoose.Schema({
  name: String,
  hub: String,
  automations: [{
    device: {type: mongoose.Schema.Types.ObjectId, ref: 'Device'},
    setting: String
  }]
}, { timestamps: true })

module.exports = mongoose.model('Automation', automationSchema)
