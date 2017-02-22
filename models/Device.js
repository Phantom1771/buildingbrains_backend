const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  name: String,
  link: String,
  hub: {type: mongoose.Schema.Types.ObjectId, ref: 'Hub'},
  state: String,
  type: String,
  catagory: String,
  groups: [{type: mongoose.Schema.Types.ObjectId, ref: 'Group'}]
}, { timestamps: true });

const Device = mongoose.model('Device', deviceSchema);
module.exports = Device;
