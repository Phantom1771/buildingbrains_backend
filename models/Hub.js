const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');

const hubSchema = new mongoose.Schema({
  hubId: { type: String, unique: true },
  users: [String],
  devices: [String],
}, { timestamps: true });
