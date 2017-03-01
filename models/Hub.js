const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');

const hubSchema = new mongoose.Schema({
  name: String,
  hubCode: { type: String, unique: true },
  address: String,
  users: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  devices: [{type: mongoose.Schema.Types.ObjectId, ref: 'Device'}],
  groups: [{type: mongoose.Schema.Types.ObjectId, ref: 'Group'}],
  automations: [{type: mongoose.Schema.Types.ObjectId, ref: 'Automation'}]
}, { timestamps: true });

const Hub = mongoose.model('Hub', hubSchema);
module.exports = Hub;
