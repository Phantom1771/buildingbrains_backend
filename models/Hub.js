const mongoose = require('mongoose');

// Define hub schema
const HubSchema   = new mongoose.Schema({
  hubCode: { type: String, unique: true },
  hubName: String,
  users: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  devices: [{type: mongoose.Schema.Types.ObjectId, ref: 'Device'}],
  groups: [{type: mongoose.Schema.Types.ObjectId, ref: 'Group'}],
  automations: [{type: mongoose.Schema.Types.ObjectId, ref: 'Automation'}]
}, {timestamps: true})

// Export the Mongoose model
module.exports = mongoose.model('Hub', HubSchema)
