const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  devices: [String],
  settings: [String, String]
});
