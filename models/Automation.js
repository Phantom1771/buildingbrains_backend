const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');

const automationSchema = new mongoose.Schema({
  name: String,
  automations: [{
    device: {mongoose.Schema.Types.ObjectID, ref: 'Device'},
    settings: Object
  }]
});

const Automation = mongoose.model('Automation', automationSchema);
module.exports = Automation;
