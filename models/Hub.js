const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');

const hubSchema = new mongoose.Schema({
  hubCode: { type: String, unique: true },
  address: String,
  users: [{type: mongoose.Schema.Types.ObjectID, ref: 'User'}],
  devices: [{type: mongoose.Schema.Types.ObjectID, ref: 'Device'}],
  groups: [{type: mongoose.Schema.Types.ObjectID, ref: 'Group'}],
  automations: [{type: mongoose.Schema.Types.ObjectID, ref: 'Automation'}]
}, { timestamps: true });

const Hub = mongoose.model('Hub', hubSchema);
module.exports = Hub;
