const async = require('async')

const User = require('../models/user')
const Hub = require('../models/hub')
const Device = require('../models/device')
const Update = require('../models/update')
const Automation = require('../models/automation')

/*
 * POST /api/automations/:hubID
 * Create a new automation
 * JSON Req: {automationName: String, devices: {Device, setting: String}}
 * 200 Res: {message: String, object: Automation}
 * 400 Res: {message: String}
 */
exports.postAutomation = function(req,res){
  req.assert('automationName', 'automationName is empty').notEmpty()
  const errors = req.validationErrors()
  if (errors) {
    res.status(400).json({message:errors[0].msg})
    return
  }

  Hub.findOne({_id: req.params.hubID}, (err, existingHub) => {
    if (err) {
      res.status(400).json({message: err})
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
          res.status(400).json({message:"A hub matching this hubID could not be found"})
          return
        }
        res.status(200).json({message:'Automation Created', object: automation})
        return
      })
    }
  })
}

/*
 * GET /api/automations/:hubID
 * Retrieve all of a hubs automations
 * 200 Res: {message: String, objects: Automations}
 * 400 Res: {message: String}
 */
exports.getAutomations = function(req,res){
  Automation.find({ hub: req.params.hubID}, (err, existingAutomations) => {
    if (err) {
      res.status(400).json({message:err})
      return
    }
    if (existingAutomations){
      res.status(200).json({message: 'Retrieved Automations', objects: existingAutomations})
      return
    }
  })
}

/*
 * DELETE /api/automations/:hubID
 * Delete an automation
 * JSON Req: {automationID: String}
 * 200 Res: {message: String, object: Hub}
 * 400 Res: {message: String}
 */
exports.deleteAutomation = function(req,res){
  req.assert('automationID', 'automationID is empty').notEmpty()
  const errors = req.validationErrors()
  if (errors) {
    res.status(400).json({message:errors[0].msg})
    return
  }

  Hub.findOne({_id: req.params.hubID, automations: req.body.automationID}, (err, existingHub) => {
    if (err) {
      res.status(400).json({message:error})
      return
    }

    if (existingHub){
      //Remove reference to group
      existingHub.automations.pull(req.body.automationID)
      existingHub.save((err) => {
        if(err){
          res.status(400).json({message:"A hub matching this hubID could not be found."})
          return
        }
      })

      //Remove Group from server
      Automation.remove({_id: req.body.automationID}, function(err) {
        if(err){
          res.status(400).json({message:"An automation matching automationID could not be found."})
          return
        }
        else{
          res.status(200).json({message:'Automation Deleted', object: existingHub})
          return
        }
      })
    }
  })
}

/*
 * GET /api/automations/:automationID
 * Retrieve an automation
 * 200 Res: {message: String, object: Automation}
 * 400 Res: {message: String}
 */
exports.getAutomation = function(req,res){
  Automation.findOne({ _id: req.params.automationID}, (err, existingAutomation) => {
    if (err) {
      res.status(400).json({message:err})
      return
    }
    if (existingAutomations){
      res.status(200).json({message: 'Retrieved Automation', objects: existingAutomation})
      return
    }
  })
}

/*
 * PUT /api/automations/:automationID
 * Add a device to an automation
 * JSON Req: {deviceID: String, setting: String}
 * 200 Res: {message: String, object: Automation}
 * 400 Res: {message: String}
 */
exports.putDevice = function(req,res){
  req.assert('deviceID', 'deviceID is empty').notEmpty()
  req.assert('setting', 'setting is empty').notEmpty()
  const errors = req.validationErrors()
  if (errors) {
    res.status(400).json({rmessage:errors[0].msg})
    return
  }

  Automation.findOne({_id: req.params.automationID}, (err, existingAutomation) => {
    if (err) {
      res.status(400).json({message: err})
      return
    }

    if (existingAutomation){
      Device.findOne({ _id:req.body.deviceID, hub: existingAutomation.hub}, (err, existingDevice) => {
        if (err) {
          res.status(400).json({message: err})
          return
        }
        if(existingDevice){
          var automation = {device: existingDevice, setting: req.body.setting}
          existingAutomation.automations.push(automation)

          existingAutomation.save((err) => {
            if (err) {
              res.status(400).json({message:"An automation matching this automationID could not be found on this Hub."})
              return
            }
            res.status(200).json({message:'Device Added', object: existingAutomation})
            return
          })
        }
      })
    }
  })
}

/*
 * DELETE /api/automations/:automationID
 * Delete a device from an automation
 * JSON Req: {deviceID: String}
 * 200 Res: {message: String, object: Automation}
 * 400 Res: {message: String}
 */
exports.deleteDevice = function(req,res){
  req.assert('deviceID', 'deviceID is empty').notEmpty()
  const errors = req.validationErrors()
  if (errors) {
    res.status(400).json({message: errors[0].msg})
    return
  }

  Automation.findOne({_id: req.params.automationID}, (err, existingAutomation) => {
    if (err) {
      res.status(400).json({message:err})
      return
    }

    if (existingAutomation){
      existingAutomation.automations.pull(req.body.deviceID)
      existingAutomation.save((err) => {
        if(err){
          res.status(400).json({message:"An Automation matching this automationID could not be found."})
          return
        }
        res.status(200).json({message: 'Device Removed', object: existingAutomation})
        return
      })
    }
  })
}

/*
 * GET /api/automations/:automationID/send
 * Retrieve an automation
 * 200 Res: {message: String, object: Automation}
 * 400 Res: {message: String}
 */
exports.getSend = function(req,res){
  Automation.findOne({ _id: req.params.automationID}, function(err, existingAutomation){
    if (err) {
      res.status(400).json({message:err})
      return
    }

    if (existingAutomation){
      Hub.findOne({ _id: existingAutomation.hub}, function(err, existingHub){
        if (err) {
          res.status(400).json({message:err})
          return
        }

        if(existingHub){
          async.each(existingAutomation.automations, function(automation, callback){
            var setting = automation.setting
            var hub = existingHub
            Device.findOne({ _id: automation.device, hub: existingHub._id}, function(err, existingDevice){
              if (err) {
                res.status(400).json({message:err})
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
              res.status(400).json({message:err})
              return
            }
            else{
              res.status(200).json({message: 'Automation updates sent', object: existingAutomation})
              return
            }
          })
        }
      })
    }
  })
}
