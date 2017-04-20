const Client = require('../models/client')

// Create endpoint for POST /api/client
exports.postClients = function(req,res){
  var client = new Client()

  client.name = req.body.name,
  client.id = req.body.id,
  client.secret = req.body.secret,
  client.userID = req.user._id

  client.save(function(err) {
    if (err){
      res.send(err)
      return
    }

    res.json({ message: 'Client added!', data: client })
    return
  })
}

// Create enpoint for GET /api/client
exports.getClients = function(req, res) {
  // Use the Client model to find all clients
  Client.find({ userID: req.user._id }, function(err, clients) {
    if (err){
      res.send(err)
      return
    }

    res.json(clients)
    return
  })
}
