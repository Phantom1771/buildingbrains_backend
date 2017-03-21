const async = require('async')
const crypto = require('crypto')
const User = require('../models/User')
const Hub = require('../models/Hub')
const Device = require('../models/Device')
const Update = require('../models/Update')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const request = require('request')

/* 1.
 * POST devices/
 * Return all of users devices on a hub
 * Authentication: header: x-access-token
 * JSON req: {hubID: "xxx"}
 * JSON res: {result: 0/1, error: "xxx", devices: {device}}
 */
exports.postAll = (req, res) => {
  req.assert('hubID', 'hubID is empty').notEmpty()

  const errors = req.validationErrors()

  if (errors) {
    res.status(400).json({result:1, error:errors[0].msg})
    return
  }

  var token = req.headers['x-access-token']

  if(token){
    // verifies secret and checks exp
    jwt.verify(token, process.env.SECRET, function(err, decoded) {
      if (err) {
        res.status(400).json({result:1, error: 'Failed to authenticate token.' })
        return
      }
      else { // if everything is good
        user = decoded._doc

        Device.find({ hub: req.body.hubID, registered: true}, (err, existingDevices) => {
          if(err){
            res.status(400).json({result:1, error: err })
            return
          }
          if (existingDevices){
            res.json({result: 0, error: "", devices: existingDevices})
            return
          }
          else{
            res.status(400).json({result:1, error: "Hub not found"})
            return
          }
        })
      }
    })
  }
  else{ // if there is no token return an error
    res.status(400).json({result:1, error: 'No token provided.' })
    return
  }
}

/* 2.
 * GET devices/deviceID
 * Return status of device
 * Authentication: header: x-access-token
 * JSON res: {result: 0/1, error: "xxx", device: {device}}
 */
exports.getDevice = (req, res) => {
  const errors = req.validationErrors()

  if (errors) {
    res.status(400).json({result:1, error:errors[0].msg})
    return
  }

  var token = req.headers['x-access-token']

  if(token){
    // verifies secret and checks exp
    jwt.verify(token, process.env.SECRET, function(err, decoded) {
      if (err) {
        res.status(400).json({result:1, error: 'Failed to authenticate token.' })
        return
      }
      else { // if everything is good
        user = decoded._doc

        Device.findOne({ _id: req.params.deviceID}, (err, existingDevice) => {
          if (existingDevice){
            res.status(200).json({result:0, error:"", device: existingDevice})
            return
          }
          else{
            res.status(400).json({result:1, error: "Device not found"})
            return
          }
        })
      }
    })
  }
  else{ // if there is no token return an error
    res.status(400).json({result:1, error: 'No token provided.' })
    return
  }
}

/* 3.
 * POST devices/nearby
 * Returns list of unregistered nearby devices
 * Authentication: header: x-access-token
 * JSON req: {hubID: "xxx"}
 * JSON res: {result: 0/1, error: "xxx", devices: {device}}
 */
exports.postNearby = (req, res) => {
  const errors = req.validationErrors()

  if (errors) {
    res.status(400).json({result:1, error:errors[0].msg})
    return
  }

  var token = req.headers['x-access-token']

  if(token){
    // verifies secret and checks exp
    jwt.verify(token, process.env.SECRET, function(err, decoded) {
      if (err) {
        res.status(400).json({result:1, error: 'Failed to authenticate token.' })
        return
      }
      else { // if everything is good
        user = decoded._doc

        Device.find({ hub: req.body.hubID, registered: false}, (err, existingDevices) => {
          if (existingDevices){
            res.json({result: 0, error: "", devices: existingDevices})
            return
          }
          else{
            res.status(400).json({result:1, error: "Hub not found"})
            return
          }
        })
      }
    })
  }
  else{ // if there is no token return an error
    res.status(400).json({result:1, error: 'No token provided.' })
    return
  }
}

