const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: String,
  devices: [{type: mongoose.Schema.Types.ObjectId, ref: 'Device'}],
  hub: String,
  type: String
});

const Group = mongoose.model('Group', groupSchema);
module.exports = Group;
