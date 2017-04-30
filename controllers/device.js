const User = require('../models/user')
const Hub = require('../models/hub')
const Device = require('../models/device')
const Update = require('../models/update')

/*
 * POST /api/devices/
 * Create a new device (only called by hub)
 * JSON Req: {deviceLink: String, hubCode: String, state: String, type: String}
 * 200 Res: {message: String, object: Device}
 * 400 Res: {message: String}
 */
exports.postDevice = function(req,res){
  req.assert('deviceLink', 'deviceLink is empty').notEmpty()
  req.assert('hubCode', 'hubCode is empty').notEmpty()
  req.assert('state', 'state is empty').notEmpty()
  req.assert('type', 'type is empty').notEmpty()
  const errors = req.validationErrors()
  if (errors) {
    res.status(400).json({message: errors[0].msg})
    return
  }

  Hub.findOne({ hubCode:req.body.hubCode}, (err, existingHub) => {
    if (err) {
      res.status(400).json({message:err.errmsg})
      return
    }

    if (existingHub) {
      const device = new Device({
        link: req.body.deviceLink,
        hub: existingHub._id,
        state: req.body.state,
        type: req.body.type,
        registered: false
      })

      if(req.body.type == "Switch"){device.params = ["ON","OFF"]}
      else if(req.body.type == "Dimmer"){device.params = ["percent"]}
      else if(req.body.type == "Color"){device.params = ["percent"]}
      else if(req.body.type == "Number"){device.params = ["float"]}
      else if(req.body.type == "Contact"){device.params = ["OPEN", "CLOSED"]}
      else{device.params = []}

      device.save((err) => {
        if (err) {
          res.status(400).json({message:'Device already exists'})
          return
        }
        res.status(200).json({message:'Device registered', object: device})
        return
      })
    }
  })
}

/*
 * PUT /api/devices/
 * Add a device to a hub
 * JSON Req: {hubID: String, deviceID: String, deviceName: String}
 * 200 Res: {message: String, object: Device}
 * 400 Res: {message: String}
 */
exports.putDevices = function(req,res){
   req.assert('hubID', 'hubID is empty').notEmpty()
   req.assert('deviceID', 'deviceID is empty').notEmpty()
   req.assert('deviceName', 'deviceName is empty').notEmpty()
   const errors = req.validationErrors()
   if (errors) {
     res.status(400).json({message:errors[0].msg})
     return
   }

   Device.findOne({_id: req.body.deviceID, registered: false}, (err, existingDevice) => {
     if (err) {
       res.status(400).json({message:error})
       return
     }

     if (existingDevice){
       Hub.findOne({ _id:req.body.hubID}, (err, existingHub) => {
         if (err) {
           res.status(400).json({message:error})
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

           res.status(200).json({message: 'Device added to hub', object: existingDevice})
           return
         }
       })
     }
   })
 }

/*
 * GET /api/devices/unclaimed/:hubID
 * Retrieve list of unclaimed devices
 * 200 Res: {message: String, objects: Devices}
 * 400 Res: {message: String}
 */
exports.getUnclaimedDevices = function(req,res){
  Device.find({ hub: req.params.hubID, registered: false}, (err, existingDevices) => {
    if (err) {
     res.status(400).json({message:error})
     return
    }
    if (existingDevices){
      res.status(200).json({message:'Unclaimed devices retrieved', objects: existingDevices})
      return
    }
  })
}

/*
 * GET /api/devices/:hubID
 * Retrieve list of users devices
 * 200 Res: {message: String, objects: devices}
 * 400 Res: {message: String}
 */
exports.getDevices = function(req,res){
  Device.find({ hub: req.params.hubID, registered: true}, (err, existingDevices) => {
    if (err) {
     res.status(400).json({message:error})
     return
    }
    if (existingDevices){
      res.status(200).json({message:'Claimed devices retrieved', objects: existingDevices})
      return
    }
  })
}

/*
 * GET /api/devices/:deviceID
 * Retrieve device info
 * 200 Res: {message: String, object: Device}
 * 400 Res: {message: String}
 */
exports.getDevice = function(req,res){
  Device.findOne({ hub: req.params.deviceID}, (err, existingDevice) => {
    if (err) {
     res.status(400).json({message:error})
     return
    }

    if (existingDevices){
      res.status(200).json({message:'Claimed devices retrieved', object: existingDevice})
      return
    }
  })
}

/*
 * PUT /api/devices/:deviceID
 * Change the state of the device
 * JSON Req: {setting: String}
 * 200 Res: {message: String, object: Device}
 * 400 Res: {message: String}
 */
exports.putDevice = function(req,res){
  req.assert('setting', 'setting is empty').notEmpty()
  const errors = req.validationErrors()
  if (errors) {
   res.status(400).json({message:errors[0].msg})
   return
  }

  Device.findOne({_id: req.params.deviceID}, (err, existingDevice) => {
    if (err) {
     res.status(400).json({message:error})
     return
    }
    if(existingDevice){
      Hub.findOne({_id: existingDevice.hub}, (err, existingHub) => {
        if (err) {
         res.status(400).json({message:error})
         return
        }
        if(existingHub){
          const update = new Update({
            hubCode: existingHub.hubCode,
            deviceLink: existingDevice.link,
            setting: req.body.setting
          })
          update.save()
          existingDevice.state = req.body.deviceSetting
          existingDevice.save((err, modified_device) => {
            if (err) {
             res.status(400).json({message: err})
             return
            }
            res.json({message:'Update sent', object: modified_device})
            return
          })
        }
      })
    }
  })
}

/*
 * DELETE /api/devices/:deviceID
 * Delete a device from a hub
 * JSON Req: {hubID: String}
 * 200 Res: {message: String, object: Hub}
 * 400 Res: {message: String}
 */
exports.deleteDevice = function(req,res){
  req.assert('hubID', 'hubID is empty').notEmpty()
  const errors = req.validationErrors()
  if (errors) {
   res.status(400).json({message:errors[0].msg})
   return
  }

  Device.findOne({_id: req.body.deviceID}, (err, existingDevice) => {
    if (err) {
     res.status(400).json({message:error})
     return
    }
    if (existingDevice){
     existingDevice.registered = false;
     existingDevice.name = null;
     existingDevice.save((err) => {
       if (err) {
         res.status(400).json({message:'Could not find Device'})
         return
       }
       res.status(200).json({message:'Device removed'})
       return
     })
    }
  })
}