/* 4.
 * POST devices/add
 * Adds a device to a users hub
 * Authentication: header: x-access-token
 * JSON req: {hubID: "xxx", deviceID: "xxx", deviceName: "xxx"}
 * JSON res: {result: 0/1, error: "xxx"}
 */
 exports.postAdd = (req, res) => {
   req.assert('hubID', 'hubID is empty').notEmpty()
   req.assert('deviceID', 'deviceID is empty').notEmpty()
   req.assert('deviceName', 'deviceName is empty').notEmpty()

   const errors = req.validationErrors()

   if (errors) {
     res.status(400).json({result:1, error:errors[0].msg})
     return
   }

   var token = req.headers['x-access-token']

   if(token){
     // verifies secret and checks exp
     jwt.verify(token, process.env.SECRET, function(err, decoded) {
       if (err) {
         res.status(400).json({result:1, error: 'Failed to authenticate token.' })
         return
       }
       else { // if everything is good
         user = decoded._doc

         Device.findOne({_id: req.body.deviceID, registered: false}, (err, existingDevice) => {
           if (err) {
             res.status(400).json({result:1, error:error})
             return
           }

           if (existingDevice){
             Hub.findOne({ _id:req.body.hubID}, (err, existingHub) => {
               if (err) {
                 res.status(400).json({result:1, error:error})
                 return
               }

               if (existingHub) {
                 if (existingDevice.name == null) {
                   existingDevice.name = req.body.deviceName
                 }
                 existingDevice.registered = true
                 existingDevice.save()

                 //This gets rid of ducplicates
                 existingHub.devices.pull(existingDevice)
                 existingHub.devices.push(existingDevice)

                 existingHub.save()

                 res.status(200).json({result:0, error:""})
                 return
               }
               else{
                 res.status(400).json({result:1, error:"A hub matching this hubID could not be found."})
                 return
               }
             })
           }
           else{
             res.status(400).json({result:1, error:"A device matching this deviceID could not be found or is already registered to a Hub."})
             return
           }
         })
       }
     })
   }
   else{ // if there is no token return an error
     res.status(400).json({result:1, error: 'No token provided.' })
     return
   }
 }

/* 5.
 * POST devices/update
 * Updates the device status
 * Authentication: header: x-access-token
 * JSON req: {hubID: "xxx", deviceID: "xxx", deviceSetting: {settings}}
 * JSON res: {result: 0/1, error: "xxx"}
 */
 exports.postUpdate = (req, res) => {
   req.assert('hubID', 'hubID is empty').notEmpty()
   req.assert('deviceID', 'deviceID is empty').notEmpty()
   req.assert('deviceSetting', 'deviceSetting is empty').notEmpty()

   const errors = req.validationErrors()

   if (errors) {
     res.status(400).json({result:1, error:errors[0].msg})
     return
   }

   var token = req.headers['x-access-token']

   if(token){
     // verifies secret and checks exp
     jwt.verify(token, process.env.SECRET, function(err, decoded) {
       if (err) {
         res.status(400).json({result:1, error: 'Failed to authenticate token.' })
         return
       }
       else { // if everything is good
         user = decoded._doc

         Hub.findOne({ _id: req.body.hubID}, (err, existingHub) => {
           if(existingHub){
           Device.findOne({ _id: req.body.deviceID, hub: req.body.hubID}, (err, existingDevice) => {
             if (existingDevice){
                 const update = new Update({
                   hubCode: existingHub.hubCode,
                   deviceLink: existingDevice.link,
                   setting: req.body.deviceSetting
                 })
                 update.save()
                 existingDevice.state = req.body.deviceSetting
                 existingDevice.save((err, modified_device) => {
                   if (err) {
                     res.status(400).json({result:1, error: err})
                     return
                   }

                   res.json({result: 0, error: "", device: modified_device})
                   return
                 })
               }
               else{
                 res.status(400).json({result:1, error: "Device not found or isnt registered to this hub"})
                 return
               }
             })
           }
           else{
             res.status(400).json({result:1, error: 'Hub not found'})
             return
           }
         })
       }
     })
   }
   else{ // if there is no token return an error
     res.status(400).json({result:1, error: 'No token provided.' })
     return
   }
 }

