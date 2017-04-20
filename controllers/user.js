const User = require('../models/user')

// Create endpoint for POST /api/users/
exports.postUsers = function(req,res){
  const user = new User({
    email: req.body.email,
    password: req.body.password
  })

  user.save(function(err) {
    if (err){
      res.send(err)
      return
    }

    res.json({ message: 'New user created!' })
    return
  })
}

// Create endpoint for GET /api/users/
exports.getUsers = function(req, res) {
  User.find(function(err, users) {
    if (err){
      res.send(err)
      return
    }

    res.json(users)
    return
  })
}
