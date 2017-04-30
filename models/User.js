const mongoose = require('mongoose')
const bcrypt = require('bcrypt-nodejs')

const UserSchema = mongoose.Schema({
  email: {type: String, unique: true, required: true},
  password: {type: String, required: true},
  firstName: String,
  lastName: String,
  hubs: [{type: mongoose.Schema.Types.ObjectId, ref: 'Hub'}],
  tempPassword: Boolean
}, { timestamps: true })

/**
 * Password hash middleware.
 */
UserSchema.pre('save', function(callback){
  var user = this;
  // Break out if the password hasn't changed
  if (!user.isModified('password')) return callback()
  // Password changed so we need to hash it
  bcrypt.genSalt(5, function(err, salt) {
    if (err) return callback(err)
    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return callback(err)
      user.password = hash
      callback()
    })
  })
})

/**
 * Helper method for validating user's password.
 */
UserSchema.methods.verifyPassword = function(password, cb){
  bcrypt.compare(password, this.password, function(err, isMatch){
    if(err) return cb(err)
    cb(null, isMatch)
  })
}

module.exports = mongoose.model('User', UserSchema)
