const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  name: String,
  address: String,
  hub: String,
  groups: [{type: mongoose.Schema.Types.ObjectId, ref: 'Group'}],
  status: String,
  deviceType: String
}, { timestamps: true });

const Device = mongoose.model('Device', deviceSchema);
module.exports = Device;
