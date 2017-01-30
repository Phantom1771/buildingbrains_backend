const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');

const hubSchema = new mongoose.Schema({
  hubCode: { type: String, unique: true },
  address: String
  users: [String],
  devices: [String],
  groups: [String],
  automations: [String]
}, { timestamps: true });
