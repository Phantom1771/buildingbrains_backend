const async = require('async')
const crypto = require('crypto')
const User = require('../models/User')
const Hub = require('../models/Hub')
const Device = require('../models/Device')
const Update = require('../models/Update')
const Automation = require('../models/Automation')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const request = require('request')

/* 1.
 * POST /automations/add
 * Add Automation
 * Authentication: Header x-access-token
 * JSON req: {hubID: "xxx", automationName: "xxx", devices: {device, setting}}
 * JSON res: {result: 0/1, error: "xxx"}
 */
exports.postAdd = (req, res) => {
  req.assert('hubID', 'hubID is empty').notEmpty()
  req.assert('automationName', 'automationName is empty').notEmpty()

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

        Hub.findOne({_id: req.body.hubID}, (err, existingHub) => {
          if (err) {
            res.status(400).json({result:1, error:error})
            return
          }
          if (existingHub){
            const automation = new Automation({
              name: req.body.automationName,
              hub: existingHub._id,
              automations:req.body.devices
            })
            existingHub.automations.pull(automation)
            existingHub.automations.push(automation)
            existingHub.save()

            automation.save((err) => {
              if (err) {
                res.status(400).json({result:1, error:err})
                return
              }
              res.status(200).json({result:0, error:""})
              return
            })
          }
          else{
            res.status(400).json({result:1, error:"A hub matching this hubID could not be found"})
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
 * POST /automations/
 * Get all Automations on a Hub
 * Authentication: Header x-access-token
 * JSON req: {hubID: "xxx"}
 * JSON res: {result: 0/1, error: "xxx", automations: {automation}}
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

        Automation.find({ hub: req.body.hubID}, (err, existingAutomations) => {
          if (err) {
            res.status(400).json({result:1, error:error})
            return
          }

          if (existingAutomations){
            res.status(200).json({result:0, error: "", automations: existingAutomations})
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

/* 3.
 * POST /automations/addDevice
 * Add a Device and settings to an Automation
 * Authentication: Header x-access-token
 * JSON req: {hubID: "xxx", automationID: "xxx", deviceID: "xxx", setting: "xxx"}
 * JSON res: {result: 0/1, error: "xxx"}
 */
exports.postAddDevice = (req, res) => {
  req.assert('hubID', 'hubID is empty').notEmpty()
  req.assert('automationID', 'automationID is empty').notEmpty()
  req.assert('deviceID', 'deviceID is empty').notEmpty()
  req.assert('setting', 'setting is empty').notEmpty()

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

        Automation.findOne({_id: req.body.automationID, hub: req.body.hubID}, (err, existingAutomation) => {
          if (err) {
            res.status(400).json({result:1, error:error})
            return
          }

          if (existingAutomation){
            Device.findOne({ _id:req.body.deviceID, hub: req.body.hubID}, (err, existingDevice) => {
              if (err) {
                res.status(400).json({result:1, error:error})
                return
              }
              if(existingDevice){
                var automation = {device: existingDevice, setting: req.body.setting}
                existingAutomation.automations.push(automation)

                existingAutomation.save((err) => {
                  if (err) {
                    res.status(400).json({result:1, error:err})
                    return
                  }
                  res.status(200).json({result:0, error:""})
                  return
                })
              }
              else{
                res.status(400).json({result:1, error:"A device matching this deviceID could not be found on this hub."})
                return
              }
            })
          }
          else{
            res.status(400).json({result:1, error:"An automation matching this automationID could not be found on this Hub."})
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
 * GET /automations/:automationID
 * Get all Devices and settings in an Automation
 * Authentication: Header x-access-token
 * JSON res: {result: 0/1, error: "xxx", devices: {device, setting}}
 */
 exports.getAutomation = (req, res) => {
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

         Automation.findOne({ _id: req.params.automationID}, (err, existingAutomation) => {
           if (existingAutomation){
               res.status(200).json({result:0, error: "", devices: existingAutomation.automations})
           }
           else{
             res.status(400).json({result:1, error: "Automation not found"})
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
* POST /automations/send
* Send automation commands to a hub
* Authentication: Header x-access-token
* JSON req: {hubID: "xxx", automationID: "xxx"}
* JSON res: {result: 0/1, error: "xxx"}
*/
exports.postSendCommands = (req, res) => {
  req.assert('hubID', 'hubID is empty').notEmpty()
  req.assert('automationID', 'automationID is empty').notEmpty()

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

        Automation.findOne({ _id: req.body.automationID, hub: req.body.hubID}, function(err, existingAutomation){
          if (err) {
            res.status(400).json({result:1, error:err})
            return
          }

          if (existingAutomation){
            Hub.findOne({ _id: req.body.hubID}, function(err, existingHub){
              if (err) {
                res.status(400).json({result:1, error:err})
                return
              }

              if(existingHub){
                async.each(existingAutomation.automations, function(automation, callback){
                  var setting = automation.setting
                  var hub = existingHub
                  Device.findOne({ _id: automation.device, hub: req.body.hubID}, function(err, existingDevice){
                    if (err) {
                      res.status(400).json({result:1, error:err})
                      return
                    }

                    if(existingDevice){
                      const update = new Update({
                        hubCode:hub.hubCode,
                        deviceLink: existingDevice.link,
                        setting: setting
                      })
                      update.save()

                      existingDevice.state = setting
                      existingDevice.save()
                      callback()
                    }
                  })


                }, function(err){
                  if(err){
                    res.status(400).json({result:1, error:err})
                    return
                  }
                  else{
                    res.status(200).json({result:0, error: ""})
                    return
                  }
                })
              }
            })
          }
        })
      }
    })
  }
}


/* 6.
 * POST /automations/removeDevice
 * Remove a Device and its settings from an Automation
 * Authentication: Header x-access-token
 * JSON req: {hubID: "xxx", automationID: "xxx", autoID: "xxx"}
 * JSON res: {result: 0/1, error: "xxx"}
 */
exports.postRemoveDevice = (req, res) => {
  req.assert('hubID', 'hubID is empty').notEmpty()
  req.assert('automationID', 'automationID is empty').notEmpty()
  req.assert('autoID', 'deviceID is empty').notEmpty()

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

        Automation.findOne({_id: req.body.automationID, hub: req.body.hubID}, (err, existingAutomation) => {
          if (err) {
            res.status(400).json({result:1, error:error})
            return
          }

          if (existingAutomation){
            existingAutomation.automations.pull(req.body.autoID)
            existingAutomation.save()

            res.status(200).json({result:0, error: ""})
            return
          }
          else{
            res.status(400).json({result:1, error:"An Automation matching this automationID could not be found."})
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
 * POST /automations/delete
 * Delete an Automation from a Hub
 * Authentication: Header x-access-token
 * JSON req: {hubID: "xxx", automationID: "xxx"}
 * JSON res: {result: 0/1, error: "xxx"}
 */
exports.postDelete = (req, res) => {
  req.assert('hubID', 'hubID is empty').notEmpty()
  req.assert('automationID', 'automationID is empty').notEmpty()

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

        Hub.findOne({_id: req.body.hubID, automations: req.body.automationID}, (err, existingHub) => {
          if (err) {
            res.status(400).json({result:1, error:error})
            return
          }

          if (existingHub){
            //Remove reference to group
            existingHub.automations.pull(req.body.automationID)
            existingHub.save()

            //Remove Group from server
            Automation.remove({_id: req.body.automationID}, function(err) {
              if(err){
                res.status(400).json({result:1, error: err})
                return
              }
              else{
                res.status(200).json({result:0, error:""})
                return
              }
            })
          }
          else{
            res.status(400).json({result:1, error:"A hub matching this hubID with an automation matching automationID could not be found."})
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