/* 6.
 * POST devices/delete
 * Delete device from a users hub
 * Authentication: header: x-access-token
 * JSON req: {hubID: "xxx", deviceID: "xxx"}
 * JSON res: {result: 0/1, error: "xxx"}
 */
 exports.postDelete = (req, res) => {
   req.assert('hubID', 'hubID is empty').notEmpty()
   req.assert('deviceID', 'deviceID is empty').notEmpty()

   const errors = req.validationErrors()

   if (errors) {
     res.status(400).json({result:1, error:errors[0].msg})
     return
   }

   var token = req.headers['x-access-token']

   if(token){
     // verifies secret and checks exp
     jwt.verify(token, process.env.SECRET, function(err, decoded) {
       if (err) {
         res.status(400).json({result:1, error: 'Failed to authenticate token.' })
         return
       }
       else { // if everything is good
         user = decoded._doc

         Device.findOne({_id: req.body.deviceID}, (err, existingDevice) => {
           if (err) {
             res.status(400).json({result:1, error:error})
             return
           }

           if (existingDevice){
             existingDevice.registered = false;
             existingDevice.save()

             res.status(200).json({result:0, error: ""})
             return
           }
           else{
             res.status(400).json({result:1, error:"A device matching this deviceID could not be found."})
             return
           }
         })
       }
     })
   }
   else{ // if there is no token return an error
     res.status(400).json({result:1, error: 'No token provided.' })
     return
   }
 }


 /* 7.
  * POST devices/register
  * THIS CALL IS ONLY FOR THE HUB
  * Sends device information to backend,
  * deviceLink is the devices link relative to the hub
  * JSON req: {deviceLink: "xxx", hubCode: "xxx", state: "xxx", category: "xxx", type: "xxx"}
  * JSON res: {result: 0/1, error: "xxx"}
  */
  exports.postRegister = (req, res) => {
    req.assert('deviceLink', 'deviceLink is empty').notEmpty()
    req.assert('hubCode', 'hubCode is empty').notEmpty()
    req.assert('state', 'state is empty').notEmpty()
    req.assert('type', 'type is empty').notEmpty()

    const errors = req.validationErrors()

    if (errors) {
      res.status(400).json({result:1, error:errors[0].msg})
      return
    }

    Hub.findOne({ hubCode:req.body.hubCode}, (err, existingHub) => {
      if (err) {
        res.status(400).json({result:1, error:err.errmsg})
        return
      }

      if (existingHub) {
        Device.findOne({link:req.body.deviceLink}, (err, existingDevice) => {
          if(err){
            res.status(400).json({result:1, error:err.errmsg})
            return
          }
          if(existingDevice){
            res.status(208).json({result:0, error:'This Hub has already been registered'})
            return
          }
          else{
            const device = new Device({
              link:req.body.deviceLink,
              hub: existingHub._id,
              state: req.body.state,
              type: req.body.type,
              registered: false
            })

            if(req.body.type == "Switch"){
              device.params = ["ON","OFF"]
            }
            else if(req.body.type == "Dimmer"){
              device.params = ["percent"]
            }
            else if(req.body.type == "Color"){
              device.params = ["float,float,float"]
            }
            else if(req.body.type == "Number"){
              device.params = ["float"]
            }
            else if(req.body.type == "Contact"){
              device.params = ["OPEN", "CLOSED"]
            }
            else{
              device.params = []
            }

            device.save((err) => {
              if (err) {
                res.status(400).json({result:1, error:err.errmsg})
                return
              }
              res.status(200).json({result:0, error:""})
              return
            })
          }
        })
      }
      else{
        res.status(400).json({result:1, error:'Device already registered'})
        return
      }
    })
  }
