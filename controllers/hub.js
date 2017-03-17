const async = require('async')
const crypto = require('crypto')
const Hub = require('../models/Hub')
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const Update = require('../models/Update')

/* #1
 * POST hubs/add
 * Add a hub to a user.
 * Authentication: Auth Header
 * JSON req: {hubCode: "xxx", hubName: "xxx"}
 * JSON res: {result: 0/1, error: "xxx"}
 */
exports.postAdd = (req, res) => {
  req.assert('hubCode', 'hubCode is empty').notEmpty()
  req.assert('hubName', 'Name is empty').notEmpty()

  const errors = req.validationErrors()

  if (errors) {
    res.json({result:1, error:errors[0].msg})
    return
  }

  var token = req.headers['x-access-token']

  if(token){
    // verifies secret and checks exp
    jwt.verify(token, process.env.SECRET, function(err, decoded) {
      if (err) {
        res.json({ result: 1, error: 'Failed to authenticate token.' })
        return
      }
      else { // if everything is good
        user = decoded._doc

        Hub.findOne({ hubCode:req.body.hubCode}, (err, existingHub) => {
          if (err) {
            res.json({result:1, error:error})
            return
          }

          if (existingHub) {
            User.findOne({ _id:user._id}, (err, existingUser) => {
              if (err) {
                res.json({result:1, error:error})
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

                res.json({result:0, error:"", hub: existingHub, user: existingUser})
                return
              }
              else{
                res.json({result:1, error:"User could not be found, hub could not be added."})
                return
              }
            })
          }
          else{
            res.json({result:1, error:"A hub matching this hubCode could not be found."})
            return
          }
        })
      }
    })
  }
  else{ // if there is no token return an error
    res.json({ result: 1, error: 'No token provided.' })
    return
  }
}

 /* #2
  * POST hubs/delete
  * Delete a hub from a user.
  * Authentication: Auth Header
  * JSON req: {hubID: "xxx"}<br/>
  * JSON res: {result: 0/1, error: "xxx"}<br/>
  */
exports.postDelete = (req, res) => {
  req.assert('hubID', 'hubID is empty').notEmpty()

  const errors = req.validationErrors()

  if (errors) {
    res.json({result:1, error:errors[0].msg})
    return
  }

  var token = req.headers['x-access-token']

  if(token){
    // verifies secret and checks exp
    jwt.verify(token, process.env.SECRET, function(err, decoded) {
      if (err) {
        res.json({ result: 1, error: 'Failed to authenticate token.' })
        return
      }
      else { // if everything is good
        user = decoded._doc

        Hub.findOne({ _id:req.body.hubID}, (err, existingHub) => {
          if (err) {
            res.json({result:1, error:error})
            return
          }

          if (existingHub) {
            User.findOne({ _id:user._id}, (err, existingUser) => {
              if (err) {
                res.json({result:1, error:error})
                return
              }

              if (existingUser) {
                existingUser.hubs.pull(existingHub)
                existingHub.users.pull(existingUser)

                existingUser.save()
                existingHub.save()

                res.json({result:0, error:""})
                return
              }
              else{
                res.json({result:1, error:"User could not be found, hub could not be added."})
                return
              }
            })
          }
          else{
            res.json({result:1, error:"A hub matching this hubID could not be found."})
            return
          }
        })
      }
    })
  }
  else{ // if there is no token return an error
    res.json({ result: 1, error: 'No token provided.' })
    return
  }
}

/* #3
 * GET hubs/
 * Return all of users hubs
 * Authentication: Auth Header
 * JSON res: {result: 0/1, error: "xxx", hubs: {hub}}
 */
exports.getAll = (req, res) => {
  const errors = req.validationErrors()

  if (errors) {
    res.json({result:1, error:errors[0].msg})
    return
  }

  var token = req.headers['x-access-token']

  if(token){
    // verifies secret and checks exp
    jwt.verify(token, process.env.SECRET, function(err, decoded) {
      if (err) {
        res.json({ result: 1, error: 'Failed to authenticate token.' })
        return
      }
      else { // if everything is good
        user = decoded._doc

        User.findOne({ _id:user._id}, (err, existingUser) => {
          if(existingUser){
            res.json({ result: 0, error: "", hubs: existingUser.hubs})
            return
          }
          else{
            res.json({ result: 1, error: "User not found"})
            return
          }
        })
      }
    })
  }
  else{ // if there is no token return an error
    res.json({ result: 1, error: 'No token provided.' })
    return
  }
}

/* #4
 * POST hubs/register
 * THIS CALL IS ONLY FOR THE HUB
 * Sends hub information to backend,
 * address is the hubs IP address
 * hubCode is the code that hub and user have (printed on bottom of the hub)
 * JSON req: {address: "xxx", hubCode: "xxx"}
 * JSON res: {result: 0/1, error: "xxx"}
 */
exports.postRegister = (req, res) => {
  req.assert('address', 'Address is empty').notEmpty()
  req.assert('hubCode', 'hubCode is empty').notEmpty()

  const errors = req.validationErrors()

  if (errors) {
    res.json({result:1, error:errors[0].msg})
    return
  }

  const hub = new Hub({
    hubCode:req.body.hubCode,
    address:req.body.address
  })

  Hub.findOne({ hubCode:req.body.hubCode}, (err, existingHub) => {
    if (err) {
      res.json({result:1, error:error})
      return
    }

    if (existingHub) {
      res.json({result:1, error:'This Hub has already been registered'})
      return
    }

    hub.save((err) => {
      if (err) { return res.json({result:1, error:err}) }
      res.json({result:0, error:""})
      return
    })
  })
}

/* #5
 * POST hubs/checkUpdates
 * THIS CALL IS ONLY FOR THE HUB
 * hubCode is the code that hub and user have (printed on bottom of the hub)
 * JSON req: {hubCode: "xxx"}
 * JSON res: {result: 0/1, error: "xxx", updates: "xxx"}
 */
exports.postCheckUpdates = (req, res) => {
  req.assert('hubCode', 'hubCode is empty').notEmpty()

  const errors = req.validationErrors()

  if (errors) {
    res.json({result:1, error:errors[0].msg})
    return
  }

  Update.find({ hubCode: req.body.hubCode}, (err, existingUpdates) => {
    if (err) {
      res.json({result:1, error:error})
      return
    }

    if (existingUpdates) {
      res.json({result:0, error: "", updates: existingUpdates})
      Update.remove(existingUpdates)
      return
    }

    else{
      res.json({result:1, error: "No current updates to return"})
      return
    }
  })
}
