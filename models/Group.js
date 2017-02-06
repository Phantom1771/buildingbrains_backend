const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  devices: [{type: Schema.Types.ObjectID, ref: 'Device'}],
  hub: String,
  type: String
});

const Group = mongoose.model('Group', groupSchema);
module.exports = Group;
