const Hub = require('../models/hub')

// Create endpoint for POST /api/hubs
exports.postHubs = function(req,res){
  var hub = new Hub()

  hub.hubCode = req.body.hubCode
  hub.hubName = req.body.hubName
  hub.userID = req.user._id

  hub.save(function(err) {
    if (err){
      res.send(err)
      return
    }

    res.json({ message: 'Hub added!', data: hub })
    return
  })
}

// Create endpoint for GET /api/hubs
exports.getHubs = function(req,res){
  Hub.find({userID: req.user._id},function(err, hubs) {
    if (err){
      res.send(err)
      return
    }

    res.json(hubs)
    return
  })
}

// Create endpoint for GET /api/hubs/:hubID
exports.getHub = function(req,res){
  Hub.find({userID: req.user._id, _id:req.params.hubID}, function(err, hub) {
    if (err){
      res.send(err)
      return
    }

    res.json(hub)
    return
  })
}

// Create endpoint for PUT /api/hubs/:hubID
exports.putHub = function(req,res){
  Hub.update({userID: req.user._id, _id:req.params.hubID},{hubName: req.body.hubName},function(err, name, raw) {
    if (err){
      res.send(err)
      return
    }

    // Save the hub and check for errors
    hub.save(function(err) {
      if (err){
        res.send(err)
        return
      }

      res.json({message: 'hubName updated to '+ name})
      return
    })
  })
}

// Create endpoint for DELETE /api/hubs/:hubID
exports.deleteHub = function(req,res){
  Hub.remove({userID: req.user._id, _id:req.params.hubID}, function(err) {
   if (err){
     res.send(err)
     return
   }

   res.json({ message: 'Hub removed!' })
   return
 })
}
