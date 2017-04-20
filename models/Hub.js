const mongoose = require('mongoose');

// Define hub schema
const HubSchema   = new mongoose.Schema({
  hubCode: { type: String, unique: true },
  hubName: String,
  userID: String
})

// Export the Mongoose model
module.exports = mongoose.model('Hub', HubSchema)
