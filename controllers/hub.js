const User = require('../models/user')
const Hub = require('../models/hub')

/*
 * POST /api/hubs/
 * Create a new hub (only called by hub)
 * JSON Req: {hubCode: String}
 * 200 Res: {message: String, object: Hub}
 * 400 Res: {message: String}
 */
exports.postHub = function(req,res){
  req.assert('hubCode', 'hubCode is empty').notEmpty()
  const errors = req.validationErrors()
  if (errors) {
    res.status(400).json({message:errors[0].msg})
    return
  }

  var hub = new Hub({
    hubCode: req.body.hubCode
  })
  hub.save(function(err) {
    if (err){
      res.status(208).json({message: 'Hub already registered'})
      return
    }
    res.status(200).json({ message: 'Hub added!', object: hub })
    return
  })
}

/*
 * GET /api/hubs/
 * Retrieve list of users hubs
 * 200 Res: {message: String, objects: Hubs}
 * 400 Res: {message: String}
 */
exports.getHubs = function(req,res){
  Hub.find({userID: req.user._id},function(err, hubs) {
    if (err){
      res.status(400).json({message: err})
      return
    }
    res.status(200).json({message: 'Hubs retrieved', objects: hubs})
    return
  })
}

/*
 * PUT /api/hubs/
 * Associates a hub with a user
 * JSON Req: {hubCode: String, hubName: String}
 * 200 Res: {message: String, object: Hub}
 * 400 Res: {message: String}
 */
exports.putHub = function(req,res){
  req.assert('hubCode', 'hubCode is empty').notEmpty()
  req.assert('hubName', 'Name is empty').notEmpty()
  const errors = req.validationErrors()
  if (errors) {
    res.status(400).json({result:1, error:errors[0].msg})
    return
  }

  Hub.findOne({ hubCode:req.body.hubCode}, (err, existingHub) => {
    if (err) {
      res.status(400).json({result:1, error:error})
      return
    }
    if (existingHub) {
      User.findOne({ _id:req.user._id}, (err, existingUser) => {
        if (err) {
          res.status(400).json({result:1, error:error})
          return
        }
        if (existingUser) {
          if (existingHub.name == null) {
            existingHub.name = req.body.hubName
            existingHub.save()
          }
          //This gets rid of ducplicates
          existingUser.hubs.pull(existingHub)
          existingHub.users.pull(existingUser)
          existingUser.hubs.push(existingHub)
          existingHub.users.push(existingUser)
          existingUser.save()
          existingHub.save()

          res.status(200).json({message: 'Hub added to User', hub: existingHub})
          return
        }
      })
    }
  })
}

/*
 * GET /api/hubs/:hubID
 * Retrieve hub info
 * 200 Res: {message: String, object: Hub}
 * 400 Res: {message: String}
 */
exports.getHub = function(req,res){
  Hub.find({userID: req.user._id, _id:req.params.hubID}, function(err, hub) {
    if (err){
      res.status(400).json({message: err})
      return
    }
    res.status(200).json({message:'Hub retrieved', object: hub})
    return
  })
}

/*
 * DELETE /api/hubs/:hubID
 * Deletes a hub from a user
 * JSON Req: {}
 * 200 Res: {message: String}
 * 400 Res: {message: String}
 */
exports.deleteHub = function(req,res){
  Hub.findOne({ _id:req.params.hubID}, (err, existingHub) => {
    if (err) {
      res.status(400).json({result:1, error:error})
      return
    }

    if (existingHub) {
      User.findOne({ _id:req.user._id}, (err, existingUser) => {
        if (err) {
          res.status(400).json({message:error})
          return
        }

        if (existingUser) {
          existingUser.hubs.pull(existingHub)
          existingHub.users.pull(existingUser)

          existingUser.save()
          existingHub.save()

          res.status(200).json({message:'Hub Deleted'})
          return
        }
      })
    }
  })
}
