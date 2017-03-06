const async = require('async')
const crypto = require('crypto')
const User = require('../models/User')
const Hub = require('../models/Hub')
const Device = require('../models/Device')
const Group = require('../models/Group')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')

/* 1.
 * POST /groups/add
 * Add a Group to a Hub
 * Authentication: Header x-access-token
 * JSON req: {hubID: "xxx", groupName: "xxx", groupType: "xxx"}
 * JSON res: {result: 0/1, error: "xxx"}
 */
 exports.postAdd = (req, res) => {
   req.assert('hubID', 'hubID is empty').notEmpty()
   req.assert('groupName', 'groupName is empty').notEmpty()
   req.assert('groupType', 'groupType is empty').notEmpty()

   const errors = req.validationErrors()

   if (errors) {
     res.json({result:1, error:errors})
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

         Hub.findOne({_id: req.body.hubID}, (err, existingHub) => {
           if (err) {
             res.json({result:1, error:error})
             return
           }
           if (existingHub){
             const group = new Group({
               name: req.body.groupName,
               type: req.body.groupType,
               hub: existingHub._id
             })
             existingHub.groups.pull(group)
             existingHub.groups.push(group)
             existingHub.save()

             group.save((err) => {
               if (err) {
                 res.json({result:1, error:err})
                 return
               }
               res.json({result:0, error:""})
               return
             })
           }
           else{
             res.json({result:1, error:"A hub matching this hubID could not be found"})
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

/* 2.
 * POST /groups/
 * Get all Groups on a Hub
 * Authentication: Header x-access-token
 * JSON req: {hubID: "xxx"}
 * JSON res: {result: 0/1, error: "xxx", groups: {group}}
 */
exports.postAll = (req, res) => {
  req.assert('hubID', 'hubID is empty').notEmpty()

  const errors = req.validationErrors()

  if (errors) {
    res.json({result:1, error:errors})
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

        Group.find({ hub: req.body.hubID}, (err, existingGroups) => {
          if (err) {
            res.json({result:1, error:error})
            return
          }

          if (existingGroups){
            res.json({result: 0, error: "", groups: existingGroups})
            return
          }
          else{
            res.json({result: 1, error: "Hub not found"})
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

/* 3.
 * POST /groups/addDevice
 * Add a Device to a Groups
 * Authentication: Header x-access-token
 * JSON req: {hubID: "xxx", groupID: "xxx", deviceID: "xxx"}
 * JSON res: {result: 0/1, error: "xxx"}
 */
exports.postAddDevice = (req, res) => {
  req.assert('hubID', 'hubID is empty').notEmpty()
  req.assert('groupID', 'deviceID is empty').notEmpty()
  req.assert('deviceID', 'deviceID is empty').notEmpty()

  const errors = req.validationErrors()

  if (errors) {
    res.json({result:1, error:errors})
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

        Group.findOne({_id: req.body.groupID, hub: req.body.hubID}, (err, existingGroup) => {
          if (err) {
            res.json({result:1, error:error})
            return
          }

          if (existingGroup){
            Device.findOne({ _id:req.body.deviceID, hub: req.body.hubID}, (err, existingDevice) => {
              if (err) {
                res.json({result:1, error:error})
                return
              }
              if(existingDevice){
                existingGroup.devices.pull(existingDevice)
                existingGroup.devices.push(existingDevice)

                existingGroup.save((err) => {
                  if (err) {
                    res.json({result:1, error:err})
                    return
                  }
                  res.json({result:0, error:""})
                  return
                })
              }
              else{
                res.json({result:1, error:"A device matching this deviceID could not be found on this hub."})
                return
              }
            })
          }
          else{
            res.json({result:1, error:"A group matching this groupID could not be found on this Hub."})
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

/* 4.
 * GET /groups/:groupID
 * Get a list of all Devices in a Group
 * Authentication: Header x-access-token
 * JSON res: {result: 0/1, error: "xxx", devices: {device}}
 */
exports.getGroup = (req, res) => {}

/* 5.
 * POST /groups/removeDevice
 * Remove a Device from a Group
 * Authentication: Header x-access-token
 * JSON req: {hubID: "xxx", groupID: "xxx", deviceID: "xxx"}
 * JSON res: {result: 0/1, error: "xxx"}
 */
 exports.postRemoveDevice = (req, res) => {}

/* 6.
 * POST /groups/delete
 * Delete a Group from a Hub
 * Authentication: Header x-access-token
 * JSON req: {hubID: "xxx", groupID: "xxx"}
 * JSON res: {result: 0/1, error: "xxx"}
 */
 exports.postDelete = (req, res) => {}
